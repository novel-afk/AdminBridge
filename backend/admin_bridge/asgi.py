"""
ASGI config for admin_bridge project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')

application = get_asgi_application()
