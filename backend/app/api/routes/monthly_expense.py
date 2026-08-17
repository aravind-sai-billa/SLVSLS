from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.monthly_expense import (
    MonthlyExpenseCreate,
    MonthlyExpenseResponse,
    MonthlyExpenseUpdate,
)
from app.services.monthly_expense import (
    create_monthly_expense_service,
    delete_monthly_expense_service,
    get_monthly_expense_service,
    get_monthly_expenses_service,
    update_monthly_expense_service,
)


router = APIRouter(
    prefix="/monthly-expenses",
    tags=["Monthly Expenses"],
)


@router.post(
    "",
    response_model=MonthlyExpenseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_monthly_expense(
    data: MonthlyExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_monthly_expense_service(
        db=db,
        data=data,
        current_user_id=current_user.user_id,
    )


@router.get(
    "",
    response_model=list[MonthlyExpenseResponse],
)
def get_monthly_expenses(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    lorry_id: int | None = Query(
        default=None,
        gt=0,
    ),
    category_id: int | None = Query(
        default=None,
        gt=0,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_monthly_expenses_service(
        db=db,
        date_from=date_from,
        date_to=date_to,
        lorry_id=lorry_id,
        category_id=category_id,
    )


@router.get(
    "/{monthly_expense_id}",
    response_model=MonthlyExpenseResponse,
)
def get_monthly_expense(
    monthly_expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_monthly_expense_service(
        db=db,
        monthly_expense_id=monthly_expense_id,
    )


@router.put(
    "/{monthly_expense_id}",
    response_model=MonthlyExpenseResponse,
)
def update_monthly_expense(
    monthly_expense_id: int,
    data: MonthlyExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return update_monthly_expense_service(
        db=db,
        monthly_expense_id=monthly_expense_id,
        data=data,
        current_user_id=current_user.user_id,
    )


@router.delete(
    "/{monthly_expense_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_monthly_expense(
    monthly_expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    delete_monthly_expense_service(
        db=db,
        monthly_expense_id=monthly_expense_id,
    )

    return None
