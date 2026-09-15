from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=280)
    sku: str = Field(min_length=1, max_length=100)

    category_id: UUID
    brand_id: UUID | None = None

    product_type: str = Field(min_length=1, max_length=100)

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

    @model_validator(mode="after")
    def validate_price(self):
        if self.selling_price > self.mrp:
            raise ValueError(
                "Selling price cannot be greater than MRP"
            )
        return self


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255
    )

    slug: str | None = Field(
        default=None,
        min_length=1,
        max_length=280
    )

    sku: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    category_id: UUID | None = None
    brand_id: UUID | None = None

    product_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

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

    status: str | None = Field(
        default=None,
        min_length=1,
        max_length=20
    )


class ProductResponse(ProductBase):
    id: UUID
    status: str

    model_config = ConfigDict(
        from_attributes=True
    )


class ProductImageSummary(BaseModel):
    id: UUID
    image_url: str
    is_primary: bool
    display_order: int

    model_config = ConfigDict(
        from_attributes=True
    )


class ProductRatingSummary(BaseModel):
    average: float
    count: int


class ProductInventorySummary(BaseModel):
    available: bool
    quantity: int


class ProductCategorySummary(BaseModel):
    id: UUID
    name: str

    model_config = ConfigDict(
        from_attributes=True
    )


class ProductBrandSummary(BaseModel):
    id: UUID
    name: str

    model_config = ConfigDict(
        from_attributes=True
    )


class ProductDetailResponse(BaseModel):
    id: UUID
    name: str
    sku: str
    slug: str

    short_description: str | None
    description: str | None

    selling_price: Decimal

    status: str

    category_id: UUID | None
    brand_id: UUID | None

    category: ProductCategorySummary | None
    brand: ProductBrandSummary | None

    images: list[ProductImageSummary]

    rating: ProductRatingSummary

    inventory: ProductInventorySummary

    model_config = ConfigDict(
        from_attributes=True
    )