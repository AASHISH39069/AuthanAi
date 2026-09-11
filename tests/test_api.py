"""
Integration tests for FastAPI endpoints using requests
"""

import requests
import pytest

BASE_URL = "http://127.0.0.1:8000"


def test_health_endpoint():
    res = requests.get(f"{BASE_URL}/api/health", timeout=5)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ONLINE"
    assert "engines" in data


def test_start_session_endpoint():
    res = requests.post(f"{BASE_URL}/api/verification/start", timeout=5)
    assert res.status_code == 200
    data = res.json()
    assert "session_id" in data
    assert data["session_id"].startswith("AUTH-2026-")
    assert "challenge" in data


def test_get_history_endpoint():
    res = requests.get(f"{BASE_URL}/api/verification/history", timeout=5)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "session_id" in data[0]


def test_direct_verify_endpoint():
    res = requests.post(f"{BASE_URL}/api/verification/verify", data={"claimed_name": "Test Citizen"}, timeout=5)
    assert res.status_code == 200
    data = res.json()
    assert "risk_score" in data
    assert "confidence_score" in data
    assert "risk_level" in data
    assert "evidence_log" in data
