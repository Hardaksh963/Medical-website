import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WishlistResponse(BaseModel):

    id: uuid.UUID
    product_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class WishlistItemResponse(BaseModel):

    id: uuid.UUID
    product_id: uuid.UUID

    name: str
    slug: str
    selling_price: float

    image_url: str | None

    available: bool

    created_at: datetime