#!/usr/bin/env python
import os
import django
from datetime import date

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')
django.setup()

from api.models import User, Branch, Employee

def add_sample_employee():
    # Check if the sample employee already exists
    if User.objects.filter(email='employee@adminbridge.com').exists():
        print("Sample employee already exists!")
        return
    
    # Get a branch (use the first one if available or create a new one)
    try:
        branch = Branch.objects.first()
        if not branch:
            branch = Branch.objects.create(
                name="Main Branch",
                address="123 Main Street, City",
                contact_number="+1987654321",
                email="main@adminbridge.com"
            )
            print(f"Created branch: {branch.name}")
    except Exception as e:
        print(f"Error getting/creating branch: {e}")
        return
    
    # Create the employee user account
    try:
        employee_user = User.objects.create_user(
            email='employee@adminbridge.com',
            password='Employee@123',
            first_name='John',
            last_name='Doe',
            role='BranchManager'
        )
        print(f"Created user: {employee_user.email}")
        
        # Create employee profile with all the new fields
        employee = Employee.objects.create(
            user=employee_user,
            branch=branch,
            employee_id="EMP001",
            gender="Male",
            position="Branch Manager",
            nationality="American",
            dob=date(1985, 5, 15),
            salary=75000.00,
            contact_number="+1234567890",
            address="456 Employee Street, City, State, ZIP",
            emergency_contact="+1987654321"
        )
        
        print(f"Added sample employee: {employee.user.first_name} {employee.user.last_name}")
        print(f"Position: {employee.position}")
        print(f"Employee ID: {employee.employee_id}")
        print(f"Branch: {employee.branch.name}")
        print("\nLogin credentials:")
        print(f"Email: {employee_user.email}")
        print(f"Password: Employee@123")
        
    except Exception as e:
        print(f"Error creating employee: {e}")

if __name__ == "__main__":
    add_sample_employee() 