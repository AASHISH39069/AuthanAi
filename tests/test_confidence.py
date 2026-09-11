"""
Tests for ConfidenceEngine
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.confidence_engine import confidence_engine


def test_high_quality_inputs_yield_high_confidence():
    conf = confidence_engine.compute_confidence(
        doc_quality=95.0,
        face_quality=92.0,
        audio_present=True,
        video_present=True,
    )
    assert conf >= 90.0


def test_missing_sensors_incur_penalty():
    conf_complete = confidence_engine.compute_confidence(90.0, 90.0, True, True)
    conf_incomplete = confidence_engine.compute_confidence(90.0, 90.0, False, False)
    assert conf_incomplete < conf_complete


def test_low_confidence_override():
    conf = confidence_engine.compute_confidence(95.0, 95.0, low_confidence_override=True)
    assert conf == 52.0
