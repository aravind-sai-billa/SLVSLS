from datetime import date

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.monthly_expense import MonthlyExpense
from app.models.trip import Trip


def get_trip_report_rows(
    db: Session,
    date_from: date | None = None,
    date_to: date | None = None,
    lorry_id: int | None = None,
    search: str | None = None,
) -> list[Trip]:
    statement = select(Trip)

    if date_from is not None:
        statement = statement.where(
            Trip.loading_date >= date_from
        )

    if date_to is not None:
        statement = statement.where(
            Trip.loading_date <= date_to
        )

    if lorry_id is not None:
        statement = statement.where(
            Trip.lorry_id == lorry_id
        )

    if search:
        keyword = f"%{search.strip()}%"

        statement = statement.where(
            or_(
                Trip.loading_location.ilike(keyword),
                Trip.unloading_location.ilike(keyword),
                Trip.notes.ilike(keyword),
            )
        )

    statement = statement.order_by(
        Trip.loading_date.desc(),
        Trip.trip_id.desc(),
    )

    return list(
        db.scalars(statement).all()
    )


def get_monthly_expense_report_rows(
    db: Session,
    date_from: date | None = None,
    date_to: date | None = None,
    lorry_id: int | None = None,
    category_id: int | None = None,
    search: str | None = None,
) -> list[MonthlyExpense]:
    statement = select(MonthlyExpense)

    if date_from is not None:
        statement = statement.where(
            MonthlyExpense.expense_date >= date_from
        )

    if date_to is not None:
        statement = statement.where(
            MonthlyExpense.expense_date <= date_to
        )

    if lorry_id is not None:
        statement = statement.where(
            MonthlyExpense.lorry_id == lorry_id
        )

    if category_id is not None:
        statement = statement.where(
            MonthlyExpense.category_id == category_id
        )

    if search:
        keyword = f"%{search.strip()}%"

        statement = statement.where(
            MonthlyExpense.description.ilike(keyword)
        )

    statement = statement.order_by(
        MonthlyExpense.expense_date.desc(),
        MonthlyExpense.monthly_expense_id.desc(),
    )

    return list(
        db.scalars(statement).all()
    )
