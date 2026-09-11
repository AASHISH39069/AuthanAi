"""
Security Utilities: Input validation, file sanitization, and PII masking
"""

from fastapi import HTTPException, UploadFile

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime", "video/x-matroska"}
ALLOWED_AUDIO_TYPES = {"audio/wav", "audio/webm", "audio/mpeg", "audio/ogg", "audio/x-wav", "audio/mp4"}


def validate_file_size(file_bytes: bytes, max_bytes: int = MAX_FILE_SIZE_BYTES):
    """Ensure file does not exceed maximum allowable payload size."""
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {max_bytes // (1024 * 1024)}MB."
        )


def validate_image_file(file: UploadFile):
    """Validate image content type."""
    if file.content_type and file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image format '{file.content_type}'. Supported: JPEG, PNG, WEBP."
        )


def mask_sensitive_id(id_number: str) -> str:
    """Mask ID document number for privacy protection (preserves only last 4 digits)."""
    clean_id = id_number.strip()
    if len(clean_id) <= 4:
        return "****"
    return "*" * (len(clean_id) - 4) + clean_id[-4:]
