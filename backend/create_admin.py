from getpass import getpass

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User


username = input("Admin username: ").strip()
password = getpass("Admin password: ")

if not username:
    raise SystemExit("Username cannot be empty.")

if not password:
    raise SystemExit("Password cannot be empty.")

with SessionLocal() as db:
    existing_user = db.scalar(
        select(User).where(User.username == username)
    )

    if existing_user:
        raise SystemExit("A user with this username already exists.")

    user = User(
        username=username,
        password_hash=hash_password(password),
        role="ADMIN",
        status="ACTIVE",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    print()
    print("ADMIN USER CREATED SUCCESSFULLY")
    print("User ID:", user.user_id)
    print("Username:", user.username)
    print("Role:", user.role)
    print("Status:", user.status)
