from decimal import Decimal

from fastapi.testclient import TestClient


def test_dashboard_metrics_are_user_scoped_and_calculated(
    client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    transactions = [
        {
            "date": "2026-01-01",
            "description": "Salary January",
            "amount": "50000",
            "currency": "TL",
            "type": "income",
        },
        {
            "date": "2026-01-03",
            "description": "Migros grocery",
            "amount": "2000",
            "currency": "TL",
            "type": "expense",
        },
        {
            "date": "2026-01-05",
            "description": "Apartment rent",
            "amount": "12000",
            "currency": "TL",
            "type": "expense",
        },
    ]

    for payload in transactions:
        response = client.post("/api/transactions", headers=auth_headers, json=payload)
        assert response.status_code == 201

    dashboard = client.get("/api/analytics/dashboard", headers=auth_headers)

    assert dashboard.status_code == 200
    body = dashboard.json()
    assert Decimal(body["total_income"]) == Decimal("50000.00")
    assert Decimal(body["total_expense"]) == Decimal("14000.00")
    assert Decimal(body["net_balance"]) == Decimal("36000.00")
    assert body["category_breakdown"][0]["category"] == "Rent"
    assert body["top_expenses"][0]["description"] == "Apartment rent"


def test_financial_health_score_label(client: TestClient, auth_headers: dict[str, str]) -> None:
    csv_body = (
        "date,description,amount,currency,type\n"
        "2026-01-01,Salary January,60000,TL,income\n"
        "2026-01-02,Migros grocery,3000,TL,expense\n"
        "2026-02-01,Salary February,60000,TL,income\n"
        "2026-02-02,A101 grocery,3500,TL,expense\n"
    )
    files = {"file": ("transactions.csv", csv_body.encode(), "text/csv")}
    client.post("/api/transactions/upload", headers=auth_headers, files=files)

    response = client.get("/api/analytics/dashboard", headers=auth_headers)

    assert response.status_code == 200
    health_score = response.json()["health_score"]
    assert health_score["score"] >= 80
    assert health_score["label"] == "Excellent"

