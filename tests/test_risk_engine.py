"""
Tests for RiskEngine
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.risk_engine import risk_engine


def test_low_risk_genuine_case():
    risk_score, risk_level, verdict, recommendation = risk_engine.compute_risk(
        doc_tampering_prob=5.0,
        face_match_score=96.0,
        deepfake_prob=4.0,
        voice_synthetic_prob=5.0,
        liveness_score=97.0,
        challenge_passed=True,
    )
    assert 0.0 <= risk_score <= 30.0
    assert risk_level == "LOW RISK"
    assert verdict == "VERIFICATION PASSED"


def test_high_risk_deepfake_case():
    risk_score, risk_level, verdict, recommendation = risk_engine.compute_risk(
        doc_tampering_prob=10.0,
        face_match_score=85.0,
        deepfake_prob=88.0,
        voice_synthetic_prob=82.0,
        liveness_score=40.0,
        challenge_passed=False,
    )
    assert risk_score > 60.0
    assert risk_level == "HIGH RISK"
    assert verdict == "MANUAL REVIEW REQUIRED"


def test_medium_risk_boundary_case():
    risk_score, risk_level, verdict, recommendation = risk_engine.compute_risk(
        doc_tampering_prob=45.0,
        face_match_score=70.0,
        deepfake_prob=45.0,
        voice_synthetic_prob=35.0,
        liveness_score=75.0,
        challenge_passed=True,
    )
    assert 30.0 < risk_score <= 60.0
    assert risk_level == "MEDIUM RISK"
    assert verdict == "ADDITIONAL VERIFICATION"
