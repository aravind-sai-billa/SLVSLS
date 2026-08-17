from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.expense_category import ExpenseCategory

from app.repositories.lorry import get_lorry_by_id

from app.repositories.trip import (
    create_trip,
    delete_trip,
    get_trip_by_id,
    get_trips,
    get_trips_by_lorry,
    update_trip,
)

from app.repositories.trip_expense import (
    create_trip_expense,
    delete_trip_expense,
    get_trip_expenses,
    get_trip_expense_total,
)

from app.schemas.trip import TripCreate, TripUpdate


OTHER_CATEGORY_NAME = "Other"


def validate_trip_expense_category(
    db: Session,
    category_id: int,
):
    category = db.get(
        ExpenseCategory,
        category_id,
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Expense category {category_id} not found"
            ),
        )

    if category.category_type != "TRIP":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only TRIP expense categories can "
                "be used for trip expenses"
            ),
        )

    if not category.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Expense category '{category.name}' "
                "is disabled"
            ),
        )

    return category


def validate_and_create_expenses(
    db: Session,
    trip_id: int,
    expenses,
):
    created_expenses = []
    standard_category_ids = set()

    for expense_data in expenses:

        category = validate_trip_expense_category(
            db,
            expense_data.category_id,
        )

        # ----------------------------------------------------
        # Other expenses
        # ----------------------------------------------------

        if category.name == OTHER_CATEGORY_NAME:

            if not expense_data.description:
                raise HTTPException(
                    status_code=(
                        status.HTTP_422_UNPROCESSABLE_ENTITY
                    ),
                    detail=(
                        "Description is required "
                        "for Other expenses"
                    ),
                )

            if expense_data.amount <= 0:
                raise HTTPException(
                    status_code=(
                        status.HTTP_422_UNPROCESSABLE_ENTITY
                    ),
                    detail=(
                        "Other expense amount must "
                        "be greater than zero"
                    ),
                )

        # ----------------------------------------------------
        # Normal categories
        # ----------------------------------------------------

        else:

            if expense_data.category_id in standard_category_ids:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        f"Expense category "
                        f"'{category.name}' "
                        "was supplied more than once"
                    ),
                )

            standard_category_ids.add(
                expense_data.category_id
            )

            if expense_data.amount < 0:
                raise HTTPException(
                    status_code=(
                        status.HTTP_422_UNPROCESSABLE_ENTITY
                    ),
                    detail=(
                        "Expense amount cannot be negative"
                    ),
                )

        expense = create_trip_expense(
            db=db,
            trip_id=trip_id,
            category_id=expense_data.category_id,
            amount=expense_data.amount,
            description=expense_data.description,
        )

        created_expenses.append(expense)

    return created_expenses


def build_trip_result(
    db: Session,
    trip,
):
    expenses = get_trip_expenses(
        db,
        trip.trip_id,
    )

    total_expenses = get_trip_expense_total(
        db,
        trip.trip_id,
    )

    gross_profit = (
        trip.freight_amount
        - total_expenses
    )

    return {
        "trip": trip,
        "expenses": expenses,
        "total_expenses": total_expenses,
        "gross_profit": gross_profit,
    }


def get_trip_service(
    db: Session,
    trip_id: int,
):
    trip = get_trip_by_id(
        db,
        trip_id,
    )

    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )

    return build_trip_result(
        db,
        trip,
    )


def create_trip_service(
    db: Session,
    data: TripCreate,
    current_user_id: int,
):
    try:

        lorry = get_lorry_by_id(
            db,
            data.lorry_id,
        )

        if lorry is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lorry not found",
            )

        trip = create_trip(
            db=db,
            loading_date=data.loading_date,
            lorry_id=data.lorry_id,
            loading_location=data.loading_location,
            unloading_location=data.unloading_location,
            freight_amount=data.freight_amount,
            notes=data.notes,
            created_by=current_user_id,
        )

        validate_and_create_expenses(
            db=db,
            trip_id=trip.trip_id,
            expenses=data.expenses,
        )

        result = build_trip_result(
            db,
            trip,
        )

        db.commit()

        db.refresh(trip)

        for expense in result["expenses"]:
            db.refresh(expense)

        result["trip"] = trip

        return result

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise


def get_trips_service(
    db: Session,
):
    trips = get_trips(db)

    results = []

    for trip in trips:
        results.append(
            build_trip_result(
                db,
                trip,
            )
        )

    return results


def get_trips_by_lorry_service(
    db: Session,
    lorry_id: int,
):
    lorry = get_lorry_by_id(
        db,
        lorry_id,
    )

    if lorry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lorry not found",
        )

    trips = get_trips_by_lorry(
        db,
        lorry_id,
    )

    results = []

    for trip in trips:
        results.append(
            build_trip_result(
                db,
                trip,
            )
        )

    return results


def update_trip_service(
    db: Session,
    trip_id: int,
    data: TripUpdate,
    current_user_id: int,
):
    trip = get_trip_by_id(
        db,
        trip_id,
    )

    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )

    try:

        if data.lorry_id is not None:

            lorry = get_lorry_by_id(
                db,
                data.lorry_id,
            )

            if lorry is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Lorry not found",
                )

        update_trip(
            db=db,
            trip=trip,
            loading_date=data.loading_date,
            lorry_id=data.lorry_id,
            loading_location=data.loading_location,
            unloading_location=data.unloading_location,
            freight_amount=data.freight_amount,
            notes=data.notes,
            updated_by=current_user_id,
        )

        # ----------------------------------------------------
        # If expenses are supplied, replace the Trip's
        # expense set atomically.
        #
        # This means Edit Trip always leaves the database
        # internally consistent.
        # ----------------------------------------------------

        if data.expenses is not None:

            existing_expenses = get_trip_expenses(
                db,
                trip.trip_id,
            )

            for expense in existing_expenses:
                delete_trip_expense(
                    db,
                    expense,
                )

            validate_and_create_expenses(
                db=db,
                trip_id=trip.trip_id,
                expenses=data.expenses,
            )

        result = build_trip_result(
            db,
            trip,
        )

        db.commit()

        db.refresh(trip)

        result["trip"] = trip

        for expense in result["expenses"]:
            db.refresh(expense)

        return result

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise


def delete_trip_service(
    db: Session,
    trip_id: int,
):
    trip = get_trip_by_id(
        db,
        trip_id,
    )

    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )

    try:

        delete_trip(
            db,
            trip,
        )

        db.commit()

    except Exception:
        db.rollback()
        raise
