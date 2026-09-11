"""
Independent Confidence Engine
Calculates verification certainty based on input signal quality, resolution, and sensor completeness.
Ensures risk and confidence remain strictly separate dimensions.
"""

from typing import Dict, Any


class ConfidenceEngine:
    """Computes model certainty percentage independently from risk score."""

    def compute_confidence(
        self,
        doc_quality: float,
        face_quality: float,
        audio_present: bool = True,
        video_present: bool = True,
        low_confidence_override: bool = False,
    ) -> float:
        """
        Evaluates input fidelity:
        High quality doc (e.g. 95) + clear face (e.g. 92) + all sensors = High Confidence (>90%).
        Poor lighting or compressed webcam feed reduces confidence.
        """
        if low_confidence_override:
            return 52.0  # Explicit low confidence demo test case

        base = (doc_quality * 0.5) + (face_quality * 0.5)

        # Penalties for missing modal feeds
        penalty = 0.0
        if not audio_present:
            penalty += 8.0
        if not video_present:
            penalty += 10.0

        confidence = round(min(99.4, max(40.0, base - penalty)), 1)
        return confidence


confidence_engine = ConfidenceEngine()
