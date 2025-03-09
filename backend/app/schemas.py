from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class TransactionCreate(BaseModel):
    amount: float
    description: str
    category: str
    date: Optional[datetime] = None

class TransactionResponse(BaseModel):
    id: int
    amount: float
    description: str
    category: str
    date: datetime 