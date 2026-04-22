"""
attendance_validators.py
Validation logic for edge cases in attendance system
"""

import logging
from typing import Tuple, Optional, Dict, Any
from datetime import datetime, timedelta
import cv2
import numpy as np

from attendance.models import Attendance, AttendanceSession, Course
from attendance.attendance_errors import (
    DuplicateAttendanceError,
    MultipleFacesDetectedError,
    NoFaceDetectedError,
    FaceNotRecognizedError,
    AttendanceException,
    AttendanceErrorType,
)

logger = logging.getLogger(__name__)


class AttendanceValidator:
    """Validates attendance operations for edge cases"""
    
    DUPLICATE_CHECK_MINUTES = 30  # Flag duplicate if within 30 min
    FACE_CONFIDENCE_THRESHOLD = 0.6
    MIN_FACE_SIZE = 20  # Minimum pixels for MTCNN detection
    
    @staticmethod
    def check_duplicate_attendance(
        student_id: int,
        course_id: int,
        session_id: Optional[int] = None,
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if attendance already marked for this session
        
        Args:
            student_id: Student ID
            course_id: Course ID
            session_id: Optional session ID (if specific session)
        
        Returns:
            (is_duplicate, marked_at_time)
        """
        try:
            # Get current session or specified session
            if session_id:
                session = AttendanceSession.objects.get(id=session_id)
            else:
                # Get today's active session
                session = AttendanceSession.objects.filter(
                    course_id=course_id,
                    date=datetime.now().date(),
                    is_active=True
                ).first()
            
            if not session:
                return False, None
            
            # Check for existing attendance in this session
            recent = Attendance.objects.filter(
                student_id=student_id,
                course_id=course_id,
                session=session,
                created_at__gte=datetime.now() - timedelta(
                    minutes=AttendanceValidator.DUPLICATE_CHECK_MINUTES
                )
            ).order_by('-created_at').first()
            
            if recent:
                marked_time = recent.created_at.strftime('%H:%M:%S')
                logger.warning(
                    f"Duplicate attendance detected: "
                    f"Student {student_id} already marked at {marked_time}"
                )
                return True, marked_time
            
            return False, None
            
        except Exception as e:
            logger.error(f"Error checking duplicate attendance: {e}")
            # If database error, allow attempt (will handle elsewhere)
            return False, None
    
    @staticmethod
    def validate_face_detection(faces: list, confidence: float = None) -> None:
        """
        Validate face detection results
        
        Args:
            faces: List of detected faces from MTCNN
            confidence: Confidence score for face recognition
        
        Raises:
            MultipleFacesDetectedError: If multiple faces detected
            NoFaceDetectedError: If no faces detected
            FaceNotRecognizedError: If confidence too low
        """
        # Check face count
        if not faces or len(faces) == 0:
            logger.warning("No faces detected in image")
            raise NoFaceDetectedError()
        
        if len(faces) > 1:
            logger.warning(f"Multiple faces detected: {len(faces)}")
            raise MultipleFacesDetectedError(len(faces))
        
        # Check face size (MTCNN has minimum size requirements)
        face = faces[0]
        face_area = (face[2] - face[0]) * (face[3] - face[1])
        min_face_area = AttendanceValidator.MIN_FACE_SIZE ** 2
        
        if face_area < min_face_area:
            logger.warning(f"Face too small: area={face_area}")
            raise AttendanceException(
                error_type=AttendanceErrorType.FACE_TOO_SMALL,
                message=f"Face too small: {face_area}px²",
                user_message="👤 Face too small. Please move closer to camera.",
                details={'face_area': face_area, 'min_area': min_face_area},
                status_code=400,
                retry_possible=True,
                fallback_possible=False,
            )
        
        # Check confidence
        if confidence is not None and confidence < AttendanceValidator.FACE_CONFIDENCE_THRESHOLD:
            logger.warning(f"Low face confidence: {confidence:.2f}")
            raise FaceNotRecognizedError(confidence)
    
    @staticmethod
    def validate_face_visibility(image: np.ndarray, face_bbox: list) -> None:
        """
        Validate that detected face is sufficiently visible
        
        Args:
            image: Original image (BGR format)
            face_bbox: Face bounding box [x1, y1, x2, y2]
        
        Raises:
            AttendanceException: If face is partially visible or low quality
        """
        x1, y1, x2, y2 = [int(v) for v in face_bbox]
        height, width = image.shape[:2]
        
        # Check if face is at image edges (partially visible)
        edge_margin = 10  # pixels
        if (x1 < edge_margin or y1 < edge_margin or 
            x2 > width - edge_margin or y2 > height - edge_margin):
            logger.warning("Face partially visible at image edges")
            raise AttendanceException(
                error_type=AttendanceErrorType.FACE_PARTIALLY_VISIBLE,
                message="Face partially visible at image edges",
                user_message="📍 Face not fully visible. Please center yourself.",
                details={'edge_margin': edge_margin},
                status_code=400,
                retry_possible=True,
                fallback_possible=False,
            )
        
        # Extract face region and check quality
        face_region = image[y1:y2, x1:x2]
        
        # Check brightness
        brightness = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)[:, :, 2].mean()
        if brightness < 30:  # Too dark
            logger.warning(f"Face region too dark: brightness={brightness}")
            raise AttendanceException(
                error_type=AttendanceErrorType.UNCLEAR_FACE,
                message=f"Face region too dark: {brightness}",
                user_message="💡 Too dark. Please improve lighting.",
                details={'brightness': brightness},
                status_code=400,
                retry_possible=True,
                fallback_possible=False,
            )
        
        if brightness > 245:  # Too bright/overexposed
            logger.warning(f"Face region too bright: brightness={brightness}")
            raise AttendanceException(
                error_type=AttendanceErrorType.UNCLEAR_FACE,
                message=f"Face region overexposed: {brightness}",
                user_message="☀️ Too bright/overexposed. Adjust your position.",
                details={'brightness': brightness},
                status_code=400,
                retry_possible=True,
                fallback_possible=False,
            )
    
    @staticmethod
    def validate_student_exists(student_id: int) -> bool:
        """
        Validate that student exists and is active
        
        Args:
            student_id: Student ID
        
        Raises:
            AttendanceException: If student invalid
        """
        try:
            from students.models import Student
            student = Student.objects.get(id=student_id, is_active=True)
            return True
        except Student.DoesNotExist:
            logger.error(f"Invalid or inactive student: {student_id}")
            raise AttendanceException(
                error_type=AttendanceErrorType.INVALID_STUDENT,
                message=f"Invalid student ID: {student_id}",
                user_message="❌ Student not found or inactive.",
                details={'student_id': student_id},
                status_code=404,
                retry_possible=False,
                fallback_possible=False,
            )
        except Exception as e:
            logger.error(f"Error validating student: {e}")
            raise
    
    @staticmethod
    def validate_course_session(course_id: int, session_id: Optional[int] = None) -> bool:
        """
        Validate that course and session exist and are active
        
        Args:
            course_id: Course ID
            session_id: Optional session ID
        
        Raises:
            AttendanceException: If course/session invalid
        """
        try:
            # Check course exists
            course = Course.objects.get(id=course_id, is_active=True)
            
            # Check session if provided
            if session_id:
                session = AttendanceSession.objects.get(
                    id=session_id,
                    course_id=course_id,
                    is_active=True
                )
            
            return True
        except Course.DoesNotExist:
            logger.error(f"Invalid course: {course_id}")
            raise AttendanceException(
                error_type=AttendanceErrorType.INVALID_COURSE,
                message=f"Invalid course ID: {course_id}",
                user_message="❌ Course not found or inactive.",
                details={'course_id': course_id},
                status_code=404,
                retry_possible=False,
                fallback_possible=False,
            )
        except AttendanceSession.DoesNotExist:
            logger.error(f"Invalid session: {session_id}")
            raise AttendanceException(
                error_type=AttendanceErrorType.SESSION_EXPIRED,
                message=f"Session not active: {session_id}",
                user_message="⏰ Attendance session is inactive.",
                details={'session_id': session_id},
                status_code=409,
                retry_possible=False,
                fallback_possible=False,
            )
        except Exception as e:
            logger.error(f"Error validating course/session: {e}")
            raise
    
    @staticmethod
    def validate_permissions(user_id: int, course_id: int, is_faculty: bool) -> bool:
        """
        Validate user has permission to mark attendance
        
        Args:
            user_id: User ID
            course_id: Course ID
            is_faculty: Whether user is faculty
        
        Raises:
            AttendanceException: If permission denied
        """
        try:
            if is_faculty:
                # Faculty must be assigned to course
                from faculty.models import Faculty
                faculty = Faculty.objects.get(user_id=user_id)
                if not faculty.courses.filter(id=course_id).exists():
                    raise AttendanceException(
                        error_type=AttendanceErrorType.PERMISSION_DENIED,
                        message=f"Faculty not assigned to course {course_id}",
                        user_message="❌ You are not assigned to this course.",
                        status_code=403,
                        retry_possible=False,
                        fallback_possible=False,
                    )
            return True
        except Exception as e:
            logger.error(f"Permission validation error: {e}")
            raise


class BlockchainValidator:
    """Validates blockchain operations"""
    
    @staticmethod
    def validate_blockchain_available() -> Tuple[bool, Optional[str]]:
        """
        Check if blockchain network is available
        
        Returns:
            (is_available, error_message)
        """
        try:
            from blockchain.blockchain_operations import AttendanceBlockchainStorage
            storage = AttendanceBlockchainStorage()
            
            # Try to get current block (simple connectivity test)
            block_number = storage.web3.eth.block_number
            logger.info(f"Blockchain connected, current block: {block_number}")
            return True, None
            
        except ConnectionError as e:
            logger.error(f"Blockchain connection error: {e}")
            return False, "Blockchain network unreachable"
        except Exception as e:
            logger.error(f"Blockchain validation error: {e}")
            return False, f"Blockchain error: {str(e)}"
    
    @staticmethod
    def validate_sufficient_gas(required_gas: int = 200000) -> bool:
        """
        Check if account has sufficient gas
        
        Args:
            required_gas: Required gas amount (default: 200k)
        
        Raises:
            AttendanceException: If insufficient gas
        """
        try:
            from blockchain.blockchain_operations import AttendanceBlockchainStorage
            storage = AttendanceBlockchainStorage()
            
            balance = storage.web3.eth.get_balance(storage.account_address)
            gas_cost = required_gas * storage.web3.eth.gas_price
            
            if balance < gas_cost:
                logger.error(
                    f"Insufficient gas: balance={balance}, cost={gas_cost}"
                )
                raise AttendanceException(
                    error_type=AttendanceErrorType.BLOCKCHAIN_INSUFFICIENT_GAS,
                    message=f"Insufficient gas: {balance} < {gas_cost}",
                    user_message="⛽ Insufficient blockchain balance. Contact admin.",
                    details={'balance': balance, 'cost': gas_cost},
                    status_code=402,
                    retry_possible=False,
                    fallback_possible=True,
                )
            
            return True
        except AttendanceException:
            raise
        except Exception as e:
            logger.error(f"Gas validation error: {e}")
            return False


class NetworkValidator:
    """Validates network connectivity"""
    
    @staticmethod
    def check_network_connectivity() -> Tuple[bool, Optional[str]]:
        """
        Check basic network connectivity
        
        Returns:
            (is_connected, error_message)
        """
        try:
            import socket
            socket.create_connection(("8.8.8.8", 53), timeout=3)
            return True, None
        except (OSError, socket.timeout) as e:
            logger.warning(f"Network connectivity issue: {e}")
            return False, "No internet connection"
        except Exception as e:
            logger.error(f"Network check error: {e}")
            return False, str(e)
