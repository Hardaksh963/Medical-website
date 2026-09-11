import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.notification_service import (
    get_user_notifications,
    get_unread_notification_count,
    mark_notification_as_read,
    mark_all_notifications_as_read,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get(
    "",
    response_model=list[NotificationResponse],
)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_notifications(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/unread-count",
)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = get_unread_notification_count(
        db=db,
        user_id=current_user.id,
    )

    return {
        "unread_count": count,
    }


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_as_read(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return mark_notification_as_read(
        db=db,
        user_id=current_user.id,
        notification_id=notification_id,
    )


@router.patch(
    "/read-all",
    status_code=status.HTTP_200_OK,
)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mark_all_notifications_as_read(
        db=db,
        user_id=current_user.id,
    )

    return {
        "message": "All notifications marked as read",
    }