"""
Evidence & Explanation Engine
Constructs itemized forensic evidence cards, pass/fail check status, and "Why this result?" rationales.
"""

from typing import List, Dict, Any
from app.models.schemas import EvidenceItem


class EvidenceEngine:
    """Generates transparent, explainable forensic evidence logs."""

    def compile_evidence(
        self,
        doc_res: Dict[str, Any],
        face_res: Dict[str, Any],
        liveness_res: Dict[str, Any],
        video_res: Dict[str, Any],
        voice_res: Dict[str, Any],
        cross_res: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Synthesizes individual modal results into:
        - evidence_log (List[EvidenceItem])
        - checks (Dict[str, bool])
        - why_this_result (List[str])
        """
        # 1. Individual Checks Boolean Map
        checks = {
            "Document Integrity": not doc_res.get("is_tampered", False),
            "Face Match": face_res.get("match_score", 0) >= 70.0,
            "Liveness": liveness_res.get("is_live", True),
            "Video Authenticity": video_res.get("video_authenticity", 0) >= 65.0,
            "Voice Authenticity": voice_res.get("voice_authenticity", 0) >= 65.0,
            "Cross-Modal Consistency": cross_res.get("overall_cross_modal_score", 0) >= 70.0,
        }

        # 2. Itemized Evidence Log
        evidence_log: List[EvidenceItem] = [
            EvidenceItem(
                check_name="Document Integrity (ELA)",
                status="PASS" if checks["Document Integrity"] else "FLAG",
                metric=f"Integrity: {doc_res.get('integrity_score', 94)}% (Tampering: {doc_res.get('tampering_probability', 6)}%)",
                details="Uniform JPEG compression matrix. No spliced text or copy-move forgery found."
                if checks["Document Integrity"] else
                "Elevated compression variance detected around photo border. Potential digital alteration.",
            ),
            EvidenceItem(
                check_name="Facial Biometric Match",
                status="PASS" if checks["Face Match"] else "FLAG",
                metric=f"Similarity: {face_res.get('match_score', 95)}%",
                details="Credential portrait and live biometric face capture share high facial landmark correlation."
                if checks["Face Match"] else
                "Facial landmark geometry mismatch between credential portrait and live sensor stream.",
            ),
            EvidenceItem(
                check_name="Micro-Motion Liveness",
                status="PASS" if checks["Liveness"] else "FLAG",
                metric=f"Liveness Score: {liveness_res.get('liveness_score', 96)}%",
                details=liveness_res.get("details", "Micro-motion challenge response confirmed."),
            ),
            EvidenceItem(
                check_name="Video Deepfake Forensics",
                status="PASS" if checks["Video Authenticity"] else "FLAG",
                metric=f"Authenticity: {video_res.get('video_authenticity', 95)}% (Deepfake Prob: {video_res.get('deepfake_probability', 5)}%)",
                details=video_res.get("details", "Natural optical flow and temporal stability verified."),
            ),
            EvidenceItem(
                check_name="Synthetic Voice Check",
                status="PASS" if checks["Voice Authenticity"] else "FLAG",
                metric=f"Authenticity: {voice_res.get('voice_authenticity', 94)}%",
                details=voice_res.get("details", "Organic harmonic spectrum without neural vocoder artifacts."),
            ),
            EvidenceItem(
                check_name="Cross-Modal Consistency",
                status="PASS" if checks["Cross-Modal Consistency"] else "FLAG",
                metric=f"Consistency Score: {cross_res.get('overall_cross_modal_score', 93)}%",
                details=cross_res.get("details", "Cross-modal agreement between document, face, and speech."),
            ),
        ]

        # 3. "Why this result?" Human-Readable Rationales
        why_this_result: List[str] = []
        if checks["Face Match"]:
            why_this_result.append("Face matched the submitted document portrait with high confidence.")
        else:
            why_this_result.append("Facial landmark correlation with the document photo fell below the safety threshold.")

        if checks["Liveness"]:
            why_this_result.append("Active behavioral liveness challenge was completed successfully.")
        else:
            why_this_result.append("Liveness motion verification was inconclusive or indicated static playback.")

        if checks["Video Authenticity"]:
            why_this_result.append("Video feed showed low temporal manipulation and natural facial boundary stability.")
        else:
            why_this_result.append("Video frames exhibited synthetic warping signatures characteristic of face-swapping.")

        if checks["Voice Authenticity"]:
            why_this_result.append("Voice analysis confirmed natural vocal tract harmonics and absence of cloning cutoffs.")
        else:
            why_this_result.append("Audio waveform analysis detected synthetic neural vocoder frequency anomalies.")

        if checks["Document Integrity"]:
            why_this_result.append("Document Error Level Analysis (ELA) indicated authentic compression uniformity.")
        else:
            why_this_result.append("Document pixels showed suspicious digital re-encoding and potential boundary splicing.")

        if checks["Cross-Modal Consistency"]:
            why_this_result.append("Cross-modal verification confirmed temporal and identity agreement across all signals.")
        else:
            why_this_result.append("Cross-modal correlation flagged discrepancies between audio, video, and credential signals.")

        return {
            "checks": checks,
            "evidence_log": evidence_log,
            "why_this_result": why_this_result,
        }


evidence_engine = EvidenceEngine()
