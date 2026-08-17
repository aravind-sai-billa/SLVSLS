from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.repositories.expense_category import (
    create_expense_category,
    get_expense_categories,
    get_expense_category_by_id,
    get_expense_category_by_name_and_type,
    update_expense_category,
)
from app.schemas.expense_category import (
    ExpenseCategoryCreate,
    ExpenseCategoryUpdate,
)


VALID_CATEGORY_TYPES = {"TRIP", "MONTHLY"}


def create_expense_category_service(
    db: Session,
    data: ExpenseCategoryCreate,
    current_user_id: int,
):
    category_type = data.category_type.upper()
    name = data.name.strip()

    if category_type not in VALID_CATEGORY_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category type must be TRIP or MONTHLY",
        )

    existing = get_expense_category_by_name_and_type(
        db,
        name,
        category_type,
    )

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "An active expense category with this "
                "name already exists for this type"
            ),
        )

    try:
        category = create_expense_category(
            db=db,
            name=name,
            category_type=category_type,
            created_by=current_user_id,
            sort_order=data.sort_order,
        )

        db.commit()
        db.refresh(category)

        return category

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Expense category already exists",
        )


def get_expense_categories_service(
    db: Session,
    category_type: str | None = None,
    active_only: bool = True,
):
    if category_type is not None:
        category_type = category_type.upper()

        if category_type not in VALID_CATEGORY_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category type must be TRIP or MONTHLY",
            )

    return get_expense_categories(
        db=db,
        category_type=category_type,
        active_only=active_only,
    )


def get_expense_category_service(
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

    return category


def update_expense_category_service(
    db: Session,
    category_id: int,
    data: ExpenseCategoryUpdate,
    current_user_id: int,
):
    category = get_expense_category_service(
        db,
        category_id,
    )

    if data.name is not None:
        existing = get_expense_category_by_name_and_type(
            db,
            data.name.strip(),
            category.category_type,
        )

        if (
            existing is not None
            and existing.category_id != category_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "An active expense category with this "
                    "name already exists for this type"
                ),
            )

    try:
        update_expense_category(
            db=db,
            category=category,
            name=(
                data.name.strip()
                if data.name is not None
                else None
            ),
            sort_order=data.sort_order,
            is_active=data.is_active,
            updated_by=current_user_id,
        )

        db.commit()
        db.refresh(category)

        return category

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Expense category update conflicts with an existing category",
        )
