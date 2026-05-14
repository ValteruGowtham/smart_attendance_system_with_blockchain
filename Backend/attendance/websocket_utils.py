"""
Utility functions for broadcasting attendance updates through WebSocket.
These functions are called from API views to push updates to connected clients.
"""

import json
import asyncio
from channels.layers import get_channel_layer
from datetime import datetime


def get_attendance_payload(attendance_obj, student_obj, faculty_obj=None):
    """
    Create the JSON payload for attendance update.
    
    Args:
        attendance_obj: Attendance model instance
        student_obj: Student model instance
        faculty_obj: Faculty model instance (optional)
    
    Returns:
        dict: Payload for WebSocket transmission
    """
    return {
        'student_id': student_obj.id,
        'name': f"{student_obj.first_name} {student_obj.last_name}",
        'registration_id': student_obj.registration_id,
        'status': attendance_obj.status,
        'timestamp': datetime.now().isoformat(),
        'class': f"{student_obj.branch}-{student_obj.year}-{student_obj.section}",
        'period': attendance_obj.period,
        'date': str(attendance_obj.date),
        'time': str(attendance_obj.time),
        'faculty_id': faculty_obj.id if faculty_obj else None,
        'faculty_name': f"{faculty_obj.first_name} {faculty_obj.last_name}" if faculty_obj else None,
    }


async def broadcast_attendance_update(attendance_obj, student_obj, faculty_obj=None):
    """
    Broadcast attendance update to dashboards.
    
    Args:
        attendance_obj: Attendance instance
        student_obj: Student instance
        faculty_obj: Faculty instance (optional)
    """
    channel_layer = get_channel_layer()
    
    payload = get_attendance_payload(attendance_obj, student_obj, faculty_obj)
    
    # Broadcast to admin dashboard
    await channel_layer.group_send(
        'admin_dashboard',
        {
            'type': 'attendance_update',
            'data': payload,
        }
    )
    
    # Broadcast to specific faculty dashboard if faculty is provided
    if faculty_obj:
        await channel_layer.group_send(
            f'faculty_dashboard_{faculty_obj.id}',
            {
                'type': 'attendance_update',
                'data': payload,
            }
        )


def broadcast_attendance_update_sync(attendance_obj, student_obj, faculty_obj=None):
    """
    Synchronous wrapper for broadcasting attendance updates.
    Call this from synchronous code (views, signals, etc.)
    
    Args:
        attendance_obj: Attendance instance
        student_obj: Student instance
        faculty_obj: Faculty instance (optional)
    """
    try:
        asyncio.run(broadcast_attendance_update(attendance_obj, student_obj, faculty_obj))
    except RuntimeError:
        # Event loop already running, try from existing loop
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(broadcast_attendance_update(attendance_obj, student_obj, faculty_obj))
        except Exception as e:
            print(f"Error broadcasting attendance update: {str(e)}")


async def send_notification(user_id, title, message, action_required=False):
    """
    Send notification to specific user.
    
    Args:
        user_id: Django user ID
        title: Notification title
        message: Notification message
        action_required: Whether this requires user action
    """
    channel_layer = get_channel_layer()
    
    await channel_layer.group_send(
        f'notifications_{user_id}',
        {
            'type': 'notify_message',
            'title': title,
            'message': message,
            'action_required': action_required,
        }
    )


async def send_attendance_alert(user_id, data):
    """
    Send attendance-related alert to user.
    
    Args:
        user_id: Django user ID
        data: Alert data dictionary
    """
    channel_layer = get_channel_layer()
    
    await channel_layer.group_send(
        f'notifications_{user_id}',
        {
            'type': 'attendance_alert',
            'data': data,
        }
    )


async def broadcast_class_update(faculty_id, status_message):
    """
    Broadcast class status updates (e.g., class started, ended).
    
    Args:
        faculty_id: Faculty member ID
        status_message: Status update message
    """
    channel_layer = get_channel_layer()
    
    await channel_layer.group_send(
        f'faculty_dashboard_{faculty_id}',
        {
            'type': 'connection_alert',
            'message': status_message,
        }
    )
