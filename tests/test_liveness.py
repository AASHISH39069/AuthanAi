"""
Tests for Liveness, Video Deepfake, and Voice Services
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.liveness_service import liveness_service
from app.services.video_service import video_service
from app.services.voice_service import voice_service


def test_liveness_successful_challenge():
    res = liveness_service.verify_liveness(challenge_id="CHAL-BLINK-01", user_response_status=True)
    assert res["is_live"] is True
    assert res["challenge_passed"] is True
    assert res["status"] == "LIVE"


def test_liveness_failed_challenge():
    res = liveness_service.verify_liveness(challenge_id="CHAL-BLINK-01", user_response_status=False)
    assert res["challenge_passed"] is False
    assert res["status"] == "SPOOF_RISK"


def test_video_deepfake_analysis():
    res = video_service.analyze_video(liveness_score=95.0)
    assert "deepfake_probability" in res
    assert "video_authenticity" in res
    assert res["video_authenticity"] >= 0.0


def test_voice_synthetic_analysis():
    res = voice_service.analyze_audio()
    assert "synthetic_speech_probability" in res
    assert "voice_authenticity" in res
    assert res["status"] in ["AUTHENTIC_VOICE", "SYNTHETIC_SPEECH_FLAG"]
