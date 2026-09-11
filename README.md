# AuthenAI – AI-Powered Deepfake & Synthetic Identity Detection System

> **"Verify the Person. Trust the Identity."**  
> *A production-grade college/hackathon multi-modal identity verification & deepfake forensics platform.*

---

## 1. Problem Statement & Background
With the proliferation of generative adversarial networks (GANs), diffusion foundation models, and open-source neural voice clones (e.g. ElevenLabs, Tortoise), identity verification systems face an unprecedented threat: **synthetic identity fraud**. Fraudsters can now fabricate physical credential photos, inject real-time face swaps into virtual webcams, and clone human speech in seconds.

Traditional verification platforms fail because they rely on single-biometric binary outputs ("Real" or "Fake").

## 2. The AuthenAI Solution
AuthenAI is built on the **Multi-Modal Rule**: do not trust any single vector. By simultaneously cross-referencing:
1. **Document Pixel Forensics**: 90% JPEG re-compression Error Level Analysis (ELA) and OCR integrity.
2. **Facial Biometric Alignment**: 3D landmark structural similarity against credential portraits.
3. **Micro-Motion Liveness**: Biological Shannon entropy and active anti-replay challenges.
4. **Video Deepfake Detection**: Temporal consistency and facial perimeter boundary audits.
5. **Synthetic Voice Check**: Acoustic formant dispersion and neural vocoder cutoff detection.
6. **Cross-Modal Consistency**: Lip-sync timing, audio-video synchronization, and identity consistency.

The system synthesizes these signals into a **Configurable Risk Score (0–100)**, an **Independent Confidence Score (%)**, an **Itemized Forensic Evidence Log**, and transparent **"Why this result?"** explanations.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router DOM.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, Python-Multipart.
- **AI & Forensics**: OpenCV, Pillow, NumPy, SciPy, scikit-learn. Modular AI model interfaces with transparent demo/fallback implementations.
- **Database**: MongoDB with async PyMongo/Motor client and resilient built-in in-memory fallback for zero-dependency local runs.
- **Testing**: Pytest automated test suite (15 unit and integration tests).
- **Deployment**: Docker, Docker Compose, Nginx.

---

## 4. Repository Structure

```
AuthenAI/
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer
│   │   ├── pages/           # Home, Verification (7 steps + Demo Mode), Dashboard, About
│   │   ├── services/        # Modular API client (api.js)
│   │   ├── styles/
│   │   ├── App.jsx          # React Router layout
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/             # REST routes (/start, /document, /face, /liveness, /video, /audio, /analyze, /history)
│   │   ├── services/        # DocumentModel, FaceModel, LivenessModel, VideoModel, VoiceModel, RiskEngine, ConfidenceEngine, EvidenceEngine
│   │   ├── models/          # Pydantic schemas
│   │   ├── database/        # MongoDB client & in-memory fallback repository
│   │   ├── utils/           # Security, PII masking, token generators
│   │   └── main.py          # FastAPI application entry point
│   ├── requirements.txt
│   └── main.py              # Root launcher
│
├── ml/
│   ├── datasets/            # Public dataset documentation (FF++, Celeb-DF, ASVspoof, MIDV-500)
│   ├── training/            # Model fine-tuning guidelines
│   ├── evaluation/          # evaluate_robustness.py (noise, compression, lighting benchmarks)
│   └── saved_models/        # ONNX / PyTorch weight storage
│
├── tests/                   # 15 Pytest unit and integration tests
├── docs/                    # architecture.md (Mermaid diagrams), api.md, model_evaluation.md, security.md
├── docker/                  # Dockerfile.frontend, Dockerfile.backend
├── docker-compose.yml       # Full stack container orchestration
├── .env.example
├── .gitignore
└── README.md
```

---

## 5. Verification Workflow (01 to 07)

```text
01 Identity     -> Capture minimal demo demographics (Name, DOB, Type) and issue AUTH-2026-XXXXX session token
02 Document     -> Upload credential, compute ELA 90% JPEG Delta, extract OCR entities, compute integrity score
03 Face         -> Capture live webcam frame or selfie, calculate landmark alignment similarity vs credential
04 Liveness     -> Issue unpredictable challenge ("Turn head left", "Blink twice", "Read code"), verify 3D motion
05 Voice        -> Record speech sample, analyze spectral flatness and neural vocoder cutoff frequencies
06 Analysis     -> Synthesize signals through Risk Engine, Confidence Engine, and Cross-Modal Consistency
07 Result       -> Evidence Dashboard: Risk Score (0-100), Confidence %, Verdict, "Why this result?", JSON export
```

---

## 6. Quickstart & Local Setup

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+
- (Optional) MongoDB 7.0+ (Automatic in-memory fallback is enabled by default)

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Swagger documentation: `http://127.0.0.1:8000/docs`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend interface: `http://localhost:5173`*

### 3. Run Automated Tests
```bash
# In project root:
python -m pytest tests/ -v
```
*(All 15 tests pass covering endpoints, ELA, face match, liveness, deepfake, voice, risk, and confidence engines).*

### 4. Run ML Robustness Benchmark
```bash
python ml/evaluation/evaluate_robustness.py
```

---

## 7. Docker Deployment

Launch the complete stack (MongoDB + FastAPI + React/Nginx) with a single command:

```bash
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017`

---

## 8. Interactive Demo Mode Presets

For hackathons and live demonstrations, the UI features 4 one-click test presets clearly marked as `DEMO ANALYSIS`:
1. **Genuine Citizen Case**: Low Risk (`18/100`), 94% Confidence, all checks pass.
2. **Suspicious Deepfake Video**: High Risk (`86/100`), flags temporal warping and vocoder cutoffs.
3. **Document Mismatch**: High Risk (`68/100`), flags photo border splicing and face mismatch.
4. **Low Confidence Case**: Medium Risk (`48/100`), Confidence `52%`, guides to additional verification.

---

## 9. Academic Prototype Limitations & Disclaimer
- **Not 100% Production-Accurate**: AuthenAI is an academic prototype and engineering evaluation project. Pretrained heuristics and spectral signal processing modules demonstrate architectural viability.
- **Continuous Retraining**: Real-world production deployment requires continuous adversarial retraining against newly released generative foundation models (e.g. Sora, Vidu, ElevenLabs v3).

---

## 10. Engineering Core Team
- **Aashish** — Lead AI & Deepfake Forensic Engineer (`aashish@authenai.internal`)
- **Vinay Dixit** — System Architect & API Engineer (`vinay.dixit@authenai.internal`)
- **Akash Mochi** — Computer Vision & Liveness Specialist (`akash.mochi@authenai.internal`)
- **Vansh Malikan** — Full-Stack Engineer & Decision Systems (`vansh.malikan@authenai.internal`)

Secretariat: *Innovation & Incubation Labs, Tech Corridor, National Hub, India*  
Copyright © 2026 AuthenAI Engineering Team. All rights reserved.
