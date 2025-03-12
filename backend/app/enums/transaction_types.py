from enum import Enum, auto
from typing import List


class TransactionType(Enum):
    """Enum representing different types of financial transactions."""
    
    INCOME = "income"  # Money coming in (salary, gifts, etc.)
    EXPENSE = "expense"  # Money going out (bills, groceries, etc.)
    TRANSFER = "transfer"  # Moving money between accounts
    INVESTMENT = "investment"  # Investment-related transactions
    REFUND = "refund"  # Refunds for previous expenses
    WITHDRAWAL = "withdrawal"  # Cash withdrawals
    DEPOSIT = "deposit"  # Cash deposits
    
    @classmethod
    def get_all_types(cls) -> List[str]:
        """Return a list of all transaction type values."""
        return [type.value for type in cls]
    
    def __str__(self) -> str:
        return self.value
