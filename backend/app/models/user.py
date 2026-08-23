import uuid

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    phone: Mapped[str | None] = mapped_column(
        String(20)
    )

    password_hash: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        Enum(
            "CUSTOMER",
            "ADMIN",
            name="user_role",
            create_type=False
        ),
        nullable=False,
        default="CUSTOMER"
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )