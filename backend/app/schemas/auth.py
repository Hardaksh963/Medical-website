from uuid import UUID

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):

    name: str

    email: EmailStr

    phone: str | None = None

    password: str


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    id: UUID

    name: str

    email: EmailStr

    role: str

    is_active: bool

    model_config = {
        "from_attributes": True
    }


class TokenResponse(BaseModel):

    access_token: str

    token_type: str = "bearer"