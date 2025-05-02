#!/usr/bin/env python
"""
This script sets the default password to "Nepal@123" for all users except SuperAdmin.
Run it with: python manage.py shell < scripts/set_default_passwords.py
"""
import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "adminbridge.settings")
django.setup()

from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

# Set default password for all non-SuperAdmin users
default_password = "Nepal@123"
users = User.objects.filter(~Q(role="SuperAdmin"))

count = 0
for user in users:
    user.set_password(default_password)
    user.save()
    count += 1

print(f"Successfully reset passwords for {count} users to the default password.")
print("Users can now log in with their email address and the default password.") 