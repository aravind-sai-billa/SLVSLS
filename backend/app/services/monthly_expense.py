from datetime import date
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.expense_category import ExpenseCategory
from app.models.lorry import Lorry
from app.schemas.monthly_expense import (
    MonthlyExpenseCreate,
    MonthlyExpenseUpdate,
)
from app.repositories.monthly_expense import (
    create_monthly_expense,
    delete_monthly_expense,
    get_monthly_expense_by_id,
    get_monthly_expenses,
    update_monthly_expense,
)


def _validate_lorry(
    db: Session,
    lorry_id: int,
) -> None:
    lorry = db.get(Lorry, lorry_id)

    if lorry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lorry not found",
        )


def _validate_monthly_category(
    db: Session,
    category_id: int,
) -> None:
    category = db.get(
        ExpenseCategory,
        category_id,
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense category not found",
        )

    if category.category_type != "MONTHLY":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected expense category is not a MONTHLY category",
        )

    if not category.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected expense category is inactive",
        )


def create_monthly_expense_service(
    db: Session,
    data: MonthlyExpenseCreate,
    current_user_id: int,
):
    _validate_lorry(
        db,
        data.lorry_id,
    )

    _validate_monthly_category(
        db,
        data.category_id,
    )

    if data.amount < Decimal("0"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount cannot be negative",
        )

    expense = create_monthly_expense(
        db=db,
        expense_date=data.expense_date,
        lorry_id=data.lorry_id,
        category_id=data.category_id,
        description=data.description,
        amount=data.amount,
        created_by=current_user_id,
    )

    db.commit()
    db.refresh(expense)

    return expense


def get_monthly_expenses_service(
    db: Session,
    date_from: date | None = None,
    date_to: date | None = None,
    lorry_id: int | None = None,
    category_id: int | None = None,
):
    if (
        date_from is not None
        and date_to is not None
        and date_from > date_to
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date From cannot be later than Date To",
        )

    if lorry_id is not None:
        _validate_lorry(
            db,
            lorry_id,
        )

    if category_id is not None:
        _validate_monthly_category(
            db,
            category_id,
        )

    return get_monthly_expenses(
        db=db,
        date_from=date_from,
        date_to=date_to,
        lorry_id=lorry_id,
        category_id=category_id,
    )


def get_monthly_expense_service(
    db: Session,
    monthly_expense_id: int,
):
    expense = get_monthly_expense_by_id(
        db,
        monthly_expense_id,
    )

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly expense not found",
        )

    return expense


def update_monthly_expense_service(
    db: Session,
    monthly_expense_id: int,
    data: MonthlyExpenseUpdate,
    current_user_id: int,
):
    expense = get_monthly_expense_by_id(
        db,
        monthly_expense_id,
    )

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly expense not found",
        )

    if data.lorry_id is not None:
        _validate_lorry(
            db,
            data.lorry_id,
        )

    if data.category_id is not None:
        _validate_monthly_category(
            db,
            data.category_id,
        )

    if (
        data.amount is not None
        and data.amount < Decimal("0")
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount cannot be negative",
        )

    update_monthly_expense(
        db=db,
        expense=expense,
        expense_date=data.expense_date,
        lorry_id=data.lorry_id,
        category_id=data.category_id,
        description=data.description,
        amount=data.amount,
        updated_by=current_user_id,
    )

    db.commit()
    db.refresh(expense)

    return expense


def delete_monthly_expense_service(
    db: Session,
    monthly_expense_id: int,
):
    expense = get_monthly_expense_by_id(
        db,
        monthly_expense_id,
    )

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly expense not found",
        )

    delete_monthly_expense(
        db,
        expense,
    )

    db.commit()
