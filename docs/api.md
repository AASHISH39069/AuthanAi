# AuthenAI REST API Specification

Base URL: `http://127.0.0.1:8000`

---

## 1. Health Check
- **`GET /api/health`**
  - Returns engine readiness statuses and server time.

## 2. Session Initialization
- **`POST /api/verification/start`**
  - Generates tracking token `AUTH-2026-XXXXX` and assigns dynamic challenge.

## 3. Demographics
- **`POST /api/verification/identity`**
  - Payload: `{"name": "...", "date_of_birth": "...", "verification_type": "..."}`

## 4. Document Tampering & OCR
- **`POST /api/verification/document`**
  - Multipart: `document` (image), `session_id`, `claimed_name`
  - Returns: OCR data, tampering probability, integrity score, ELA evidence.

## 5. Face Biometrics
- **`POST /api/verification/face`**
  - Multipart: `face` (image), `session_id`
  - Returns: Face quality score, document-to-face match similarity %, confidence.

## 6. Liveness & Challenge
- **`POST /api/verification/liveness`**
  - Multipart: `video` (optional), `challenge_id`, `challenge_passed`
  - Returns: Liveness score, motion entropy, status (`LIVE` / `SPOOF_RISK`).

## 7. Video Deepfake Forensics
- **`POST /api/verification/video`**
  - Multipart: `video` (clip/blob), `session_id`
  - Returns: Deepfake probability, video authenticity %, temporal consistency.

## 8. Voice Harmonics
- **`POST /api/verification/audio`**
  - Multipart: `audio` (speech blob), `session_id`
  - Returns: Synthetic speech probability, voice authenticity %, vocoder cutoff status.

## 9. Centralized Decision & Evidence
- **`POST /api/verification/analyze`**
  - Form: `session_id`, `demo_scenario` (optional)
  - Returns: Consolidated Risk Score, Confidence %, Verdict, Evidence list, "Why this result?".

## 10. All-in-One Verification
- **`POST /api/verification/verify`**
  - Multipart: Ingests all modal files directly for instant one-click evaluation.

## 11. Verification History
- **`GET /api/verification/history`**
  - Returns list of historical verification sessions for the User Dashboard.
