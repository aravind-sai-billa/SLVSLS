from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.lorry import (
    create_lorry,
    delete_lorry,
    get_lorries,
    get_lorry_by_id,
    get_lorry_by_registration_number,
    update_lorry,
)
from app.schemas.lorry import LorryCreate, LorryUpdate


def create_lorry_service(
    db: Session,
    data: LorryCreate,
):
    existing_lorry = get_lorry_by_registration_number(
        db,
        data.registration_number,
    )

    if existing_lorry is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A lorry with this registration number already exists",
        )

    lorry = create_lorry(
        db=db,
        registration_number=data.registration_number,
        nickname=data.nickname,
        owner_name=data.owner_name,
    )

    db.commit()
    db.refresh(lorry)

    return lorry


def get_lorry_service(
    db: Session,
    lorry_id: int,
):
    lorry = get_lorry_by_id(
        db,
        lorry_id,
    )

    if lorry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lorry not found",
        )

    return lorry


def get_lorries_service(
    db: Session,
):
    return get_lorries(db)


def update_lorry_service(
    db: Session,
    lorry_id: int,
    data: LorryUpdate,
):
    lorry = get_lorry_service(
        db,
        lorry_id,
    )

    if data.registration_number is not None:
        existing_lorry = get_lorry_by_registration_number(
            db,
            data.registration_number,
        )

        if (
            existing_lorry is not None
            and existing_lorry.lorry_id != lorry_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A lorry with this registration number already exists",
            )

    update_lorry(
        db=db,
        lorry=lorry,
        registration_number=data.registration_number,
        nickname=data.nickname,
        owner_name=data.owner_name,
    )

    db.commit()
    db.refresh(lorry)

    return lorry


def delete_lorry_service(
    db: Session,
    lorry_id: int,
):
    lorry = get_lorry_service(
        db,
        lorry_id,
    )

    try:
        delete_lorry(
            db,
            lorry,
        )
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Lorry cannot be deleted because it is "
                "referenced by existing records"
            ),
        )