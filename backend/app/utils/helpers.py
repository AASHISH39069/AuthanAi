"""
Helper utilities: Session token generation, challenge catalogs, and formatting
"""

import uuid
import random
from datetime import datetime, timezone
from typing import Dict, Any

CHALLENGES = [
    {
        "challenge_id": "CHAL-BLINK-01",
        "type": "blink",
        "instruction": "Blink twice clearly within 3 seconds",
        "action_keyword": "blink_twice",
        "passcode": None,
        "timeout_seconds": 15,
    },
    {
        "challenge_id": "CHAL-TURN-02",
        "type": "turn_head_left",
        "instruction": "Turn your head slowly to the LEFT, then look forward",
        "action_keyword": "turn_left",
        "passcode": None,
        "timeout_seconds": 15,
    },
    {
        "challenge_id": "CHAL-TURN-03",
        "type": "turn_head_right",
        "instruction": "Turn your head slowly to the RIGHT, then look forward",
        "action_keyword": "turn_right",
        "passcode": None,
        "timeout_seconds": 15,
    },
    {
        "challenge_id": "CHAL-SMILE-04",
        "type": "smile",
        "instruction": "Smile naturally for 2 seconds",
        "action_keyword": "smile_detected",
        "passcode": None,
        "timeout_seconds": 15,
    },
    {
        "challenge_id": "CHAL-CODE-05",
        "type": "read_digits",
        "instruction": "Read aloud the dynamic 4-digit passcode: 8492",
        "action_keyword": "read_code_8492",
        "passcode": "8492",
        "timeout_seconds": 20,
    },
]


def generate_session_id() -> str:
    """Generate session token conforming to AUTH-2026-XXXXX format."""
    suffix = uuid.uuid4().hex[:5].upper()
    return f"AUTH-2026-{suffix}"


def get_iso_timestamp() -> str:
    """Return current UTC timestamp in ISO format."""
    return datetime.now(timezone.utc).isoformat()


def get_random_challenge() -> Dict[str, Any]:
    """Select an unpredictable challenge for anti-replay validation."""
    return random.choice(CHALLENGES)
