"""
Centralized Risk Engine
Combines multi-modal forensic signals into a normalized Risk Score (0–100) using configurable weights.
"""

import os
from typing import Dict, Any, Tuple


class RiskEngine:
    """Configurable risk aggregation engine."""

    def __init__(self):
        # Configurable weights (Sum to 1.0)
        self.w_doc = float(os.getenv("WEIGHT_DOCUMENT", "0.25"))
        self.w_face = float(os.getenv("WEIGHT_FACE", "0.25"))
        self.w_video = float(os.getenv("WEIGHT_VIDEO", "0.20"))
        self.w_voice = float(os.getenv("WEIGHT_VOICE", "0.15"))
        self.w_liveness = float(os.getenv("WEIGHT_LIVENESS", "0.15"))

        # Thresholds
        self.thresh_low = float(os.getenv("THRESHOLD_LOW_RISK", "30.0"))
        self.thresh_medium = float(os.getenv("THRESHOLD_MEDIUM_RISK", "60.0"))

    def compute_risk(
        self,
        doc_tampering_prob: float,
        face_match_score: float,
        deepfake_prob: float,
        voice_synthetic_prob: float,
        liveness_score: float,
        challenge_passed: bool = True,
    ) -> Tuple[float, str, str, str]:
        """
        Calculates composite risk score and maps to risk level, verdict, and recommendation.
        Returns: (risk_score, risk_level, verdict, recommendation)
        """
        # Convert all modalities into risk dimensions (0 to 100 where higher = riskier)
        doc_risk = min(100.0, max(0.0, doc_tampering_prob))
        face_risk = min(100.0, max(0.0, 100.0 - face_match_score))
        video_risk = min(100.0, max(0.0, deepfake_prob))
        voice_risk = min(100.0, max(0.0, voice_synthetic_prob))
        liveness_risk = min(100.0, max(0.0, 100.0 - liveness_score))

        if not challenge_passed:
            liveness_risk = max(liveness_risk, 85.0)

        # Weighted composite risk
        composite_risk = (
            (doc_risk * self.w_doc)
            + (face_risk * self.w_face)
            + (video_risk * self.w_video)
            + (voice_risk * self.w_voice)
            + (liveness_risk * self.w_liveness)
        )

        # Critical escalation: if any primary vector exceeds 70% fraud probability, escalate risk
        max_vector = max(doc_risk, video_risk, voice_risk, liveness_risk)
        if max_vector >= 70.0:
            composite_risk = max(composite_risk, max_vector * 0.92)

        composite_risk = round(min(100.0, max(0.0, composite_risk)), 1)

        # Tier Classification
        if composite_risk <= self.thresh_low:
            risk_level = "LOW RISK"
            verdict = "VERIFICATION PASSED"
            recommendation = "Multi-modal integrity threshold fully satisfied. Low fraud probability."
        elif composite_risk <= self.thresh_medium:
            risk_level = "MEDIUM RISK"
            verdict = "ADDITIONAL VERIFICATION"
            recommendation = "Moderate variance detected across biometrics. Secondary identity check recommended."
        else:
            risk_level = "HIGH RISK"
            verdict = "MANUAL REVIEW REQUIRED"
            recommendation = "High synthetic artifact or credential discrepancy detected. Immediate forensic officer audit required."

        return composite_risk, risk_level, verdict, recommendation


risk_engine = RiskEngine()
