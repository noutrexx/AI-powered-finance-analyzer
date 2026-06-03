from fastapi.testclient import TestClient


def test_csv_upload_validation_returns_meaningful_errors(
    client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    files = {"file": ("bad.csv", b"date,description,amount,currency\n2026-01-01,Migros,100,TL\n", "text/csv")}

    response = client.post("/api/transactions/upload", headers=auth_headers, files=files)

    assert response.status_code == 200
    assert response.json()["imported_count"] == 0
    assert "Missing required columns" in response.json()["errors"][0]


def test_csv_upload_imports_valid_rows(client: TestClient, auth_headers: dict[str, str]) -> None:
    csv_body = (
        "date,description,amount,currency,type\n"
        "2026-01-01,Salary January,50000,TL,income\n"
        "2026-01-02,Migros grocery,1250,TL,expense\n"
    )
    files = {"file": ("transactions.csv", csv_body.encode(), "text/csv")}

    response = client.post("/api/transactions/upload", headers=auth_headers, files=files)

    assert response.status_code == 200
    assert response.json()["imported_count"] == 2
    assert response.json()["errors"] == []

