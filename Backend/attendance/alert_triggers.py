"""
Alert Triggers - Logic to detect when alerts should be sent.
"""

import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q, Count
from .models import Student, Attendance, Faculty
from .alert_models import AttendanceAlert, AlertLog, AlertPreference, DailyAlertLimit
from .email_service import email_service
from .sms_service import sms_service

logger = logging.getLogger(__name__)


class AttendanceAlertTrigger:
    """Manage alert triggers based on attendance events."""
    
    ATTENDANCE_THRESHOLD = 75  # Default threshold percentage
    
    def __init__(self, threshold: int = ATTENDANCE_THRESHOLD):
        self.threshold = threshold
    
    # ============= ABSENCE ALERTS =============
    
    def check_and_trigger_absence_alerts(self, date: str = None):
        """
        Check for newly absent students and trigger alerts.
        
        Args:
            date: Date to check (format: YYYY-MM-DD). If None, uses today.
        """
        if date is None:
            today = timezone.now().date()
        else:
            today = datetime.strptime(date, '%Y-%m-%d').date()
        
        # Get all absent records for today
        absent_records = Attendance.objects.filter(
            date=today,
            status='Absent'
        ).select_related('student')
        
        logger.info(f"Found {absent_records.count()} absent records for {today}")
        
        for record in absent_records:
            self.trigger_absence_alert(record.student)
    
    def trigger_absence_alert(self, student: Student) -> bool:
        """
        Trigger absence alert for a student.
        
        Args:
            student: Student object
            
        Returns:
            bool: True if alert was created/sent successfully
        """
        try:
            # Check student preferences
            preference = self._get_or_create_preference(student)
            
            if not preference.should_send_email('absent') and not preference.should_send_sms('absent'):
                logger.debug(f"Absence alerts disabled for {student.registration_id}")
                return False
            
            # Check daily limit
            if not self._check_daily_limit(student, 'absent'):
                logger.warning(f"Daily alert limit exceeded for {student.registration_id}")
                return False
            
            # Check if alert already sent today
            if self._alert_sent_today(student, 'absent'):
                logger.debug(f"Absence alert already sent today for {student.registration_id}")
                return False
            
            # Create alert
            alert = self._create_alert(
                student=student,
                alert_type='absent',
                preference=preference
            )
            
            # Send notification
            success = self._send_notifications(alert, preference)
            
            if success:
                alert.mark_sent()
                self._record_alert_log(alert, 'sent')
                self._record_daily_limit(student, 'absent')
            else:
                alert.mark_failed("Failed to send notifications")
                self._record_alert_log(alert, 'failed')
            
            return success
        
        except Exception as e:
            logger.error(f"Error triggering absence alert for {student.registration_id}: {str(e)}")
            return False
    
    # ============= THRESHOLD ALERTS =============
    
    def check_and_trigger_threshold_alerts(self):
        """
        Check all students and trigger alerts for those below threshold.
        Should run periodically (e.g., daily).
        """
        students = Student.objects.all()
        triggered_count = 0
        
        for student in students:
            if self.trigger_threshold_alert(student):
                triggered_count += 1
        
        logger.info(f"Triggered threshold alerts for {triggered_count} students")
        return triggered_count
    
    def trigger_threshold_alert(self, student: Student) -> bool:
        """
        Trigger threshold alert if student's attendance is below threshold.
        
        Args:
            student: Student object
            
        Returns:
            bool: True if alert was created/sent successfully
        """
        try:
            # Get current attendance percentage
            current_attendance = self.get_student_attendance_percentage(student)
            
            if current_attendance >= self.threshold:
                logger.debug(f"{student.registration_id} attendance OK: {current_attendance:.1f}%")
                return False
            
            # Check preferences
            preference = self._get_or_create_preference(student)
            
            if not preference.should_send_email('below_threshold') and not preference.should_send_sms('below_threshold'):
                return False
            
            # Check daily limit
            if not self._check_daily_limit(student, 'below_threshold'):
                return False
            
            # Check frequency - don't send duplicate alerts too often
            if self._recent_threshold_alert_exists(student):
                logger.debug(f"Recent threshold alert already exists for {student.registration_id}")
                return False
            
            # Calculate classes needed
            classes_needed = self._calculate_classes_needed(student)
            
            # Create alert
            alert = self._create_alert(
                student=student,
                alert_type='below_threshold',
                preference=preference,
                current_attendance=current_attendance,
                classes_needed=classes_needed
            )
            
            # Send notification
            success = self._send_notifications(alert, preference)
            
            if success:
                alert.mark_sent()
                self._record_alert_log(alert, 'sent')
                self._record_daily_limit(student, 'below_threshold')
            else:
                alert.mark_failed("Failed to send notifications")
                self._record_alert_log(alert, 'failed')
            
            return success
        
        except Exception as e:
            logger.error(f"Error triggering threshold alert for {student.registration_id}: {str(e)}")
            return False
    
    # ============= BULK TRIGGERS =============
    
    def check_and_trigger_at_risk_faculty_alerts(self):
        """
        Identify at-risk students by class and notify faculty.
        """
        # Group students by class
        classes = Student.objects.values('branch', 'year', 'section').distinct()
        
        for class_info in classes:
            branch = class_info['branch']
            year = class_info['year']
            section = class_info['section']
            
            # Get at-risk students in this class
            at_risk_students = self.get_at_risk_students(branch, year, section)
            
            if at_risk_students.count() > 0:
                self.notify_faculty_about_at_risk(branch, year, section, at_risk_students)
    
    def notify_faculty_about_at_risk(self, branch: str, year: str, section: str, students):
        """
        Send alert to faculty about at-risk students.
        """
        try:
            # Get faculty taking classes for this batch
            faculty_list = Faculty.objects.filter(
                Q(branch=branch) | Q(year=year)
            ).distinct()
            
            if not faculty_list.exists():
                logger.warning(f"No faculty found for {branch}-{year}-{section}")
                return
            
            at_risk_count = students.filter(
                attendance_alerts__alert_type='below_threshold',
                attendance_alerts__status='sent'
            ).distinct().count()
            
            critical_count = students.filter(
                attendance_percentage__lt=50
            ).count()
            
            alert_data = {
                'class': f"{branch}-{year}{section}",
                'at_risk_count': at_risk_count,
                'critical_count': critical_count,
                'students': [s.first_name + ' ' + s.last_name for s in students[:5]]
            }
            
            for faculty in faculty_list:
                email_service.send_faculty_alert(
                    faculty_email=faculty.email,
                    faculty_name=faculty.first_name,
                    alert_data=alert_data
                )
                logger.info(f"Faculty alert sent to {faculty.email}")
        
        except Exception as e:
            logger.error(f"Error notifying faculty: {str(e)}")
    
    # ============= HELPER METHODS =============
    
    def get_student_attendance_percentage(self, student: Student) -> float:
        """Calculate student's current attendance percentage."""
        try:
            total_classes = Attendance.objects.filter(student=student).count()
            if total_classes == 0:
                return 100.0
            
            present_classes = Attendance.objects.filter(
                student=student,
                status__iexact='Present'
            ).count()
            
            percentage = (present_classes / total_classes) * 100
            return percentage
        except Exception as e:
            logger.error(f"Error calculating attendance for {student.registration_id}: {str(e)}")
            return 100.0
    
    def get_at_risk_students(self, branch: str, year: str, section: str):
        """Get students below threshold in a class."""
        students = Student.objects.filter(
            branch=branch,
            year=year,
            section=section
        )
        
        at_risk = []
        for student in students:
            if self.get_student_attendance_percentage(student) < self.threshold:
                at_risk.append(student)
        
        return at_risk
    
    def _calculate_classes_needed(self, student: Student) -> int:
        """
        Calculate how many more classes student needs to attend to reach threshold.
        Formula: x = ((target% × total) - (100 × attended)) / (100 - target%)
        """
        try:
            total_classes = Attendance.objects.filter(student=student).count()
            if total_classes == 0:
                return 0
            
            present_classes = Attendance.objects.filter(
                student=student,
                status__iexact='Present'
            ).count()
            
            # If already above threshold
            if present_classes >= (self.threshold * total_classes / 100):
                return 0
            
            # Calculate classes needed
            numerator = (self.threshold * total_classes) - (100 * present_classes)
            denominator = 100 - self.threshold
            
            classes_needed = max(0, int(numerator / denominator) + 1)
            return classes_needed
        except Exception as e:
            logger.error(f"Error calculating classes needed: {str(e)}")
            return 0
    
    def _create_alert(self, student: Student, alert_type: str, preference: AlertPreference, **kwargs) -> AttendanceAlert:
        """Create an AttendanceAlert object."""
        alert = AttendanceAlert.objects.create(
            student=student,
            alert_type=alert_type,
            recipient_email=student.email,
            recipient_phone=preference.phone_number,
            current_attendance=kwargs.get('current_attendance'),
            classes_needed=kwargs.get('classes_needed'),
            channel=self._determine_channel(preference, alert_type),
            **{k: v for k, v in kwargs.items() if k not in ['current_attendance', 'classes_needed']}
        )
        logger.debug(f"Created alert {alert.id} for {student.registration_id}")
        return alert
    
    def _determine_channel(self, preference: AlertPreference, alert_type: str) -> str:
        """Determine notification channel based on preferences."""
        email_ok = (
            (alert_type == 'absent' and preference.email_on_absent) or
            (alert_type == 'below_threshold' and preference.email_on_below_threshold)
        )
        sms_ok = preference.should_send_sms(alert_type)
        
        if email_ok and sms_ok:
            return 'both'
        elif sms_ok:
            return 'sms'
        else:
            return 'email'
    
    def _send_notifications(self, alert: AttendanceAlert, preference: AlertPreference) -> bool:
        """Send notifications via configured channels."""
        sent_count = 0
        
        if alert.channel in ['email', 'both']:
            try:
                if email_service.send_attendance_alert(
                    student_email=alert.recipient_email,
                    student_name=alert.student.first_name,
                    alert_type=alert.alert_type,
                    current_attendance=alert.current_attendance,
                    classes_needed=alert.classes_needed,
                    threshold=alert.threshold
                ):
                    sent_count += 1
            except Exception as e:
                logger.error(f"Error sending email for alert {alert.id}: {str(e)}")
        
        if alert.channel in ['sms', 'both'] and alert.recipient_phone:
            try:
                if sms_service.send_attendance_sms(
                    phone_number=alert.recipient_phone,
                    student_name=alert.student.first_name,
                    alert_type=alert.alert_type,
                    current_attendance=alert.current_attendance
                ):
                    sent_count += 1
            except Exception as e:
                logger.error(f"Error sending SMS for alert {alert.id}: {str(e)}")
        
        # Consider it a success if at least one channel was sent
        return sent_count > 0
    
    def _get_or_create_preference(self, student: Student) -> AlertPreference:
        """Get or create alert preferences for student."""
        preference, created = AlertPreference.objects.get_or_create(student=student)
        if created:
            logger.debug(f"Created default preferences for {student.registration_id}")
        return preference
    
    def _check_daily_limit(self, student: Student, alert_type: str) -> bool:
        """Check if daily alert limit has been exceeded."""
        today = timezone.now().date()
        daily_limit, created = DailyAlertLimit.objects.get_or_create(student=student, date=today)
        return daily_limit.can_send_alert()
    
    def _record_daily_limit(self, student: Student, alert_type: str):
        """Record alert in daily limit."""
        today = timezone.now().date()
        daily_limit, created = DailyAlertLimit.objects.get_or_create(student=student, date=today)
        daily_limit.record_alert(alert_type)
    
    def _alert_sent_today(self, student: Student, alert_type: str) -> bool:
        """Check if alert already sent today."""
        today = timezone.now().date()
        return AttendanceAlert.objects.filter(
            student=student,
            alert_type=alert_type,
            status='sent',
            sent_at__date=today
        ).exists()
    
    def _recent_threshold_alert_exists(self, student: Student) -> bool:
        """Check if threshold alert was sent in last 6 hours."""
        six_hours_ago = timezone.now() - timedelta(hours=6)
        return AttendanceAlert.objects.filter(
            student=student,
            alert_type='below_threshold',
            status='sent',
            sent_at__gte=six_hours_ago
        ).exists()
    
    def _record_alert_log(self, alert: AttendanceAlert, action: str, details: dict = None):
        """Record action in alert log."""
        if details is None:
            details = {}
        
        AlertLog.objects.create(
            alert=alert,
            action=action,
            details=details
        )


# Global instance
alert_trigger = AttendanceAlertTrigger()
