"""
WebSocket routing configuration for Django Channels.
Maps WebSocket paths to consumers.
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Attendance updates for admin/faculty dashboards
    re_path(
        r'ws/attendance/updates/$',
        consumers.AttendanceConsumer.as_asgi()
    ),
    
    # Personal notifications
    re_path(
        r'ws/notifications/$',
        consumers.NotificationConsumer.as_asgi()
    ),
]
