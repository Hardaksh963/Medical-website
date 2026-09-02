from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.api.admin_dependencies import get_current_admin

from app.models.user import User
from app.models.complaint import Complaint

from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintUpdate
)


router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)


# CUSTOMER: Create complaint
@router.post(
    "",
    response_model=ComplaintResponse
)
def create_complaint(
    data: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    complaint = Complaint(
        user_id=current_user.id,
        order_id=data.order_id,
        subject=data.subject,
        description=data.description
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    return complaint


# CUSTOMER: View own complaints
@router.get(
    "",
    response_model=list[ComplaintResponse]
)
def get_my_complaints(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    complaints = (
        db.query(Complaint)
        .filter(Complaint.user_id == current_user.id)
        .order_by(Complaint.created_at.desc())
        .all()
    )

    return complaints


# CUSTOMER: View one complaint


# ADMIN: View all complaints
@router.get(
    "/admin",
    response_model=list[ComplaintResponse]
)
def get_all_complaints(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    complaints = (
        db.query(Complaint)
        .order_by(Complaint.created_at.desc())
        .all()
    )

    return complaints


# ADMIN: Update complaint
@router.patch(
    "/admin/{complaint_id}",
    response_model=ComplaintResponse
)
def update_complaint(
    complaint_id: str,
    data: ComplaintUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    allowed_statuses = {
        "OPEN",
        "IN_PROGRESS",
        "RESOLVED",
        "CLOSED"
    }

    if data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid complaint status"
        )

    complaint = (
        db.query(Complaint)
        .filter(Complaint.id == complaint_id)
        .first()
    )

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    complaint.status = data.status
    complaint.admin_response = data.admin_response

    db.commit()
    db.refresh(complaint)

    return complaint

@router.get(
    "/{complaint_id}",
    response_model=ComplaintResponse
)
def get_my_complaint(
    complaint_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.id == complaint_id,
            Complaint.user_id == current_user.id
        )
        .first()
    )

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return complaint
