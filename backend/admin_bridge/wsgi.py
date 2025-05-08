"""
WSGI config for admin_bridge project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')

application = get_wsgi_application()
