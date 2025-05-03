#!/usr/bin/env python
import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')
django.setup()

from api.models import User

def reset_passwords():
    """Reset all non-SuperAdmin user passwords to the default password."""
    print("Resetting passwords for all non-SuperAdmin users to 'Nepal@123'...")
    
    # Get all non-SuperAdmin users
    users = User.objects.exclude(role='SuperAdmin')
    
    # Count for reporting
    total_users = users.count()
    updated_users = 0
    
    # Reset passwords
    for user in users:
        user.set_password('Nepal@123')
        user.save(update_fields=['password'])
        updated_users += 1
        print(f"Reset password for: {user.email} ({user.role})")
    
    print(f"\nDone! Reset passwords for {updated_users} out of {total_users} users.")

if __name__ == '__main__':
    reset_passwords() 