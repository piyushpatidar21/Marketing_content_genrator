from app.core.security import get_password_hash
from app.db.database import Base, SessionLocal, engine
from app.models.brand_profile import BrandProfile
from app.models.campaign import Campaign
from app.models.user import User


def seed_demo_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if demo user already exists
        existing = db.query(User).filter(User.email == "sarah@example.com").first()
        if not existing:
            demo_user = User(
                name="Sarah Jenkins",
                email="sarah@example.com",
                password_hash=get_password_hash("Password123!"),
                is_active=True,
            )
            db.add(demo_user)
            db.flush()

            # Seed Brand Profile for Sarah
            brand = BrandProfile(
                user_id=demo_user.id,
                brand_name="Apex Precision Labs",
                description="Ultra-pure bioavailable fitness nutrition engineered for peak human performance.",
                industry="Health & Sports Nutrition",
                target_audience="Athletes, CrossFitters, and high-performance achievers 18-40",
                brand_voice="Authoritative, science-backed, inspiring, and clean",
                preferred_tone="Energetic",
                products_services="Organic Whey Isolate, Electrolyte Drops, Nootropic Energy Bars",
                brand_values="100% transparency, zero fillers, clinically tested ingredients",
                default_cta="Claim your sample pack with code CRUNCH20",
                forbidden_words=["miracle cure", "instant weight loss", "magic pill"],
                preferred_language="English",
            )
            db.add(brand)

            # Seed Demo Campaign
            campaign = Campaign(
                user_id=demo_user.id,
                name="Summer Hydration Blast",
                product_service="HydraPro Shake",
                idea="Launch high-protein organic hydration shake with zero artificial sugar and crunchy sea salt almonds.",
                target_audience="18-35 fitness enthusiasts and busy professionals",
                age_group="18–35 years old",
                location="Global",
                interests="Fitness, clean nutrition, bodybuilding, productivity",
                pain_points="Chalky taste of typical protein shakes, high sugar content",
                goal="sales",
                tone="energetic",
                language="English",
                key_points="20g protein, 0g sugar, 100% organic cacao, rapid electrolyte hydration",
                cta="Get 20% off your first starter bundle today",
                keywords="protein, clean energy, hydration, workout fuel",
                hashtag_preference="#fitfuel #cleanprotein #workoutroutine",
            )
            db.add(campaign)

            db.commit()
            print("Successfully seeded demo user: sarah@example.com / Password123!")
        else:
            # Update password hash in case it was modified
            existing.password_hash = get_password_hash("Password123!")
            db.commit()
            print("Demo user sarah@example.com password refreshed.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
