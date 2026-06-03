from collections import defaultdict
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.analytics import CategorySummary, DashboardMetrics, HealthScore, MonthlyTrend

ZERO = Decimal("0.00")


def get_dashboard_metrics(db: Session, owner: User) -> DashboardMetrics:
    transactions = (
        db.query(Transaction)
        .filter(Transaction.owner_id == owner.id)
        .order_by(Transaction.date.desc(), Transaction.id.desc())
        .all()
    )

    total_income = _sum_amounts(transactions, "income")
    total_expense = _sum_amounts(transactions, "expense")
    net_balance = total_income - total_expense
    category_breakdown = _category_breakdown(transactions, total_expense)
    monthly_trend = _monthly_trend(transactions)
    top_expenses = sorted(
        [item for item in transactions if item.type == "expense"],
        key=lambda item: item.amount,
        reverse=True,
    )[:5]
    average_daily_spending = _average_daily_spending(transactions)
    savings_rate = _savings_rate(total_income, total_expense)
    health_score = calculate_health_score(
        transactions=transactions,
        total_income=total_income,
        total_expense=total_expense,
        savings_rate=savings_rate,
        category_breakdown=category_breakdown,
    )

    from app.services.insights_service import generate_recommendations

    return DashboardMetrics(
        total_income=total_income,
        total_expense=total_expense,
        net_balance=net_balance,
        category_breakdown=category_breakdown,
        monthly_trend=monthly_trend,
        top_expenses=top_expenses,
        average_daily_spending=average_daily_spending,
        savings_rate=savings_rate,
        health_score=health_score,
        recommendations=generate_recommendations(
            total_income=total_income,
            total_expense=total_expense,
            category_breakdown=category_breakdown,
            savings_rate=savings_rate,
        ),
    )


def calculate_health_score(
    transactions: list[Transaction],
    total_income: Decimal,
    total_expense: Decimal,
    savings_rate: float,
    category_breakdown: list[CategorySummary],
) -> HealthScore:
    score = 50

    if savings_rate >= 30:
        score += 25
    elif savings_rate >= 15:
        score += 15
    elif savings_rate >= 5:
        score += 5
    else:
        score -= 10

    if total_expense > total_income and total_income > ZERO:
        score -= 25
    elif total_income > total_expense:
        score += 10

    if category_breakdown and category_breakdown[0].percentage >= 45:
        score -= 15

    income_months = {
        transaction.date.strftime("%Y-%m")
        for transaction in transactions
        if transaction.type == "income"
    }
    if len(income_months) >= 2:
        score += 10

    bounded = max(0, min(100, score))
    return HealthScore(score=bounded, label=_score_label(bounded), savings_rate=savings_rate)


def _sum_amounts(transactions: list[Transaction], transaction_type: str) -> Decimal:
    total = sum((item.amount for item in transactions if item.type == transaction_type), ZERO)
    return total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _category_breakdown(
    transactions: list[Transaction],
    total_expense: Decimal,
) -> list[CategorySummary]:
    totals: dict[str, Decimal] = defaultdict(lambda: ZERO)
    for transaction in transactions:
        if transaction.type == "expense":
            totals[transaction.category] += transaction.amount

    summaries = [
        CategorySummary(
            category=category,
            total=amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            percentage=round((float(amount / total_expense) * 100), 2) if total_expense else 0,
        )
        for category, amount in totals.items()
    ]
    return sorted(summaries, key=lambda item: item.total, reverse=True)


def _monthly_trend(transactions: list[Transaction]) -> list[MonthlyTrend]:
    monthly: dict[str, dict[str, Decimal]] = defaultdict(lambda: {"income": ZERO, "expense": ZERO})
    for transaction in transactions:
        month = transaction.date.strftime("%Y-%m")
        monthly[month][transaction.type] += transaction.amount

    return [
        MonthlyTrend(
            month=month,
            income=values["income"].quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            expense=values["expense"].quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            net=(values["income"] - values["expense"]).quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            ),
        )
        for month, values in sorted(monthly.items())
    ]


def _average_daily_spending(transactions: list[Transaction]) -> Decimal:
    expenses = [item for item in transactions if item.type == "expense"]
    if not expenses:
        return ZERO

    first_day = min(item.date for item in expenses)
    last_day = max(item.date for item in expenses)
    days = max((last_day - first_day).days + 1, 1)
    total = sum((item.amount for item in expenses), ZERO)
    return (total / Decimal(days)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _savings_rate(total_income: Decimal, total_expense: Decimal) -> float:
    if total_income <= ZERO:
        return 0.0
    return round(float(((total_income - total_expense) / total_income) * 100), 2)


def _score_label(score: int) -> str:
    if score >= 80:
        return "Excellent"
    if score >= 60:
        return "Good"
    if score >= 40:
        return "Needs improvement"
    return "Risky"
