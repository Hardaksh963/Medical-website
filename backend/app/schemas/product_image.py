import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProductImageCreate(BaseModel):
    product_id: uuid.UUID
    image_url: str
    is_primary: bool = False
    display_order: int = 0


class ProductImageUpdate(BaseModel):
    image_url: str | None = None
    is_primary: bool | None = None
    display_order: int | None = None


class ProductImageResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    image_url: str
    is_primary: bool
    display_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)