from typing import Any

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.ai.provider import get_ai_provider
from app.core.exceptions import ForbiddenException, NotFoundException
from app.core.logging import logger
from app.models.campaign import Campaign
from app.models.content_variation import ContentVariation
from app.models.generation import Generation
from app.schemas.generation import (
    DashboardStatsResponse,
    GenerationCreateRequest,
    GenerationRegenerateRequest,
    GenerationUpdateRequest,
    StructuredContentResponse,
)
from app.services.brand_service import BrandService
from app.services.campaign_service import CampaignService
from app.services.prompt_service import PromptService


class GenerationService:
    @staticmethod
    def get_generation_by_id(db: Session, generation_id: str, user_id: str) -> Generation:
        gen = db.query(Generation).filter(Generation.id == generation_id).first()
        if not gen:
            raise NotFoundException(resource="Generation", message="Generation record not found")
        if gen.user_id != user_id:
            raise ForbiddenException("You do not have access to this generation record")
        return gen

    @classmethod
    async def generate_content(
        cls,
        db: Session,
        user_id: str,
        req: GenerationCreateRequest,
    ) -> list[Generation]:
        # 1. Validate campaign ownership
        campaign = CampaignService.get_campaign_by_id(db, req.campaign_id, user_id)

        # 2. Extract brand context if available
        brand_profile_dict = BrandService.get_brand_profile_dict(db, user_id)

        # Campaign data dict
        campaign_data = {
            "name": campaign.name,
            "idea": campaign.idea,
            "product_service": campaign.product_service,
            "target_audience": campaign.target_audience,
            "age_group": campaign.age_group,
            "location": campaign.location,
            "interests": campaign.interests,
            "pain_points": campaign.pain_points,
            "goal": campaign.goal,
            "tone": campaign.tone,
            "language": campaign.language,
            "key_points": campaign.key_points,
            "cta": campaign.cta,
            "keywords": campaign.keywords,
            "hashtag_preference": campaign.hashtag_preference,
            "additional_instructions": campaign.additional_instructions,
        }

        ai_provider = get_ai_provider()
        system_prompt = PromptService.get_system_prompt()
        saved_generations: list[Generation] = []

        # 3. Generate exactly ONE comprehensive, all-in-one deliverable per platform
        # Deduplicate platforms to prevent redundant duplicate API calls and records
        unique_platforms = list(dict.fromkeys(req.platforms))

        # Determine media_type summary string from user selection
        if req.media_types:
            if len(req.media_types) == 1:
                primary_media_type = req.media_types[0]
            elif set(req.media_types) >= {"text", "image", "video", "audio"}:
                primary_media_type = "all-in-one"
            else:
                primary_media_type = ", ".join(req.media_types)
        else:
            primary_media_type = "all-in-one"

        for platform in unique_platforms:
            # Build unified prompt for this platform containing Copy + Visual + Video + Audio
            prompt = PromptService.create_generation_prompt(
                campaign_data=campaign_data,
                platform=platform,
                media_type=primary_media_type,
                brand_profile=brand_profile_dict,
                custom_instructions=req.custom_instructions,
            )

            input_data = {
                "campaign_id": campaign.id,
                "campaign_name": campaign.name,
                "platform": platform,
                "media_type": primary_media_type,
                "custom_instructions": req.custom_instructions,
                "prompt_snapshot": prompt[:500] + "...",
            }

            try:
                # Execute AI Generation
                ai_resp = await ai_provider.generate_structured(
                    prompt=prompt,
                    system_prompt=system_prompt,
                    response_schema=StructuredContentResponse,
                )

                # Persist generation record
                gen_record = Generation(
                    campaign_id=campaign.id,
                    user_id=user_id,
                    platform=platform,
                    media_type=primary_media_type,
                    input_data=input_data,
                    generated_content=ai_resp.content,
                    status="completed",
                    model=ai_resp.model,
                    input_tokens=ai_resp.input_tokens,
                    output_tokens=ai_resp.output_tokens,
                    estimated_cost=ai_resp.estimated_cost,
                    generation_time_ms=ai_resp.generation_time_ms,
                    is_favorite=False,
                )
                db.add(gen_record)
                db.flush()

                # Save alternative variations if present
                variations = ai_resp.content.get("variations", [])
                for idx, var_text in enumerate(variations):
                    var_record = ContentVariation(
                        generation_id=gen_record.id,
                        title=f"Variation {idx + 1}",
                        content={"variation_text": var_text},
                        is_favorite=False,
                    )
                    db.add(var_record)

                saved_generations.append(gen_record)

            except Exception as e:
                logger.exception(f"Failed generation for {platform}: {e!s}")
                # Save failed state or raise
                failed_record = Generation(
                    campaign_id=campaign.id,
                    user_id=user_id,
                    platform=platform,
                    media_type=primary_media_type,
                    input_data=input_data,
                    generated_content={"error": str(e)},
                    status="failed",
                    model=getattr(ai_provider, "model", "unknown"),
                )
                db.add(failed_record)
                db.flush()
                saved_generations.append(failed_record)

        db.commit()
        for g in saved_generations:
            db.refresh(g)

        return saved_generations

    @classmethod
    async def generate_media(
        cls,
        db: Session,
        user_id: str,
        media_type: str,  # "text", "image", "video", "audio"
        platforms: list[str],
        campaign_id: str | None = None,
        concept_or_topic: str | None = None,
        tone: str | None = None,
        specific_options: dict[str, Any] | None = None,
        custom_instructions: str | None = None,
    ) -> list[Generation]:
        # 1. Resolve campaign (user specified or fallback default)
        if campaign_id:
            campaign = CampaignService.get_campaign_by_id(db, campaign_id, user_id)
        else:
            campaign = CampaignService.get_or_create_default_campaign(db, user_id)

        # 2. Extract brand context if available
        brand_profile_dict = BrandService.get_brand_profile_dict(db, user_id)

        # 3. Campaign data dict
        campaign_data = {
            "name": campaign.name,
            "idea": concept_or_topic or campaign.idea,
            "product_service": campaign.product_service,
            "target_audience": campaign.target_audience,
            "age_group": campaign.age_group,
            "location": campaign.location,
            "interests": campaign.interests,
            "pain_points": campaign.pain_points,
            "goal": campaign.goal,
            "tone": tone or campaign.tone,
            "language": campaign.language,
            "key_points": campaign.key_points,
            "cta": campaign.cta,
            "keywords": campaign.keywords,
            "hashtag_preference": campaign.hashtag_preference,
            "additional_instructions": campaign.additional_instructions,
        }

        # Build custom instructions incorporating specific options
        instructions_parts = []
        if specific_options:
            for k, v in specific_options.items():
                if v:
                    label = k.replace("_", " ").title()
                    instructions_parts.append(f"{label}: {v}")
        if custom_instructions:
            instructions_parts.append(custom_instructions)
        combined_instructions = "\n".join(instructions_parts) if instructions_parts else None

        ai_provider = get_ai_provider(media_type=media_type)
        system_prompt = PromptService.get_system_prompt()
        saved_generations: list[Generation] = []

        unique_platforms = list(dict.fromkeys(platforms))

        for platform in unique_platforms:
            prompt = PromptService.create_generation_prompt(
                campaign_data=campaign_data,
                platform=platform,
                media_type=media_type,
                brand_profile=brand_profile_dict,
                custom_instructions=combined_instructions,
            )

            input_data = {
                "campaign_id": campaign.id,
                "campaign_name": campaign.name,
                "platform": platform,
                "media_type": media_type,
                "specific_options": specific_options or {},
                "custom_instructions": combined_instructions,
                "prompt_snapshot": prompt[:500] + "...",
            }

            try:
                ai_resp = await ai_provider.generate_structured(
                    prompt=prompt,
                    system_prompt=system_prompt,
                    response_schema=StructuredContentResponse,
                )

                gen_record = Generation(
                    campaign_id=campaign.id,
                    user_id=user_id,
                    platform=platform,
                    media_type=media_type,
                    input_data=input_data,
                    generated_content=ai_resp.content,
                    status="completed",
                    model=ai_resp.model,
                    input_tokens=ai_resp.input_tokens,
                    output_tokens=ai_resp.output_tokens,
                    estimated_cost=ai_resp.estimated_cost,
                    generation_time_ms=ai_resp.generation_time_ms,
                    is_favorite=False,
                )
                db.add(gen_record)
                db.flush()

                variations = ai_resp.content.get("variations", [])
                for idx, var_text in enumerate(variations):
                    var_record = ContentVariation(
                        generation_id=gen_record.id,
                        title=f"Variation {idx + 1}",
                        content={"variation_text": var_text},
                        is_favorite=False,
                    )
                    db.add(var_record)

                saved_generations.append(gen_record)

            except Exception as e:
                logger.exception(f"Failed {media_type} generation for {platform}: {e!s}")
                failed_record = Generation(
                    campaign_id=campaign.id,
                    user_id=user_id,
                    platform=platform,
                    media_type=media_type,
                    input_data=input_data,
                    generated_content={"error": str(e)},
                    status="failed",
                    model=getattr(ai_provider, "model", "unknown"),
                )
                db.add(failed_record)
                db.flush()
                saved_generations.append(failed_record)

        db.commit()
        for g in saved_generations:
            db.refresh(g)

        return saved_generations


    @classmethod
    async def regenerate_content(
        cls,
        db: Session,
        user_id: str,
        generation_id: str,
        req: GenerationRegenerateRequest,
    ) -> Generation:
        gen = cls.get_generation_by_id(db, generation_id, user_id)
        campaign = CampaignService.get_campaign_by_id(db, gen.campaign_id, user_id)
        brand_profile_dict = BrandService.get_brand_profile_dict(db, user_id)

        campaign_data = {
            "name": campaign.name,
            "idea": campaign.idea,
            "product_service": campaign.product_service,
            "target_audience": campaign.target_audience,
            "age_group": campaign.age_group,
            "location": campaign.location,
            "interests": campaign.interests,
            "pain_points": campaign.pain_points,
            "goal": campaign.goal,
            "tone": campaign.tone,
            "language": campaign.language,
            "key_points": campaign.key_points,
            "cta": campaign.cta,
            "keywords": campaign.keywords,
            "hashtag_preference": campaign.hashtag_preference,
            "additional_instructions": campaign.additional_instructions,
        }

        ai_provider = get_ai_provider()
        system_prompt = PromptService.get_system_prompt()

        prompt = PromptService.create_generation_prompt(
            campaign_data=campaign_data,
            platform=gen.platform,
            media_type=gen.media_type,
            brand_profile=brand_profile_dict,
            modification_instruction=req.modification_instruction,
            custom_instructions=gen.input_data.get("custom_instructions") if isinstance(gen.input_data, dict) else None,
        )

        ai_resp = await ai_provider.generate_structured(
            prompt=prompt,
            system_prompt=system_prompt,
            response_schema=StructuredContentResponse,
        )

        # Update generation content
        gen.generated_content = ai_resp.content
        gen.status = "completed"
        gen.model = ai_resp.model
        gen.input_tokens = (gen.input_tokens or 0) + ai_resp.input_tokens
        gen.output_tokens = (gen.output_tokens or 0) + ai_resp.output_tokens
        gen.estimated_cost = (gen.estimated_cost or 0.0) + ai_resp.estimated_cost
        gen.generation_time_ms = ai_resp.generation_time_ms

        # Add new variation snapshot
        var_record = ContentVariation(
            generation_id=gen.id,
            title=f"Regenerated ({req.modification_instruction or 'Refined'})"[:200],
            content=ai_resp.content,
            is_favorite=False,
        )
        db.add(var_record)

        db.commit()
        db.refresh(gen)
        return gen

    @staticmethod
    def toggle_favorite(db: Session, generation_id: str, user_id: str) -> Generation:
        gen = GenerationService.get_generation_by_id(db, generation_id, user_id)
        gen.is_favorite = not gen.is_favorite
        db.commit()
        db.refresh(gen)
        return gen

    @classmethod
    def update_generation(
        cls,
        db: Session,
        generation_id: str,
        user_id: str,
        req: GenerationUpdateRequest,
    ) -> Generation:
        gen = cls.get_generation_by_id(db, generation_id, user_id)
        if req.generated_content is not None:
            gen.generated_content = req.generated_content
        if req.is_favorite is not None:
            gen.is_favorite = req.is_favorite
        db.commit()
        db.refresh(gen)
        return gen

    @staticmethod
    def delete_generation(db: Session, generation_id: str, user_id: str) -> bool:
        gen = GenerationService.get_generation_by_id(db, generation_id, user_id)
        db.delete(gen)
        db.commit()
        return True

    @staticmethod
    def list_generations(
        db: Session,
        user_id: str,
        skip: int = 0,
        limit: int = 50,
        campaign_id: str | None = None,
        platform: str | None = None,
        media_type: str | None = None,
        favorite_only: bool = False,
    ) -> tuple[int, list[Generation]]:
        query = db.query(Generation).filter(Generation.user_id == user_id)

        if campaign_id:
            query = query.filter(Generation.campaign_id == campaign_id)
        if platform:
            query = query.filter(Generation.platform == platform.lower())
        if media_type:
            query = query.filter(Generation.media_type == media_type.lower())
        if favorite_only:
            query = query.filter(Generation.is_favorite == True)

        total = query.count()
        items = query.order_by(desc(Generation.created_at)).offset(skip).limit(limit).all()
        return total, items

    @staticmethod
    def get_dashboard_stats(db: Session, user_id: str) -> DashboardStatsResponse:
        total_campaigns = db.query(func.count(Campaign.id)).filter(Campaign.user_id == user_id).scalar() or 0
        total_generations = db.query(func.count(Generation.id)).filter(Generation.user_id == user_id).scalar() or 0
        total_favorites = (
            db.query(func.count(Generation.id))
            .filter(Generation.user_id == user_id, Generation.is_favorite == True)
            .scalar()
            or 0
        )

        # Platform breakdown
        platform_counts = (
            db.query(Generation.platform, func.count(Generation.id))
            .filter(Generation.user_id == user_id)
            .group_by(Generation.platform)
            .all()
        )
        platform_breakdown = dict(platform_counts)

        most_used_platform = "None"
        if platform_breakdown:
            most_used_platform = max(platform_breakdown, key=platform_breakdown.get).title()

        # Recent campaigns
        recent_campaigns = (
            db.query(Campaign).filter(Campaign.user_id == user_id).order_by(desc(Campaign.created_at)).limit(5).all()
        )
        recent_campaigns_data = [
            {
                "id": c.id,
                "name": c.name,
                "product_service": c.product_service,
                "goal": c.goal,
                "tone": c.tone,
                "created_at": c.created_at,
            }
            for c in recent_campaigns
        ]

        # Recent generations
        recent_generations = (
            db.query(Generation)
            .filter(Generation.user_id == user_id)
            .order_by(desc(Generation.created_at))
            .limit(5)
            .all()
        )
        recent_generations_data = [
            {
                "id": g.id,
                "campaign_id": g.campaign_id,
                "platform": g.platform,
                "media_type": g.media_type,
                "hook": g.generated_content.get("hook") if isinstance(g.generated_content, dict) else "",
                "is_favorite": g.is_favorite,
                "created_at": g.created_at,
            }
            for g in recent_generations
        ]

        return DashboardStatsResponse(
            total_campaigns=total_campaigns,
            total_generations=total_generations,
            total_favorites=total_favorites,
            most_used_platform=most_used_platform,
            platform_breakdown=platform_breakdown,
            recent_campaigns=recent_campaigns_data,
            recent_generations=recent_generations_data,
        )
