import uuid
from datetime import datetime

from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class WishlistAdd(BaseModel):
    product_id: uuid.UUID


class WishlistProductResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    selling_price: Decimal
    status: str

    model_config = ConfigDict(
        from_attributes=True
    )


class WishlistResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    created_at: datetime
    product: WishlistProductResponse | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


class WishlistCheckResponse(BaseModel):
    product_id: uuid.UUID
    wishlisted: bool