from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.user import User as UserSchema, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    if user_in.email and user_in.email != current_user.email:
        if crud.user.get_by_email(db, email=user_in.email):
            raise HTTPException(
                status_code=400,
                detail="The email is already in use.",
            )
    
    if user_in.username and user_in.username != current_user.username:
        if crud.user.get_by_username(db, username=user_in.username):
            raise HTTPException(
                status_code=400,
                detail="The username is already in use.",
            )
    
    user = crud.user.update(db, db_obj=current_user, obj_in=user_in)
    return user 