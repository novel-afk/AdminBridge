#!/usr/bin/env python
import os
import django
from datetime import date

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')
django.setup()

from api.models import User, Branch, Employee

def add_second_employee():
    # Check if the second employee already exists
    if User.objects.filter(email='sarah@adminbridge.com').exists():
        print("Second employee already exists!")
        return
    
    # Get the first branch (assume it exists from previous scripts)
    try:
        branch = Branch.objects.first()
        if not branch:
            print("No branch found. Please run add_sample_employee.py first")
            return
    except Exception as e:
        print(f"Error getting branch: {e}")
        return
    
    # Create the employee user account
    try:
        employee_user = User.objects.create_user(
            email='sarah@adminbridge.com',
            password='Sarah@123',
            first_name='Sarah',
            last_name='Johnson',
            role='Counsellor'
        )
        print(f"Created user: {employee_user.email}")
        
        # Create employee profile with all the new fields
        employee = Employee.objects.create(
            user=employee_user,
            branch=branch,
            employee_id="EMP002",
            gender="Female",
            position="Senior Counsellor",
            nationality="Canadian",
            dob=date(1990, 8, 22),
            salary=65000.00,
            contact_number="+1555123456",
            address="789 Counselor Avenue, Toronto, Canada",
            emergency_contact="+1555789012"
        )
        
        print(f"Added second employee: {employee.user.first_name} {employee.user.last_name}")
        print(f"Position: {employee.position}")
        print(f"Employee ID: {employee.employee_id}")
        print(f"Branch: {employee.branch.name}")
        print("\nLogin credentials:")
        print(f"Email: {employee_user.email}")
        print(f"Password: Sarah@123")
        
    except Exception as e:
        print(f"Error creating employee: {e}")

if __name__ == "__main__":
    add_second_employee() 