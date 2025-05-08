from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status, generics
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime
import random
# from guardian.shortcuts import assign_perm, get_objects_for_user  # Temporarily commented out
from rest_framework.views import APIView

from .models import (
    User, Branch, Employee, Student, Lead,
    Job, JobResponse, Blog, StudentAttendance, EmployeeAttendance, ActivityLog
)
from .serializers import (
    UserSerializer, BranchSerializer, EmployeeSerializer, StudentSerializer,
    LeadSerializer, JobSerializer, JobResponseSerializer, BlogSerializer,
    StudentDetailSerializer, StudentUpdateSerializer, StudentAttendanceSerializer, 
    EmployeeAttendanceSerializer, ActivityLogSerializer
)
from .permissions import (
    IsSuperAdmin, IsBranchManager, IsCounsellor, IsReceptionist,
    BelongsToBranch, BranchManagerPermission, CounsellorPermission,
    ReceptionistPermission, IsStudent
)

# Create your views here.

# Dashboard stats API views

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsSuperAdmin])
def admin_stats(request):
    """
    API endpoint for admin dashboard statistics
    """
    try:
        # Count real data from the database
        branch_count = Branch.objects.count()
        manager_count = Employee.objects.filter(user__role='BranchManager').count()
        counsellor_count = Employee.objects.filter(user__role='Counsellor').count()
        receptionist_count = Employee.objects.filter(user__role='Receptionist').count()
        student_count = Student.objects.count()
        lead_count = Lead.objects.count()
        job_count = Job.objects.count()
        
        # Get real branch data and student counts
        branches = Branch.objects.all()
        students_by_branch = {}
        
        if branches.exists():
            for branch in branches:
                students_count = Student.objects.filter(branch=branch).count()
                students_by_branch[branch.name] = students_count
        
        # Get lead source distribution
        lead_source_counts = {}
        lead_sources = Lead.objects.values('lead_source').annotate(count=Count('lead_source'))
        for item in lead_sources:
            lead_source_counts[item['lead_source']] = item['count']
            
        # If no lead sources found, provide some default categories
        if not lead_source_counts:
            lead_source_counts = {
                "Website": Lead.objects.filter(lead_source="Website").count(),
                "Social Media": Lead.objects.filter(lead_source="Social Media").count(),
                "Referral": Lead.objects.filter(lead_source="Referral").count(),
                "Walk-in": Lead.objects.filter(lead_source="Walk-in").count(),
                "Phone Inquiry": Lead.objects.filter(lead_source="Phone Inquiry").count(),
                "Email": Lead.objects.filter(lead_source="Email").count(),
                "Event": Lead.objects.filter(lead_source="Event").count(),
                "Other": Lead.objects.filter(lead_source="Other").count()
            }
        
        # Calculate monthly student registrations for the last 6 months
        monthly_student_registrations = {}
        current_date = timezone.now()
        
        # Get the last 6 months
        for i in range(6):
            # Calculate month and year (going back from current month)
            month = (current_date.month - i) % 12
            if month == 0:
                month = 12
            
            year = current_date.year
            if current_date.month - i <= 0:
                year -= 1
                
            # Get month name
            month_name = datetime(year, month, 1).strftime('%b')
            
            # Count students registered in this month
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1) - datetime.timedelta(days=1)
            else:
                end_date = datetime(year, month + 1, 1) - datetime.timedelta(days=1)
                
            month_count = Student.objects.filter(enrollment_date__range=[start_date, end_date]).count()
            monthly_student_registrations[month_name] = month_count
        
        # Reverse to show in chronological order
        monthly_student_registrations = dict(reversed(list(monthly_student_registrations.items())))
            
        stats = {
            "branchCount": branch_count,
            "managerCount": manager_count,
            "counsellorCount": counsellor_count,
            "receptionistCount": receptionist_count,
            "studentCount": student_count,
            "leadCount": lead_count,
            "jobCount": job_count,
            "studentsByBranch": students_by_branch,
            "leadsStatusCount": lead_source_counts,
            "monthlyStudentRegistrations": monthly_student_registrations
        }
        
        return Response(stats)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsBranchManager])
def branch_manager_stats(request):
    """
    API endpoint for branch manager dashboard statistics
    """
    try:
        # Get the branch manager's branch
        branch_name = "Unknown Branch"
        branch = None
        
        if hasattr(request.user, 'employee_profile'):
            branch = request.user.employee_profile.branch
            branch_name = branch.name
            
        # Count employees and students for this branch
        if branch:
            employee_count = Employee.objects.filter(branch=branch).count() or 12
            student_count = Student.objects.filter(branch=branch).count() or 78
            lead_count = Lead.objects.filter(branch=branch).count() or 14
        else:
            # Mock data if branch not found
            employee_count = 12
            student_count = 78
            lead_count = 14
            
        # Generate mock data for charts
        course_distribution = {
            "Web Development": random.randint(10, 30),
            "Digital Marketing": random.randint(8, 20),
            "Graphic Design": random.randint(5, 15),
            "App Development": random.randint(10, 25),
            "Data Science": random.randint(5, 15)
        }
        
        lead_status_count = {
            "New": random.randint(2, 7),
            "Contacted": random.randint(3, 8),
            "Qualified": random.randint(2, 5),
            "Converted": random.randint(1, 5),
            "Closed": random.randint(1, 3)
        }
        
        # Mock data for student attendance
        student_attendance = {
            "Monday": random.randint(70, 95),
            "Tuesday": random.randint(70, 95),
            "Wednesday": random.randint(70, 95),
            "Thursday": random.randint(70, 95),
            "Friday": random.randint(70, 95)
        }
        
        # Mock data for lead conversions over past 6 months
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        current_month = timezone.now().month
        
        lead_conversions = {
            "labels": [],
            "values": []
        }
        
        for i in range(6):
            month_idx = (current_month - i - 1) % 12
            if month_idx == 0:
                month_idx = 12
            
            lead_conversions["labels"].append(month_names[month_idx - 1])
            lead_conversions["values"].append(random.randint(3, 12))
            
        # Reverse for chronological order
        lead_conversions["labels"].reverse()
        lead_conversions["values"].reverse()
        
        stats = {
            "branchName": branch_name,
            "employeeCount": employee_count,
            "studentCount": student_count,
            "leadCount": lead_count,
            "courseDistribution": course_distribution,
            "leadStatusCount": lead_status_count,
            "studentAttendance": student_attendance,
            "leadConversions": lead_conversions
        }
        
        return Response(stats)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsCounsellor])
def counsellor_stats(request):
    """
    API endpoint for counsellor dashboard statistics
    """
    try:
        # Get the counsellor's name and branch
        counsellor_name = f"{request.user.first_name} {request.user.last_name}"
        branch_name = "Unknown Branch"
        branch = None
        
        if hasattr(request.user, 'employee_profile'):
            branch = request.user.employee_profile.branch
            branch_name = branch.name
            
        # Count assigned students and leads
        assigned_student_count = random.randint(15, 40)
        assigned_lead_count = random.randint(5, 15)
        upcoming_appointment_count = random.randint(3, 8)
            
        # Generate mock data for charts
        student_status_distribution = {
            "Active": random.randint(10, 30),
            "Completed": random.randint(5, 15),
            "On Hold": random.randint(2, 8),
            "Graduated": random.randint(5, 10)
        }
        
        lead_status_distribution = {
            "New": random.randint(2, 5),
            "Contacted": random.randint(2, 7),
            "Interested": random.randint(2, 5),
            "Not Interested": random.randint(1, 3),
            "Converted": random.randint(1, 4)
        }
        
        # Mock data for performance metrics
        performance_metrics = {
            "Student Success Rate": random.randint(75, 95),
            "Lead Conversion Rate": random.randint(40, 75),
            "Appointment Completion": random.randint(80, 98),
            "Student Satisfaction": random.randint(85, 98)
        }
        
        # Mock data for weekly schedule
        weekly_schedule = {
            "Monday": random.randint(1, 5),
            "Tuesday": random.randint(1, 5),
            "Wednesday": random.randint(1, 5),
            "Thursday": random.randint(1, 5),
            "Friday": random.randint(1, 5)
        }
        
        stats = {
            "counsellorName": counsellor_name,
            "branchName": branch_name,
            "assignedStudentCount": assigned_student_count,
            "assignedLeadCount": assigned_lead_count,
            "upcomingAppointmentCount": upcoming_appointment_count,
            "studentStatusDistribution": student_status_distribution,
            "leadStatusDistribution": lead_status_distribution,
            "performanceMetrics": performance_metrics,
            "weeklySchedule": weekly_schedule
        }
        
        return Response(stats)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsReceptionist])
def receptionist_stats(request):
    """
    API endpoint for receptionist dashboard statistics
    """
    try:
        # Get the receptionist's name and branch
        receptionist_name = f"{request.user.first_name} {request.user.last_name}"
        branch_name = "Unknown Branch"
        branch = None
        
        if hasattr(request.user, 'employee_profile'):
            branch = request.user.employee_profile.branch
            branch_name = branch.name
            
        # Mock data for today's counts
        today_lead_count = random.randint(1, 8)
        today_visitor_count = random.randint(5, 25)
        upcoming_appointment_count = random.randint(3, 12)
            
        # Generate mock data for charts
        lead_source_distribution = {
            "Walk-in": random.randint(5, 15),
            "Website": random.randint(5, 20),
            "Referral": random.randint(3, 10),
            "Social Media": random.randint(5, 15),
            "Ad Campaign": random.randint(2, 10)
        }
        
        student_course_distribution = {
            "Web Development": random.randint(10, 30),
            "Digital Marketing": random.randint(8, 20),
            "Graphic Design": random.randint(5, 15),
            "App Development": random.randint(10, 25),
            "Data Science": random.randint(5, 15)
        }
        
        # Mock data for visitor traffic (last 7 days)
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        visitor_traffic = {}
        
        for day in days:
            visitor_traffic[day] = random.randint(5, 30)
        
        stats = {
            "receptionistName": receptionist_name,
            "branchName": branch_name,
            "todayLeadCount": today_lead_count,
            "todayVisitorCount": today_visitor_count,
            "upcomingAppointmentCount": upcoming_appointment_count,
            "leadSourceDistribution": lead_source_distribution,
            "studentCourseDistribution": student_course_distribution,
            "visitorTraffic": visitor_traffic
        }
        
        return Response(stats)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def bank_manager_stats(request):
    """
    API endpoint for bank manager dashboard statistics
    """
    try:
        # Get the bank manager's name
        bank_manager_name = f"{request.user.first_name} {request.user.last_name}"
            
        # Mock data for loan counts
        total_loans = random.randint(50, 200)
        pending_loans = random.randint(10, 30)
        approved_loans = random.randint(30, 150)
        rejected_loans = random.randint(5, 20)
            
        # Generate mock data for charts
        loan_type_distribution = {
            "Education": random.randint(20, 70),
            "Personal": random.randint(10, 40),
            "Business": random.randint(5, 30),
            "Housing": random.randint(10, 50),
            "Vehicle": random.randint(5, 20)
        }
        
        loan_status_distribution = {
            "Pending": pending_loans,
            "Approved": approved_loans,
            "Rejected": rejected_loans,
            "Completed": random.randint(10, 50)
        }
        
        # Mock data for monthly loan amounts
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        current_month = timezone.now().month
        
        monthly_loan_amount = {}
        
        for i in range(6):
            month_idx = (current_month - i - 1) % 12
            if month_idx == 0:
                month_idx = 12
            
            monthly_loan_amount[month_names[month_idx - 1]] = random.randint(50000, 250000)
            
        # Reverse for chronological order
        monthly_loan_amount = dict(reversed(list(monthly_loan_amount.items())))
        
        # Mock data for branch distribution
        branches = Branch.objects.all()
        branch_names = [branch.name for branch in branches] if branches.exists() else [
            "Kathmandu", "Pokhara", "Chitwan", "Butwal", "Biratnagar"
        ]
        
        branch_distribution = {}
        for name in branch_names:
            branch_distribution[name] = random.randint(5, 50)
        
        stats = {
            "bankManagerName": bank_manager_name,
            "totalLoans": total_loans,
            "pendingLoans": pending_loans,
            "approvedLoans": approved_loans,
            "rejectedLoans": rejected_loans,
            "loanTypeDistribution": loan_type_distribution,
            "loanStatusDistribution": loan_status_distribution,
            "monthlyLoanAmount": monthly_loan_amount,
            "branchDistribution": branch_distribution
        }
        
        return Response(stats)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsSuperAdmin]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperAdmin]
        elif self.action in ['reset_default_password']:
            permission_classes = [IsSuperAdmin | IsBranchManager]
        elif self.action in ['change_password']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Return the current authenticated user's details
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
        
    @action(detail=True, methods=['post'])
    def reset_default_password(self, request, pk=None):
        """
        Reset a user's password to the default (Nepal@123)
        """
        user = self.get_object()
        
        # Branch managers can only reset passwords for users in their branch
        if request.user.role == 'BranchManager':
            if not hasattr(request.user, 'employee_profile'):
                return Response(
                    {"detail": "You don't have permission to reset this password."},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            manager_branch = request.user.employee_profile.branch
            
            # Check if user belongs to manager's branch
            user_branch = None
            if hasattr(user, 'employee_profile'):
                user_branch = user.employee_profile.branch
            elif hasattr(user, 'student_profile'):
                user_branch = user.student_profile.branch
                
            if user_branch != manager_branch:
                return Response(
                    {"detail": "You don't have permission to reset password for users outside your branch."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Don't allow resetting SuperAdmin passwords
        if user.role == 'SuperAdmin':
            return Response(
                {"detail": "Cannot reset password for SuperAdmin users."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Reset the password
        user.set_default_password()
        
        return Response({"detail": "Password has been reset to the default."}, status=status.HTTP_200_OK)
        
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """
        Change the current user's password
        """
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        # Validate input
        if not current_password or not new_password:
            return Response(
                {"detail": "Both current and new password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check current password
        if not user.check_password(current_password):
            return Response(
                {"detail": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Validate new password
        if len(new_password) < 8:
            return Response(
                {"detail": "New password must be at least 8 characters long."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Set new password
        user.set_password(new_password)
        user.save(update_fields=['password'])
        
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)
    
    def get_queryset(self):
        user = self.request.user
        
        # SuperAdmin can see all users
        if user.role == 'SuperAdmin':
            return User.objects.all()
        
        # Branch managers can see users in their branch
        if user.role == 'BranchManager' and hasattr(user, 'employee_profile'):
            manager_branch = user.employee_profile.branch
            
            # Get students and employees in this branch
            student_users = User.objects.filter(
                student_profile__branch=manager_branch,
                role='Student'
            )
            
            employee_users = User.objects.filter(
                employee_profile__branch=manager_branch
            )
            
            return (student_users | employee_users).distinct()
        
        # Counsellors can see students and employees in their branch
        if user.role == 'Counsellor' and hasattr(user, 'employee_profile'):
            counsellor_branch = user.employee_profile.branch
            
            student_users = User.objects.filter(
                student_profile__branch=counsellor_branch,
                role='Student'
            )
            
            employee_users = User.objects.filter(
                employee_profile__branch=counsellor_branch
            )
            
            return (student_users | employee_users).distinct()
            
        # Receptionists can see employees and students in their branch
        if user.role == 'Receptionist' and hasattr(user, 'employee_profile'):
            receptionist_branch = user.employee_profile.branch
            
            student_users = User.objects.filter(
                student_profile__branch=receptionist_branch,
                role='Student'
            )
            
            employee_users = User.objects.filter(
                employee_profile__branch=receptionist_branch
            )
            
            return (student_users | employee_users).distinct()
            
        # Students can only see themselves
        if user.role == 'Student':
            return User.objects.filter(id=user.id)
            
        # Default - users can see themselves
        return User.objects.filter(id=user.id)

class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check if branch has associated employees or students
        employee_count = instance.employees.count()
        student_count = instance.students.count()
        
        if employee_count > 0 or student_count > 0:
            error_message = "Cannot delete this branch as it has "
            if employee_count > 0 and student_count > 0:
                error_message += f"{employee_count} employees and {student_count} students associated with it."
            elif employee_count > 0:
                error_message += f"{employee_count} employees associated with it."
            else:
                error_message += f"{student_count} students associated with it."
                
            return Response({"detail": error_message}, status=status.HTTP_400_BAD_REQUEST)
            
        return super().destroy(request, *args, **kwargs)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperAdmin | BranchManagerPermission]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
        
    def get_queryset(self):
        user = self.request.user
        
        # SuperAdmin can see all employees
        if user.role == 'SuperAdmin':
            return Employee.objects.all()
            
        # Branch Manager, Counsellor, and Receptionist can see employees in their branch
        if user.role in ['BranchManager', 'Counsellor', 'Receptionist'] and hasattr(user, 'employee_profile'):
            user_branch = user.employee_profile.branch
            return Employee.objects.filter(branch=user_branch)
            
        # Students and others can't see employees
        return Employee.objects.none()
        
    def create(self, request, *args, **kwargs):
        # Process the JSON employee data sent from frontend
        if 'employee_data' in request.data:
            import json
            employee_data = json.loads(request.data['employee_data'])
            
            # Prepare user data
            user_data = {
                'first_name': request.data.get('user.first_name'),
                'last_name': request.data.get('user.last_name'),
                'email': request.data.get('user.email'),
                'role': request.data.get('user.role'),
                # Use default password for non-SuperAdmin roles
                'password': 'Nepal@123' if request.data.get('user.role') != 'SuperAdmin' else request.data.get('user.password')
            }
            
            # Debug print statements
            print("User data:", user_data)
            print("Employee data:", employee_data)
            
            # For non-SuperAdmin users, automatically assign the branch ID of the current user
            if request.user.role != 'SuperAdmin':
                if hasattr(request.user, 'employee_profile') and request.user.employee_profile.branch:
                    employee_data['branch'] = request.user.employee_profile.branch.id
            
            # Create a new serializer context with all the data needed
            serializer_data = {
                'user': user_data,
                'branch': employee_data.get('branch'),
                'salary': employee_data.get('salary'),
                'contact_number': employee_data.get('contact_number'),
                'address': employee_data.get('address'),
                'emergency_contact': employee_data.get('emergency_contact', ''),
                'nationality': employee_data.get('nationality', ''),
                'gender': employee_data.get('gender', 'Other'),  # Default to Other if not provided
                'dob': employee_data.get('dob')  # Add date of birth field
            }
            
            # Handle file uploads if they exist
            if 'profile_image' in request.FILES:
                serializer_data['profile_image'] = request.FILES['profile_image']
                
            if 'citizenship_document' in request.FILES:
                serializer_data['citizenship_document'] = request.FILES['citizenship_document']
            
            # Debug the serializer data
            print("Serializer data:", serializer_data)
            
            serializer = self.get_serializer(data=serializer_data)
            is_valid = serializer.is_valid()
            
            if not is_valid:
                print("Serializer errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            self.perform_create(serializer)
            
            # Send email notification for new employee - always try to send for all employee roles
            try:
                from utils.email_sender import send_employee_credentials_email
                print(f"Attempting to send email notification to {user_data['email']}")
                send_employee_credentials_email(user_data, employee_data)
                print(f"Email notification successfully queued for {user_data['email']}")
            except Exception as e:
                print(f"Error sending email notification: {str(e)}")
                # Continue with the response even if email fails
                
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        # If not using JSON, fall back to standard processing
        return super().create(request, *args, **kwargs)
        
    def update(self, request, *args, **kwargs):
        # Process the JSON employee data sent from frontend for updates
        if 'employee_data' in request.data:
            import json
            employee_data = json.loads(request.data['employee_data'])
            
            # Get the current instance
            instance = self.get_object()
            
            # Prepare user data
            user_data = {
                'first_name': request.data.get('user.first_name'),
                'last_name': request.data.get('user.last_name'),
                'email': request.data.get('user.email'),
                'role': request.data.get('user.role')
            }
            
            # Debug print statements
            print("Update - User data:", user_data)
            print("Update - Employee data:", employee_data)
            
            # For non-SuperAdmin users, ensure branch ID matches their own branch
            if request.user.role != 'SuperAdmin':
                if hasattr(request.user, 'employee_profile') and request.user.employee_profile.branch:
                    employee_data['branch'] = request.user.employee_profile.branch.id
            
            # Create a serializer context with all the data needed
            serializer_data = {
                'user': user_data,
                'branch': employee_data.get('branch'),
                'salary': employee_data.get('salary'),
                'contact_number': employee_data.get('contact_number'),
                'address': employee_data.get('address'),
                'emergency_contact': employee_data.get('emergency_contact', ''),
                'nationality': employee_data.get('nationality', ''),
                'gender': employee_data.get('gender', 'Other'),  # Default to Other if not provided
                'dob': employee_data.get('dob')  # Add date of birth field
            }
            
            # Handle file uploads if they exist
            if 'profile_image' in request.FILES:
                serializer_data['profile_image'] = request.FILES['profile_image']
                
            if 'citizenship_document' in request.FILES:
                serializer_data['citizenship_document'] = request.FILES['citizenship_document']
            
            # Debug the serializer data
            print("Update - Serializer data:", serializer_data)
            
            # Use partial=True to only update provided fields
            serializer = self.get_serializer(instance, data=serializer_data, partial=True)
            is_valid = serializer.is_valid()
            
            if not is_valid:
                print("Update - Serializer errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            self.perform_update(serializer)
            
            if getattr(instance, '_prefetched_objects_cache', None):
                # If 'prefetch_related' has been applied to a queryset, we need to
                # forcibly invalidate the prefetch cache on the instance.
                instance._prefetched_objects_cache = {}
                
            return Response(serializer.data)
        
        # If not using JSON, fall back to standard processing
        return super().update(request, *args, **kwargs)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsSuperAdmin | BranchManagerPermission | CounsellorPermission | ReceptionistPermission]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsSuperAdmin | BranchManagerPermission | CounsellorPermission]
        elif self.action == 'destroy':
            permission_classes = [IsSuperAdmin | BranchManagerPermission]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
        
    def get_queryset(self):
        user = self.request.user
        
        # SuperAdmin can see all students
        if user.role == 'SuperAdmin':
            return Student.objects.all()
            
        # Branch Manager, Counsellor, and Receptionist can see students in their branch
        if user.role in ['BranchManager', 'Counsellor', 'Receptionist'] and hasattr(user, 'employee_profile'):
            user_branch = user.employee_profile.branch
            return Student.objects.filter(branch=user_branch)
            
        # Students can only see themselves
        if user.role == 'Student' and hasattr(user, 'student_profile'):
            return Student.objects.filter(id=user.student_profile.id)
            
        # Default - no access
        return Student.objects.none()
    
    def create(self, request, *args, **kwargs):
        # Process the JSON student data sent from frontend
        if 'student_data' in request.data:
            import json
            student_data = json.loads(request.data['student_data'])
            
            # For non-SuperAdmin users, automatically assign the branch ID of the current user
            if request.user.role != 'SuperAdmin':
                if hasattr(request.user, 'employee_profile') and request.user.employee_profile.branch:
                    student_data['branch'] = request.user.employee_profile.branch.id
            
            # Prepare user data
            user_data = {
                'first_name': request.data.get('user.first_name'),
                'last_name': request.data.get('user.last_name'),
                'email': request.data.get('user.email'),
                'role': 'Student',
                'password': 'Nepal@123'  # Default password for all students
            }
            
            # Create a serializer context with all the data needed
            serializer_data = {
                'user': user_data,
                'branch': student_data.get('branch'),
                'age': student_data.get('age'),
                'gender': student_data.get('gender'),
                'nationality': student_data.get('nationality'),
                'contact_number': student_data.get('contact_number'),
                'address': student_data.get('address'),
                'institution_name': student_data.get('institution_name'),
                'language_test': student_data.get('language_test'),
                'emergency_contact': student_data.get('emergency_contact', ''),
                'mother_name': student_data.get('mother_name', ''),
                'father_name': student_data.get('father_name', ''),
                'parent_number': student_data.get('parent_number', ''),
            }
            
            # Handle file uploads if they exist
            if 'profile_image' in request.FILES:
                serializer_data['profile_image'] = request.FILES['profile_image']
            if 'resume' in request.FILES:
                serializer_data['resume'] = request.FILES['resume']
            if 'citizenship_document' in request.FILES:
                serializer_data['citizenship_document'] = request.FILES['citizenship_document']
            
            serializer = self.get_serializer(data=serializer_data)
            is_valid = serializer.is_valid()
            
            if not is_valid:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            self.perform_create(serializer)
            
            # Send email notification to the new student
            from utils.email_sender import send_employee_credentials_email
            send_employee_credentials_email(user_data, student_data)
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        # If not using JSON, fall back to standard processing
        return super().create(request, *args, **kwargs)
        
    def update(self, request, *args, **kwargs):
        # Process the JSON student data sent from frontend for updates
        if 'student_data' in request.data:
            import json
            student_data = json.loads(request.data['student_data'])
            instance = self.get_object()
            user_data = {
                'first_name': request.data.get('user.first_name', instance.user.first_name),
                'last_name': request.data.get('user.last_name', instance.user.last_name),
                'email': request.data.get('user.email', instance.user.email),
                'role': 'Student',
                'password': request.data.get('user.password', None)
            }
            serializer_data = {
                'user': user_data,
                'branch': student_data.get('branch', instance.branch.id),
                'age': student_data.get('age', instance.age),
                'gender': student_data.get('gender', instance.gender),
                'nationality': student_data.get('nationality', instance.nationality),
                'contact_number': student_data.get('contact_number', instance.contact_number),
                'address': student_data.get('address', instance.address),
                'institution_name': student_data.get('institution_name', instance.institution_name),
                'language_test': student_data.get('language_test', instance.language_test),
                'emergency_contact': student_data.get('emergency_contact', instance.emergency_contact),
                'mother_name': student_data.get('mother_name', instance.mother_name),
                'father_name': student_data.get('father_name', instance.father_name),
                'parent_number': student_data.get('parent_number', instance.parent_number),
            }
            if 'profile_image' in request.FILES:
                serializer_data['profile_image'] = request.FILES['profile_image']
            if 'resume' in request.FILES:
                serializer_data['resume'] = request.FILES['resume']
            serializer = self.get_serializer(instance, data=serializer_data, partial=True)
            is_valid = serializer.is_valid()
            if not is_valid:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            self.perform_update(serializer)
            return Response(serializer.data)
        return super().update(request, *args, **kwargs)

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            # Any authenticated user can create a lead
            permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'destroy':
            # Only SuperAdmin can delete leads
            permission_classes = [IsSuperAdmin]
        elif self.action in ['update', 'partial_update']:
            # SuperAdmin, BranchManager, and Counsellor can update leads
            permission_classes = [IsSuperAdmin | BranchManagerPermission | CounsellorPermission]
        else:
            # All authenticated users can list and retrieve
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
        
    def get_queryset(self):
        user = self.request.user
        
        # Select related fields to reduce database queries
        queryset = Lead.objects.select_related('branch', 'created_by', 'assigned_to')
        
        # SuperAdmin can see all leads
        if user.role == 'SuperAdmin':
            return queryset
            
        # Branch Manager, Counsellor, and Receptionist can see leads in their branch
        if user.role in ['BranchManager', 'Counsellor', 'Receptionist'] and hasattr(user, 'employee_profile'):
            user_branch = user.employee_profile.branch
            return queryset.filter(branch=user_branch)
            
        # Students and others can't see leads
        return Lead.objects.none()
    
    def perform_create(self, serializer):
        # For non-SuperAdmin users, automatically set the branch to the user's branch
        if self.request.user.role != 'SuperAdmin':
            if hasattr(self.request.user, 'employee_profile') and self.request.user.employee_profile.branch:
                serializer.save(created_by=self.request.user, branch=self.request.user.employee_profile.branch)
                return
        
        # For SuperAdmin or fallback
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        # For non-SuperAdmin users, ensure the branch remains the user's branch
        if self.request.user.role != 'SuperAdmin':
            if hasattr(self.request.user, 'employee_profile') and self.request.user.employee_profile.branch:
                serializer.save(branch=self.request.user.employee_profile.branch)
                return
        
        # For SuperAdmin or fallback
        serializer.save()

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperAdmin | BranchManagerPermission]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
        
    def get_queryset(self):
        user = self.request.user
        
        # SuperAdmin can see all jobs
        if user.role == 'SuperAdmin':
            return Job.objects.all()
            
        # Branch Manager can see jobs in their branch
        if user.role == 'BranchManager' and hasattr(user, 'employee_profile'):
            user_branch = user.employee_profile.branch
            return Job.objects.filter(branch=user_branch)
            
        # Other roles can see all active jobs
        return Job.objects.filter(is_active=True)

class JobResponseViewSet(viewsets.ModelViewSet):
    queryset = JobResponse.objects.all()
    serializer_class = JobResponseSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Allow students to list/retrieve their own applications
            permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'create':
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperAdmin | BranchManagerPermission]
        else:
            permission_classes = [IsSuperAdmin | BranchManagerPermission]
        return [permission() for permission in permission_classes]
        
    def get_queryset(self):
        user = self.request.user
        if user.role == 'Student':
            # Only return job responses for the logged-in student
            return JobResponse.objects.filter(email=user.email)
        # SuperAdmin can see all job responses
        if user.role == 'SuperAdmin':
            return JobResponse.objects.all()
        # Branch Manager can see job responses for jobs in their branch that they created
        if user.role == 'BranchManager' and hasattr(user, 'employee_profile'):
            user_branch = user.employee_profile.branch
            return JobResponse.objects.filter(job__branch=user_branch, job__created_by=user)
        # Other roles can't see job responses
        return JobResponse.objects.none()

class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperAdmin | BranchManagerPermission]
        else:
            # Anyone can view published blogs
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]
        
    def get_queryset(self):
        user = self.request.user
        
        # For list/retrieve actions and non-authenticated users, show only published blogs
        if self.action in ['list', 'retrieve'] and (not user.is_authenticated or user.role not in ['SuperAdmin', 'BranchManager']):
            return Blog.objects.filter(is_published=True)
        
        # SuperAdmin can see all blogs
        if user.is_authenticated and user.role == 'SuperAdmin':
            return Blog.objects.all()
            
        # Branch Manager can see all blogs in their branch
        if user.is_authenticated and user.role == 'BranchManager' and hasattr(user, 'employee_profile'):
            user_branch = user.employee_profile.branch
            return Blog.objects.filter(branch=user_branch)
            
        # Default - show only published blogs
        return Blog.objects.filter(is_published=True)

# Student Portal Endpoints
class StudentProfileView(APIView):
    """View for student to see and update their own profile"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
            serializer = StudentDetailSerializer(student)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request):
        try:
            student = Student.objects.get(user=request.user)
            serializer = StudentUpdateSerializer(student, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Student.DoesNotExist:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)


class StudentJobResponseView(APIView):
    """View for student to apply to jobs"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def post(self, request):
        serializer = JobResponseSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentJobResponseListView(APIView):
    """View for student to view their job applications"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get(self, request):
        student = Student.objects.get(user=request.user)
        # Get job responses by student email
        responses = JobResponse.objects.filter(email=request.user.email).order_by('-created_at')
        serializer = JobResponseSerializer(responses, many=True)
        return Response(serializer.data)

class EmployeeAttendanceViewSet(viewsets.ModelViewSet):
    queryset = EmployeeAttendance.objects.all()
    serializer_class = EmployeeAttendanceSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperAdmin | BranchManagerPermission]
        else:
            permission_classes = [IsSuperAdmin]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Base queryset with select_related for performance
        base_queryset = EmployeeAttendance.objects.select_related(
            'employee', 'employee__user', 'employee__branch', 'created_by', 'updated_by'
        )
        
        # SuperAdmin can see all attendance records
        if user.role == 'SuperAdmin':
            return base_queryset
        
        # Branch Manager can see attendance records for employees in their branch
        if user.role == 'BranchManager' and hasattr(user, 'employee_profile'):
            user_branch = user.employee_profile.branch
            return base_queryset.filter(employee__branch=user_branch)
        
        # Others can't see any records
        return EmployeeAttendance.objects.none()
    
    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """Get attendance records for a specific date"""
        import traceback
        date_str = request.query_params.get('date')
        if not date_str:
            return Response(
                {"detail": "Date parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            from datetime import datetime
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            # Get all employees first
            user = self.request.user
            employees = []
            if user.role == 'SuperAdmin':
                employees = Employee.objects.select_related('user', 'branch').all()
            elif user.role == 'BranchManager' and hasattr(user, 'employee_profile'):
                user_branch = user.employee_profile.branch
                employees = Employee.objects.select_related('user', 'branch').filter(branch=user_branch)
            # Get existing attendance records for this date
            queryset = self.get_queryset().filter(date=date)
            existing_attendance = {record.employee_id: record for record in queryset}
            # Create attendance data for all employees
            attendance_data = []
            for employee in employees:
                if employee.id in existing_attendance:
                    # Use existing record
                    attendance_data.append(existing_attendance[employee.id])
                else:
                    # Create a placeholder EmployeeAttendance instance (not saved to DB)
                    attendance_data.append(
                        EmployeeAttendance(
                            employee=employee,
                            date=date,
                            time_in='09:00:00',
                            time_out='17:00:00',
                            status='Present',
                            remarks=None
                        )
                    )
            # Serialize the data
            serializer = self.get_serializer(attendance_data, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(traceback.format_exc())
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def by_employee(self, request):
        """Get attendance records for a specific employee"""
        employee_id = request.query_params.get('employee_id')
        if not employee_id:
            return Response(
                {"detail": "Employee ID parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(employee__employee_id=employee_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """
        Bulk update attendance records
        Expects a list of attendance records in the format:
        [
            {
                "employee": 1,
                "date": "2023-01-01",
                "status": "Present"
            }
        ]
        """
        if not request.user.role == 'SuperAdmin':
            return Response(
                {"detail": "Only SuperAdmin can perform bulk updates."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        attendance_data = request.data
        if not isinstance(attendance_data, list):
            return Response(
                {"detail": "Expected a list of attendance records."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = []
        for record in attendance_data:
            employee_id = record.get('employee')
            date_str = record.get('date')
            status_value = record.get('status')
            
            if not employee_id or not date_str or not status_value:
                results.append({
                    'success': False,
                    'error': "Missing required fields (employee, date, status)",
                    'data': record
                })
                continue
            
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
                
                # Find or create the attendance record
                attendance, created = EmployeeAttendance.objects.get_or_create(
                    employee_id=employee_id,
                    date=date,
                    defaults={
                        'status': status_value,
                        'created_by': request.user,
                        'time_in': '09:00:00',
                        'time_out': '17:00:00'
                    }
                )
                
                if not created:
                    # Update existing record
                    attendance.status = status_value
                    attendance.updated_by = request.user
                    attendance.save(update_fields=['status', 'updated_by'])
                
                results.append({
                    'success': True,
                    'employee_id': employee_id,
                    'date': date_str,
                    'status': status_value
                })
                
            except Exception as e:
                results.append({
                    'success': False,
                    'error': str(e),
                    'data': record
                })
        
        return Response({
            'results': results,
            'success_count': len([r for r in results if r.get('success')]),
            'error_count': len([r for r in results if not r.get('success')])
        })


class StudentAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StudentAttendance.objects.all()
    serializer_class = StudentAttendanceSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsSuperAdmin | BranchManagerPermission]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperAdmin]
        else:
            permission_classes = [IsSuperAdmin]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Base queryset with select_related for performance
        base_queryset = StudentAttendance.objects.select_related(
            'student', 'student__user', 'student__branch', 'created_by', 'updated_by'
        )
        
        # SuperAdmin can see all attendance records
        if user.role == 'SuperAdmin':
            return base_queryset
        
        # Branch Manager can see attendance records for students in their branch
        if user.role == 'BranchManager' and hasattr(user, 'employee_profile'):
            user_branch = user.employee_profile.branch
            return base_queryset.filter(student__branch=user_branch)
        
        # Students can see their own attendance records
        if user.role == 'Student' and hasattr(user, 'student_profile'):
            return base_queryset.filter(student=user.student_profile)
        
        # Others can't see any records
        return StudentAttendance.objects.none()
    
    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """Get attendance records for a specific date"""
        date_str = request.query_params.get('date')
        if not date_str:
            return Response(
                {"detail": "Date parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from datetime import datetime
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all students first
        user = self.request.user
        students = []
        
        if user.role == 'SuperAdmin':
            students = Student.objects.select_related('user', 'branch').all()
        elif user.role == 'BranchManager' and hasattr(user, 'employee_profile'):
            user_branch = user.employee_profile.branch
            students = Student.objects.select_related('user', 'branch').filter(branch=user_branch)
        elif user.role == 'Student' and hasattr(user, 'student_profile'):
            students = [user.student_profile]
        
        # Get existing attendance records for this date
        queryset = self.get_queryset().filter(date=date)
        existing_attendance = {record.student_id: record for record in queryset}
        
        # Create attendance data for all students (as dicts)
        attendance_data = []
        for student in students:
            if student.id in existing_attendance:
                # Use existing record, serialize to dict
                record = existing_attendance[student.id]
                serializer = self.get_serializer(record)
                attendance_data.append(serializer.data)
            else:
                # Create a placeholder record as dict
                attendance_data.append({
                    'student': student.id,
                    'student_name': f"{student.user.first_name} {student.user.last_name}",
                    'student_id': student.student_id,
                    'branch_name': student.branch.name,
                    'date': date,
                    'time_in': '09:00:00',
                    'time_out': '17:00:00',
                    'status': 'Present',
                    'remarks': None
                })
        return Response(attendance_data)
    
    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get attendance records for a specific student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {"detail": "Student ID parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(student__student_id=student_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """
        Bulk update attendance records
        Expects a list of attendance records in the format:
        [
            {
                "student": 1,
                "date": "2023-01-01",
                "status": "Present"
            }
        ]
        """
        if not request.user.role == 'SuperAdmin':
            return Response(
                {"detail": "Only SuperAdmin can perform bulk updates."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        attendance_data = request.data
        if not isinstance(attendance_data, list):
            return Response(
                {"detail": "Expected a list of attendance records."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = []
        for record in attendance_data:
            student_id = record.get('student')
            date_str = record.get('date')
            status_value = record.get('status')
            
            if not student_id or not date_str or not status_value:
                results.append({
                    'success': False,
                    'error': "Missing required fields (student, date, status)",
                    'data': record
                })
                continue
            
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
                
                # Find or create the attendance record
                attendance, created = StudentAttendance.objects.get_or_create(
                    student_id=student_id,
                    date=date,
                    defaults={
                        'status': status_value,
                        'created_by': request.user,
                        'time_in': '09:00:00',
                        'time_out': '17:00:00'
                    }
                )
                
                if not created:
                    # Update existing record
                    attendance.status = status_value
                    attendance.updated_by = request.user
                    attendance.save(update_fields=['status', 'updated_by'])
                
                results.append({
                    'success': True,
                    'student_id': student_id,
                    'date': date_str,
                    'status': status_value
                })
                
            except Exception as e:
                results.append({
                    'success': False,
                    'error': str(e),
                    'data': record
                })
        
        return Response({
            'results': results,
            'success_count': len([r for r in results if r.get('success')]),
            'error_count': len([r for r in results if not r.get('success')])
        })


class ActivityLogPagination(PageNumberPagination):
    """Custom pagination class for activity logs"""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing activity logs"""
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    pagination_class = ActivityLogPagination
    
    def get_queryset(self):
        # Only SuperAdmin can see all logs
        if self.request.user.role == 'SuperAdmin':
            # Clean old logs (older than 1 day)
            from django.utils import timezone
            from datetime import timedelta
            cutoff_date = timezone.now() - timedelta(days=1)
            ActivityLog.objects.filter(created_at__lt=cutoff_date).delete()
            
            # Get remaining logs
            queryset = ActivityLog.objects.all().order_by('-created_at')
            
            # Filter by user role if specified
            role = self.request.query_params.get('role', None)
            if role:
                queryset = queryset.filter(user__role=role)
                
            # Filter by action type if specified
            action_type = self.request.query_params.get('action_type', None)
            if action_type:
                queryset = queryset.filter(action_type=action_type)
                
            # Filter by date range if specified
            start_date = self.request.query_params.get('start_date', None)
            end_date = self.request.query_params.get('end_date', None)
            if start_date and end_date:
                queryset = queryset.filter(created_at__date__range=[start_date, end_date])
                
            return queryset
        
        # Others can't see any logs
        return ActivityLog.objects.none()
    
    @action(detail=False, methods=['get'])
    def all(self, request):
        """Get all activity logs without pagination"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
