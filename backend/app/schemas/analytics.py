from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class CategorySummary(BaseModel):
    category: str
    total: Decimal
    percentage: float


class MonthlyTrend(BaseModel):
    month: str
    income: Decimal
    expense: Decimal
    net: Decimal


class HealthScore(BaseModel):
    score: int
    label: str
    savings_rate: float


class Recommendation(BaseModel):
    title: str
    message: str
    priority: str


class TransactionPreview(BaseModel):
    id: int
    date: date
    description: str
    amount: Decimal
    currency: str
    category: str


class DashboardMetrics(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    net_balance: Decimal
    category_breakdown: list[CategorySummary]
    monthly_trend: list[MonthlyTrend]
    top_expenses: list["TransactionPreview"]
    average_daily_spending: Decimal
    savings_rate: float
    health_score: HealthScore
    recommendations: list[Recommendation]
