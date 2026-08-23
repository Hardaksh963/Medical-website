from fastapi import Depends, HTTPException

from app.api.dependencies import get_current_user
from app.models.user import User


def require_admin(
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "ADMIN":

        raise HTTPException(
            status_code=403,
            detail="Administrator access required"
        )

    return current_user