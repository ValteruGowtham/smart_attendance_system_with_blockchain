"""
attendance_errors.py
Centralized error handling and exceptions for attendance system
"""

from enum import Enum
from typing import Optional, Dict, Any


class AttendanceErrorType(Enum):
    """Enum for all possible attendance system errors"""
    
    # Duplicate/Session errors
    DUPLICATE_ATTENDANCE = "duplicate_attendance"
    ATTENDANCE_ALREADY_MARKED = "attendance_already_marked"
    SESSION_EXPIRED = "session_expired"
    
    # Face detection errors
    NO_FACE_DETECTED = "no_face_detected"
    MULTIPLE_FACES_DETECTED = "multiple_faces_detected"
    FACE_NOT_RECOGNIZED = "face_not_recognized"
    UNCLEAR_FACE = "unclear_face"
    FACE_TOO_SMALL = "face_too_small"  # MTCNN minimum size issue
    FACE_PARTIALLY_VISIBLE = "face_partially_visible"
    
    # Camera errors
    CAMERA_NOT_AVAILABLE = "camera_not_available"
    CAMERA_PERMISSION_DENIED = "camera_permission_denied"
    CAMERA_INITIALIZATION_FAILED = "camera_initialization_failed"
    CAMERA_STREAM_INTERRUPTED = "camera_stream_interrupted"
    
    # Network errors
    NETWORK_TIMEOUT = "network_timeout"
    NETWORK_UNREACHABLE = "network_unreachable"
    API_REQUEST_FAILED = "api_request_failed"
    API_RESPONSE_INVALID = "api_response_invalid"
    
    # Blockchain errors
    BLOCKCHAIN_NETWORK_ERROR = "blockchain_network_error"
    BLOCKCHAIN_TRANSACTION_FAILED = "blockchain_transaction_failed"
    BLOCKCHAIN_INSUFFICIENT_GAS = "blockchain_insufficient_gas"
    BLOCKCHAIN_CONTRACT_ERROR = "blockchain_contract_error"
    BLOCKCHAIN_TIMEOUT = "blockchain_timeout"
    
    # Validation errors
    INVALID_STUDENT = "invalid_student"
    INVALID_COURSE = "invalid_course"
    INVALID_SESSION = "invalid_session"
    PERMISSION_DENIED = "permission_denied"


class AttendanceException(Exception):
    """Base exception for attendance system"""
    
    def __init__(
        self,
        error_type: AttendanceErrorType,
        message: str,
        user_message: str,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 400,
        retry_possible: bool = False,
        fallback_possible: bool = False,
    ):
        """
        Initialize AttendanceException
        
        Args:
            error_type: Type of error
            message: Technical error message (log only)
            user_message: User-friendly error message
            details: Additional error context
            status_code: HTTP status code
            retry_possible: Whether retry is recommended
            fallback_possible: Whether fallback mechanism exists
        """
        self.error_type = error_type
        self.message = message
        self.user_message = user_message
        self.details = details or {}
        self.status_code = status_code
        self.retry_possible = retry_possible
        self.fallback_possible = fallback_possible
        
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to response dictionary"""
        return {
            'error': self.error_type.value,
            'message': self.user_message,
            'retry_possible': self.retry_possible,
            'fallback_possible': self.fallback_possible,
            'details': self.details,
        }


# Specific exception classes

class DuplicateAttendanceError(AttendanceException):
    """Raised when attendance is already marked for session"""
    
    def __init__(self, student_name: str, course_name: str, marked_at: str):
        super().__init__(
            error_type=AttendanceErrorType.ATTENDANCE_ALREADY_MARKED,
            message=f"Attendance already marked for {student_name} in {course_name}",
            user_message=f"⏰ Attendance already marked at {marked_at}. Cannot mark duplicate.",
            details={
                'student_name': student_name,
                'course_name': course_name,
                'marked_at': marked_at,
            },
            status_code=409,
            retry_possible=False,
            fallback_possible=False,
        )


class MultipleFacesDetectedError(AttendanceException):
    """Raised when multiple faces are detected in image"""
    
    def __init__(self, face_count: int):
        super().__init__(
            error_type=AttendanceErrorType.MULTIPLE_FACES_DETECTED,
            message=f"Multiple faces detected: {face_count}",
            user_message=f"❌ Detected {face_count} faces. Please ensure only one person is visible.",
            details={
                'face_count': face_count,
                'recommendation': 'Retry with single person in frame',
            },
            status_code=400,
            retry_possible=True,
            fallback_possible=False,
        )


class NoFaceDetectedError(AttendanceException):
    """Raised when no face is detected in image"""
    
    def __init__(self):
        super().__init__(
            error_type=AttendanceErrorType.NO_FACE_DETECTED,
            message="No face detected in image",
            user_message="🚫 No face detected. Please ensure your face is visible and well-lit.",
            details={
                'recommendation': 'Adjust lighting and position',
            },
            status_code=400,
            retry_possible=True,
            fallback_possible=False,
        )


class FaceNotRecognizedError(AttendanceException):
    """Raised when face cannot be recognized"""
    
    def __init__(self, confidence: float = 0.0):
        super().__init__(
            error_type=AttendanceErrorType.FACE_NOT_RECOGNIZED,
            message=f"Face not recognized (confidence: {confidence:.2f})",
            user_message="🤔 Face not recognized. Please ensure good lighting and clear visibility.",
            details={
                'confidence': confidence,
                'threshold': 0.6,
                'recommendation': 'Retry with better conditions',
            },
            status_code=400,
            retry_possible=True,
            fallback_possible=True,  # Can use manual entry by faculty
        )


class CameraNotAvailableError(AttendanceException):
    """Raised when camera is not available"""
    
    def __init__(self, reason: str = "Unknown"):
        super().__init__(
            error_type=AttendanceErrorType.CAMERA_NOT_AVAILABLE,
            message=f"Camera not available: {reason}",
            user_message="📷 Camera not available. Please check permissions and hardware.",
            details={
                'reason': reason,
                'resolution': 'Grant camera permission or check camera connection',
            },
            status_code=400,
            retry_possible=True,
            fallback_possible=True,  # Manual entry
        )


class CameraPermissionDeniedError(AttendanceException):
    """Raised when camera permission is denied"""
    
    def __init__(self):
        super().__init__(
            error_type=AttendanceErrorType.CAMERA_PERMISSION_DENIED,
            message="Camera permission denied",
            user_message="🔒 Camera permission denied. Please allow camera access in browser settings.",
            details={
                'resolution': 'Browser Settings → Privacy → Camera → Allow',
            },
            status_code=403,
            retry_possible=True,
            fallback_possible=True,
        )


class NetworkTimeoutError(AttendanceException):
    """Raised when network request times out"""
    
    def __init__(self, endpoint: str, timeout_seconds: int = 30):
        super().__init__(
            error_type=AttendanceErrorType.NETWORK_TIMEOUT,
            message=f"Network timeout for {endpoint} after {timeout_seconds}s",
            user_message="⏱️ Request timed out. Please check your connection and retry.",
            details={
                'endpoint': endpoint,
                'timeout_seconds': timeout_seconds,
            },
            status_code=504,
            retry_possible=True,
            fallback_possible=True,
        )


class NetworkUnreachableError(AttendanceException):
    """Raised when network is unreachable"""
    
    def __init__(self):
        super().__init__(
            error_type=AttendanceErrorType.NETWORK_UNREACHABLE,
            message="Network unreachable",
            user_message="🌐 No internet connection. Please check your network.",
            details={
                'resolution': 'Check WiFi/Mobile connection',
            },
            status_code=503,
            retry_possible=True,
            fallback_possible=True,  # Can queue and sync later
        )


class BlockchainTransactionFailedError(AttendanceException):
    """Raised when blockchain transaction fails"""
    
    def __init__(self, reason: str, transaction_hash: Optional[str] = None):
        super().__init__(
            error_type=AttendanceErrorType.BLOCKCHAIN_TRANSACTION_FAILED,
            message=f"Blockchain transaction failed: {reason}",
            user_message="⛓️ Blockchain recording failed. Attendance saved locally - will retry automatically.",
            details={
                'reason': reason,
                'transaction_hash': transaction_hash,
                'next_retry': '5 minutes',
            },
            status_code=502,
            retry_possible=True,
            fallback_possible=True,  # Attendance recorded, blockchain queued
        )


class BlockchainTimeoutError(AttendanceException):
    """Raised when blockchain operation times out"""
    
    def __init__(self):
        super().__init__(
            error_type=AttendanceErrorType.BLOCKCHAIN_TIMEOUT,
            message="Blockchain operation timeout",
            user_message="⏳ Blockchain is busy. Attendance saved - will record on-chain when available.",
            details={
                'status': 'pending',
                'auto_retry': True,
            },
            status_code=504,
            retry_possible=True,
            fallback_possible=True,
        )


# Error message factory

ERROR_MESSAGES = {
    AttendanceErrorType.DUPLICATE_ATTENDANCE: {
        'title': '⏰ Already Marked',
        'message': 'Attendance already marked for this class.',
        'icon': 'info',
    },
    AttendanceErrorType.MULTIPLE_FACES_DETECTED: {
        'title': '❌ Multiple Faces',
        'message': 'Please ensure only one person is visible to the camera.',
        'icon': 'warning',
        'action': 'Retry',
    },
    AttendanceErrorType.NO_FACE_DETECTED: {
        'title': '🚫 No Face Found',
        'message': 'Face not detected. Ensure good lighting and clear visibility.',
        'icon': 'error',
        'action': 'Retry',
    },
    AttendanceErrorType.FACE_NOT_RECOGNIZED: {
        'title': '🤔 Face Not Recognized',
        'message': 'Your face could not be matched. Try again with better lighting.',
        'icon': 'warning',
        'action': 'Retry or Manual Entry',
    },
    AttendanceErrorType.CAMERA_NOT_AVAILABLE: {
        'title': '📷 Camera Error',
        'message': 'Camera is not available. Check permissions and hardware.',
        'icon': 'error',
        'action': 'Use Manual Entry',
    },
    AttendanceErrorType.CAMERA_PERMISSION_DENIED: {
        'title': '🔒 Permission Denied',
        'message': 'Camera permission required. Enable in browser settings.',
        'icon': 'security',
        'action': 'Allow Access',
    },
    AttendanceErrorType.NETWORK_TIMEOUT: {
        'title': '⏱️ Connection Timeout',
        'message': 'Request took too long. Please check your connection.',
        'icon': 'clock',
        'action': 'Retry',
    },
    AttendanceErrorType.NETWORK_UNREACHABLE: {
        'title': '🌐 No Connection',
        'message': 'Internet connection lost. Check WiFi/Mobile network.',
        'icon': 'signal_off',
        'action': 'Offline Mode',
    },
    AttendanceErrorType.BLOCKCHAIN_NETWORK_ERROR: {
        'title': '⛓️ Blockchain Network',
        'message': 'Blockchain service unavailable. Data saved locally.',
        'icon': 'warning',
        'action': 'Auto-Retry',
    },
    AttendanceErrorType.BLOCKCHAIN_TRANSACTION_FAILED: {
        'title': '⛓️ Recording Failed',
        'message': 'Blockchain recording failed. Will retry automatically.',
        'icon': 'info',
    },
    AttendanceErrorType.BLOCKCHAIN_TIMEOUT: {
        'title': '⏳ Blockchain Pending',
        'message': 'Blockchain is busy. Recording when available.',
        'icon': 'pending',
    },
}
