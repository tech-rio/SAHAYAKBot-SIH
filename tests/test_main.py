from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

def test_telemetry_endpoint():
    response = client.get("/api/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert "total_queries" in data
    assert "categories" in data

def test_grievances_endpoint():
    response = client.get("/api/grievances")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
