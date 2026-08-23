import uuid
from decimal import Decimal
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Product(Base):

    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    slug: Mapped[str] = mapped_column(
        String(280),
        unique=True,
        nullable=False
    )

    sku: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id"),
        nullable=False
    )

    brand_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("brands.id")
    )

    product_type: Mapped[str] = mapped_column(
        Enum(
            "SURGICAL_DISPOSABLE",
            "SURGICAL_INSTRUMENT",
            "DIAGNOSTIC_DEVICE",
            "HOME_HEALTHCARE_DEVICE",
            "MOBILITY_SUPPORT",
            name="product_type"
        ),
        nullable=False
    )

    short_description: Mapped[str | None] = mapped_column(
        String(500)
    )

    description: Mapped[str | None] = mapped_column(
        Text
    )

    mrp: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    selling_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    manufacturer: Mapped[str | None] = mapped_column(
        String(255)
    )

    country_of_origin: Mapped[str | None] = mapped_column(
        String(100)
    )

    is_disposable: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    is_sterile: Mapped[bool | None] = mapped_column(
        Boolean
    )

    is_single_use: Mapped[bool | None] = mapped_column(
        Boolean
    )

    expiry_required: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    batch_tracking_required: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    warranty_months: Mapped[int | None] = mapped_column(
        Integer
    )

    reorder_level: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=5
    )

    weight_grams: Mapped[int | None] = mapped_column(
        Integer
    )

    status: Mapped[str] = mapped_column(
        Enum(
            "ACTIVE",
            "INACTIVE",
            "DRAFT",
            name="product_status"
        ),
        nullable=False,
        default="ACTIVE"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )