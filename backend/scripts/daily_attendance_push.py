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
        logging.FileHandler('attendance_push.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

from api.models import StudentAttendance, EmployeeAttendance, Employee, Student, User

def push_attendance_data():
    """
    Push attendance data to database at 9 PM Nepal time daily.
    For any employees/students without records for today, create default 'Present' records.
    """
    nepal_tz = pytz.timezone('Asia/Kathmandu')
    today = datetime.now(nepal_tz).date()
    current_time = datetime.now(nepal_tz).time()
    
    logger.info(f"Running attendance push for {today} at {current_time}")
    
    # Get the SuperAdmin user for creating records
    try:
        admin_user = User.objects.filter(role='SuperAdmin').first()
        if not admin_user:
            logger.error("No SuperAdmin user found to create attendance records")
            return
    except Exception as e:
        logger.error(f"Error finding SuperAdmin user: {str(e)}")
        return
    
    # Process employee attendance
    process_employee_attendance(today, admin_user)
    
    # Process student attendance
    process_student_attendance(today, admin_user)
    
    logger.info(f"Completed attendance push for {today}")

def process_employee_attendance(today, admin_user):
    """Process all employee attendance records for today"""
    # Get all employees
    try:
        employees = Employee.objects.all()
        logger.info(f"Found {len(employees)} employees to process")
        
        employee_count = 0
        updated_count = 0
        
        for employee in employees:
            # Check if record already exists for today
            attendance_record = EmployeeAttendance.objects.filter(
                employee=employee, 
                date=today
            ).first()
            
            if attendance_record:
                # Update the record if needed (time_out field)
                if not attendance_record.time_out:
                    attendance_record.time_out = datetime.now().time()
                    attendance_record.updated_by = admin_user
                    attendance_record.save()
                    updated_count += 1
            else:
                # Create a new attendance record with default 'Present' status
                EmployeeAttendance.objects.create(
                    employee=employee,
                    date=today,
                    status='Present',  # Default to present
                    time_in = "09:00:00",  # Default time in
                    time_out = "17:00:00",  # Default time out
                    created_by=admin_user
                )
                employee_count += 1
                
        logger.info(f"Created {employee_count} new employee attendance records and updated {updated_count} existing records")
    except Exception as e:
        logger.error(f"Error processing employee attendance: {str(e)}")

def process_student_attendance(today, admin_user):
    """Process all student attendance records for today"""
    # Get all students
    try:
        students = Student.objects.all()
        logger.info(f"Found {len(students)} students to process")
        
        student_count = 0
        updated_count = 0
        
        for student in students:
            # Check if record already exists for today
            attendance_record = StudentAttendance.objects.filter(
                student=student, 
                date=today
            ).first()
            
            if attendance_record:
                # Update the record if needed (time_out field)
                if not attendance_record.time_out:
                    attendance_record.time_out = datetime.now().time()
                    attendance_record.updated_by = admin_user
                    attendance_record.save()
                    updated_count += 1
            else:
                # Create a new attendance record with default 'Present' status
                StudentAttendance.objects.create(
                    student=student,
                    date=today,
                    status='Present',  # Default to present
                    time_in = "09:00:00",  # Default time in
                    time_out = "17:00:00",  # Default time out
                    created_by=admin_user
                )
                student_count += 1
                
        logger.info(f"Created {student_count} new student attendance records and updated {updated_count} existing records")
    except Exception as e:
        logger.error(f"Error processing student attendance: {str(e)}")

def should_run_now():
    """Check if it's the right time to run the script (9 PM Nepal time)"""
    nepal_tz = pytz.timezone('Asia/Kathmandu')
    current_time = datetime.now(nepal_tz).time()
    
    # For testing, always return True
    # return True
    
    # In production, check if it's close to 9 PM (21:00)
    target_hour = 21  # 9 PM
    return current_time.hour == target_hour and 0 <= current_time.minute < 5

def main():
    """Main script function"""
    logger.info("Starting attendance push process")
    
    try:
        if should_run_now():
            push_attendance_data()
            logger.info("Attendance push process completed successfully")
        else:
            nepal_tz = pytz.timezone('Asia/Kathmandu')
            current_time = datetime.now(nepal_tz).time()
            logger.info(f"Skipping execution - current time is {current_time}, not close to 9 PM Nepal time")
    except Exception as e:
        logger.error(f"Error during attendance push: {str(e)}")

if __name__ == "__main__":
    main() 