"""
Tests for Document Verification Service
"""

import sys
import os
import io
from PIL import Image
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.document_service import document_service


def test_document_analysis_runs_on_valid_image():
    # Create valid synthetic test image in memory
    buf = io.BytesIO()
    img = Image.new("RGB", (320, 200), color=(20, 30, 50))
    img.save(buf, "JPEG")
    image_bytes = buf.getvalue()

    res = document_service.analyze_document(image_bytes, user_claimed_name="Test Citizen")
    assert "ocr_extracted" in res
    assert "tampering_probability" in res
    assert "integrity_score" in res
    assert res["ocr_extracted"]["name"] == "Test Citizen"
    assert res["status"] in ["LOW RISK", "MEDIUM RISK", "HIGH RISK"]
