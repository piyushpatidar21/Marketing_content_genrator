from app.db.database import Base  # noqa

# Import all models here so Alembic can discover them
from app.models.user import User  # noqa
from app.models.campaign import Campaign  # noqa
from app.models.generation import Generation  # noqa
from app.models.content_variation import ContentVariation  # noqa
from app.models.brand_profile import BrandProfile  # noqa
