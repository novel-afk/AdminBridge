#!/usr/bin/env python
import os
import django
from datetime import date

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')
django.setup()

from api.models import User, Employee

def update_superadmin():
    # Check if the superadmin exists
    try:
        superadmin = User.objects.get(email='superadmin@adminbridge.com')
    except User.DoesNotExist:
        print("Superadmin user does not exist! Run create_superadmin.py first.")
        return
    
    # Get and update the employee profile
    try:
        employee = Employee.objects.get(user=superadmin)
        
        # Update with new attributes
        employee.position = "Super Administrator"
        employee.gender = "Male"
        employee.nationality = "International"
        employee.dob = date(1990, 1, 1)
        employee.salary = 0.00
        
        employee.save()
        print(f"Superadmin profile updated successfully for {superadmin.email}")
        
    except Employee.DoesNotExist:
        print("Employee profile not found for the superadmin user.")
    
if __name__ == "__main__":
    update_superadmin() 