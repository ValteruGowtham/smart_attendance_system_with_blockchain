"""
Celery Configuration - Setup Celery for scheduled and async tasks.
Place this file in the project root (digital_id_system/celery.py)
"""

import os
from celery import Celery
from celery.schedules import crontab
from django.conf import settings

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')

app = Celery('digital_id_system')

# Load configuration from Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all installed apps
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    # Check for absent students every 1 minute (or customize the frequency)
    'check-absence-alerts': {
        'task': 'attendance.tasks.check_absence_alerts_task',
        'schedule': crontab(minute='*/1'),  # Every minute
    },
    
    # Check attendance threshold daily at 9 PM
    'check-threshold-alerts': {
        'task': 'attendance.tasks.check_threshold_alerts_task',
        'schedule': crontab(hour=21, minute=0),  # Daily at 9 PM
    },
    
    # Notify faculty about at-risk students weekly on Friday at 10 AM
    'notify-faculty': {
        'task': 'attendance.tasks.notify_faculty_alerts_task',
        'schedule': crontab(day_of_week=4, hour=10, minute=0),  # Friday 10 AM
    },
    
    # Retry failed alerts every 5 minutes
    'retry-failed-alerts': {
        'task': 'attendance.tasks.retry_failed_alerts_task',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    
    # Clean up old alert logs (keep last 90 days) daily at 2 AM
    'cleanup-alert-logs': {
        'task': 'attendance.tasks.cleanup_alert_logs_task',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}

# Celery Configuration
app.conf.update(
    # Task settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone=settings.TIME_ZONE,
    enable_utc=True,
    
    # Task timeout (30 minutes)
    task_soft_time_limit=30 * 60,
    task_time_limit=35 * 60,
    
    # Result backend settings
    result_expires=3600,  # Store results for 1 hour
    
    # Task routing
    task_routes={
        'attendance.tasks.check_absence_alerts_task': {'queue': 'alerts'},
        'attendance.tasks.check_threshold_alerts_task': {'queue': 'alerts'},
        'attendance.tasks.notify_faculty_alerts_task': {'queue': 'alerts'},
        'attendance.tasks.retry_failed_alerts_task': {'queue': 'alerts'},
        'attendance.tasks.cleanup_alert_logs_task': {'queue': 'maintenance'},
    },
    
    # Broker settings (Redis)
    broker_url=getattr(settings, 'CELERY_BROKER_URL', 'redis://127.0.0.1:6379/0'),
    result_backend=getattr(settings, 'CELERY_RESULT_BACKEND', 'redis://127.0.0.1:6379/0'),
)


@app.task(bind=True)
def debug_task(self):
    """Debug task to test Celery setup."""
    print(f'Request: {self.request!r}')
