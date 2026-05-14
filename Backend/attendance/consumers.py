"""
WebSocket Consumer for Real-time Attendance Updates
Handles bidirectional communication for dashboard updates
"""

import json
import logging
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from django.utils import timezone
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)


class AttendanceConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time attendance updates.
    Handles connections for admin and faculty dashboards.
    """

    async def connect(self):
        """
        Handle WebSocket connection.
        Subscribe to appropriate room based on user role.
        """
        self.user = self.scope["user"]
        self.user_id = self.user.id if self.user.is_authenticated else None
        
        # Determine which room to join based on user role
        await self.determine_room()
        
        if self.room_name:
            # Join the room group
            await self.channel_layer.group_add(
                self.room_name,
                self.channel_name
            )
            
            await self.accept()
            
            # Send connection acknowledgment
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': f'Connected to {self.room_name}',
                'user_id': self.user_id,
                'timestamp': datetime.now().isoformat(),
                'room': self.room_name,
            }))
            
            logger.info(
                f"User {self.user_id} ({self.user.username}) "
                f"connected to {self.room_name}"
            )
        else:
            # Disconnect if user role cannot be determined
            await self.close()
            logger.warning(f"User {self.user_id} rejected: unable to determine role")

    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection.
        Leave the room group.
        """
        if hasattr(self, 'room_name') and self.room_name:
            await self.channel_layer.group_discard(
                self.room_name,
                self.channel_name
            )
            
            logger.info(
                f"User {self.user_id} ({self.user.username}) "
                f"disconnected from {self.room_name} (code: {close_code})"
            )

    async def receive(self, text_data):
        """
        Handle incoming WebSocket messages from client.
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                # Respond to ping (keep-alive)
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': datetime.now().isoformat(),
                }))
            
            elif message_type == 'request_status':
                # Client requesting current status
                await self.send(text_data=json.dumps({
                    'type': 'status',
                    'message': 'Connection active',
                    'room': self.room_name,
                    'user_id': self.user_id,
                    'timestamp': datetime.now().isoformat(),
                }))
            
            else:
                logger.warning(
                    f"Unknown message type from {self.user_id}: {message_type}"
                )
        
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received from {self.user_id}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid message format',
            }))
        except Exception as e:
            logger.error(f"Error in receive: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Server error processing message',
            }))

    # Event handlers for group messages
    async def attendance_update(self, event):
        """
        Forward attendance update to WebSocket.
        This handler is called by group_send.
        """
        await self.send(text_data=json.dumps({
            'type': 'attendance_update',
            'data': event['data'],
            'timestamp': datetime.now().isoformat(),
        }))

    async def connection_alert(self, event):
        """
        Send connection status alerts.
        """
        await self.send(text_data=json.dumps({
            'type': 'connection_alert',
            'message': event['message'],
            'timestamp': datetime.now().isoformat(),
        }))

    async def broadcast_message(self, event):
        """
        Handle broadcast messages.
        """
        await self.send(text_data=json.dumps({
            'type': 'broadcast',
            'data': event['data'],
            'timestamp': datetime.now().isoformat(),
        }))

    @sync_to_async
    def determine_room(self):
        """
        Determine which room/group the user should join.
        Based on user role: admin or faculty.
        """
        self.room_name = None
        
        # Check if user is admin
        if self.user.is_authenticated and self.user.is_staff:
            self.room_name = 'admin_dashboard'
        
        # Check if user is faculty
        elif self.user.is_authenticated:
            try:
                faculty = self.user.faculty_profile
                self.room_name = f'faculty_dashboard_{faculty.id}'
            except:
                # User is neither admin nor faculty
                self.room_name = None


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    Separate consumer for personal notifications.
    Each user connects to their own notification channel.
    """

    async def connect(self):
        """Handle notification connection."""
        self.user = self.scope["user"]
        self.user_id = self.user.id if self.user.is_authenticated else None
        
        if self.user.is_authenticated:
            self.room_name = f'notifications_{self.user_id}'
            
            await self.channel_layer.group_add(
                self.room_name,
                self.channel_name
            )
            
            await self.accept()
            
            logger.info(f"User {self.user_id} connected to notifications")
        else:
            await self.close()
            logger.warning("Unauthenticated user attempted notification connection")

    async def disconnect(self, close_code):
        """Handle notification disconnection."""
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(
                self.room_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Handle incoming notification messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': datetime.now().isoformat(),
                }))
        except Exception as e:
            logger.error(f"Error in notification receive: {str(e)}")

    async def notify_message(self, event):
        """Forward notification to client."""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'title': event.get('title'),
            'message': event.get('message'),
            'action_required': event.get('action_required', False),
            'timestamp': datetime.now().isoformat(),
        }))

    async def attendance_alert(self, event):
        """Forward attendance-related alerts."""
        await self.send(text_data=json.dumps({
            'type': 'attendance_alert',
            'data': event['data'],
            'timestamp': datetime.now().isoformat(),
        }))
