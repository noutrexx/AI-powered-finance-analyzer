from decimal import Decimal

from app.schemas.analytics import CategorySummary, Recommendation


def generate_recommendations(
    total_income: Decimal,
    total_expense: Decimal,
    category_breakdown: list[CategorySummary],
    savings_rate: float,
) -> list[Recommendation]:
    recommendations: list[Recommendation] = []

    if total_income > 0 and total_expense > total_income:
        recommendations.append(
            Recommendation(
                title="Monthly cash flow is negative",
                message=(
                    "Expenses are currently higher than income. Review subscriptions, dining, "
                    "and entertainment before making new discretionary purchases."
                ),
                priority="high",
            )
        )

    if category_breakdown:
        largest = category_breakdown[0]
        if largest.percentage >= 30:
            target_percentage = Decimal("25")
            target_amount = total_expense * (target_percentage / Decimal("100"))
            estimated_saving = max(Decimal("0"), largest.total - target_amount)
            recommendations.append(
                Recommendation(
                    title=f"{largest.category} spending is concentrated",
                    message=(
                        f"{largest.category} represents {largest.percentage}% of total expenses. "
                        f"Reducing it toward 25% could free about {estimated_saving:.2f} TL."
                    ),
                    priority="medium",
                )
            )

    if savings_rate >= 20:
        recommendations.append(
            Recommendation(
                title="Savings rate is healthy",
                message=(
                    "Your savings rate is in a solid range. Keep building an emergency fund "
                    "and consider automating long-term investments."
                ),
                priority="low",
            )
        )
    elif total_income > 0:
        recommendations.append(
            Recommendation(
                title="Savings buffer needs attention",
                message=(
                    "Try setting a fixed transfer on payday, even if it starts small. "
                    "A 10% baseline gives the budget more resilience."
                ),
                priority="medium",
            )
        )

    return recommendations or [
        Recommendation(
            title="Add more transaction history",
            message="Upload at least one full month of transactions to unlock stronger insights.",
            priority="low",
        )
    ]

