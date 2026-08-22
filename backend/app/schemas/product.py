from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):

    name: str

    slug: str

    sku: str

    category_id: UUID

    brand_id: UUID | None = None

    product_type: str

    short_description: str | None = None

    description: str | None = None

    mrp: Decimal

    selling_price: Decimal

    manufacturer: str | None = None

    country_of_origin: str | None = None

    is_disposable: bool = False

    is_sterile: bool | None = None

    is_single_use: bool | None = None

    expiry_required: bool = False

    batch_tracking_required: bool = False

    warranty_months: int | None = None

    reorder_level: int = 5

    weight_grams: int | None = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):

    id: UUID

    status: str

    model_config = ConfigDict(
        from_attributes=True
    )