from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.crud.user import authenticate, get_by_email, get_by_username, create as create_user_crud
from app.schemas.token import Token
from app.schemas.user import User, UserCreate
from app.api.deps import get_db
from app.core.config import settings
from app.core.security import create_access_token

router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/register", response_model=User)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    # Debug statements for troubleshooting
    print("DEBUG: Registration attempt")
    print(f"DEBUG: Email: {user_in.email}, Username: {user_in.username}")
    
    # Comment this out when not actively debugging
    # import pdb; pdb.set_trace()
    
    # Use the directly imported functions instead of crud.user
    user = get_by_email(db, user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Use the directly imported function
    username_exists = get_by_username(db, user_in.username)
    if username_exists:
        raise HTTPException(
            status_code=400,
            detail="The username is already taken.",
        )
    
    user = create_user_crud(db, obj_in=user_in)
    return user 