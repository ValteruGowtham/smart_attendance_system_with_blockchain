"""
ASGI config for digital_id_system project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import attendance.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')

# Initialize Django ASGI application early to ensure Django settings are configured
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    # HTTP and WebSocket will be routed here
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            attendance.routing.websocket_urlpatterns
        )
    ),
})
