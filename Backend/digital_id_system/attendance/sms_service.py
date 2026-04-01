"""
SMS Service Module - Handles SMS notifications (optional).
Supports Twilio and other SMS providers.
"""

import logging
from typing import Optional, List, Dict
from django.conf import settings

logger = logging.getLogger(__name__)


class SMSService:
    """Handle SMS sending via Twilio or other providers."""
    
    def __init__(self):
        """Initialize SMS service based on configuration."""
        self.enabled = getattr(settings, 'SMS_SERVICE_ENABLED', False)
        self.provider = getattr(settings, 'SMS_PROVIDER', 'twilio')
        
        if self.enabled:
            if self.provider == 'twilio':
                self._init_twilio()
            elif self.provider == 'nexmo':
                self._init_nexmo()
    
    def _init_twilio(self):
        """Initialize Twilio client."""
        try:
            from twilio.rest import Client
            account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
            auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
            self.twilio_number = getattr(settings, 'TWILIO_PHONE_NUMBER', None)
            
            if account_sid and auth_token:
                self.client = Client(account_sid, auth_token)
                logger.info("Twilio SMS service initialized")
            else:
                self.enabled = False
                logger.warning("Twilio credentials not configured")
        except ImportError:
            self.enabled = False
            logger.warning("Twilio library not installed. Install: pip install twilio")
    
    def _init_nexmo(self):
        """Initialize Nexmo/Vonage client."""
        try:
            import vonage
            api_key = getattr(settings, 'NEXMO_API_KEY', None)
            api_secret = getattr(settings, 'NEXMO_API_SECRET', None)
            
            if api_key and api_secret:
                self.client = vonage.Client(key=api_key, secret=api_secret)
                logger.info("Nexmo SMS service initialized")
            else:
                self.enabled = False
                logger.warning("Nexmo credentials not configured")
        except ImportError:
            self.enabled = False
            logger.warning("Nexmo library not installed. Install: pip install vonage")
    
    def send_sms(
        self,
        phone_number: str,
        message: str
    ) -> bool:
        """
        Send SMS message.
        
        Args:
            phone_number: Recipient phone number (with country code, e.g., +919876543210)
            message: SMS message text (max 160 characters)
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.enabled:
            logger.warning("SMS service is not enabled")
            return False
        
        if len(message) > 160:
            message = message[:157] + "..."
        
        try:
            if self.provider == 'twilio':
                return self._send_twilio(phone_number, message)
            elif self.provider == 'nexmo':
                return self._send_nexmo(phone_number, message)
        except Exception as e:
            logger.error(f"Error sending SMS to {phone_number}: {str(e)}")
            return False
    
    def _send_twilio(self, phone_number: str, message: str) -> bool:
        """Send SMS via Twilio."""
        try:
            msg = self.client.messages.create(
                body=message,
                from_=self.twilio_number,
                to=phone_number
            )
            logger.info(f"SMS sent successfully to {phone_number} (SID: {msg.sid})")
            return True
        except Exception as e:
            logger.error(f"Twilio SMS error: {str(e)}")
            return False
    
    def _send_nexmo(self, phone_number: str, message: str) -> bool:
        """Send SMS via Nexmo/Vonage."""
        try:
            response = self.client.sms.send_message(
                {
                    "to": phone_number,
                    "from": "Attendance",
                    "text": message,
                }
            )
            if response["messages"][0]["status"] == "0":
                logger.info(f"SMS sent successfully to {phone_number}")
                return True
            else:
                logger.error(f"Nexmo SMS failed: {response['messages'][0]['error-text']}")
                return False
        except Exception as e:
            logger.error(f"Nexmo SMS error: {str(e)}")
            return False
    
    def send_attendance_sms(
        self,
        phone_number: str,
        student_name: str,
        alert_type: str,
        **kwargs
    ) -> bool:
        """
        Send attendance alert SMS.
        
        Args:
            phone_number: Student's phone number
            student_name: Student's name
            alert_type: Type of alert ('absent' or 'below_threshold')
            **kwargs: Additional data
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            if alert_type == 'absent':
                message = f"Hi {student_name}! You were marked absent today. Please ensure timely attendance."
            elif alert_type == 'below_threshold':
                current = kwargs.get('current_attendance', 0)
                message = f"Hi {student_name}! Your attendance is {current:.0f}% (below 75%). Please attend more classes."
            else:
                return False
            
            return self.send_sms(phone_number, message)
        except Exception as e:
            logger.error(f"Error sending attendance SMS to {phone_number}: {str(e)}")
            return False
    
    def send_bulk_sms(
        self,
        messages: List[Dict]
    ) -> tuple:
        """
        Send bulk SMS messages.
        
        Args:
            messages: List of message dictionaries with keys:
                     - phone_number, student_name, alert_type, **context
                     
        Returns:
            tuple: (successful_count, total_count)
        """
        successful = 0
        for msg_data in messages:
            try:
                if self.send_attendance_sms(**msg_data):
                    successful += 1
            except Exception as e:
                logger.error(f"Error in bulk SMS: {str(e)}")
        
        logger.info(f"Bulk SMS sent: {successful}/{len(messages)} successful")
        return successful, len(messages)


# Global instance
sms_service = SMSService()
