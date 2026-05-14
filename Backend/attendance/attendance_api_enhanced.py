"""
attendance_api_enhanced.py
Enhanced API views with robust error handling for all edge cases
"""

import logging
import base64
from typing import Optional, Dict, Any
from io import BytesIO

import cv2
import numpy as np
from PIL import Image
from rest_framework import status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from attendance.models import Attendance, AttendanceSession, Course
from attendance.attendance_errors import (
    AttendanceException,
    DuplicateAttendanceError,
    NetworkTimeoutError,
    BlockchainTransactionFailedError,
)
from attendance.attendance_validators import (
    AttendanceValidator,
    BlockchainValidator,
    NetworkValidator,
)
from attendance.blockchain_transaction_queue import BlockchainQueueHandler
from blockchain.blockchain_operations import AttendanceBlockchainStorage

logger = logging.getLogger(__name__)


class AttendanceMarkSerializer(serializers.Serializer):
    """Serializer for marking attendance"""

    student_id = serializers.IntegerField()
    course_id = serializers.IntegerField()
    session_id = serializers.IntegerField(required=False)
    face_image = serializers.CharField(help_text="Base64 encoded image")
    confidence = serializers.FloatField(required=False, allow_null=True)


class AttendanceMarkAPIView(APIView):
    """
    Enhanced API endpoint for marking attendance with edge case handling
    POST /api/attendance/mark/
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Mark attendance with face recognition and blockchain recording"""

        try:
            # Step 1: Validate request data
            serializer = AttendanceMarkSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {
                        'error': 'invalid_request',
                        'message': 'Invalid request data',
                        'details': serializer.errors,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            student_id = serializer.validated_data['student_id']
            course_id = serializer.validated_data['course_id']
            session_id = serializer.validated_data.get('session_id')
            face_image_b64 = serializer.validated_data['face_image']
            confidence = serializer.validated_data.get('confidence', None)

            # Step 2: Validate network connectivity
            is_connected, network_error = NetworkValidator.check_network_connectivity()
            if not is_connected:
                logger.warning(f"Network connectivity issue: {network_error}")
                raise NetworkTimeoutError("attendance-api", timeout_seconds=30)

            # Step 3: Check duplicate attendance
            is_duplicate, marked_time = AttendanceValidator.check_duplicate_attendance(
                student_id=student_id,
                course_id=course_id,
                session_id=session_id,
            )
            if is_duplicate:
                raise DuplicateAttendanceError(
                    student_name=f"Student {student_id}",  # Get from DB
                    course_name=f"Course {course_id}",      # Get from DB
                    marked_at=marked_time,
                )

            # Step 4: Validate entities exist
            AttendanceValidator.validate_student_exists(student_id)
            AttendanceValidator.validate_course_session(course_id, session_id)
            AttendanceValidator.validate_permissions(
                user_id=request.user.id,
                course_id=course_id,
                is_faculty=hasattr(request.user, 'faculty'),
            )

            # Step 5: Process and validate face image
            face_data = self._process_face_image(face_image_b64)
            if not face_data['valid']:
                raise face_data['error']

            faces = face_data['faces']
            image = face_data['image']

            # Step 6: Validate face detection
            try:
                AttendanceValidator.validate_face_detection(faces, confidence)
                AttendanceValidator.validate_face_visibility(image, faces[0])
            except AttendanceException as e:
                logger.warning(f"Face validation failed: {e.message}")
                return Response(
                    e.to_dict(),
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Step 7: Create attendance record
            attendance = Attendance.objects.create(
                student_id=student_id,
                course_id=course_id,
                session_id=session_id,
                status='present',
                marked_by_faculty=request.user if hasattr(request.user, 'faculty') else None,
                confidence_score=confidence or 0.0,
            )

            logger.info(f"Attendance created: {attendance.id}")

            # Step 8: Handle blockchain recording
            blockchain_result = self._handle_blockchain_recording(attendance)

            return Response(
                {
                    'success': True,
                    'message': 'Attendance marked successfully',
                    'attendance_id': attendance.id,
                    'blockchain': blockchain_result,
                    'timestamp': attendance.date_time.isoformat(),
                },
                status=status.HTTP_201_CREATED,
            )

        except AttendanceException as e:
            logger.warning(f"Attendance validation error: {e.message}")
            return Response(
                e.to_dict(),
                status=e.status_code,
            )
        except Exception as e:
            logger.error(f"Unexpected error in attendance marking: {e}", exc_info=True)
            return Response(
                {
                    'error': 'internal_server_error',
                    'message': 'An unexpected error occurred. Please try again.',
                    'details': str(e) if hasattr(e, 'user_message') else None,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @staticmethod
    def _process_face_image(face_image_b64: str) -> Dict[str, Any]:
        """
        Decode and process face image
        Returns: {
            'valid': bool,
            'faces': list,
            'image': np.ndarray,
            'error': AttendanceException (if invalid)
        }
        """
        try:
            # Decode base64 image
            image_data = base64.b64decode(face_image_b64)
            image = Image.open(BytesIO(image_data))
            image_cv2 = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

            # Detect faces using MTCNN (or other detector)
            from facenet_pytorch import MTCNN

            mtcnn = MTCNN(keep_all=True, device='cpu')
            faces, _ = mtcnn.detect(image_cv2)

            return {
                'valid': True,
                'faces': faces if faces is not None else [],
                'image': image_cv2,
                'error': None,
            }

        except Exception as e:
            logger.error(f"Face image processing error: {e}")
            from attendance.attendance_errors import AttendanceErrorType

            raise AttendanceException(
                error_type=AttendanceErrorType.API_REQUEST_FAILED,
                message=f"Face image processing failed: {e}",
                user_message="📸 Unable to process image. Please try a different image.",
                status_code=400,
                retry_possible=True,
                fallback_possible=False,
            )

    @staticmethod
    def _handle_blockchain_recording(attendance) -> Dict[str, Any]:
        """
        Handle blockchain recording with fallback
        
        Returns: {
            'status': 'recorded'|'pending'|'failed',
            'transaction_hash': str (if recorded),
            'retry_at': str (if pending),
            'error': str (if failed)
        }
        """
        try:
            # Check blockchain availability
            is_available, blockchain_error = BlockchainValidator.validate_blockchain_available()
            if not is_available:
                logger.warning(f"Blockchain unavailable: {blockchain_error}")

                # Queue for retry
                queue_entry = BlockchainQueueHandler.queue_transaction(
                    attendance_id=attendance.id,
                    transaction_data={
                        'student_id': attendance.student_id,
                        'course_id': attendance.course_id,
                        'attendance_date': str(attendance.date_time.date()),
                        'status': 'present',
                    },
                )
                queue_entry.schedule_retry()

                return {
                    'status': 'pending',
                    'message': 'Blockchain unavailable, will retry automatically',
                    'retry_at': queue_entry.next_retry_at.isoformat(),
                }

            # Check gas availability
            try:
                BlockchainValidator.validate_sufficient_gas()
            except AttendanceException as e:
                logger.warning(f"Insufficient gas: {e.message}")

                # Queue for retry
                BlockchainQueueHandler.queue_transaction(
                    attendance_id=attendance.id,
                    transaction_data={
                        'student_id': attendance.student_id,
                        'course_id': attendance.course_id,
                        'attendance_date': str(attendance.date_time.date()),
                        'status': 'present',
                    },
                )

                return {
                    'status': 'pending',
                    'message': 'Insufficient gas for blockchain, queued for later',
                }

            # Try to record on blockchain
            storage = AttendanceBlockchainStorage()
            tx_hash = storage.store_record(
                student_id=attendance.student_id,
                course_id=attendance.course_id,
                attendance_date=str(attendance.date_time.date()),
                status='present',
            )

            # Update attendance with transaction hash
            attendance.blockchain_tx = tx_hash
            attendance.blockchain_status = 'pending'
            attendance.save()

            return {
                'status': 'recorded',
                'transaction_hash': tx_hash,
                'message': 'Recorded on blockchain',
            }

        except AttendanceException as e:
            if e.fallback_possible:
                # Queue for retry
                try:
                    BlockchainQueueHandler.queue_transaction(
                        attendance_id=attendance.id,
                        transaction_data={
                            'student_id': attendance.student_id,
                            'course_id': attendance.course_id,
                            'attendance_date': str(attendance.date_time.date()),
                            'status': 'present',
                        },
                    )

                    return {
                        'status': 'pending',
                        'message': e.user_message,
                        'error': e.message,
                    }
                except Exception as queue_error:
                    logger.error(f"Failed to queue transaction: {queue_error}")
                    return {
                        'status': 'failed',
                        'message': 'Failed to queue blockchain transaction',
                        'error': str(queue_error),
                    }
            else:
                return {
                    'status': 'failed',
                    'message': e.user_message,
                    'error': e.message,
                }

        except Exception as e:
            logger.error(f"Unexpected blockchain error: {e}", exc_info=True)
            return {
                'status': 'failed',
                'message': 'Blockchain recording failed',
                'error': str(e),
            }


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def retry_blockchain_transaction(request, transaction_id: int):
    """
    Manually retry a failed blockchain transaction
    POST /api/attendance/blockchain/retry/{transaction_id}/
    """
    try:
        success = BlockchainQueueHandler.retry_specific_transaction(transaction_id)

        if success:
            return Response(
                {
                    'success': True,
                    'message': 'Transaction queued for retry',
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {
                    'error': 'retry_failed',
                    'message': 'Unable to retry transaction',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
    except Exception as e:
        logger.error(f"Retry error: {e}")
        return Response(
            {
                'error': 'internal_error',
                'message': str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_blockchain_queue_status(request):
    """
    Get status of blockchain queue
    GET /api/attendance/blockchain/queue/status/
    """
    try:
        pending = BlockchainQueueHandler.get_pending_count()
        failed = BlockchainQueueHandler.get_failed_count()

        return Response(
            {
                'pending_transactions': pending,
                'failed_transactions': failed,
                'status': 'syncing' if pending > 0 else 'synced',
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        logger.error(f"Status check error: {e}")
        return Response(
            {
                'error': 'internal_error',
                'message': str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
