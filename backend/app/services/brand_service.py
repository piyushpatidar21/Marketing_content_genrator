from typing import Any

from sqlalchemy.orm import Session

from app.models.brand_profile import BrandProfile
from app.schemas.brand_profile import (
    BrandProfileCreateRequest,
)


class BrandService:
    @staticmethod
    def get_brand_profile(db: Session, user_id: str) -> BrandProfile | None:
        return db.query(BrandProfile).filter(BrandProfile.user_id == user_id).first()

    @classmethod
    def get_brand_profile_dict(cls, db: Session, user_id: str) -> dict[str, Any] | None:
        profile = cls.get_brand_profile(db, user_id)
        if not profile:
            return None
        return {
            "brand_name": profile.brand_name,
            "description": profile.description,
            "industry": profile.industry,
            "target_audience": profile.target_audience,
            "brand_voice": profile.brand_voice,
            "preferred_tone": profile.preferred_tone,
            "products_services": profile.products_services,
            "brand_values": profile.brand_values,
            "default_cta": profile.default_cta,
            "forbidden_words": profile.forbidden_words or [],
            "preferred_language": profile.preferred_language,
        }

    @classmethod
    def upsert_brand_profile(cls, db: Session, user_id: str, req: BrandProfileCreateRequest) -> BrandProfile:
        existing = cls.get_brand_profile(db, user_id)
        if existing:
            existing.brand_name = req.brand_name.strip()
            existing.description = req.description.strip() if req.description else None
            existing.industry = req.industry.strip() if req.industry else None
            existing.target_audience = req.target_audience.strip() if req.target_audience else None
            existing.brand_voice = req.brand_voice.strip() if req.brand_voice else None
            existing.preferred_tone = req.preferred_tone.strip() if req.preferred_tone else None
            existing.products_services = req.products_services.strip() if req.products_services else None
            existing.brand_values = req.brand_values.strip() if req.brand_values else None
            existing.default_cta = req.default_cta.strip() if req.default_cta else None
            existing.forbidden_words = req.forbidden_words or []
            existing.preferred_language = req.preferred_language.strip() if req.preferred_language else "English"
            db.commit()
            db.refresh(existing)
            return existing
        else:
            new_profile = BrandProfile(
                user_id=user_id,
                brand_name=req.brand_name.strip(),
                description=req.description.strip() if req.description else None,
                industry=req.industry.strip() if req.industry else None,
                target_audience=req.target_audience.strip() if req.target_audience else None,
                brand_voice=req.brand_voice.strip() if req.brand_voice else None,
                preferred_tone=req.preferred_tone.strip() if req.preferred_tone else None,
                products_services=req.products_services.strip() if req.products_services else None,
                brand_values=req.brand_values.strip() if req.brand_values else None,
                default_cta=req.default_cta.strip() if req.default_cta else None,
                forbidden_words=req.forbidden_words or [],
                preferred_language=req.preferred_language.strip() if req.preferred_language else "English",
            )
            db.add(new_profile)
            db.commit()
            db.refresh(new_profile)
            return new_profile
