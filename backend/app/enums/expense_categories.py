from enum import Enum
from typing import List


class ExpenseCategory(Enum):
    """Enum representing different categories of expenses in a personal finance application."""
    
    HOUSING = "housing"  # Rent, mortgage, property taxes, repairs
    UTILITIES = "utilities"  # Electricity, water, gas, internet, phone
    FOOD = "food"  # Groceries, restaurants, takeout
    TRANSPORTATION = "transportation"  # Car payments, gas, public transit, ride sharing
    HEALTHCARE = "healthcare"  # Medical bills, prescriptions, insurance
    ENTERTAINMENT = "entertainment"  # Movies, concerts, subscriptions, hobbies
    SHOPPING = "shopping"  # Clothing, electronics, household items
    EDUCATION = "education"  # Tuition, books, courses, student loans
    PERSONAL_CARE = "personal_care"  # Haircuts, gym, spa, personal hygiene
    DEBT_PAYMENTS = "debt_payments"  # Credit card, loans (non-mortgage)
    SAVINGS = "savings"  # Emergency fund, savings goals
    INVESTMENTS = "investments"  # Stocks, bonds, retirement accounts
    INSURANCE = "insurance"  # Life, auto, home/renters (non-health)
    GIFTS_DONATIONS = "gifts_donations"  # Charity, presents, donations
    TRAVEL = "travel"  # Hotels, flights, vacation expenses
    CHILDREN = "children"  # Childcare, toys, supplies, allowance
    PETS = "pets"  # Pet food, vet bills, supplies
    BUSINESS = "business"  # Business expenses, professional dues
    TAXES = "taxes"  # Income tax, property tax (if not included in mortgage)
    MISCELLANEOUS = "miscellaneous"  # Other expenses that don't fit elsewhere
    
    @classmethod
    def get_all_categories(cls) -> List[str]:
        """Return a list of all expense category values."""
        return [category.value for category in cls]
    
    def __str__(self) -> str:
        return self.value
