from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.monthly_expense import MonthlyExpense


def create_monthly_expense(
    db: Session,
    expense_date: date,
    lorry_id: int,
    category_id: int,
    description: str | None,
    amount: Decimal,
    created_by: int,
) -> MonthlyExpense:
    expense = MonthlyExpense(
        expense_date=expense_date,
        lorry_id=lorry_id,
        category_id=category_id,
        description=description,
        amount=amount,
        created_by=created_by,
    )

    db.add(expense)
    db.flush()

    return expense


def get_monthly_expense_by_id(
    db: Session,
    monthly_expense_id: int,
) -> MonthlyExpense | None:
    return db.scalar(
        select(MonthlyExpense).where(
            MonthlyExpense.monthly_expense_id
            == monthly_expense_id
        )
    )


def get_monthly_expenses(
    db: Session,
    date_from: date | None = None,
    date_to: date | None = None,
    lorry_id: int | None = None,
    category_id: int | None = None,
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

    statement = statement.order_by(
        MonthlyExpense.expense_date.desc(),
        MonthlyExpense.monthly_expense_id.desc(),
    )

    return list(db.scalars(statement).all())


def update_monthly_expense(
    db: Session,
    expense: MonthlyExpense,
    expense_date: date | None = None,
    lorry_id: int | None = None,
    category_id: int | None = None,
    description: str | None = None,
    amount: Decimal | None = None,
    updated_by: int | None = None,
) -> MonthlyExpense:

    if expense_date is not None:
        expense.expense_date = expense_date

    if lorry_id is not None:
        expense.lorry_id = lorry_id

    if category_id is not None:
        expense.category_id = category_id

    if description is not None:
        expense.description = description

    if amount is not None:
        expense.amount = amount

    if updated_by is not None:
        expense.updated_by = updated_by

    db.flush()

    return expense


def delete_monthly_expense(
    db: Session,
    expense: MonthlyExpense,
) -> None:
    db.delete(expense)
    db.flush()
