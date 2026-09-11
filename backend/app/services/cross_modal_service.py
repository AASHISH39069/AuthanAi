"""
Cross-Modal Consistency Service
Cross-validates multi-modal signals: Document vs Face, Video vs Audio, and Liveness consistency.
"""

from typing import Dict, Any


class CrossModalService:
    """Evaluates cross-correlation across all biometric and credential modalities."""

    def evaluate_cross_modal(
        self,
        doc_integrity: float,
        face_match: float,
        liveness_score: float,
        video_authenticity: float,
        voice_authenticity: float,
        challenge_passed: bool,
    ) -> Dict[str, Any]:
        """
        Synthesizes multi-modal cross correlation:
        Face-to-Document + Video-to-Voice + Challenge Consistency
        """
        # 1. Face vs Document alignment
        face_doc_score = min(100.0, (doc_integrity * 0.4) + (face_match * 0.6))

        # 2. Audio vs Video sync / consistency proxy
        av_diff = abs(video_authenticity - voice_authenticity)
        if av_diff < 15.0 and challenge_passed:
            av_consistency = "HIGH"
        elif av_diff < 30.0:
            av_consistency = "MEDIUM"
        else:
            av_consistency = "LOW"

        # 3. Overall cross-modal composite score
        overall_score = (
            (face_doc_score * 0.35)
            + (liveness_score * 0.25)
            + (video_authenticity * 0.20)
            + (voice_authenticity * 0.20)
        )
        if not challenge_passed:
            overall_score *= 0.65

        overall_score = round(min(99.4, max(10.0, overall_score)), 1)

        details = (
            f"Cross-modal consistency verified ({overall_score}%). Audio-video sync is {av_consistency}."
            if overall_score >= 70.0 else
            f"Cross-modal anomaly detected ({overall_score}%). Discrepancy observed between modalities."
        )

        return {
            "audio_video_consistency": av_consistency,
            "face_document_consistency": round(face_doc_score, 1),
            "overall_cross_modal_score": overall_score,
            "details": details,
        }


cross_modal_service = CrossModalService()
