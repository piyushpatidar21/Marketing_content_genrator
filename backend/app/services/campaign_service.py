from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.campaign import Campaign
from app.models.generation import Generation
from app.schemas.campaign import (
    CampaignCreateRequest,
    CampaignUpdateRequest,
)


class CampaignService:
    @staticmethod
    def get_campaign_by_id(db: Session, campaign_id: str, user_id: str) -> Campaign:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            raise NotFoundException(resource="Campaign", message="Campaign not found")
        if campaign.user_id != user_id:
            raise ForbiddenException("You do not have access to this campaign")
        return campaign

    @staticmethod
    def list_campaigns(
        db: Session,
        user_id: str,
        skip: int = 0,
        limit: int = 50,
        search: str | None = None,
    ) -> tuple[int, list[dict]]:
        query = db.query(Campaign).filter(Campaign.user_id == user_id)
        if search:
            query = query.filter(
                (Campaign.name.ilike(f"%{search}%"))
                | (Campaign.product_service.ilike(f"%{search}%"))
                | (Campaign.idea.ilike(f"%{search}%"))
            )

        total = query.count()
        campaigns = query.order_by(Campaign.created_at.desc()).offset(skip).limit(limit).all()

        # Calculate generation counts per campaign
        items = []
        for c in campaigns:
            gen_count = db.query(func.count(Generation.id)).filter(Generation.campaign_id == c.id).scalar() or 0
            c_dict = {
                "id": c.id,
                "user_id": c.user_id,
                "name": c.name,
                "idea": c.idea,
                "product_service": c.product_service,
                "target_audience": c.target_audience,
                "age_group": c.age_group,
                "location": c.location,
                "interests": c.interests,
                "pain_points": c.pain_points,
                "goal": c.goal,
                "tone": c.tone,
                "language": c.language,
                "key_points": c.key_points,
                "cta": c.cta,
                "keywords": c.keywords,
                "hashtag_preference": c.hashtag_preference,
                "additional_instructions": c.additional_instructions,
                "created_at": c.created_at,
                "updated_at": c.updated_at,
                "generation_count": gen_count,
            }
            items.append(c_dict)

        return total, items

    @staticmethod
    def create_campaign(db: Session, user_id: str, req: CampaignCreateRequest) -> Campaign:
        campaign = Campaign(
            user_id=user_id,
            name=req.name.strip(),
            idea=req.idea.strip(),
            product_service=req.product_service.strip(),
            target_audience=req.target_audience.strip(),
            age_group=req.age_group.strip() if req.age_group else None,
            location=req.location.strip() if req.location else None,
            interests=req.interests.strip() if req.interests else None,
            pain_points=req.pain_points.strip() if req.pain_points else None,
            goal=req.goal.strip(),
            tone=req.tone.strip(),
            language=req.language.strip() if req.language else "English",
            key_points=req.key_points.strip() if req.key_points else None,
            cta=req.cta.strip() if req.cta else None,
            keywords=req.keywords.strip() if req.keywords else None,
            hashtag_preference=req.hashtag_preference.strip() if req.hashtag_preference else None,
            additional_instructions=req.additional_instructions.strip() if req.additional_instructions else None,
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        return campaign

    @classmethod
    def update_campaign(
        cls,
        db: Session,
        campaign_id: str,
        user_id: str,
        req: CampaignUpdateRequest,
    ) -> Campaign:
        campaign = cls.get_campaign_by_id(db, campaign_id, user_id)

        update_data = req.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(campaign, field, value.strip() if isinstance(value, str) else value)

        db.commit()
        db.refresh(campaign)
        return campaign

    @classmethod
    def delete_campaign(cls, db: Session, campaign_id: str, user_id: str) -> bool:
        campaign = cls.get_campaign_by_id(db, campaign_id, user_id)
        db.delete(campaign)
        db.commit()
        return True

    @staticmethod
    def get_or_create_default_campaign(
        db: Session,
        user_id: str,
        name: str = "Direct Generations",
    ) -> Campaign:
        campaign = (
            db.query(Campaign)
            .filter(Campaign.user_id == user_id, Campaign.name == name)
            .first()
        )
        if not campaign:
            campaign = Campaign(
                user_id=user_id,
                name=name,
                idea="Direct media generation via dedicated API endpoints",
                product_service="General Product / Service",
                target_audience="Target Audience",
                goal="brand awareness",
                tone="persuasive and engaging",
                language="English",
            )
            db.add(campaign)
            db.flush()
        return campaign

