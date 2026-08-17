from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.session import get_db
from app.models.user import User

from app.schemas.trip import (
    TripCreate,
    TripCreateResponse,
    TripDetailResponse,
    TripResponse,
    TripUpdate,
)

from app.services.trip import (
    create_trip_service,
    delete_trip_service,
    get_trip_service,
    get_trips_by_lorry_service,
    get_trips_service,
    update_trip_service,
)


router = APIRouter(
    prefix="/trips",
    tags=["Trips"],
)


@router.post(
    "",
    response_model=TripCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_trip(
    data: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = create_trip_service(
        db=db,
        data=data,
        current_user_id=current_user.user_id,
    )

    return {
        **result["trip"].__dict__,
        "expenses": result["expenses"],
        "total_expenses": result["total_expenses"],
        "gross_profit": result["gross_profit"],
    }


@router.get(
    "",
    response_model=list[TripResponse],
)
def get_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    results = get_trips_service(db)

    return [
        {
            **result["trip"].__dict__,
            "total_expenses": result["total_expenses"],
            "gross_profit": result["gross_profit"],
        }
        for result in results
    ]


@router.get(
    "/lorry/{lorry_id}",
    response_model=list[TripResponse],
)
def get_trips_by_lorry(
    lorry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    results = get_trips_by_lorry_service(
        db,
        lorry_id,
    )

    return [
        {
            **result["trip"].__dict__,
            "total_expenses": result["total_expenses"],
            "gross_profit": result["gross_profit"],
        }
        for result in results
    ]


@router.get(
    "/{trip_id}",
    response_model=TripDetailResponse,
)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = get_trip_service(
        db,
        trip_id,
    )

    return {
        **result["trip"].__dict__,
        "expenses": result["expenses"],
        "total_expenses": result["total_expenses"],
        "gross_profit": result["gross_profit"],
    }


@router.put(
    "/{trip_id}",
    response_model=TripDetailResponse,
)
def update_trip(
    trip_id: int,
    data: TripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = update_trip_service(
        db=db,
        trip_id=trip_id,
        data=data,
        current_user_id=current_user.user_id,
    )

    return {
        **result["trip"].__dict__,
        "expenses": result["expenses"],
        "total_expenses": result["total_expenses"],
        "gross_profit": result["gross_profit"],
    }


@router.delete(
    "/{trip_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    delete_trip_service(
        db=db,
        trip_id=trip_id,
    )

    return None
