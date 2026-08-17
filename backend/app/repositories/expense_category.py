from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.expense_category import ExpenseCategory


def create_expense_category(
    db: Session,
    name: str,
    category_type: str,
    created_by: int,
    sort_order: int = 0,
) -> ExpenseCategory:
    category = ExpenseCategory(
        name=name,
        category_type=category_type,
        is_active=True,
        sort_order=sort_order,
        created_by=created_by,
    )

    db.add(category)
    db.flush()

    return category


def get_expense_category_by_id(
    db: Session,
    category_id: int,
) -> ExpenseCategory | None:
    return db.scalar(
        select(ExpenseCategory).where(
            ExpenseCategory.category_id == category_id
        )
    )


def get_expense_category_by_name_and_type(
    db: Session,
    name: str,
    category_type: str,
) -> ExpenseCategory | None:
    return db.scalar(
        select(ExpenseCategory).where(
            ExpenseCategory.name == name,
            ExpenseCategory.category_type == category_type,
            ExpenseCategory.is_active.is_(True),
        )
    )


def get_expense_categories(
    db: Session,
    category_type: str | None = None,
    active_only: bool = True,
) -> list[ExpenseCategory]:
    query = select(ExpenseCategory)

    if category_type is not None:
        query = query.where(
            ExpenseCategory.category_type == category_type
        )

    if active_only:
        query = query.where(
            ExpenseCategory.is_active.is_(True)
        )

    query = query.order_by(
        ExpenseCategory.sort_order,
        ExpenseCategory.category_id,
    )

    return list(db.scalars(query).all())


def update_expense_category(
    db: Session,
    category: ExpenseCategory,
    name: str | None = None,
    sort_order: int | None = None,
    is_active: bool | None = None,
    updated_by: int | None = None,
) -> ExpenseCategory:

    if name is not None:
        category.name = name

    if sort_order is not None:
        category.sort_order = sort_order

    if is_active is not None:
        category.is_active = is_active

    if updated_by is not None:
        category.updated_by = updated_by

    db.flush()

    return category
