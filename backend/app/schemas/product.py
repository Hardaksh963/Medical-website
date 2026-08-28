from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):

    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=280)
    sku: str = Field(min_length=1, max_length=100)

    category_id: UUID
    brand_id: UUID | None = None

    product_type: str

    short_description: str | None = None
    description: str | None = None

    mrp: Decimal = Field(gt=0)
    selling_price: Decimal = Field(gt=0)

    manufacturer: str | None = None
    country_of_origin: str | None = None

    is_disposable: bool = False
    is_sterile: bool | None = None
    is_single_use: bool | None = None

    expiry_required: bool = False
    batch_tracking_required: bool = False

    warranty_months: int | None = Field(default=None, ge=0)
    reorder_level: int = Field(default=5, ge=0)
    weight_grams: int | None = Field(default=None, gt=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):

    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = Field(default=None, min_length=1, max_length=280)
    sku: str | None = Field(default=None, min_length=1, max_length=100)

    category_id: UUID | None = None
    brand_id: UUID | None = None

    product_type: str | None = None

    short_description: str | None = None
    description: str | None = None

    mrp: Decimal | None = Field(default=None, gt=0)
    selling_price: Decimal | None = Field(default=None, gt=0)

    manufacturer: str | None = None
    country_of_origin: str | None = None

    is_disposable: bool | None = None
    is_sterile: bool | None = None
    is_single_use: bool | None = None

    expiry_required: bool | None = None
    batch_tracking_required: bool | None = None

    warranty_months: int | None = Field(default=None, ge=0)
    reorder_level: int | None = Field(default=None, ge=0)
    weight_grams: int | None = Field(default=None, gt=0)

    status: str | None = None


class ProductResponse(ProductBase):

    id: UUID
    status: str

    model_config = ConfigDict(
        from_attributes=True
    )