from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.expense_category import (
    ExpenseCategoryCreate,
    ExpenseCategoryResponse,
    ExpenseCategoryUpdate,
)
from app.services.expense_category import (
    create_expense_category_service,
    get_expense_categories_service,
    get_expense_category_service,
    update_expense_category_service,
)


router = APIRouter(
    prefix="/expense-categories",
    tags=["Expense Categories"],
)


@router.post(
    "",
    response_model=ExpenseCategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_expense_category(
    data: ExpenseCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_expense_category_service(
        db=db,
        data=data,
        current_user_id=current_user.user_id,
    )


@router.get(
    "",
    response_model=list[ExpenseCategoryResponse],
)
def get_expense_categories(
    category_type: str | None = Query(
        default=None,
        pattern="^(TRIP|MONTHLY)$",
    ),
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_expense_categories_service(
        db=db,
        category_type=category_type,
        active_only=active_only,
    )


@router.get(
    "/{category_id}",
    response_model=ExpenseCategoryResponse,
)
def get_expense_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_expense_category_service(
        db=db,
        category_id=category_id,
    )


@router.put(
    "/{category_id}",
    response_model=ExpenseCategoryResponse,
)
def update_expense_category(
    category_id: int,
    data: ExpenseCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return update_expense_category_service(
        db=db,
        category_id=category_id,
        data=data,
        current_user_id=current_user.user_id,
    )
