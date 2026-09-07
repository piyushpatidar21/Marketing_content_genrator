"""Initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-08-20 11:30:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    # Brand Profiles table
    op.create_table(
        "brand_profiles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("brand_name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("industry", sa.String(length=100), nullable=True),
        sa.Column("target_audience", sa.Text(), nullable=True),
        sa.Column("brand_voice", sa.String(length=100), nullable=True),
        sa.Column("preferred_tone", sa.String(length=100), nullable=True),
        sa.Column("products_services", sa.Text(), nullable=True),
        sa.Column("brand_values", sa.Text(), nullable=True),
        sa.Column("default_cta", sa.String(length=200), nullable=True),
        sa.Column("forbidden_words", sa.JSON(), nullable=True),
        sa.Column(
            "preferred_language",
            sa.String(length=50),
            nullable=False,
            server_default="English",
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_brand_profiles_id"), "brand_profiles", ["id"], unique=False)
    op.create_index(op.f("ix_brand_profiles_user_id"), "brand_profiles", ["user_id"], unique=True)

    # Campaigns table
    op.create_table(
        "campaigns",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("idea", sa.Text(), nullable=False),
        sa.Column("product_service", sa.String(length=200), nullable=False),
        sa.Column("target_audience", sa.Text(), nullable=False),
        sa.Column("age_group", sa.String(length=100), nullable=True),
        sa.Column("location", sa.String(length=100), nullable=True),
        sa.Column("interests", sa.Text(), nullable=True),
        sa.Column("pain_points", sa.Text(), nullable=True),
        sa.Column(
            "goal",
            sa.String(length=100),
            nullable=False,
            server_default="brand awareness",
        ),
        sa.Column("tone", sa.String(length=100), nullable=False, server_default="energetic"),
        sa.Column("language", sa.String(length=50), nullable=False, server_default="English"),
        sa.Column("key_points", sa.Text(), nullable=True),
        sa.Column("cta", sa.String(length=200), nullable=True),
        sa.Column("keywords", sa.Text(), nullable=True),
        sa.Column("hashtag_preference", sa.String(length=100), nullable=True),
        sa.Column("additional_instructions", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_campaigns_id"), "campaigns", ["id"], unique=False)
    op.create_index(op.f("ix_campaigns_user_id"), "campaigns", ["user_id"], unique=False)

    # Generations table
    op.create_table(
        "generations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("campaign_id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("platform", sa.String(length=50), nullable=False),
        sa.Column("media_type", sa.String(length=50), nullable=False),
        sa.Column("input_data", sa.JSON(), nullable=False),
        sa.Column("generated_content", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="completed"),
        sa.Column("model", sa.String(length=100), nullable=True),
        sa.Column("input_tokens", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("output_tokens", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("estimated_cost", sa.Float(), nullable=True, server_default="0.0"),
        sa.Column("generation_time_ms", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("is_favorite", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["campaign_id"], ["campaigns.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_generations_id"), "generations", ["id"], unique=False)
    op.create_index(op.f("ix_generations_campaign_id"), "generations", ["campaign_id"], unique=False)
    op.create_index(op.f("ix_generations_user_id"), "generations", ["user_id"], unique=False)
    op.create_index(op.f("ix_generations_platform"), "generations", ["platform"], unique=False)
    op.create_index(op.f("ix_generations_media_type"), "generations", ["media_type"], unique=False)
    op.create_index(op.f("ix_generations_is_favorite"), "generations", ["is_favorite"], unique=False)
    op.create_index(op.f("ix_generations_created_at"), "generations", ["created_at"], unique=False)

    # Content Variations table
    op.create_table(
        "content_variations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("generation_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=True),
        sa.Column("content", sa.JSON(), nullable=False),
        sa.Column("is_favorite", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["generation_id"], ["generations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_content_variations_id"), "content_variations", ["id"], unique=False)
    op.create_index(
        op.f("ix_content_variations_generation_id"),
        "content_variations",
        ["generation_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_table("content_variations")
    op.drop_table("generations")
    op.drop_table("campaigns")
    op.drop_table("brand_profiles")
    op.drop_table("users")
