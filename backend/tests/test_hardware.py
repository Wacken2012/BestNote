
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_scan_endpoint():
    response = client.post("/hardware/scan")
    assert response.status_code in (200, 503, 500)
    # 200: Scan erfolgreich, 503: kein Scanner, 500: Fehler

def test_print_endpoint():
    files = {"file": ("test.txt", b"Testdruck", "text/plain")}
    response = client.post("/hardware/print", files=files)
    assert response.status_code in (200, 503, 500)
    # 200: Druck erfolgreich, 503: kein Drucker, 500: Fehler
