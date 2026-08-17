from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_users(
    db: Session,
) -> list[User]:
    return list(
        db.scalars(
            select(User).order_by(
                User.user_id.asc()
            )
        ).all()
    )


def get_user_by_id(
    db: Session,
    user_id: int,
) -> User | None:
    return db.scalar(
        select(User).where(
            User.user_id == user_id
        )
    )


def get_user_by_username(
    db: Session,
    username: str,
) -> User | None:
    return db.scalar(
        select(User).where(
            User.username == username
        )
    )


def create_user(
    db: Session,
    username: str,
    password_hash: str,
    role: str,
    status: str,
) -> User:
    user = User(
        username=username,
        password_hash=password_hash,
        role=role,
        status=status,
    )

    db.add(user)
    db.flush()

    return user


def update_user(
    db: Session,
    user: User,
    username: str | None = None,
    password_hash: str | None = None,
    role: str | None = None,
    status: str | None = None,
) -> User:

    if username is not None:
        user.username = username

    if password_hash is not None:
        user.password_hash = password_hash

    if role is not None:
        user.role = role

    if status is not None:
        user.status = status

    db.flush()

    return user


def delete_user(
    db: Session,
    user: User,
) -> None:
    db.delete(user)
    db.flush()
