from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .database import User, get_db

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterPayload(BaseModel):
    username: str
    password: str


@router.post("/register")
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    user = User(username=payload.username, password=payload.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created", "user_id": user.id}


@router.post("/login")
def login(payload: RegisterPayload, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.username == payload.username, User.password == payload.password)
        .first()
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"message": "Login successful", "user_id": user.id}
