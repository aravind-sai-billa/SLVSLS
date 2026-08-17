from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.expense_category import (
    get_expense_category_by_id,
)
from app.repositories.trip import get_trip_by_id
from app.repositories.trip_expense import (
    create_trip_expense,
    delete_trip_expense,
    get_trip_expense_by_category,
    get_trip_expense_by_id,
    get_trip_expense_total,
    get_trip_expenses,
    update_trip_expense,
)
from app.schemas.trip_expense import (
    TripExpenseCreate,
    TripExpenseUpdate,
)


OTHER_CATEGORY_NAME = "Other"


def get_trip_or_404(
    db: Session,
    trip_id: int,
):
    trip = get_trip_by_id(db, trip_id)

    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )

    return trip


def get_trip_expense_or_404(
    db: Session,
    trip_expense_id: int,
):
    expense = get_trip_expense_by_id(
        db,
        trip_expense_id,
    )

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip expense not found",
        )

    return expense


def validate_trip_category(
    db: Session,
    category_id: int,
):
    category = get_expense_category_by_id(
        db,
        category_id,
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense category not found",
        )

    if category.category_type != "TRIP":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only TRIP expense categories can be "
                "used for trip expenses"
            ),
        )

    if not category.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The selected expense category is disabled",
        )

    return category


def validate_other_expense(
    category_name: str,
    description: str | None,
    amount,
):
    if category_name == OTHER_CATEGORY_NAME:
        if not description:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Description is required for Other expenses",
            )

        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "Other expense amount must be greater than zero"
                ),
            )


def create_trip_expense_service(
    db: Session,
    trip_id: int,
    data: TripExpenseCreate,
):
    get_trip_or_404(
        db,
        trip_id,
    )

    category = validate_trip_category(
        db,
        data.category_id,
    )

    validate_other_expense(
        category.name,
        data.description,
        data.amount,
    )

    # Standard categories are one row per category per trip.
    # Other can contain unlimited rows.
    if category.name != OTHER_CATEGORY_NAME:
        existing = get_trip_expense_by_category(
            db,
            trip_id,
            data.category_id,
        )

        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This expense category already exists "
                    "for the selected trip"
                ),
            )

    expense = create_trip_expense(
        db=db,
        trip_id=trip_id,
        category_id=data.category_id,
        amount=data.amount,
        description=data.description,
    )

    db.commit()
    db.refresh(expense)

    return expense


def get_trip_expenses_service(
    db: Session,
    trip_id: int,
):
    get_trip_or_404(
        db,
        trip_id,
    )

    return get_trip_expenses(
        db,
        trip_id,
    )


def get_trip_expense_service(
    db: Session,
    trip_expense_id: int,
):
    return get_trip_expense_or_404(
        db,
        trip_expense_id,
    )


def get_trip_expense_total_service(
    db: Session,
    trip_id: int,
):
    get_trip_or_404(
        db,
        trip_id,
    )

    return get_trip_expense_total(
        db,
        trip_id,
    )


def update_trip_expense_service(
    db: Session,
    trip_expense_id: int,
    data: TripExpenseUpdate,
):
    expense = get_trip_expense_or_404(
        db,
        trip_expense_id,
    )

    new_category_id = (
        data.category_id
        if data.category_id is not None
        else expense.category_id
    )

    category = validate_trip_category(
        db,
        new_category_id,
    )

    new_description = (
        data.description
        if data.description is not None
        else expense.description
    )

    new_amount = (
        data.amount
        if data.amount is not None
        else expense.amount
    )

    validate_other_expense(
        category.name,
        new_description,
        new_amount,
    )

    if category.name != OTHER_CATEGORY_NAME:
        existing = get_trip_expense_by_category(
            db,
            expense.trip_id,
            new_category_id,
        )

        if (
            existing is not None
            and existing.trip_expense_id != expense.trip_expense_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This expense category already exists "
                    "for the selected trip"
                ),
            )

    update_trip_expense(
        db=db,
        expense=expense,
        category_id=new_category_id,
        amount=data.amount,
        description=data.description,
    )

    db.commit()
    db.refresh(expense)

    return expense


def delete_trip_expense_service(
    db: Session,
    trip_expense_id: int,
):
    expense = get_trip_expense_or_404(
        db,
        trip_expense_id,
    )

    delete_trip_expense(
        db,
        expense,
    )

    db.commit()
