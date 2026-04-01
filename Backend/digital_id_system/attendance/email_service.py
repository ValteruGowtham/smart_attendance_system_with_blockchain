"""
Email Service Module - Handles email notifications for attendance alerts.
Supports SMTP configuration and templated email sending.
"""

import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class EmailService:
    """Handle email sending with SMTP configuration."""
    
    def __init__(self):
        self.from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', settings.EMAIL_HOST_USER)
        self.host = settings.EMAIL_HOST
        self.port = settings.EMAIL_PORT
        self.use_tls = settings.EMAIL_USE_TLS
        
    def send_simple_email(
        self,
        to_email: str,
        subject: str,
        message: str,
        html_message: Optional[str] = None
    ) -> bool:
        """
        Send simple email.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            message: Plain text message
            html_message: Optional HTML version of message
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if html_message:
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=message,
                    from_email=self.from_email,
                    to=[to_email]
                )
                email.attach_alternative(html_message, "text/html")
                email.send()
            else:
                from django.core.mail import send_mail
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=self.from_email,
                    recipient_list=[to_email],
                    fail_silently=False
                )
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_attendance_alert(
        self,
        student_email: str,
        student_name: str,
        alert_type: str,
        **kwargs
    ) -> bool:
        """
        Send attendance alert email to student.
        
        Args:
            student_email: Student's email address
            student_name: Student's name
            alert_type: Type of alert ('absent' or 'below_threshold')
            **kwargs: Additional context for template
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            context = {
                'student_name': student_name,
                'alert_type': alert_type,
                **kwargs
            }
            
            if alert_type == 'absent':
                subject = "Attendance Alert: You were marked absent today"
                message = self._get_absent_message(student_name)
                html_message = self._get_absent_html(context)
            elif alert_type == 'below_threshold':
                subject = f"Attendance Warning: Your attendance is below {kwargs.get('threshold', 75)}%"
                message = self._get_threshold_message(student_name, kwargs.get('current_attendance', 0))
                html_message = self._get_threshold_html(context)
            else:
                logger.warning(f"Unknown alert type: {alert_type}")
                return False
            
            return self.send_simple_email(
                to_email=student_email,
                subject=subject,
                message=message,
                html_message=html_message
            )
        except Exception as e:
            logger.error(f"Error sending attendance alert to {student_email}: {str(e)}")
            return False
    
    def send_bulk_attendance_alerts(
        self,
        alerts: List[Dict]
    ) -> tuple:
        """
        Send bulk attendance alerts.
        
        Args:
            alerts: List of alert dictionaries with keys:
                   - student_email, student_name, alert_type, **context
                   
        Returns:
            tuple: (successful_count, total_count)
        """
        successful = 0
        for alert in alerts:
            try:
                if self.send_attendance_alert(**alert):
                    successful += 1
            except Exception as e:
                logger.error(f"Error in bulk alert: {str(e)}")
        
        logger.info(f"Bulk alerts sent: {successful}/{len(alerts)} successful")
        return successful, len(alerts)
    
    def send_faculty_alert(
        self,
        faculty_email: str,
        faculty_name: str,
        alert_data: Dict
    ) -> bool:
        """
        Send alert to faculty about at-risk students.
        
        Args:
            faculty_email: Faculty's email address
            faculty_name: Faculty's name
            alert_data: Data about at-risk students
                       {'class': 'CSE-4A', 'at_risk_count': 5, 'critical_count': 2}
                       
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            subject = f"Faculty Alert: {alert_data.get('at_risk_count', 0)} students at risk in {alert_data.get('class', 'your class')}"
            
            message = (
                f"Dear {faculty_name},\n\n"
                f"There are {alert_data.get('at_risk_count', 0)} students with attendance below threshold in your class.\n"
                f"Critical cases: {alert_data.get('critical_count', 0)}\n\n"
                f"Please review and take necessary action.\n\n"
                f"Regards,\nAttendance System"
            )
            
            context = {
                'faculty_name': faculty_name,
                'alert_data': alert_data
            }
            html_message = self._get_faculty_alert_html(context)
            
            return self.send_simple_email(
                to_email=faculty_email,
                subject=subject,
                message=message,
                html_message=html_message
            )
        except Exception as e:
            logger.error(f"Error sending faculty alert to {faculty_email}: {str(e)}")
            return False
    
    @staticmethod
    def _get_absent_message(student_name: str) -> str:
        """Get plain text message for absence alert."""
        return (
            f"Dear {student_name},\n\n"
            f"You were marked ABSENT today in your class.\n\n"
            f"Please ensure timely attendance in future classes.\n"
            f"If there was an error, please contact your faculty member.\n\n"
            f"Regards,\nAttendance Management System"
        )
    
    @staticmethod
    def _get_absent_html(context: Dict) -> str:
        """Get HTML message for absence alert."""
        return f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #ff6b6b; color: white; padding: 15px; border-radius: 5px; }}
                    .content {{ padding: 20px; background-color: #f9f9f9; margin-top: 10px; }}
                    .footer {{ font-size: 12px; color: #666; margin-top: 20px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>❌ Attendance Alert - Marked Absent</h2>
                    </div>
                    <div class="content">
                        <p>Dear <strong>{context['student_name']}</strong>,</p>
                        <p>You were <strong>marked ABSENT</strong> today in your class.</p>
                        <p style="color: #d63031; font-weight: bold;">Please ensure timely attendance in future classes.</p>
                        <p>If there was an error, please contact your faculty member immediately.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from the Attendance Management System.</p>
                    </div>
                </div>
            </body>
        </html>
        """
    
    @staticmethod
    def _get_threshold_message(student_name: str, current_attendance: float) -> str:
        """Get plain text message for threshold alert."""
        return (
            f"Dear {student_name},\n\n"
            f"Your attendance is currently {current_attendance:.1f}%, which is below the required 75% threshold.\n\n"
            f"This may affect your academic performance and eligibility.\n"
            f"Please improve your attendance immediately.\n\n"
            f"Regards,\nAttendance Management System"
        )
    
    @staticmethod
    def _get_threshold_html(context: Dict) -> str:
        """Get HTML message for threshold alert."""
        current = context.get('current_attendance', 0)
        classes_needed = context.get('classes_needed', 0)
        threshold = context.get('threshold', 75)
        
        return f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #ffa502; color: white; padding: 15px; border-radius: 5px; }}
                    .content {{ padding: 20px; background-color: #f9f9f9; margin-top: 10px; }}
                    .stats {{ background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffa502; margin: 15px 0; }}
                    .stat-item {{ margin: 10px 0; }}
                    .footer {{ font-size: 12px; color: #666; margin-top: 20px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>⚠️ Attendance Warning - Below Threshold</h2>
                    </div>
                    <div class="content">
                        <p>Dear <strong>{context['student_name']}</strong>,</p>
                        <p>Your attendance is currently <strong style="color: #d63031;">{current:.1f}%</strong>, 
                           which is below the required <strong>{threshold}%</strong> threshold.</p>
                        
                        <div class="stats">
                            <div class="stat-item">
                                <strong>Current Attendance:</strong> {current:.1f}%
                            </div>
                            <div class="stat-item">
                                <strong>Required Attendance:</strong> {threshold}%
                            </div>
                            <div class="stat-item">
                                <strong>Classes Needed:</strong> Attend at least <strong>{classes_needed}</strong> 
                                more consecutive classes to reach {threshold}%
                            </div>
                        </div>
                        
                        <p><strong style="color: #d63031;">⚠️ Important:</strong> 
                           This may affect your academic performance and eligibility. 
                           Please improve your attendance immediately.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from the Attendance Management System.</p>
                    </div>
                </div>
            </body>
        </html>
        """
    
    @staticmethod
    def _get_faculty_alert_html(context: Dict) -> str:
        """Get HTML message for faculty alert."""
        alert_data = context.get('alert_data', {})
        
        return f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #0984e3; color: white; padding: 15px; border-radius: 5px; }}
                    .content {{ padding: 20px; background-color: #f9f9f9; margin-top: 10px; }}
                    .alert-box {{ background-color: #ffe8e8; padding: 15px; border-left: 4px solid #d63031; margin: 15px 0; }}
                    .footer {{ font-size: 12px; color: #666; margin-top: 20px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>📋 Faculty Alert - At-Risk Students</h2>
                    </div>
                    <div class="content">
                        <p>Dear <strong>{context['faculty_name']}</strong>,</p>
                        <p>This is an alert about student attendance in your class.</p>
                        
                        <div class="alert-box">
                            <h3>Class: {alert_data.get('class', 'N/A')}</h3>
                            <p><strong>Students Below Threshold:</strong> {alert_data.get('at_risk_count', 0)}</p>
                            <p><strong>Critical Cases (Below 50%):</strong> {alert_data.get('critical_count', 0)}</p>
                        </div>
                        
                        <p>Please review the attendance records and take appropriate action with at-risk students.</p>
                        <p>Contact students and encourage them to improve their attendance to avoid academic consequences.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from the Attendance Management System.</p>
                    </div>
                </div>
            </body>
        </html>
        """


# Global instance
email_service = EmailService()
