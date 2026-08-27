from uuid import UUID

from pydantic import BaseModel, EmailStr, ConfigDict


class RegisterRequest(BaseModel):

    name: str

    email: EmailStr

    phone: str | None = None

    password: str


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID

    name: str

    email: EmailStr

    phone: str | None

    role: str

    is_active: bool


class TokenResponse(BaseModel):

    access_token: str

    token_type: str = "bearer"

    user: UserResponse