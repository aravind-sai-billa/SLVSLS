from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
)
from app.services.user import (
    create_user_service,
    delete_user_service,
    get_user_service,
    get_users_service,
    update_user_service,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "",
    response_model=list[UserResponse],
)
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_users_service(
        db=db,
    )


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_user_service(
        db=db,
        data=data,
    )


@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_user_service(
        db=db,
        user_id=user_id,
    )


@router.put(
    "/{user_id}",
    response_model=UserResponse,
)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return update_user_service(
        db=db,
        user_id=user_id,
        data=data,
    )


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    delete_user_service(
        db=db,
        user_id=user_id,
        current_user_id=current_user.user_id,
    )

    return None
