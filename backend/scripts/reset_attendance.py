#!/usr/bin/env python
import os
import sys
import django
import logging
from datetime import datetime, date, timedelta
import pytz

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')
django.setup()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('attendance_reset.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

from api.models import StudentAttendance, EmployeeAttendance, Employee, Student, User

def create_new_attendance_records():
    """Create attendance records for all employees and students for today"""
    nepal_tz = pytz.timezone('Asia/Kathmandu')
    today = datetime.now(nepal_tz).date()
    
    # Get the SuperAdmin user
    try:
        admin_user = User.objects.filter(role='SuperAdmin').first()
    except User.DoesNotExist:
        logger.error("No SuperAdmin user found to create attendance records")
        return
    
    # Create attendance records for employees
    employees = Employee.objects.all()
    employee_count = 0
    
    for employee in employees:
        # Check if record already exists for today
        if not EmployeeAttendance.objects.filter(employee=employee, date=today).exists():
            EmployeeAttendance.objects.create(
                employee=employee,
                date=today,
                status='Present',  # Default to present
                created_by=admin_user
            )
            employee_count += 1
    
    # Create attendance records for students
    students = Student.objects.all()
    student_count = 0
    
    for student in students:
        # Check if record already exists for today
        if not StudentAttendance.objects.filter(student=student, date=today).exists():
            StudentAttendance.objects.create(
                student=student,
                date=today,
                status='Present',  # Default to present
                created_by=admin_user
            )
            student_count += 1
    
    logger.info(f"Created {employee_count} employee attendance records and {student_count} student attendance records for {today}")

def main():
    """Main script function"""
    logger.info("Starting attendance reset process")
    
    try:
        create_new_attendance_records()
        logger.info("Attendance reset process completed successfully")
    except Exception as e:
        logger.error(f"Error resetting attendance: {str(e)}")

if __name__ == "__main__":
    main() 