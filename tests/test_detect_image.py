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


def test_real_webcam_selfie_moderate_prnu():
    """
    REGRESSION TEST: Verify real webcam/laptop photo (e.g. WIN_20260912_...Pro.jpg)
    with PRNU around 0.70 and natural skin texture (variance > 12.0)
    passes as REAL / AUTHENTIC IMAGE with Authenticity >= 92% and Deepfake Probability <= 8%.
    """
    np.random.seed(303)
    y, x = np.mgrid[0:512, 0:512] / 512.0
    dist = np.sqrt((y * 512 - 256) ** 2 + (x * 512 - 256) ** 2)
    face_mask = dist < 140
    # Natural skin texture with micro-grain (variance > 25)
    skin_grain = np.random.normal(0, 5.5, (512, 512))
    skin = 160 + 15 * np.cos(dist / 30.0) + skin_grain
    # Detailed background (e.g. arches/tiles with high frequency)
    bg = 120 + 35 * np.sin(x * 12) * np.cos(y * 12) + np.random.normal(0, 3.0, (512, 512))
    # Moderate webcam PRNU
    prnu = np.random.normal(0, 0.75, (512, 512))
    arr = np.where(face_mask, skin, bg) + prnu
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    
    upload = _make_upload_file("WIN_20260912_01_28_10_Pro.jpg", buf.getvalue())
    res = asyncio.run(detect_image(file=upload))
    assert res["is_deepfake"] is False
    assert res["verdict"] == "REAL / AUTHENTIC IMAGE"
    assert res["authenticity_score"] >= 92.0
    assert res["deepfake_probability"] <= 8.0


def test_ai_girl_selfie_sharp_background():
    """
    CRITICAL TEST: Verify AI-generated portrait/selfie with smooth face (low skin variance < 20)
    and sharp hair/clothes/background (contrast ratio > 2.8) is flagged as DEEPFAKE DETECTED.
    """
    np.random.seed(404)
    y, x = np.mgrid[0:512, 0:512] / 512.0
    dist = np.sqrt((y * 512 - 256) ** 2 + (x * 512 - 256) ** 2)
    face_mask = dist < 140
    # Over-smoothed plastic skin (very low variance < 5.0)
    smooth_skin = 160 + 10 * np.cos(dist / 40.0)
    # High-contrast sharp background / clothing edges (> 45 variance)
    bg = 120 + np.random.normal(0, 15.0, (512, 512))
    arr = np.where(face_mask, smooth_skin, bg)
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=80)
    
    upload = _make_upload_file("ai_girl_portrait.jpg", buf.getvalue())
    res = asyncio.run(detect_image(file=upload))
    assert res["is_deepfake"] is True
    assert res["verdict"] == "SYNTHETIC / DEEPFAKE DETECTED"
    assert res["deepfake_probability"] >= 75.0
    assert res["authenticity_score"] <= 25.0


def _generate_benchmark_cropped_face(mode: str = "real") -> bytes:
    """
    Generates a 256x256 tightly cropped face image simulating benchmark datasets
    (FaceForensics++, Celeb-DF, Kaggle DFDC).
    """
    np.random.seed(42 if mode != "real" else 24)
    H, W = 256, 256
    y, x = np.mgrid[0:H, 0:W]
    cy, cx = H // 2, W // 2
    r = np.sqrt((y - cy) ** 2 + (x - cx) ** 2)

    if mode == "real":
        # REAL optical capture:
        # Natural micro-texture in cheeks (skin pore texture + sensor noise std > 8.0)
        skin_texture = np.random.normal(0, 9.5, (H, W))
        Y = 160 + 20 * np.cos(r / 35.0) + skin_texture
        Cb = 105 + 5 * np.sin(x / 30.0) + np.random.normal(0, 2.0, (H, W))
        Cr = 150 + 5 * np.cos(y / 30.0) + np.random.normal(0, 2.0, (H, W))

        periph_mask = r >= 105
        Y[periph_mask] = 40 + 15 * np.sin(x[periph_mask] / 10.0) + np.random.normal(0, 5.0, np.sum(periph_mask))
        Cb[periph_mask] = 128 + np.random.normal(0, 3.0, np.sum(periph_mask))
        Cr[periph_mask] = 128 + np.random.normal(0, 3.0, np.sum(periph_mask))
    elif mode == "faceswap":
        # DEEPFAKE face-swap (FaceForensics++):
        # Smooth swapped face (micro-texture < 6.0) + feathered boundary blending in Cb and Cr
        skin_texture = np.random.normal(0, 3.2, (H, W))
        Y = 165 + 20 * np.cos(r / 35.0) + skin_texture
        Cb = np.full((H, W), 108.0)
        Cr = np.full((H, W), 152.0)

        # Boundary feathering between r=95 and r=115
        blend = np.clip((r - 95) / 20.0, 0.0, 1.0)
        outer_Cb = 125.0
        outer_Cr = 135.0
        Cb = Cb * (1 - blend) + outer_Cb * blend
        Cr = Cr * (1 - blend) + outer_Cr * blend

        periph_mask = r >= 115
        Y[periph_mask] = 40 + 15 * np.sin(x[periph_mask] / 10.0)
    else:  # gan_rings
        # GAN with periodic checkerboard deconvolution grid artifacts
        skin_texture = np.random.normal(0, 4.0, (H, W))
        checkerboard = 8.0 * np.sin(x * np.pi / 2) * np.sin(y * np.pi / 2)
        Y = 160 + 20 * np.cos(r / 35.0) + skin_texture + checkerboard
        Cb = 110 + 4 * np.sin(x / 40.0)
        Cr = 148 + 4 * np.cos(y / 40.0)
        periph_mask = r >= 105
        Y[periph_mask] = 45 + 10 * np.sin(x[periph_mask] / 10.0)

    # Convert YCbCr back to RGB
    R = Y + 1.402 * (Cr - 128)
    G = Y - 0.344136 * (Cb - 128) - 0.714136 * (Cr - 128)
    B = Y + 1.772 * (Cb - 128)

    rgb = np.stack([np.clip(R, 0, 255), np.clip(G, 0, 255), np.clip(B, 0, 255)], axis=2).astype(np.uint8)
    img = Image.fromarray(rgb)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def test_cropped_face_real_celeb_df():
    """
    BENCHMARK DATASET TEST (Celeb-DF / FF++ Real):
    Verify a pre-cropped 256x256 face portrait with micro-texture std > 8.0 in cheeks
    and HF/LF energy ratio > 0.22 is classified as REAL / AUTHENTIC IMAGE.
    """
    real_crop = _generate_benchmark_cropped_face("real")
    upload = _make_upload_file("celeb_df_real_001.jpg", real_crop)
    res = asyncio.run(detect_image(file=upload))
    assert res["is_deepfake"] is False
    assert res["verdict"] == "REAL / AUTHENTIC IMAGE"
    assert res["authenticity_score"] >= 88.0
    assert res["deepfake_probability"] <= 12.0
    assert res["metrics"]["is_tightly_cropped_face"] is True
    assert res["metrics"]["cheek_micro_std"] > 8.0


def test_cropped_face_deepfake_faceforensics():
    """
    BENCHMARK DATASET TEST (FaceForensics++ Deepfakes / FaceSwap):
    Verify tightly cropped face-swap with unnatural boundary feathering and smoothed cheeks (< 6.0)
    is flagged as SYNTHETIC / DEEPFAKE DETECTED.
    """
    ff_crop = _generate_benchmark_cropped_face("faceswap")
    upload = _make_upload_file("ff_deepfake_042.jpg", ff_crop)
    res = asyncio.run(detect_image(file=upload))
    assert res["is_deepfake"] is True
    assert res["verdict"] == "SYNTHETIC / DEEPFAKE DETECTED"
    assert res["deepfake_probability"] >= 75.0
    assert res["metrics"]["is_tightly_cropped_face"] is True
    assert res["metrics"]["cheek_micro_std"] < 6.0


def test_cropped_face_deepfake_gan_rings():
    """
    BENCHMARK DATASET TEST (Kaggle DFDC / GAN Synthesis):
    Verify tightly cropped face with periodic frequency grid / GAN checkerboard artifacts
    is flagged as SYNTHETIC / DEEPFAKE DETECTED.
    """
    gan_crop = _generate_benchmark_cropped_face("gan_rings")
    upload = _make_upload_file("kaggle_gan_089.jpg", gan_crop)
    res = asyncio.run(detect_image(file=upload))
    assert res["is_deepfake"] is True
    assert res["verdict"] == "SYNTHETIC / DEEPFAKE DETECTED"
    assert res["deepfake_probability"] >= 75.0
    assert res["metrics"]["is_tightly_cropped_face"] is True


def test_case1_low_res_old_camera_real_1000():
    """
    CASE 1 TEST: Low-Res / Old Camera Real Photo (e.g. real_1000.jpg)
    Verify soft-focus/low-resolution authentic camera photo with global_blur < 45.0
    and low disparity ratio (< 1.8) is classified as REAL / AUTHENTIC IMAGE.
    """
    np.random.seed(999)
    H, W = 400, 400
    y, x = np.mgrid[0:H, 0:W] / float(H)
    r1000 = Image.fromarray((120 + 30 * np.sin(x * 4) + 20 * np.cos(y * 4) + np.random.normal(0, 2.0, (H, W))).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=1.2))
    buf = io.BytesIO()
    r1000.save(buf, format="JPEG", quality=80)
    upload = _make_upload_file("real_1000.jpg", buf.getvalue())
    res = asyncio.run(detect_image(file=upload))
    assert res["is_deepfake"] is False
    assert res["verdict"] == "REAL / AUTHENTIC IMAGE"
    assert res["authenticity_score"] >= 85.0
    assert res["deepfake_probability"] <= 15.0
    assert res["metrics"]["global_blur"] < 45.0


def test_camera_photo_with_beauty_filter():
    """
    EDGE CASE 1: Filter Detection vs AI Diffusion (Beauty/Snapchat filters)
    If skin variance is low (< 8.0) BUT PRNU camera noise is intact (PRNU >= 0.40) and boundary chrominance is clean:
    Do NOT flag as deepfake. Classify as 'REAL / CAMERA WITH BEAUTY FILTER' (Authenticity > 85%).
    """
    np.random.seed(505)
    H, W = 512, 512
    y, x = np.mgrid[0:H, 0:W]
    dist = np.sqrt((y - 256) ** 2 + (x - 256) ** 2)
    face_mask = dist < 140
    # Over-smoothed filtered skin with subtle gradient (< 8.0 variance)
    smooth_skin = 160 + 3.0 * np.cos(dist / 60.0)
    bg = 120 + 20 * np.sin(x / 20.0)
    base = np.where(face_mask, smooth_skin, bg)
    # Intact PRNU camera noise (noise floor >= 0.40)
    prnu = np.random.normal(0, 1.4, (H, W))
    arr = np.clip(base + prnu, 0, 255).astype(np.float32)
    
    # Natural facial skin in YCbCr (Cb=112, Cr=148), distinct non-skin background (Cb=138, Cr=122)
    Y = arr
    Cb = np.where(face_mask, 112.0, 138.0).astype(np.float32)
    Cr = np.where(face_mask, 148.0, 122.0).astype(np.float32)
    R = np.clip(Y + 1.402 * (Cr - 128), 0, 255)
    G = np.clip(Y - 0.344136 * (Cb - 128) - 0.714136 * (Cr - 128), 0, 255)
    B = np.clip(Y + 1.772 * (Cb - 128), 0, 255)
    rgb = np.stack([R, G, B], axis=2).astype(np.uint8)
    
    img = Image.fromarray(rgb)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    
    upload = _make_upload_file("snapchat_beauty_filter.jpg", buf.getvalue())
    res = asyncio.run(detect_image(file=upload))
    assert res["is_deepfake"] is False
    assert res["verdict"] == "REAL / CAMERA WITH BEAUTY FILTER"
    assert res["classification"] == "REAL / CAMERA WITH BEAUTY FILTER"
    assert res["authenticity_score"] > 85.0
    assert res["tier_verdict"] == "AUTHENTIC"
    assert res["metrics"]["is_beauty_filter"] is True
    assert res["metrics"]["skin_laplacian_variance"] < 8.0


def test_screen_replay_moire_presentation_attack():
    """
    EDGE CASE 2: Screen Replay Detection (Moiré Pattern)
    Check for sharp periodic geometric peaks in the FFT 2D high-frequency band.
    If periodic grid spikes exceed 4.0x median spectral density, flag as 'PRESENTATION ATTACK / SCREEN CAPTURE'.
    """
    raw_bytes = _generate_real_photo_bytes(compressed_whatsapp=False)
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    arr = np.array(img, dtype=np.float32)
    H, W = arr.shape[:2]
    y, x = np.ogrid[:H, :W]
    # Screen subpixel lattice creating high-frequency 2D periodic grid spikes
    grid_moire = 22.0 * np.cos(2 * np.pi * 140 * x / W) * np.sin(2 * np.pi * 140 * y / H)
    arr[:, :, 0] = np.clip(arr[:, :, 0] + grid_moire, 0, 255)
    arr[:, :, 1] = np.clip(arr[:, :, 1] + grid_moire, 0, 255)
    arr[:, :, 2] = np.clip(arr[:, :, 2] + grid_moire, 0, 255)
    
    buf = io.BytesIO()
    Image.fromarray(arr.astype(np.uint8)).save(buf, format="JPEG", quality=90)
    upload = _make_upload_file("screen_capture_replay.jpg", buf.getvalue())
    res = asyncio.run(detect_image(file=upload))
    
    assert res["is_deepfake"] is True
    assert res["verdict"] == "PRESENTATION ATTACK / SCREEN CAPTURE"
    assert res["tier_verdict"] == "LIKELY SYNTHETIC"
    assert res["suspected_generator_profile"] == "Presentation Attack (Moiré Screen Replay)"
    assert res["metrics"]["is_screen_capture"] is True
    assert res["metrics"]["periodic_grid_spike_ratio"] >= 4.0


def test_localized_inpainting_microblock_tampering():
    """
    EDGE CASE 3: Localized Inpainting / Splicing
    Divide detected face bounding box into 8x8 micro-blocks.
    If a specific block has an ELA discrepancy > 35% compared to adjacent blocks, raise localized tampering risk (+40).
    """
    raw_bytes = _generate_real_photo_bytes(compressed_whatsapp=False)
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    arr = np.array(img, dtype=np.uint8)
    H, W = arr.shape[:2]
    # Inpaint / paste a foreign re-compressed patch in one 8x8 micro-block inside face bounding box
    iy1, iy2 = int(H * 0.30), int(H * 0.70)
    ix1, ix2 = int(W * 0.30), int(W * 0.70)
    block_h = (iy2 - iy1) // 8
    block_w = (ix2 - ix1) // 8
    
    # Save a low-quality patch to create sharp ELA discrepancy in micro-block (3, 3)
    patch_y1 = iy1 + 3 * block_h
    patch_y2 = iy1 + 4 * block_h
    patch_x1 = ix1 + 3 * block_w
    patch_x2 = ix1 + 4 * block_w
    
    sub = Image.fromarray(arr[patch_y1:patch_y2, patch_x1:patch_x2])
    pbuf = io.BytesIO()
    sub.save(pbuf, format="JPEG", quality=35)
    pbuf.seek(0)
    sub_recomp = Image.open(pbuf).convert("RGB")
    arr[patch_y1:patch_y2, patch_x1:patch_x2] = np.array(sub_recomp)
    
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="JPEG", quality=92)
    upload = _make_upload_file("localized_inpainted_face.jpg", buf.getvalue())
    res = asyncio.run(detect_image(file=upload))
    
    assert res["metrics"]["has_localized_inpainting"] is True
    assert res["metrics"]["max_microblock_discrepancy"] > 0.35
    assert res["tier_verdict"] == "LIKELY SYNTHETIC"
    assert res["suspected_generator_profile"] == "Splicing / Inpainting"


def test_inconclusive_low_resolution_image():
    """
    THREE-TIER FORENSIC VERDICT: Inconclusive on low-resolution / compressed media
    When resolution < 300px and markers cannot be reliably resolved, trigger INCONCLUSIVE.
    """
    np.random.seed(88)
    tiny_arr = np.random.normal(128, 5.0, (200, 200)).astype(np.uint8)
    buf = io.BytesIO()
    Image.fromarray(tiny_arr).save(buf, format="JPEG", quality=50)
    upload = _make_upload_file("tiny_lowres_preview.jpg", buf.getvalue())
    res = asyncio.run(detect_image(file=upload))
    
    assert res["tier_verdict"] == "INCONCLUSIVE"
    assert "Heavy compression masks reliable markers" in res["details"]


def test_url_streaming_ingestion(monkeypatch):
    """
    DUAL-MODE INGESTION: Test streaming URL fetching with 15MB cap and MIME checking.
    """
    from unittest.mock import MagicMock
    import urllib.request
    
    raw_bytes = _generate_real_photo_bytes(compressed_whatsapp=False)
    
    mock_response = MagicMock()
    mock_response.headers = {
        "Content-Type": "image/jpeg",
        "Content-Length": str(len(raw_bytes))
    }
    mock_response.read.side_effect = [raw_bytes, b""]
    mock_response.__enter__.return_value = mock_response
    mock_response.__exit__.return_value = None
    
    monkeypatch.setattr(urllib.request, "urlopen", lambda req, timeout=12: mock_response)
    
    res = asyncio.run(detect_image(file=None, url="https://authenai-cdn.org/sample_portrait.jpg"))
    assert res is not None
    assert "authenticity_score" in res
    assert res["tier_verdict"] in ("AUTHENTIC", "LIKELY SYNTHETIC", "INCONCLUSIVE")





