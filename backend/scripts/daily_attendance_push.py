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
from django.db import IntegrityError, transaction

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
            # Use any user as fallback
            admin_user = User.objects.first()
            if not admin_user:
                logger.error("No users found in the database")
                return
            logger.info(f"Using {admin_user.email} as fallback for attendance creation")
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
        with transaction.atomic():
            employees = Employee.objects.select_related('user', 'branch').all()
            logger.info(f"Found {len(employees)} employees to process")
            
            if not employees.exists():
                logger.warning("No employees found in database")
                return
            
            employee_count = 0
            updated_count = 0
            
            for employee in employees:
                try:
                    # Skip if employee doesn't have a user
                    if not hasattr(employee, 'user') or not employee.user:
                        logger.warning(f"Employee {employee.id} has no associated user, skipping")
                        continue
                    
                    # Check if record already exists for today
                    attendance_record = EmployeeAttendance.objects.filter(
                        employee=employee, 
                        date=today
                    ).first()
                    
                    if attendance_record:
                        # Log existing record
                        logger.debug(f"Found existing attendance for employee {employee.user.email} ({employee.employee_id})")
                        # Only update if status is not already set
                        if not attendance_record.status:
                            attendance_record.status = 'Present'
                            attendance_record.updated_by = admin_user
                            attendance_record.save(update_fields=['status', 'updated_by'])
                            updated_count += 1
                    else:
                        # Create a new attendance record with default 'Present' status
                        # Use Nepal time for time_in and time_out
                        nepal_tz = pytz.timezone('Asia/Kathmandu')
                        time_in = datetime.now(nepal_tz).replace(hour=9, minute=0, second=0, microsecond=0).time()
                        time_out = datetime.now(nepal_tz).replace(hour=17, minute=0, second=0, microsecond=0).time()
                        
                        EmployeeAttendance.objects.create(
                            employee=employee,
                            date=today,
                            status='Present',  # Default to present
                            time_in=time_in,
                            time_out=time_out,
                            created_by=admin_user
                        )
                        employee_count += 1
                        logger.debug(f"Created attendance for employee {employee.user.email} ({employee.employee_id})")
                except IntegrityError as e:
                    logger.warning(f"IntegrityError for employee {employee.id}: {str(e)}")
                except Exception as e:
                    logger.error(f"Error processing employee {employee.id}: {str(e)}")
                    
            logger.info(f"Created {employee_count} new employee attendance records and updated {updated_count} existing records")
    except Exception as e:
        logger.error(f"Error processing employee attendance: {str(e)}")

def process_student_attendance(today, admin_user):
    """Process all student attendance records for today"""
    # Get all students
    try:
        with transaction.atomic():
            students = Student.objects.select_related('user', 'branch').all()
            logger.info(f"Found {len(students)} students to process")
            
            if not students.exists():
                logger.warning("No students found in database")
                return
            
            student_count = 0
            updated_count = 0
            
            for student in students:
                try:
                    # Skip if student doesn't have a user
                    if not hasattr(student, 'user') or not student.user:
                        logger.warning(f"Student {student.id} has no associated user, skipping")
                        continue
                    
                    # Check if record already exists for today
                    attendance_record = StudentAttendance.objects.filter(
                        student=student, 
                        date=today
                    ).first()
                    
                    if attendance_record:
                        # Log existing record
                        logger.debug(f"Found existing attendance for student {student.user.email} ({student.student_id})")
                        # Only update if status is not already set
                        if not attendance_record.status:
                            attendance_record.status = 'Present'
                            attendance_record.updated_by = admin_user
                            attendance_record.save(update_fields=['status', 'updated_by'])
                            updated_count += 1
                    else:
                        # Create a new attendance record with default 'Present' status
                        # Use Nepal time for time_in and time_out
                        nepal_tz = pytz.timezone('Asia/Kathmandu')
                        time_in = datetime.now(nepal_tz).replace(hour=9, minute=0, second=0, microsecond=0).time()
                        time_out = datetime.now(nepal_tz).replace(hour=17, minute=0, second=0, microsecond=0).time()
                        
                        StudentAttendance.objects.create(
                            student=student,
                            date=today,
                            status='Present',  # Default to present
                            time_in=time_in,
                            time_out=time_out,
                            created_by=admin_user
                        )
                        student_count += 1
                        logger.debug(f"Created attendance for student {student.user.email} ({student.student_id})")
                except IntegrityError as e:
                    logger.warning(f"IntegrityError for student {student.id}: {str(e)}")
                except Exception as e:
                    logger.error(f"Error processing student {student.id}: {str(e)}")
                    
            logger.info(f"Created {student_count} new student attendance records and updated {updated_count} existing records")
    except Exception as e:
        logger.error(f"Error processing student attendance: {str(e)}")

def should_run_now():
    """Check if it's the right time to run the script (9 PM Nepal time)"""
    nepal_tz = pytz.timezone('Asia/Kathmandu')
    current_time = datetime.now(nepal_tz).time()
    
    # For testing, always return True
    return True
    
    # In production, check if it's close to 9 PM (21:00)
    # target_hour = 21  # 9 PM
    # return current_time.hour == target_hour and 0 <= current_time.minute < 5

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