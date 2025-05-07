#!/usr/bin/env python
import os
import django
from datetime import date

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')
django.setup()

from api.models import User, Branch, Employee

def create_superadmin():
    # Check if the superadmin already exists
    if User.objects.filter(email='superadmin@adminbridge.com').exists():
        print("Superadmin user already exists!")
        return
    
    # Create a branch first (required for the employee)
    branch, created = Branch.objects.get_or_create(
        name="Headquarters",
        defaults={
            'country': "USA",
            'city': "New York",
            'address': "Main Street, City Center"
        }
    )
    if created:
        print(f"Created branch: {branch.name} ({branch.city}, {branch.country})")
    
    # Create the superadmin user
    superadmin = User.objects.create_superuser(
        email='superadmin@adminbridge.com',
        password='Admin@123',
        first_name='Super',
        last_name='Admin',
        role='SuperAdmin'
    )
    
    # Create employee profile for the superadmin using the new fields
    Employee.objects.create(
        user=superadmin,
        branch=branch,
        employee_id="SA001",
        position="Super Administrator",
        gender="Male",
        nationality="International",
        dob=date(1990, 1, 1),  # Default date of birth
        salary=0.00,  # Default salary
        contact_number="+1234567890",
        address="Administrator Address"
    )
    
    print(f"Superadmin created successfully with email: {superadmin.email}")
    print("Password: Admin@123")
    print("Please change this password after first login for security reasons.")

if __name__ == "__main__":
    create_superadmin() 