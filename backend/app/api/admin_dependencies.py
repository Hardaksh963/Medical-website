from fastapi import Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.models.user import User


def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user