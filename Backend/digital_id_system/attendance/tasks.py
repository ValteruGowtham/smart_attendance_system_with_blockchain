"""
Celery Tasks - Async and scheduled tasks for alert system.
Place this file in: attendance/tasks.py
"""

import logging
from celery import shared_task
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q
from .alert_triggers import alert_trigger
from .alert_models import AttendanceAlert, AlertLog, DailyAlertLimit
from .models import Attendance, Student

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def check_absence_alerts_task(self):
    """
    Periodic task to check for newly absent students and trigger alerts.
    Runs every minute (configurable in celery.py beat_schedule).
    """
    try:
        logger.info("Starting check_absence_alerts_task")
        
        # Get today's date
        today = timezone.now().date()
        
        # Get all absent records from today that we haven't processed yet
        recent_absences = Attendance.objects.filter(
            date=today,
            status='Absent'
        ).select_related('student')
        
        logger.info(f"Found {recent_absences.count()} absences for today")
        
        processed = 0
        for absence in recent_absences:
            try:
                if alert_trigger.trigger_absence_alert(absence.student):
                    processed += 1
            except Exception as e:
                logger.error(f"Error processing absence for {absence.student.registration_id}: {str(e)}")
                continue
        
        logger.info(f"Processed {processed} absence alerts")
        return {
            'status': 'success',
            'processed': processed,
            'timestamp': str(timezone.now())
        }
    
    except Exception as exc:
        logger.error(f"Error in check_absence_alerts_task: {str(exc)}")
        # Retry after 5 minutes
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=2)
def check_threshold_alerts_task(self):
    """
    Periodic task to check all students and trigger alerts for those below threshold.
    Runs daily at a scheduled time (configurable in celery.py).
    """
    try:
        logger.info("Starting check_threshold_alerts_task")
        
        triggered = alert_trigger.check_and_trigger_threshold_alerts()
        
        logger.info(f"check_threshold_alerts_task completed: {triggered} alerts triggered")
        
        return {
            'status': 'success',
            'alerts_triggered': triggered,
            'timestamp': str(timezone.now())
        }
    
    except Exception as exc:
        logger.error(f"Error in check_threshold_alerts_task: {str(exc)}")
        raise self.retry(exc=exc, countdown=600)


@shared_task(bind=True, max_retries=2)
def notify_faculty_alerts_task(self):
    """
    Periodic task to identify at-risk students and notify faculty.
    Runs weekly (configurable in celery.py).
    """
    try:
        logger.info("Starting notify_faculty_alerts_task")
        
        alert_trigger.check_and_trigger_at_risk_faculty_alerts()
        
        logger.info("notify_faculty_alerts_task completed")
        
        return {
            'status': 'success',
            'timestamp': str(timezone.now())
        }
    
    except Exception as exc:
        logger.error(f"Error in notify_faculty_alerts_task: {str(exc)}")
        raise self.retry(exc=exc, countdown=600)


@shared_task(bind=True, max_retries=3)
def retry_failed_alerts_task(self):
    """
    Periodic task to retry failed alerts.
    Runs every 5 minutes.
    """
    try:
        logger.info("Starting retry_failed_alerts_task")
        
        # Get failed alerts that haven't exceeded retry limit
        failed_alerts = AttendanceAlert.objects.filter(
            status='failed',
            retry_count__lt=3,
            created_at__gte=timezone.now() - timedelta(days=1)  # Alerts from last 24 hours
        ).select_related('student')
        
        logger.info(f"Found {failed_alerts.count()} failed alerts to retry")
        
        retried = 0
        for alert in failed_alerts:
            try:
                logger.debug(f"Retrying alert {alert.id}")
                
                # Try to send again
                from .email_service import email_service
                from .sms_service import sms_service
                
                success = False
                
                if alert.channel in ['email', 'both']:
                    if email_service.send_attendance_alert(
                        student_email=alert.recipient_email,
                        student_name=alert.student.first_name,
                        alert_type=alert.alert_type,
                        current_attendance=alert.current_attendance,
                        classes_needed=alert.classes_needed,
                        threshold=alert.threshold
                    ):
                        success = True
                
                if alert.channel in ['sms', 'both'] and alert.recipient_phone:
                    if sms_service.send_attendance_sms(
                        phone_number=alert.recipient_phone,
                        student_name=alert.student.first_name,
                        alert_type=alert.alert_type,
                        current_attendance=alert.current_attendance
                    ):
                        success = True
                
                if success:
                    alert.status = 'sent'
                    alert.sent_at = timezone.now()
                    alert.save()
                    
                    AlertLog.objects.create(
                        alert=alert,
                        action='retried',
                        details={'retry_count': alert.retry_count}
                    )
                    retried += 1
                else:
                    alert.retry_count += 1
                    alert.save()
            
            except Exception as e:
                logger.error(f"Error retrying alert {alert.id}: {str(e)}")
                alert.mark_failed(str(e))
                continue
        
        logger.info(f"retry_failed_alerts_task completed: {retried} alerts retried")
        
        return {
            'status': 'success',
            'retried': retried,
            'timestamp': str(timezone.now())
        }
    
    except Exception as exc:
        logger.error(f"Error in retry_failed_alerts_task: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True)
def cleanup_alert_logs_task(self):
    """
    Periodic task to clean up old alert logs and daily limits.
    Runs daily.
    """
    try:
        logger.info("Starting cleanup_alert_logs_task")
        
        # Keep only last 90 days of logs
        cutoff_date = timezone.now() - timedelta(days=90)
        old_logs = AlertLog.objects.filter(timestamp__lt=cutoff_date)
        logs_deleted = old_logs.count()
        old_logs.delete()
        
        # Clean up old daily limits (keep last 30 days)
        cutoff_date_limits = timezone.now().date() - timedelta(days=30)
        old_limits = DailyAlertLimit.objects.filter(date__lt=cutoff_date_limits)
        limits_deleted = old_limits.count()
        old_limits.delete()
        
        logger.info(f"Deleted {logs_deleted} old alert logs and {limits_deleted} old daily limits")
        
        return {
            'status': 'success',
            'logs_deleted': logs_deleted,
            'limits_deleted': limits_deleted,
            'timestamp': str(timezone.now())
        }
    
    except Exception as exc:
        logger.error(f"Error in cleanup_alert_logs_task: {str(exc)}")
        return {
            'status': 'error',
            'error': str(exc),
            'timestamp': str(timezone.now())
        }


@shared_task(bind=True)
def send_attendance_alert_async(self, alert_id: int):
    """
    Send a single attendance alert asynchronously.
    Can be called directly for immediate sending.
    
    Args:
        alert_id: ID of AttendanceAlert object
    """
    try:
        from .alert_models import AttendanceAlert
        from .email_service import email_service
        from .sms_service import sms_service
        
        alert = AttendanceAlert.objects.get(id=alert_id)
        logger.info(f"Sending alert {alert_id} for {alert.student.registration_id}")
        
        success = False
        
        if alert.channel in ['email', 'both']:
            if email_service.send_attendance_alert(
                student_email=alert.recipient_email,
                student_name=alert.student.first_name,
                alert_type=alert.alert_type,
                current_attendance=alert.current_attendance,
                classes_needed=alert.classes_needed,
                threshold=alert.threshold
            ):
                success = True
        
        if alert.channel in ['sms', 'both'] and alert.recipient_phone:
            if sms_service.send_attendance_sms(
                phone_number=alert.recipient_phone,
                student_name=alert.student.first_name,
                alert_type=alert.alert_type,
                current_attendance=alert.current_attendance
            ):
                success = True
        
        if success:
            alert.mark_sent()
            AlertLog.objects.create(
                alert=alert,
                action='sent',
                details={'method': 'async_task'}
            )
        else:
            alert.mark_failed("Failed to send via async task")
        
        return {
            'status': 'success' if success else 'failed',
            'alert_id': alert_id,
            'timestamp': str(timezone.now())
        }
    
    except AttendanceAlert.DoesNotExist:
        logger.error(f"Alert {alert_id} not found")
        return {
            'status': 'error',
            'error': f'Alert {alert_id} not found',
            'timestamp': str(timezone.now())
        }
    except Exception as exc:
        logger.error(f"Error sending alert {alert_id}: {str(exc)}")
        return {
            'status': 'error',
            'error': str(exc),
            'timestamp': str(timezone.now())
        }


@shared_task(bind=True)
def generate_attendance_report_task(self, student_id: int = None, batch: str = None):
    """
    Generate attendance report for student(s).
    
    Args:
        student_id: Optional student ID for individual report
        batch: Optional batch identifier for batch report
    """
    try:
        from .models import Student
        
        logger.info(f"Generating attendance report - student_id: {student_id}, batch: {batch}")
        
        if student_id:
            students = Student.objects.filter(id=student_id)
        elif batch:
            students = Student.objects.filter(year=batch)
        else:
            students = Student.objects.all()
        
        report_data = []
        for student in students:
            attendance_pct = alert_trigger.get_student_attendance_percentage(student)
            classes_needed = alert_trigger._calculate_classes_needed(student)
            
            report_data.append({
                'student_id': student.registration_id,
                'name': f"{student.first_name} {student.last_name}",
                'attendance': attendance_pct,
                'classes_needed': classes_needed,
                'status': 'At Risk' if attendance_pct < 75 else 'OK'
            })
        
        return {
            'status': 'success',
            'report_count': len(report_data),
            'timestamp': str(timezone.now())
        }
    
    except Exception as exc:
        logger.error(f"Error generating report: {str(exc)}")
        return {
            'status': 'error',
            'error': str(exc),
            'timestamp': str(timezone.now())
        }
