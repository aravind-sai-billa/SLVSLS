from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.repositories.user import (
    create_user,
    delete_user,
    get_user_by_id,
    get_user_by_username,
    get_users,
    update_user,
)
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    VALID_USER_ROLES,
    VALID_USER_STATUSES,
)


def normalize_username(username: str) -> str:
    username = username.strip()

    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username cannot be empty",
        )

    return username


def validate_role(role: str) -> str:
    role = role.strip().upper()

    if role not in VALID_USER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be ADMIN or USER",
        )

    return role


def validate_status(user_status: str) -> str:
    user_status = user_status.strip().upper()

    if user_status not in VALID_USER_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be ACTIVE or INACTIVE",
        )

    return user_status


def get_users_service(
    db: Session,
):
    return get_users(db)


def get_user_service(
    db: Session,
    user_id: int,
):
    user = get_user_by_id(
        db,
        user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


def create_user_service(
    db: Session,
    data: UserCreate,
):
    username = normalize_username(data.username)
    role = validate_role(data.role)
    user_status = validate_status(data.status)

    existing = get_user_by_username(
        db,
        username,
    )

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )

    password_hash = hash_password(
        data.password,
    )

    try:
        user = create_user(
            db=db,
            username=username,
            password_hash=password_hash,
            role=role,
            status=user_status,
        )

        db.commit()
        db.refresh(user)

        return user

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )


def update_user_service(
    db: Session,
    user_id: int,
    data: UserUpdate,
):
    user = get_user_service(
        db,
        user_id,
    )

    username = None
    password_hash = None
    role = None
    user_status = None

    if data.username is not None:
        username = normalize_username(
            data.username
        )

        existing = get_user_by_username(
            db,
            username,
        )

        if (
            existing is not None
            and existing.user_id != user_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists",
            )

    if data.password is not None:
        password_hash = hash_password(
            data.password,
        )

    if data.role is not None:
        role = validate_role(
            data.role
        )

    if data.status is not None:
        user_status = validate_status(
            data.status
        )

    try:
        update_user(
            db=db,
            user=user,
            username=username,
            password_hash=password_hash,
            role=role,
            status=user_status,
        )

        db.commit()
        db.refresh(user)

        return user

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )


def delete_user_service(
    db: Session,
    user_id: int,
    current_user_id: int,
):
    user = get_user_service(
        db,
        user_id,
    )

    if user.user_id == current_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account",
        )

    try:
        delete_user(
            db,
            user,
        )

        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "User cannot be deleted because "
                "the account is referenced by existing records"
            ),
        )
