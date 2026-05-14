"""
WebSocket routing configuration for Django Channels
"""

from django.urls import path
# from .consumers import AttendanceConsumer

# WebSocket URL patterns
websocket_urlpatterns = [
    # WebSocket routes for real-time features can be added here
    # Example:
    # path('ws/attendance/<int:event_id>/', AttendanceConsumer.as_asgi()),
    # path('ws/notifications/<str:user_id>/', NotificationConsumer.as_asgi()),
]
