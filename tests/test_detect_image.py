"""
Tests for Image Deepfake & Generative Artifact Detection (/api/tools/detect-image)
Direct async invocation of detect_image endpoint function.
"""

import sys
import os
import io
import pytest
import asyncio
import numpy as np
from PIL import Image, ImageFilter
from fastapi import UploadFile

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
from app.api.tools_routes import detect_image


def _generate_real_photo_bytes(compressed_whatsapp: bool = False, high_iso: bool = False) -> bytes:
    """Simulates a camera photo: natural optical textures + PRNU sensor noise + photon shot noise."""
    np.random.seed(101)
    y, x = np.mgrid[0:512, 0:512] / 512.0
    cy, cx = 256, 256
    dist = np.sqrt((y * 512 - cy) ** 2 + (x * 512 - cx) ** 2)
    face_mask = dist < 140
    skin = 150 + 20 * np.sin(x * 512 * 0.1) * np.cos(y * 512 * 0.1)
    base = 120 + 40 * np.sin(x * 3) + 30 * np.cos(y * 4)
    noise_sigma = 8.5 if high_iso else 3.2
    features = np.random.normal(0, 10.0 if high_iso else 6.0, (512, 512))
    prnu = np.random.normal(0, noise_sigma, (512, 512))
    arr = np.where(face_mask, skin, base) + features * 0.2 + prnu
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    
    buf = io.BytesIO()
    if compressed_whatsapp:
        img.save(buf, format="JPEG", quality=72)
    else:
        img.save(buf, format="JPEG", quality=95)
    return buf.getvalue()


def _generate_ai_portrait_bytes(compressed_whatsapp: bool = False) -> bytes:
    """Simulates an AI-generated portrait: plastic smooth skin, zero PRNU, spectral high-frequency roll-off."""
    np.random.seed(202)
    y, x = np.mgrid[0:512, 0:512] / 512.0
    cy, cx = 256, 256
    dist = np.sqrt((y * 512 - cy) ** 2 + (x * 512 - cx) ** 2)
    face_mask = dist < 140
    smooth_skin = 160 + 25 * np.cos(dist / 40.0)
    bg = 110 + 30 * np.sin(x * 2)
    arr = np.where(face_mask, smooth_skin, bg)
    edge = np.exp(-((dist - 140) / 10.0) ** 2) * 40
    arr = arr + edge
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=0.7))
    
    buf = io.BytesIO()
    if compressed_whatsapp:
        img.save(buf, format="JPEG", quality=72)
    else:
        img.save(buf, format="PNG")
    return buf.getvalue()


def _make_upload_file(filename: str, content: bytes) -> UploadFile:
    return UploadFile(filename=filename, file=io.BytesIO(content))


def test_sample_deepfake():
    """Verify explicit deepfake sample mode returns SYNTHETIC / DEEPFAKE DETECTED."""
    res = asyncio.run(detect_image(file=None, sample_type="deepfake"))
    assert res["is_deepfake"] is True
    assert res["verdict"] == "SYNTHETIC / DEEPFAKE DETECTED"
    assert res["deepfake_probability"] > 80.0
    assert "synthesis_classification" in res["metrics"]


def test_sample_real():
    """Verify explicit real sample mode returns REAL / AUTHENTIC IMAGE."""
    res = asyncio.run(detect_image(file=None, sample_type="real"))
    assert res["is_deepfake"] is False
    assert res["verdict"] == "REAL / AUTHENTIC IMAGE"
    assert res["authenticity_score"] > 80.0


def test_real_camera_photo_raw():
    """Verify raw camera photograph passes as authentic with low deepfake probability."""
    raw_bytes = _generate_real_photo_bytes(compressed_whatsapp=False)
    upload = _make_upload_file("camera_photo_101.jpg", raw_bytes)
    res = asyncio.run(detect_image(file=upload))
    assert res["is_deepfake"] is False
    assert res["verdict"] == "REAL / AUTHENTIC IMAGE"
    assert res["authenticity_score"] >= 85.0
    assert res["deepfake_probability"] < 15.0
    assert res["metrics"]["skin_prnu_noise_floor"] >= 1.4


def test_real_camera_photo_high_iso_indoor():
    """Verify indoor/low-light photo with high ISO noise and edge variance is NOT falsely penalized."""
    indoor_bytes = _generate_real_photo_bytes(compressed_whatsapp=False, high_iso=True)
    upload = _make_upload_file("IMG_indoor_lowlight.jpg", indoor_bytes)
    res = asyncio.run(detect_image(file=upload))
    assert res["is_deepfake"] is False
    assert res["verdict"] == "REAL / AUTHENTIC IMAGE"
    assert res["authenticity_score"] >= 85.0
    assert res["deepfake_probability"] < 15.0
    assert res["metrics"]["skin_prnu_noise_floor"] >= 2.0


def test_real_camera_photo_whatsapp():
    """Verify camera photograph compressed by WhatsApp still passes as authentic."""
    wa_bytes = _generate_real_photo_bytes(compressed_whatsapp=True)
    upload = _make_upload_file("IMG-20240912-WA0042.jpg", wa_bytes)
    res = asyncio.run(detect_image(file=upload))
    assert res["is_deepfake"] is False
    assert res["verdict"] == "REAL / AUTHENTIC IMAGE"
    assert res["authenticity_score"] >= 85.0
    assert res["deepfake_probability"] < 20.0


def test_ai_portrait_raw():
    """Verify raw AI generated portrait is detected with >80% deepfake probability."""
    ai_bytes = _generate_ai_portrait_bytes(compressed_whatsapp=False)
    upload = _make_upload_file("portrait_generation.png", ai_bytes)
    res = asyncio.run(detect_image(file=upload))
    assert res["is_deepfake"] is True
    assert res["verdict"] == "SYNTHETIC / DEEPFAKE DETECTED"
    assert res["deepfake_probability"] > 80.0
    assert res["classification"] == "SYNTHETIC / AI GENERATED IMAGE"
    assert res["metrics"]["synthesis_classification"] == "SYNTHETIC / AI GENERATED IMAGE"
    assert res["metrics"]["fft_azimuthal_hf_ratio"] < 0.35


def test_ai_portrait_whatsapp_recompressed():
    """
    CRITICAL TEST: Verify AI-generated portrait recompressed by WhatsApp
    does NOT pass as authentic, but is flagged as SYNTHETIC / DEEPFAKE DETECTED with >80% probability.
    """
    ai_wa_bytes = _generate_ai_portrait_bytes(compressed_whatsapp=True)
    upload = _make_upload_file("IMG-20240912-WA0099.jpg", ai_wa_bytes)
    res = asyncio.run(detect_image(file=upload))
    assert res["is_deepfake"] is True
    assert res["verdict"] == "SYNTHETIC / DEEPFAKE DETECTED"
    assert res["deepfake_probability"] > 80.0
    assert res["classification"] == "SYNTHETIC / AI GENERATED IMAGE"
    assert res["metrics"]["synthesis_classification"] == "SYNTHETIC / AI GENERATED IMAGE"
    assert res["metrics"]["skin_prnu_noise_floor"] < 1.3
