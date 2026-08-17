from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.lorry import (
    LorryCreate,
    LorryResponse,
    LorryUpdate,
)
from app.services.lorry import (
    create_lorry_service,
    delete_lorry_service,
    get_lorries_service,
    get_lorry_service,
    update_lorry_service,
)


router = APIRouter(
    prefix="/lorries",
    tags=["Lorries"],
)


@router.post(
    "",
    response_model=LorryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_lorry(
    data: LorryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_lorry_service(
        db,
        data,
    )


@router.get(
    "",
    response_model=list[LorryResponse],
)
def get_lorries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_lorries_service(db)


@router.get(
    "/{lorry_id}",
    response_model=LorryResponse,
)
def get_lorry(
    lorry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_lorry_service(
        db,
        lorry_id,
    )


@router.put(
    "/{lorry_id}",
    response_model=LorryResponse,
)
def update_lorry(
    lorry_id: int,
    data: LorryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return update_lorry_service(
        db,
        lorry_id,
        data,
    )


@router.delete(
    "/{lorry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_lorry(
    lorry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    delete_lorry_service(
        db,
        lorry_id,
    )