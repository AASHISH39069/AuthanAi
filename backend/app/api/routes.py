"""
AuthenAI FastAPI Verification API Routes
Comprehensive REST endpoints for each step of the multi-modal verification pipeline.
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Query
from app.models.schemas import (
    IdentityRequest,
    StartSessionResponse,
    ChallengeData,
    DocumentAnalysisResult,
    FaceAnalysisResult,
    LivenessAnalysisResult,
    VideoAnalysisResult,
    VoiceAnalysisResult,
    VerificationResult,
    SessionHistoryItem,
)
from app.utils.helpers import generate_session_id, get_iso_timestamp, get_random_challenge
from app.database.mongo import (
    save_session,
    get_session,
    save_verification_result,
    get_verification_result,
    get_verification_history,
)
from app.services import (
    document_service,
    face_service,
    liveness_service,
    video_service,
    voice_service,
    cross_modal_service,
    risk_engine,
    confidence_engine,
    evidence_engine,
)

router = APIRouter(prefix="/api/verification", tags=["Verification"])


@router.post("/start", response_model=StartSessionResponse)
async def start_session():
    """
    Step 1: Initialize a new zero-trust verification session.
    Generates a unique tracking token AUTH-2026-XXXXX and assigns a random liveness challenge.
    """
    session_id = generate_session_id()
    now_iso = get_iso_timestamp()
    challenge_dict = get_random_challenge()
    challenge = ChallengeData(**challenge_dict)

    session_data = {
        "session_id": session_id,
        "created_at": now_iso,
        "status": "INITIALIZED",
        "challenge": challenge_dict,
    }
    await save_session(session_id, session_data)

    return StartSessionResponse(
        session_id=session_id,
        timestamp=now_iso,
        status="ACTIVE",
        challenge=challenge,
        service_status="AWAITING_MULTI_MODAL_PAYLOAD",
    )


@router.post("/identity")
async def save_identity(payload: IdentityRequest):
    """Save minimal demographic identity information for the session."""
    session_id = payload.session_id or generate_session_id()
    session = await get_session(session_id) or {"session_id": session_id}
    session["identity"] = payload.model_dump()
    session["status"] = "IDENTITY_SAVED"
    await save_session(session_id, session)
    return {"status": "SUCCESS", "session_id": session_id, "identity": payload.model_dump()}


@router.post("/document", response_model=DocumentAnalysisResult)
async def analyze_document(
    document: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    claimed_name: str = Form("Alexandra Chen"),
):
    """
    Step 2: Ingest identity document, run ELA (Error Level Analysis) and OCR.
    """
    doc_bytes = await document.read()
    if len(doc_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty document payload.")

    analysis = document_service.analyze_document(doc_bytes, claimed_name)

    if session_id:
        session = await get_session(session_id) or {"session_id": session_id}
        session["document_analysis"] = analysis
        session["_doc_bytes"] = doc_bytes[:4096]  # Store small sample for face cross-check
        await save_session(session_id, session)

    return DocumentAnalysisResult(**analysis)


@router.post("/face", response_model=FaceAnalysisResult)
async def analyze_face(
    face: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
):
    """
    Step 3: Ingest biometric face frame, assess quality, and compute similarity vs document portrait.
    """
    face_bytes = await face.read()
    doc_bytes = None
    if session_id:
        session = await get_session(session_id)
        if session and "_doc_bytes" in session:
            doc_bytes = session["_doc_bytes"]

    analysis = face_service.analyze_face(face_bytes, doc_bytes)

    if session_id:
        session = await get_session(session_id) or {"session_id": session_id}
        session["face_analysis"] = analysis
        await save_session(session_id, session)

    return FaceAnalysisResult(**analysis)


@router.post("/liveness", response_model=LivenessAnalysisResult)
async def verify_liveness(
    video: Optional[UploadFile] = File(None),
    session_id: Optional[str] = Form(None),
    challenge_id: str = Form("CHAL-BLINK-01"),
    challenge_passed: bool = Form(True),
):
    """
    Step 4: Verify active motion liveness and challenge-response adherence.
    """
    video_bytes = await video.read() if video else None
    analysis = liveness_service.verify_liveness(video_bytes, challenge_id, challenge_passed)

    if session_id:
        session = await get_session(session_id) or {"session_id": session_id}
        session["liveness_analysis"] = analysis
        await save_session(session_id, session)

    return LivenessAnalysisResult(**analysis)


@router.post("/video", response_model=VideoAnalysisResult)
async def analyze_video(
    video: Optional[UploadFile] = File(None),
    session_id: Optional[str] = Form(None),
):
    """
    Analyze video stream for temporal deepfake and blending boundary artifacts.
    """
    video_bytes = await video.read() if isinstance(video, UploadFile) else None
    analysis = video_service.analyze_video(video_bytes)

    if session_id:
        session = await get_session(session_id) or {"session_id": session_id}
        session["video_analysis"] = analysis
        await save_session(session_id, session)

    return VideoAnalysisResult(**analysis)


@router.post("/audio", response_model=VoiceAnalysisResult)
async def analyze_audio(
    audio: Optional[UploadFile] = File(None),
    session_id: Optional[str] = Form(None),
):
    """
    Step 5: Inspect voice audio for synthetic speech and vocoder artifacts.
    """
    audio_bytes = await audio.read() if isinstance(audio, UploadFile) else None
    analysis = voice_service.analyze_audio(audio_bytes)

    if session_id:
        session = await get_session(session_id) or {"session_id": session_id}
        session["voice_analysis"] = analysis
        await save_session(session_id, session)

    return VoiceAnalysisResult(**analysis)


@router.post("/analyze", response_model=VerificationResult)
async def run_analysis(
    session_id: str = Form(...),
    demo_scenario: Optional[str] = Form(None),  # "genuine", "deepfake", "mismatch", "low_confidence"
):
    """
    Step 6 & 7: Centralized Risk & Confidence Synthesis.
    Consolidates signals from all modalities and returns final explainable result.
    """
    session = await get_session(session_id) or {"session_id": session_id}
    doc_res = session.get("document_analysis")
    face_res = session.get("face_analysis")
    liveness_res = session.get("liveness_analysis")
    video_res = session.get("video_analysis")
    voice_res = session.get("voice_analysis")

    # If steps were simulated or partially executed, populate safe baselines
    if not doc_res:
        doc_res = document_service.analyze_document(b"fake_doc")
    if not face_res:
        face_res = face_service.analyze_face(b"fake_face")
    if not liveness_res:
        liveness_res = liveness_service.verify_liveness()
    if not video_res:
        video_res = video_service.analyze_video()
    if not voice_res:
        voice_res = voice_service.analyze_audio()

    is_demo = False

    # Apply Demo Mode Scenarios if selected
    if demo_scenario == "deepfake":
        is_demo = True
        video_res["deepfake_probability"] = 88.0
        video_res["video_authenticity"] = 12.0
        voice_res["synthetic_speech_probability"] = 82.0
        voice_res["voice_authenticity"] = 18.0
        liveness_res["liveness_score"] = 42.0
        liveness_res["is_live"] = False
    elif demo_scenario == "mismatch":
        is_demo = True
        doc_res["tampering_probability"] = 72.0
        doc_res["is_tampered"] = True
        doc_res["integrity_score"] = 28.0
        face_res["match_score"] = 38.0
    elif demo_scenario == "low_confidence":
        is_demo = True

    # 1. Cross-Modal Evaluation
    cross_res = cross_modal_service.evaluate_cross_modal(
        doc_integrity=doc_res["integrity_score"],
        face_match=face_res["match_score"],
        liveness_score=liveness_res["liveness_score"],
        video_authenticity=video_res["video_authenticity"],
        voice_authenticity=voice_res["voice_authenticity"],
        challenge_passed=liveness_res.get("challenge_passed", True),
    )

    # 2. Risk Engine
    risk_score, risk_level, verdict, recommendation = risk_engine.compute_risk(
        doc_tampering_prob=doc_res["tampering_probability"],
        face_match_score=face_res["match_score"],
        deepfake_prob=video_res["deepfake_probability"],
        voice_synthetic_prob=voice_res["synthetic_speech_probability"],
        liveness_score=liveness_res["liveness_score"],
        challenge_passed=liveness_res.get("challenge_passed", True),
    )

    # 3. Confidence Engine
    confidence = confidence_engine.compute_confidence(
        doc_quality=doc_res.get("document_quality", 90.0),
        face_quality=face_res.get("face_quality", 90.0),
        low_confidence_override=(demo_scenario == "low_confidence"),
    )

    # If confidence is low, guide user to additional verification
    if confidence < 60.0:
        verdict = "ADDITIONAL VERIFICATION"
        recommendation = "Low signal confidence detected. Inconclusive image quality; additional verification required."

    # 4. Evidence Engine
    evidence_bundle = evidence_engine.compile_evidence(
        doc_res=doc_res,
        face_res=face_res,
        liveness_res=liveness_res,
        video_res=video_res,
        voice_res=voice_res,
        cross_res=cross_res,
    )

    user_claimed_name = session.get("identity", {}).get("name", "Alexandra Chen")
    now_iso = get_iso_timestamp()

    final_result = {
        "session_id": session_id,
        "timestamp": now_iso,
        "risk_score": risk_score,
        "confidence_score": confidence,
        "risk_level": risk_level,
        "verdict": verdict,
        "recommendation": recommendation,
        "why_this_result": evidence_bundle["why_this_result"],
        "checks": evidence_bundle["checks"],
        "evidence_log": [item.model_dump() for item in evidence_bundle["evidence_log"]],
        "metrics": {
            "document_integrity": doc_res["integrity_score"],
            "tampering_probability": doc_res["tampering_probability"],
            "face_similarity": face_res["match_score"],
            "liveness_score": liveness_res["liveness_score"],
            "deepfake_probability": video_res["deepfake_probability"],
            "voice_synthetic_risk": voice_res["synthetic_speech_probability"],
            "cross_modal_score": cross_res["overall_cross_modal_score"],
        },
        "is_demo": is_demo,
    }

    # Persist in Database
    await save_verification_result(final_result, user_name=user_claimed_name)

    return VerificationResult(**final_result)


@router.post("/verify", response_model=VerificationResult)
async def verify_all_in_one(
    document: Optional[UploadFile] = File(None),
    selfie: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    session_id: Optional[str] = Form(None),
    demo_scenario: Optional[str] = Form(None),
    claimed_name: str = Form("Alexandra Chen"),
):
    """
    All-in-one verification endpoint for direct single-request testing.
    """
    eff_session_id = session_id or generate_session_id()

    # Document
    if isinstance(document, UploadFile):
        doc_bytes = await document.read()
    else:
        doc_bytes = b"sample_doc"
    doc_res = document_service.analyze_document(doc_bytes, claimed_name)

    # Face
    face_file = selfie if isinstance(selfie, UploadFile) else (video if isinstance(video, UploadFile) else None)
    if face_file:
        face_bytes = await face_file.read()
    else:
        face_bytes = b"sample_face"
    face_res = face_service.analyze_face(face_bytes, doc_bytes)

    # Liveness
    liveness_res = liveness_service.verify_liveness()

    # Video
    video_bytes = await video.read() if isinstance(video, UploadFile) else None
    video_res = video_service.analyze_video(video_bytes)

    # Audio / Voice
    audio_bytes = await audio.read() if isinstance(audio, UploadFile) else None
    voice_res = voice_service.analyze_audio(audio_bytes)

    is_demo = False
    if demo_scenario == "deepfake":
        is_demo = True
        video_res["deepfake_probability"] = 88.0
        video_res["video_authenticity"] = 12.0
        voice_res["synthetic_speech_probability"] = 82.0
        voice_res["voice_authenticity"] = 18.0
        liveness_res["liveness_score"] = 42.0
        liveness_res["is_live"] = False
    elif demo_scenario == "mismatch":
        is_demo = True
        doc_res["tampering_probability"] = 72.0
        doc_res["is_tampered"] = True
        doc_res["integrity_score"] = 28.0
        face_res["match_score"] = 38.0
    elif demo_scenario == "low_confidence":
        is_demo = True

    # Cross-Modal
    cross_res = cross_modal_service.evaluate_cross_modal(
        doc_integrity=doc_res["integrity_score"],
        face_match=face_res["match_score"],
        liveness_score=liveness_res["liveness_score"],
        video_authenticity=video_res["video_authenticity"],
        voice_authenticity=voice_res["voice_authenticity"],
        challenge_passed=liveness_res.get("challenge_passed", True),
    )

    # Risk & Confidence
    risk_score, risk_level, verdict, recommendation = risk_engine.compute_risk(
        doc_tampering_prob=doc_res["tampering_probability"],
        face_match_score=face_res["match_score"],
        deepfake_prob=video_res["deepfake_probability"],
        voice_synthetic_prob=voice_res["synthetic_speech_probability"],
        liveness_score=liveness_res["liveness_score"],
    )

    confidence = confidence_engine.compute_confidence(
        doc_quality=doc_res.get("document_quality", 92.0),
        face_quality=face_res.get("face_quality", 94.0),
        low_confidence_override=(demo_scenario == "low_confidence"),
    )

    if confidence < 60.0:
        verdict = "ADDITIONAL VERIFICATION"
        recommendation = "Inconclusive sensor fidelity. Additional verification required."

    evidence_bundle = evidence_engine.compile_evidence(
        doc_res=doc_res,
        face_res=face_res,
        liveness_res=liveness_res,
        video_res=video_res,
        voice_res=voice_res,
        cross_res=cross_res,
    )

    final_result = {
        "session_id": eff_session_id,
        "timestamp": get_iso_timestamp(),
        "risk_score": risk_score,
        "confidence_score": confidence,
        "risk_level": risk_level,
        "verdict": verdict,
        "recommendation": recommendation,
        "why_this_result": evidence_bundle["why_this_result"],
        "checks": evidence_bundle["checks"],
        "evidence_log": [item.model_dump() for item in evidence_bundle["evidence_log"]],
        "metrics": {
            "document_integrity": doc_res["integrity_score"],
            "tampering_probability": doc_res["tampering_probability"],
            "face_similarity": face_res["match_score"],
            "liveness_score": liveness_res["liveness_score"],
            "deepfake_probability": video_res["deepfake_probability"],
            "voice_synthetic_risk": voice_res["synthetic_speech_probability"],
            "cross_modal_score": cross_res["overall_cross_modal_score"],
        },
        "is_demo": is_demo,
    }

    await save_verification_result(final_result, user_name=claimed_name)
    return VerificationResult(**final_result)


@router.get("/result/{session_id}", response_model=VerificationResult)
async def get_result(session_id: str):
    """Retrieve saved verification result for a session."""
    result = await get_verification_result(session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Verification session result not found.")
    return VerificationResult(**result)


@router.get("/history", response_model=List[SessionHistoryItem])
async def get_history():
    """Retrieve verification history audits for the user dashboard."""
    history = await get_verification_history()
    return [SessionHistoryItem(**item) for item in history]
