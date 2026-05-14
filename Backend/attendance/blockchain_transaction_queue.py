"""
blockchain_transaction_queue.py
Handles failed blockchain transactions with retry/fallback logic
"""

import logging
import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum

from django.db import models
from django.utils import timezone
from django.core.cache import cache

logger = logging.getLogger(__name__)


class BlockchainTransactionStatus(Enum):
    """Status of blockchain transaction"""
    PENDING = "pending"           # Waiting to send
    SENT = "sent"                 # Sent to blockchain
    CONFIRMED = "confirmed"       # Confirmed on-chain
    FAILED = "failed"             # Failed after retries
    QUEUED = "queued"             # Queued for retry


class BlockchainTransactionQueue(models.Model):
    """
    Queue for managing blockchain transactions
    Handles failures with automatic retry and fallback
    """
    
    # Reference to attendance record
    attendance = models.ForeignKey(
        'Attendance',
        on_delete=models.CASCADE,
        related_name='blockchain_queue'
    )
    
    # Transaction data
    transaction_hash = models.CharField(max_length=66, null=True, blank=True)
    transaction_data = models.JSONField(
        help_text="Transaction data for retry"
    )
    
    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=[(s.value, s.name) for s in BlockchainTransactionStatus],
        default=BlockchainTransactionStatus.PENDING.value
    )
    error_message = models.TextField(null=True, blank=True)
    
    # Retry tracking
    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=5)
    last_retry_at = models.DateTimeField(null=True, blank=True)
    next_retry_at = models.DateTimeField(null=True, blank=True)
    
    # Fallback info
    fallback_used = models.BooleanField(default=False)
    fallback_reason = models.TextField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['next_retry_at']
        indexes = [
            models.Index(fields=['status', 'next_retry_at']),
            models.Index(fields=['attendance']),
        ]
    
    def __str__(self):
        return f"BlockchainTx {self.id} - {self.status}"
    
    def should_retry(self) -> bool:
        """Check if transaction should be retried"""
        if self.status == BlockchainTransactionStatus.CONFIRMED.value:
            return False
        
        if self.retry_count >= self.max_retries:
            return False
        
        if self.next_retry_at and self.next_retry_at > timezone.now():
            return False
        
        return True
    
    def schedule_retry(self, delay_seconds: int = 300):
        """
        Schedule retry with exponential backoff
        
        Args:
            delay_seconds: Initial delay in seconds (default: 5 min)
        """
        # Exponential backoff: 5min, 15min, 30min, 60min, 120min
        backoff_multiplier = min(2 ** self.retry_count, 8)
        delay_seconds = delay_seconds * backoff_multiplier
        
        self.next_retry_at = timezone.now() + timedelta(seconds=delay_seconds)
        self.status = BlockchainTransactionStatus.QUEUED.value
        self.save()
        
        logger.info(
            f"Scheduled retry #{self.retry_count + 1} for {self.id} "
            f"in {delay_seconds}s at {self.next_retry_at}"
        )
    
    def mark_failed(self, reason: str):
        """
        Mark transaction as permanently failed
        
        Args:
            reason: Failure reason
        """
        self.status = BlockchainTransactionStatus.FAILED.value
        self.error_message = reason
        self.save()
        
        logger.error(f"Transaction {self.id} marked failed: {reason}")
        
        # Notify admin
        self._notify_admin_failure(reason)
    
    def mark_confirmed(self, block_number: int):
        """
        Mark transaction as confirmed
        
        Args:
            block_number: Block number where confirmed
        """
        self.status = BlockchainTransactionStatus.CONFIRMED.value
        self.transaction_data['block_number'] = block_number
        self.save()
        
        # Update attendance record
        if self.attendance:
            self.attendance.blockchain_tx = self.transaction_hash
            self.attendance.blockchain_status = 'confirmed'
            self.attendance.blockchain_block = block_number
            self.attendance.save()
        
        logger.info(
            f"Transaction {self.id} confirmed in block {block_number}"
        )
    
    def activate_fallback(self, reason: str):
        """
        Activate fallback mechanism when blockchain fails
        Records attendance locally without blockchain
        
        Args:
            reason: Reason for fallback
        """
        self.fallback_used = True
        self.fallback_reason = reason
        self.status = BlockchainTransactionStatus.FAILED.value
        self.save()
        
        # Update attendance to pending blockchain
        if self.attendance:
            self.attendance.blockchain_status = 'pending'
            self.attendance.save()
        
        logger.warning(
            f"Fallback activated for transaction {self.id}: {reason}"
        )
    
    @staticmethod
    def _notify_admin_failure(reason: str):
        """Notify admin of persistent failure"""
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            
            send_mail(
                subject='⛓️ Blockchain Transaction Failed',
                message=f'Blockchain transaction failed after retries: {reason}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=True,
            )
        except Exception as e:
            logger.error(f"Failed to notify admin: {e}")


class BlockchainQueueHandler:
    """Handles blockchain transaction queue operations"""
    
    RETRY_DELAY_SECONDS = 300  # 5 minutes
    
    @staticmethod
    def queue_transaction(
        attendance_id: int,
        transaction_data: Dict[str, Any],
    ) -> BlockchainTransactionQueue:
        """
        Queue a blockchain transaction for retry
        
        Args:
            attendance_id: Attendance record ID
            transaction_data: Transaction data to retry
        
        Returns:
            BlockchainTransactionQueue instance
        """
        from attendance.models import Attendance
        
        attendance = Attendance.objects.get(id=attendance_id)
        
        queue_entry = BlockchainTransactionQueue.objects.create(
            attendance=attendance,
            transaction_data=transaction_data,
            status=BlockchainTransactionStatus.PENDING.value,
            next_retry_at=timezone.now(),
        )
        
        logger.info(f"Queued blockchain transaction {queue_entry.id}")
        return queue_entry
    
    @staticmethod
    def process_queue(batch_size: int = 10) -> Dict[str, int]:
        """
        Process queued blockchain transactions
        
        Args:
            batch_size: Number of transactions to process
        
        Returns:
            {
                'processed': count,
                'succeeded': count,
                'failed': count,
                'queued_for_retry': count,
            }
        """
        from blockchain.blockchain_operations import AttendanceBlockchainStorage
        from attendance.attendance_errors import AttendanceException
        
        stats = {
            'processed': 0,
            'succeeded': 0,
            'failed': 0,
            'queued_for_retry': 0,
        }
        
        # Get pending/queued transactions
        pending = BlockchainTransactionQueue.objects.filter(
            status__in=[
                BlockchainTransactionStatus.PENDING.value,
                BlockchainTransactionStatus.QUEUED.value,
            ],
            next_retry_at__lte=timezone.now(),
        )[:batch_size]
        
        blockch= AttendanceBlockchainStorage()
        
        for entry in pending:
            try:
                stats['processed'] += 1
                
                # Try to send transaction
                tx_data = entry.transaction_data
                
                tx_hash = blockch.store_record(
                    student_id=tx_data['student_id'],
                    course_id=tx_data['course_id'],
                    attendance_date=tx_data['attendance_date'],
                    status=tx_data['status'],
                )
                
                entry.transaction_hash = tx_hash
                entry.status = BlockchainTransactionStatus.SENT.value
                entry.last_retry_at = timezone.now()
                entry.save()
                
                logger.info(f"Successfully sent blockchain transaction {entry.id}")
                stats['succeeded'] += 1
                
            except AttendanceException as e:
                entry.error_message = str(e)
                
                # Check if recoverable
                if e.retry_possible and entry.retry_count < entry.max_retries:
                    entry.retry_count += 1
                    entry.schedule_retry(BlockchainQueueHandler.RETRY_DELAY_SECONDS)
                    stats['queued_for_retry'] += 1
                    logger.warning(
                        f"Transaction {entry.id} will retry "
                        f"({entry.retry_count}/{entry.max_retries})"
                    )
                else:
                    # Give up and activate fallback
                    entry.activate_fallback(str(e))
                    stats['failed'] += 1
                    logger.error(f"Transaction {entry.id} failed, fallback activated")
                    
            except Exception as e:
                logger.error(f"Unexpected error processing transaction {entry.id}: {e}")
                entry.error_message = str(e)
                
                if entry.retry_count < entry.max_retries:
                    entry.retry_count += 1
                    entry.schedule_retry(BlockchainQueueHandler.RETRY_DELAY_SECONDS)
                    stats['queued_for_retry'] += 1
                else:
                    entry.mark_failed(str(e))
                    stats['failed'] += 1
        
        return stats
    
    @staticmethod
    def get_pending_count() -> int:
        """Get count of pending blockchain transactions"""
        return BlockchainTransactionQueue.objects.filter(
            status__in=[
                BlockchainTransactionStatus.PENDING.value,
                BlockchainTransactionStatus.QUEUED.value,
                BlockchainTransactionStatus.SENT.value,
            ]
        ).count()
    
    @staticmethod
    def get_failed_count() -> int:
        """Get count of failed blockchain transactions"""
        return BlockchainTransactionQueue.objects.filter(
            status=BlockchainTransactionStatus.FAILED.value
        ).count()
    
    @staticmethod
    def retry_specific_transaction(queue_id: int) -> bool:
        """
        Manually retry a specific transaction
        
        Args:
            queue_id: BlockchainTransactionQueue ID
        
        Returns:
            Success status
        """
        try:
            entry = BlockchainTransactionQueue.objects.get(id=queue_id)
            
            if entry.retry_count >= entry.max_retries:
                logger.warning(f"Transaction {queue_id} exceeded max retries")
                return False
            
            entry.retry_count += 1
            entry.schedule_retry(0)  # Retry immediately
            return True
            
        except BlockchainTransactionQueue.DoesNotExist:
            logger.error(f"Transaction queue entry {queue_id} not found")
            return False
