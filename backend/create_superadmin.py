#!/usr/bin/env python
import os
import django
from datetime import date
from django.contrib.auth import get_user_model

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')
django.setup()

from api.models import User, Branch, Employee

User = get_user_model()

# Create superadmin if it doesn't exist
if not User.objects.filter(email='superadmin@adminbridge.com').exists():
    User.objects.create_user(
        email='superadmin@adminbridge.com',
        password='Nepal@123',
        first_name='Super',
        last_name='Admin',
        role='SuperAdmin',
        is_staff=True,
        is_superuser=True
    )
    print('Superadmin user created successfully!')
else:
    # Update password for existing superadmin
    user = User.objects.get(email='superadmin@adminbridge.com')
    user.set_password('Nepal@123')
    user.save()
    print('Superadmin password updated successfully!')

if __name__ == "__main__":
    create_superadmin() 