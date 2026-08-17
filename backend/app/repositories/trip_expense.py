from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.trip_expense import TripExpense


def create_trip_expense(
    db: Session,
    trip_id: int,
    category_id: int,
    amount: Decimal,
    description: str | None = None,
) -> TripExpense:
    expense = TripExpense(
        trip_id=trip_id,
        category_id=category_id,
        amount=amount,
        description=description,
    )

    db.add(expense)
    db.flush()

    return expense


def get_trip_expense_by_id(
    db: Session,
    trip_expense_id: int,
) -> TripExpense | None:
    return db.scalar(
        select(TripExpense).where(
            TripExpense.trip_expense_id == trip_expense_id
        )
    )


def get_trip_expenses(
    db: Session,
    trip_id: int,
) -> list[TripExpense]:
    return list(
        db.scalars(
            select(TripExpense)
            .where(
                TripExpense.trip_id == trip_id
            )
            .order_by(
                TripExpense.trip_expense_id
            )
        ).all()
    )


def get_trip_expense_by_category(
    db: Session,
    trip_id: int,
    category_id: int,
) -> TripExpense | None:
    return db.scalar(
        select(TripExpense).where(
            TripExpense.trip_id == trip_id,
            TripExpense.category_id == category_id,
        )
    )


def get_trip_expense_total(
    db: Session,
    trip_id: int,
) -> Decimal:
    total = db.scalar(
        select(
            func.coalesce(
                func.sum(TripExpense.amount),
                0,
            )
        ).where(
            TripExpense.trip_id == trip_id
        )
    )

    return Decimal(str(total))


def update_trip_expense(
    db: Session,
    expense: TripExpense,
    category_id: int | None = None,
    amount: Decimal | None = None,
    description: str | None = None,
) -> TripExpense:

    if category_id is not None:
        expense.category_id = category_id

    if amount is not None:
        expense.amount = amount

    if description is not None:
        expense.description = description

    db.flush()

    return expense


def delete_trip_expense(
    db: Session,
    expense: TripExpense,
) -> None:
    db.delete(expense)
    db.flush()
