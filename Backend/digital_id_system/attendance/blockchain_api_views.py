"""
blockchain_api_views.py
API endpoints for blockchain transaction data
"""

from rest_framework import viewsets, serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from attendance.models import Attendance
from blockchain.blockchain_operations import AttendanceBlockchainStorage
import logging

logger = logging.getLogger(__name__)


class BlockchainTransactionSerializer(serializers.Serializer):
    """Serializer for blockchain transaction data"""
    
    tx_hash = serializers.CharField(source='blockchain_tx', read_only=True)
    transaction_hash = serializers.CharField(source='blockchain_tx', read_only=True)
    block_number = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source='date_time', format='iso-8601')
    created_at = serializers.DateTimeField(format='iso-8601')
    
    # Student details
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_id = serializers.CharField(source='student.registration_id', read_only=True)
    student_email = serializers.CharField(source='student.user.email', read_only=True)
    
    # Course details
    course_name = serializers.CharField(source='course.course_name', read_only=True)
    course_id = serializers.CharField(source='course.course_code', read_only=True)
    
    # Attendance details
    date = serializers.DateField(source='date_time', format='iso-8601')
    time = serializers.TimeField(source='date_time', format='iso-8601')
    attendance_status = serializers.CharField(source='status')
    subject = serializers.CharField(source='course.course_name', read_only=True)
    
    # Blockchain details (optional - populated if tx data exists)
    from_address = serializers.SerializerMethodField()
    to_address = serializers.SerializerMethodField()
    gas_used = serializers.SerializerMethodField()
    gas_price = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()
    confirmations = serializers.SerializerMethodField()
    
    def get_block_number(self, obj):
        """Extract block number from blockchain transaction"""
        if not obj.blockchain_tx:
            return None
        try:
            storage = AttendanceBlockchainStorage()
            receipt = storage.web3.eth.get_transaction_receipt(obj.blockchain_tx)
            return receipt.get('blockNumber') if receipt else None
        except Exception as e:
            logger.warning(f"Could not get block number for {obj.blockchain_tx}: {e}")
            return None
    
    def get_status(self, obj):
        """Determine transaction status"""
        if not obj.blockchain_tx:
            return 'pending'
        
        try:
            storage = AttendanceBlockchainStorage()
            receipt = storage.web3.eth.get_transaction_receipt(obj.blockchain_tx)
            
            if receipt is None:
                return 'pending'
            
            if receipt.get('status') == 1:
                return 'confirmed'
            else:
                return 'failed'
        except Exception as e:
            logger.warning(f"Could not get status for {obj.blockchain_tx}: {e}")
            return 'pending'
    
    def get_from_address(self, obj):
        """Get sender address from blockchain"""
        if not obj.blockchain_tx:
            return None
        try:
            storage = AttendanceBlockchainStorage()
            tx = storage.web3.eth.get_transaction(obj.blockchain_tx)
            return tx.get('from') if tx else None
        except Exception:
            return None
    
    def get_to_address(self, obj):
        """Get recipient address from blockchain"""
        if not obj.blockchain_tx:
            return None
        try:
            storage = AttendanceBlockchainStorage()
            tx = storage.web3.eth.get_transaction(obj.blockchain_tx)
            return tx.get('to') if tx else None
        except Exception:
            return None
    
    def get_gas_used(self, obj):
        """Get gas used from blockchain receipt"""
        if not obj.blockchain_tx:
            return None
        try:
            storage = AttendanceBlockchainStorage()
            receipt = storage.web3.eth.get_transaction_receipt(obj.blockchain_tx)
            return receipt.get('gasUsed') if receipt else None
        except Exception:
            return None
    
    def get_gas_price(self, obj):
        """Get gas price from blockchain transaction"""
        if not obj.blockchain_tx:
            return None
        try:
            storage = AttendanceBlockchainStorage()
            tx = storage.web3.eth.get_transaction(obj.blockchain_tx)
            return tx.get('gasPrice') if tx else None
        except Exception:
            return None
    
    def get_value(self, obj):
        """Get transaction value from blockchain"""
        if not obj.blockchain_tx:
            return None
        try:
            storage = AttendanceBlockchainStorage()
            tx = storage.web3.eth.get_transaction(obj.blockchain_tx)
            return tx.get('value') if tx else None
        except Exception:
            return None
    
    def get_confirmations(self, obj):
        """Get number of confirmations"""
        if not obj.blockchain_tx:
            return 0
        try:
            storage = AttendanceBlockchainStorage()
            receipt = storage.web3.eth.get_transaction_receipt(obj.blockchain_tx)
            if not receipt:
                return 0
            
            current_block = storage.web3.eth.block_number
            block_number = receipt.get('blockNumber')
            return current_block - block_number if block_number else 0
        except Exception:
            return 0


class BlockchainTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for blockchain transactions"""
    
    serializer_class = BlockchainTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get attendance records with blockchain transactions"""
        # Only return records with blockchain transactions
        queryset = Attendance.objects.filter(
            blockchain_tx__isnull=False
        ).select_related(
            'student',
            'student__user',
            'course'
        ).order_by('-date_time')
        
        # Filter by faculty if user is faculty
        if hasattr(self.request.user, 'faculty'):
            queryset = queryset.filter(course__faculty=self.request.user.faculty)
        
        return queryset[:100]  # Limit to last 100 for performance
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Filter transactions by status (confirmed, pending, failed)"""
        status = request.query_params.get('status', 'all')
        
        queryset = self.get_queryset()
        filtered = []
        
        for attendance in queryset:
            tx_status = self._get_tx_status(attendance.blockchain_tx)
            if status == 'all' or tx_status == status:
                filtered.append(attendance)
        
        serializer = self.get_serializer(filtered, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get transactions for a specific student"""
        student_id = request.query_params.get('student_id')
        
        if not student_id:
            return Response(
                {'error': 'student_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(student__registration_id=student_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_course(self, request):
        """Get transactions for a specific course"""
        course_id = request.query_params.get('course_id')
        
        if not course_id:
            return Response(
                {'error': 'course_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(course__id=course_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_date_range(self, request):
        """Get transactions within a date range"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date parameters required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from datetime import datetime
            start = datetime.fromisoformat(start_date)
            end = datetime.fromisoformat(end_date)
            
            queryset = self.get_queryset().filter(
                date_time__range=[start, end]
            )
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use ISO 8601 format.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get transaction statistics"""
        queryset = self.get_queryset()
        
        confirmed = 0
        pending = 0
        failed = 0
        
        for attendance in queryset:
            tx_status = self._get_tx_status(attendance.blockchain_tx)
            if tx_status == 'confirmed':
                confirmed += 1
            elif tx_status == 'pending':
                pending += 1
            elif tx_status == 'failed':
                failed += 1
        
        return Response({
            'total': queryset.count(),
            'confirmed': confirmed,
            'pending': pending,
            'failed': failed,
            'timestamp': timezone.now().isoformat(),
        })
    
    @staticmethod
    def _get_tx_status(tx_hash):
        """Helper to get transaction status"""
        if not tx_hash:
            return 'pending'
        
        try:
            storage = AttendanceBlockchainStorage()
            receipt = storage.web3.eth.get_transaction_receipt(tx_hash)
            
            if receipt is None:
                return 'pending'
            
            return 'confirmed' if receipt.get('status') == 1 else 'failed'
        except Exception:
            return 'unknown'
