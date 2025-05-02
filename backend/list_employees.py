#!/usr/bin/env python
import os
import django
from datetime import date

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')
django.setup()

from api.models import User, Employee

def list_employees():
    print("\n===== EMPLOYEE LIST =====\n")
    
    employees = Employee.objects.all().select_related('user', 'branch')
    
    if not employees:
        print("No employees found in the system.")
        return
    
    print(f"Total employees: {len(employees)}\n")
    
    for i, employee in enumerate(employees, 1):
        print(f"Employee #{i}")
        print(f"{'ID:':<20} {employee.employee_id}")
        print(f"{'Name:':<20} {employee.user.first_name} {employee.user.last_name}")
        print(f"{'Email:':<20} {employee.user.email}")
        print(f"{'Role:':<20} {employee.user.role}")
        print(f"{'Position:':<20} {employee.position or 'Not specified'}")
        print(f"{'Gender:':<20} {employee.gender or 'Not specified'}")
        print(f"{'Nationality:':<20} {employee.nationality or 'Not specified'}")
        print(f"{'Date of Birth:':<20} {employee.dob or 'Not specified'}")
        print(f"{'Branch:':<20} {employee.branch.name}")
        print(f"{'Salary:':<20} ${employee.salary or 0:,.2f}")
        print(f"{'Contact:':<20} {employee.contact_number}")
        print(f"{'Emergency Contact:':<20} {employee.emergency_contact or 'Not specified'}")
        print(f"{'Address:':<20} {employee.address}")
        print(f"{'Has Profile Image:':<20} {'Yes' if employee.profile_image else 'No'}")
        print(f"{'Has Citizenship Doc:':<20} {'Yes' if employee.citizenship_document else 'No'}")
        print(f"{'Created At:':<20} {employee.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 50)

if __name__ == "__main__":
    list_employees() 