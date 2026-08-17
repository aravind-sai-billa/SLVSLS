from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.lorry import Lorry


def create_lorry(
    db: Session,
    registration_number: str,
    nickname: str | None,
    owner_name: str,
) -> Lorry:
    lorry = Lorry(
        registration_number=registration_number,
        nickname=nickname,
        owner_name=owner_name,
    )

    db.add(lorry)
    db.flush()

    return lorry


def get_lorry_by_id(
    db: Session,
    lorry_id: int,
) -> Lorry | None:
    return db.scalar(
        select(Lorry).where(
            Lorry.lorry_id == lorry_id
        )
    )


def get_lorry_by_registration_number(
    db: Session,
    registration_number: str,
) -> Lorry | None:
    return db.scalar(
        select(Lorry).where(
            Lorry.registration_number == registration_number
        )
    )


def get_lorries(
    db: Session,
) -> list[Lorry]:
    return list(
        db.scalars(
            select(Lorry).order_by(Lorry.lorry_id)
        ).all()
    )


def update_lorry(
    db: Session,
    lorry: Lorry,
    registration_number: str | None = None,
    nickname: str | None = None,
    owner_name: str | None = None,
) -> Lorry:
    if registration_number is not None:
        lorry.registration_number = registration_number

    if nickname is not None:
        lorry.nickname = nickname

    if owner_name is not None:
        lorry.owner_name = owner_name

    db.flush()

    return lorry


def delete_lorry(
    db: Session,
    lorry: Lorry,
) -> None:
    db.delete(lorry)
    db.flush()