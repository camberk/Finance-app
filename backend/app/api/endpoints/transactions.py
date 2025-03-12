from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.transactions import Transaction
from app.enums.transaction_types import TransactionType
from app.enums.expense_categories import ExpenseCategory

router = APIRouter()

class TransactionCreate(BaseModel):
    amount: float
    transaction_type: str
    expense_category: str
    transaction_date: date
    description: Optional[str] = None
    
    class Config:
        orm_mode = True

class TransactionResponse(BaseModel):
    transaction_id: int
    user_id: int
    amount: float
    transaction_type: str
    expense_category: str
    transaction_date: date
    description: Optional[str]
    created_at: datetime
    
    class Config:
        orm_mode = True


@router.post("/", response_model=TransactionResponse)
def create_transaction(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    transaction_data: TransactionCreate,
):
    """
    Create a new transaction for the current user.
    """
    # Validate transaction type
    if transaction_data.transaction_type not in TransactionType.get_all_types():
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transaction type. Valid options are: {', '.join(TransactionType.get_all_types())}"
        )
    
    # Validate expense category
    if transaction_data.expense_category not in ExpenseCategory.get_all_categories():
        raise HTTPException(
            status_code=400,
            detail=f"Invalid expense category. Valid options are: {', '.join(ExpenseCategory.get_all_categories())}"
        )
    
    # Create transaction
    db_transaction = Transaction(
        user_id=current_user.id,
        amount=transaction_data.amount,
        transaction_type=transaction_data.transaction_type,
        expense_category=transaction_data.expense_category,
        transaction_date=transaction_data.transaction_date,
        description=transaction_data.description,
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return db_transaction


@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    transaction_type: Optional[str] = None,
    expense_category: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
):
    """
    Get all transactions for the current user with optional filtering.
    """
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    # Apply filters if provided
    if transaction_type:
        if transaction_type not in TransactionType.get_all_types():
            raise HTTPException(
                status_code=400,
                detail=f"Invalid transaction type. Valid options are: {', '.join(TransactionType.get_all_types())}"
            )
        query = query.filter(Transaction.transaction_type == transaction_type)
    
    if expense_category:
        if expense_category not in ExpenseCategory.get_all_categories():
            raise HTTPException(
                status_code=400,
                detail=f"Invalid expense category. Valid options are: {', '.join(ExpenseCategory.get_all_categories())}"
            )
        query = query.filter(Transaction.expense_category == expense_category)
    
    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)
    
    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)
    
    # Order by transaction date (newest first)
    query = query.order_by(Transaction.transaction_date.desc())
    
    # Apply pagination
    transactions = query.offset(skip).limit(limit).all()
    
    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    transaction_id: int,
):
    """
    Get a specific transaction by ID.
    """
    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return transaction 