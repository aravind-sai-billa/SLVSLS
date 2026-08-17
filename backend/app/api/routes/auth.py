from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.security import create_access_token, verify_password
from app.schemas.auth import LoginRequest, TokenResponse
from app.api.dependencies import get_current_user, require_admin

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/login", response_model=TokenResponse)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    statement = select(User).where(
        User.username == credentials.username
    )

    user = db.scalar(statement)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    if not verify_password(
        credentials.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token = create_access_token(
        subject=str(user.user_id),
        role=user.role,
    )

    return TokenResponse(
        access_token=access_token,
    )


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "role": current_user.role,
        "status": current_user.status,
    }

@router.get("/admin-test")
def admin_test(
    current_user: User = Depends(require_admin),
):
    return {
        "message": "ADMIN access confirmed",
        "user_id": current_user.user_id,
        "username": current_user.username,
        "role": current_user.role,
    }

