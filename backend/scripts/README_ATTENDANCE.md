# AdminBridge Attendance System

This system provides attendance tracking for employees and students in the AdminBridge application.

## Features

1. **Daily Attendance Records**: 
   - Automatically creates attendance records for all employees and students
   - Default status is "Present"
   - SuperAdmin can change status to "Absent", "Late", etc.

2. **Attendance Management**:
   - SuperAdmin has full access to view and modify all attendance records
   - Branch Managers can view attendance records for employees and students in their branch
   - Students can view their own attendance records

3. **Daily Reset**:
   - Attendance records are reset daily at 9:00 PM Nepal time
   - New records are created for the next day with default "Present" status

## Setup Instructions

1. **Database Migration**:
   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Install Required Packages**:
   ```
   pip install pytz
   ```

3. **Set Up Cron Job**:
   Edit the `attendance_crontab` file to match your project path, then:
   ```
   crontab attendance_crontab
   ```

4. **Manual Reset**:
   You can manually run the reset script:
   ```
   python scripts/reset_attendance.py
   ```

## API Endpoints

### Employee Attendance

- `GET /api/employee-attendance/` - List all employee attendance records (SuperAdmin only)
- `GET /api/employee-attendance/{id}/` - Get specific employee attendance record
- `POST /api/employee-attendance/` - Create new employee attendance record (SuperAdmin only)
- `PUT /api/employee-attendance/{id}/` - Update employee attendance record (SuperAdmin only)
- `GET /api/employee-attendance/by-date/?date=YYYY-MM-DD` - Get attendance records by date
- `GET /api/employee-attendance/by-employee/?employee_id=EMPLOYEE_ID` - Get attendance records by employee ID

### Student Attendance

- `GET /api/student-attendance/` - List all student attendance records (SuperAdmin only)
- `GET /api/student-attendance/{id}/` - Get specific student attendance record
- `POST /api/student-attendance/` - Create new student attendance record (SuperAdmin only)
- `PUT /api/student-attendance/{id}/` - Update student attendance record (SuperAdmin only)
- `GET /api/student-attendance/by-date/?date=YYYY-MM-DD` - Get attendance records by date
- `GET /api/student-attendance/by-student/?student_id=STUDENT_ID` - Get attendance records by student ID

## Models

### EmployeeAttendance
- `employee` - ForeignKey to Employee
- `date` - Date of attendance
- `time_in` - Time employee arrived (optional)
- `time_out` - Time employee left (optional)
- `status` - Status of attendance (Present, Absent, Late, Half Day, On Leave)
- `remarks` - Additional notes (optional)
- `created_by` - User who created the record
- `updated_by` - User who last updated the record

### StudentAttendance
- `student` - ForeignKey to Student
- `date` - Date of attendance
- `time_in` - Time student arrived (optional)
- `time_out` - Time student left (optional)
- `status` - Status of attendance (Present, Absent, Late, Half Day, On Leave)
- `remarks` - Additional notes (optional)
- `created_by` - User who created the record
- `updated_by` - User who last updated the record 