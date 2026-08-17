from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.trip_expense import (
    TripExpenseCreate,
    TripExpenseResponse,
    TripExpenseTotalResponse,
    TripExpenseUpdate,
)
from app.services.trip_expense import (
    create_trip_expense_service,
    delete_trip_expense_service,
    get_trip_expense_service,
    get_trip_expense_total_service,
    get_trip_expenses_service,
    update_trip_expense_service,
)


router = APIRouter(
    prefix="/trip-expenses",
    tags=["Trip Expenses"],
)


@router.post(
    "/trip/{trip_id}",
    response_model=TripExpenseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_trip_expense(
    trip_id: int,
    data: TripExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_trip_expense_service(
        db=db,
        trip_id=trip_id,
        data=data,
    )


@router.get(
    "/trip/{trip_id}",
    response_model=list[TripExpenseResponse],
)
def get_trip_expenses(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_trip_expenses_service(
        db=db,
        trip_id=trip_id,
    )


@router.get(
    "/trip/{trip_id}/total",
    response_model=TripExpenseTotalResponse,
)
def get_trip_expense_total(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    total = get_trip_expense_total_service(
        db=db,
        trip_id=trip_id,
    )

    return {
        "trip_id": trip_id,
        "total_expenses": total,
    }


@router.get(
    "/{trip_expense_id}",
    response_model=TripExpenseResponse,
)
def get_trip_expense(
    trip_expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_trip_expense_service(
        db=db,
        trip_expense_id=trip_expense_id,
    )


@router.put(
    "/{trip_expense_id}",
    response_model=TripExpenseResponse,
)
def update_trip_expense(
    trip_expense_id: int,
    data: TripExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return update_trip_expense_service(
        db=db,
        trip_expense_id=trip_expense_id,
        data=data,
    )


@router.delete(
    "/{trip_expense_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_trip_expense(
    trip_expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    delete_trip_expense_service(
        db=db,
        trip_expense_id=trip_expense_id,
    )

    return None
