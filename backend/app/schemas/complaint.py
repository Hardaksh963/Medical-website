from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ComplaintCreate(BaseModel):
    subject: str
    description: str
    order_id: UUID | None = None


class ComplaintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    order_id: UUID | None
    subject: str
    description: str
    status: str
    admin_response: str | None
    created_at: datetime
    updated_at: datetime


class ComplaintUpdate(BaseModel):
    status: str
    admin_response: str | None = None