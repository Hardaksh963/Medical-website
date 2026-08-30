from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field


class BatchCreate(BaseModel):
    product_id: UUID
    batch_number: str = Field(min_length=1, max_length=100)
    quantity: int = Field(ge=0)
    manufacturing_date: date | None = None
    expiry_date: date | None = None


class BatchResponse(BaseModel):
    id: UUID
    product_id: UUID
    batch_number: str
    quantity: int
    manufacturing_date: date | None
    expiry_date: date | None
    is_active: bool

    model_config = {
        "from_attributes": True
    }


class InventoryAdjustment(BaseModel):
    batch_id: UUID
    quantity: int = Field(gt=0)
    movement_type: str
    reason: str | None = Field(default=None, max_length=255)


class InventoryMovementResponse(BaseModel):
    id: UUID
    product_id: UUID
    batch_id: UUID
    quantity: int
    movement_type: str
    reason: str | None
    created_at: object

    model_config = {
        "from_attributes": True
    }