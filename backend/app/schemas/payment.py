import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PaymentCreate(BaseModel):
    order_id: uuid.UUID
    payment_method: str


class PaymentResponse(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    amount: Decimal
    payment_method: str
    status: str
    transaction_id: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)