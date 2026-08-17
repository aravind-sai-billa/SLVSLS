from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.lorry import Lorry
from app.models.monthly_expense import MonthlyExpense
from app.models.trip import Trip
from app.models.trip_expense import TripExpense


def get_financial_lorries(
    db: Session,
    lorry_id: int | None = None,
) -> list[Lorry]:
    statement = select(Lorry)

    if lorry_id is not None:
        statement = statement.where(
            Lorry.lorry_id == lorry_id
        )

    statement = statement.order_by(
        Lorry.lorry_id
    )

    return list(
        db.scalars(statement).all()
    )


def get_lorry_freight(
    db: Session,
    lorry_id: int,
    date_from: date,
    date_to: date,
) -> Decimal:
    total = db.scalar(
        select(
            func.coalesce(
                func.sum(Trip.freight_amount),
                0,
            )
        ).where(
            Trip.lorry_id == lorry_id,
            Trip.loading_date >= date_from,
            Trip.loading_date <= date_to,
        )
    )

    return Decimal(str(total))


def get_lorry_trip_expenses(
    db: Session,
    lorry_id: int,
    date_from: date,
    date_to: date,
) -> Decimal:
    total = db.scalar(
        select(
            func.coalesce(
                func.sum(TripExpense.amount),
                0,
            )
        )
        .join(
            Trip,
            Trip.trip_id == TripExpense.trip_id,
        )
        .where(
            Trip.lorry_id == lorry_id,
            Trip.loading_date >= date_from,
            Trip.loading_date <= date_to,
        )
    )

    return Decimal(str(total))


def get_lorry_monthly_expenses(
    db: Session,
    lorry_id: int,
    date_from: date,
    date_to: date,
) -> Decimal:
    total = db.scalar(
        select(
            func.coalesce(
                func.sum(MonthlyExpense.amount),
                0,
            )
        ).where(
            MonthlyExpense.lorry_id == lorry_id,
            MonthlyExpense.expense_date >= date_from,
            MonthlyExpense.expense_date <= date_to,
        )
    )

    return Decimal(str(total))
