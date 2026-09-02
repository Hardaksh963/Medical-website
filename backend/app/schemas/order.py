from decimal import Decimal
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OrderStatusUpdate(BaseModel):
    status: str


class OrderItemResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_id: UUID
    quantity: int
    unit_price: Decimal
    subtotal: Decimal


class OrderResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    order_number: str
    status: str
    subtotal: Decimal
    shipping_cost: Decimal
    total_amount: Decimal
    created_at: datetime