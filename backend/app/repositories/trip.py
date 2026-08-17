from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.trip import Trip


def create_trip(
    db: Session,
    loading_date: date,
    lorry_id: int,
    loading_location: str,
    unloading_location: str,
    freight_amount: Decimal,
    notes: str | None,
    created_by: int,
) -> Trip:
    trip = Trip(
        loading_date=loading_date,
        lorry_id=lorry_id,
        loading_location=loading_location,
        unloading_location=unloading_location,
        freight_amount=freight_amount,
        notes=notes,
        created_by=created_by,
    )

    db.add(trip)
    db.flush()

    return trip


def get_trip_by_id(
    db: Session,
    trip_id: int,
) -> Trip | None:
    return db.scalar(
        select(Trip).where(
            Trip.trip_id == trip_id
        )
    )


def get_trips(
    db: Session,
) -> list[Trip]:
    return list(
        db.scalars(
            select(Trip).order_by(
                Trip.loading_date.desc(),
                Trip.trip_id.desc(),
            )
        ).all()
    )


def get_trips_by_lorry(
    db: Session,
    lorry_id: int,
) -> list[Trip]:
    return list(
        db.scalars(
            select(Trip)
            .where(Trip.lorry_id == lorry_id)
            .order_by(
                Trip.loading_date.desc(),
                Trip.trip_id.desc(),
            )
        ).all()
    )


def update_trip(
    db: Session,
    trip: Trip,
    loading_date: date | None = None,
    lorry_id: int | None = None,
    loading_location: str | None = None,
    unloading_location: str | None = None,
    freight_amount: Decimal | None = None,
    notes: str | None = None,
    updated_by: int | None = None,
) -> Trip:
    if loading_date is not None:
        trip.loading_date = loading_date

    if lorry_id is not None:
        trip.lorry_id = lorry_id

    if loading_location is not None:
        trip.loading_location = loading_location

    if unloading_location is not None:
        trip.unloading_location = unloading_location

    if freight_amount is not None:
        trip.freight_amount = freight_amount

    if notes is not None:
        trip.notes = notes

    if updated_by is not None:
        trip.updated_by = updated_by

    db.flush()

    return trip


def delete_trip(
    db: Session,
    trip: Trip,
) -> None:
    db.delete(trip)
    db.flush()