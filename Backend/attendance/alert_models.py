"""
Alert Models - Database models for tracking alerts and notifications.
"""

from django.db import models
from django.contrib.auth.models import User
from .models import Student, Attendance
from datetime import timedelta
from django.utils import timezone


class AttendanceAlert(models.Model):
    """Track attendance alerts sent to students."""
    
    ALERT_TYPES = (
        ('absent', 'Marked Absent'),
        ('below_threshold', 'Below Attendance Threshold'),
    )
    
    CHANNEL_CHOICES = (
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('both', 'Email & SMS'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    )
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    channel = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default='email')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    # Alert context data
    current_attendance = models.FloatField(null=True, blank=True)  # Current attendance percentage
    classes_needed = models.IntegerField(null=True, blank=True)   # Classes needed to reach threshold
    threshold = models.IntegerField(default=75)                   # Attendance threshold
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    # Email/SMS details
    recipient_email = models.EmailField(null=True, blank=True)
    recipient_phone = models.CharField(max_length=20, null=True, blank=True)
    
    # Response tracking
    error_message = models.TextField(null=True, blank=True)
    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', '-created_at']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.student.registration_id} - {self.alert_type} - {self.status}"
    
    def mark_sent(self):
        """Mark alert as sent."""
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save()
    
    def mark_failed(self, error_message: str):
        """Mark alert as failed."""
        self.status = 'failed'
        self.error_message = error_message
        self.retry_count += 1
        self.save()
    
    def should_retry(self) -> bool:
        """Check if alert should be retried."""
        return self.status == 'failed' and self.retry_count < self.max_retries


class AlertLog(models.Model):
    """Log all alert activities for audit trail."""
    
    ACTIONS = (
        ('created', 'Alert Created'),
        ('sent', 'Alert Sent'),
        ('failed', 'Alert Failed'),
        ('retried', 'Alert Retried'),
        ('expired', 'Alert Expired'),
    )
    
    alert = models.ForeignKey(AttendanceAlert, on_delete=models.CASCADE, related_name='logs')
    action = models.CharField(max_length=20, choices=ACTIONS)
    details = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['alert', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.alert.student.registration_id} - {self.action} - {self.timestamp}"


class AlertPreference(models.Model):
    """Student preferences for receiving alerts."""
    
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='alert_preference')
    
    # Email preferences
    email_on_absent = models.BooleanField(default=True, help_text="Send email when marked absent")
    email_on_below_threshold = models.BooleanField(default=True, help_text="Send email when attendance below threshold")
    email_frequency = models.CharField(
        max_length=20,
        default='daily',
        choices=[
            ('immediately', 'Immediately'),
            ('daily', 'Daily (once per day)'),
            ('weekly', 'Weekly (once per week)'),
        ]
    )
    
    # SMS preferences
    sms_enabled = models.BooleanField(default=False, help_text="Enable SMS notifications")
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    sms_on_absent = models.BooleanField(default=False)
    sms_on_below_threshold = models.BooleanField(default=False)
    
    # Parent/Guardian notification
    notify_parent = models.BooleanField(default=False)
    parent_email = models.EmailField(null=True, blank=True)
    
    # Don't disturb hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True, help_text="e.g., 22:00")
    quiet_hours_end = models.TimeField(null=True, blank=True, help_text="e.g., 08:00")
    
    # Disable temporarily
    alerts_disabled = models.BooleanField(default=False)
    disabled_until = models.DateTimeField(null=True, blank=True)
    
    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Alert Preferences"
    
    def __str__(self):
        return f"Alert Preferences - {self.student.registration_id}"
    
    def is_disabled(self) -> bool:
        """Check if alerts are currently disabled."""
        if not self.alerts_disabled:
            return False
        
        if self.disabled_until and timezone.now() > self.disabled_until:
            self.alerts_disabled = False
            self.disabled_until = None
            self.save()
            return False
        
        return True
    
    def should_send_email(self, alert_type: str) -> bool:
        """Check if email should be sent for this alert type."""
        if self.is_disabled():
            return False
        
        if alert_type == 'absent':
            return self.email_on_absent
        elif alert_type == 'below_threshold':
            return self.email_on_below_threshold
        
        return False
    
    def should_send_sms(self, alert_type: str) -> bool:
        """Check if SMS should be sent for this alert type."""
        if not self.sms_enabled or not self.phone_number:
            return False
        
        if self.is_disabled():
            return False
        
        if alert_type == 'absent':
            return self.sms_on_absent
        elif alert_type == 'below_threshold':
            return self.sms_on_below_threshold
        
        return False
    
    def is_in_quiet_hours(self) -> bool:
        """Check if current time is in quiet hours."""
        if not self.quiet_hours_enabled or not self.quiet_hours_start or not self.quiet_hours_end:
            return False
        
        current_time = timezone.now().time()
        
        if self.quiet_hours_start < self.quiet_hours_end:
            # Normal case: quiet hours don't span midnight
            return self.quiet_hours_start <= current_time < self.quiet_hours_end
        else:
            # Span midnight case
            return current_time >= self.quiet_hours_start or current_time < self.quiet_hours_end


class DailyAlertLimit(models.Model):
    """Track daily alert limits to prevent spam."""
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='daily_alert_limits')
    date = models.DateField(auto_now_add=True, db_index=True)
    
    absent_alerts_sent = models.IntegerField(default=0)
    threshold_alerts_sent = models.IntegerField(default=0)
    
    MAX_ALERTS_PER_DAY = 5
    
    class Meta:
        unique_together = ('student', 'date')
        indexes = [
            models.Index(fields=['student', 'date']),
        ]
    
    def __str__(self):
        return f"{self.student.registration_id} - {self.date}"
    
    def can_send_alert(self) -> bool:
        """Check if daily limit hasn't been exceeded."""
        total = self.absent_alerts_sent + self.threshold_alerts_sent
        return total < self.MAX_ALERTS_PER_DAY
    
    def record_alert(self, alert_type: str):
        """Record an alert sent."""
        if alert_type == 'absent':
            self.absent_alerts_sent += 1
        elif alert_type == 'below_threshold':
            self.threshold_alerts_sent += 1
        self.save()
