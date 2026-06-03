from fastapi.testclient import TestClient


def test_register_and_login(client: TestClient) -> None:
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": "user@example.com",
            "full_name": "Portfolio User",
            "password": "strong-password",
        },
    )

    assert register_response.status_code == 201
    assert register_response.json()["user"]["email"] == "user@example.com"
    assert register_response.json()["access_token"]

    login_response = client.post(
        "/api/auth/login",
        json={"email": "user@example.com", "password": "strong-password"},
    )

    assert login_response.status_code == 200
    assert login_response.json()["token_type"] == "bearer"

