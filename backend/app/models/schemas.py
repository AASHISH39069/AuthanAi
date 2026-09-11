"""
Pydantic Schemas for AuthenAI Multi-Modal Verification System
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class IdentityRequest(BaseModel):
    session_id: Optional[str] = None
    name: str = Field(..., description="Full citizen legal name")
    date_of_birth: str = Field(..., description="Date of birth YYYY-MM-DD")
    verification_type: str = Field("NATIONAL_ID", description="Credential type")


class ChallengeData(BaseModel):
    challenge_id: str
    type: str  # "blink", "turn_head_left", "turn_head_right", "read_digits"
    instruction: str
    action_keyword: str
    passcode: Optional[str] = None
    timeout_seconds: int = 15


class StartSessionResponse(BaseModel):
    session_id: str
    timestamp: str
    status: str
    challenge: ChallengeData
    service_status: str


class DocumentAnalysisResult(BaseModel):
    document_type: str
    ocr_extracted: Dict[str, str]
    document_quality: float  # 0-100
    tampering_probability: float  # 0-100
    integrity_score: float  # 0-100
    is_tampered: bool
    status: str  # "LOW RISK", "MEDIUM RISK", "HIGH RISK"
    evidence: List[str]


class FaceAnalysisResult(BaseModel):
    face_detected: bool
    face_quality: float  # 0-100
    match_score: float  # 0-100
    confidence: float
    status: str
    details: str


class LivenessAnalysisResult(BaseModel):
    liveness_score: float  # 0-100
    is_live: bool
    challenge_id: str
    challenge_passed: bool
    motion_entropy: float
    status: str
    details: str


class VideoAnalysisResult(BaseModel):
    deepfake_probability: float  # 0-100
    video_authenticity: float  # 0-100
    temporal_consistency: float  # 0-100
    status: str
    details: str


class VoiceAnalysisResult(BaseModel):
    synthetic_speech_probability: float  # 0-100
    voice_authenticity: float  # 0-100
    spectral_flatness: float
    vocoder_cutoff_detected: bool
    status: str
    details: str


class CrossModalResult(BaseModel):
    audio_video_consistency: str  # "HIGH", "MEDIUM", "LOW"
    face_document_consistency: float  # 0-100
    overall_cross_modal_score: float  # 0-100
    details: str


class EvidenceItem(BaseModel):
    check_name: str
    status: str  # "PASS", "FLAG", "WARN"
    metric: str
    details: str


class VerificationResult(BaseModel):
    session_id: str
    timestamp: str
    risk_score: float  # 0 to 100
    confidence_score: float  # 0 to 100
    risk_level: str  # "LOW RISK", "MEDIUM RISK", "HIGH RISK"
    verdict: str  # "VERIFICATION PASSED", "ADDITIONAL VERIFICATION", "MANUAL REVIEW REQUIRED"
    recommendation: str
    why_this_result: List[str]
    checks: Dict[str, bool]
    evidence_log: List[EvidenceItem]
    metrics: Dict[str, Any]
    is_demo: bool = False


class SessionHistoryItem(BaseModel):
    session_id: str
    date: str
    name: str
    risk_level: str
    risk_score: float
    confidence: float
    status: str
