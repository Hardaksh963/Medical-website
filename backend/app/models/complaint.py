import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("orders.id"),
        nullable=True
    )

    subject = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    status = Column(
        String(30),
        nullable=False,
        default="OPEN"
    )

    admin_response = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )