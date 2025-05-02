from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status, generics
from django.db.models import Q
from django.shortcuts import get_object_or_404
# from guardian.shortcuts import assign_perm, get_objects_for_user  # Temporarily commented out

from .models import (
    User, Branch, Employee, Student, Lead,
    Job, JobResponse, Blog
)
from .serializers import (
    UserSerializer, BranchSerializer, EmployeeSerializer, 
    StudentSerializer, LeadSerializer, JobSerializer,
    JobResponseSerializer, BlogSerializer
)
from .permissions import (
    IsSuperAdmin, IsBranchManager, IsCounsellor, IsReceptionist,
    BelongsToBranch, BranchManagerPermission, CounsellorPermission,
    ReceptionistPermission
)

# Create your views here.

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
                'password': request.data.get('user.password')
            }
            
            # Debug print statements
            print("User data:", user_data)
            print("Employee data:", employee_data)
            
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
            permission_classes = [IsSuperAdmin | BranchManagerPermission | CounsellorPermission]
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
            
            # Prepare user data
            user_data = {
                'first_name': request.data.get('user.first_name'),
                'last_name': request.data.get('user.last_name'),
                'email': request.data.get('user.email'),
                'role': 'Student',
                'password': request.data.get('user.password', 'defaultpassword123')  # Default password
            }
            
            # Debug print statements
            print("User data:", user_data)
            print("Student data:", student_data)
            
            # Create a new serializer context with all the data needed
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
                'comments': student_data.get('comments', '')
            }
            
            # Handle file uploads if they exist
            if 'profile_image' in request.FILES:
                serializer_data['profile_image'] = request.FILES['profile_image']
                
            if 'resume' in request.FILES:
                serializer_data['resume'] = request.FILES['resume']
            
            # Debug the serializer data
            print("Serializer data:", serializer_data)
            
            serializer = self.get_serializer(data=serializer_data)
            is_valid = serializer.is_valid()
            
            if not is_valid:
                print("Serializer errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        # If not using JSON, fall back to standard processing
        return super().create(request, *args, **kwargs)
        
    def update(self, request, *args, **kwargs):
        # Process the JSON student data sent from frontend for updates
        if 'student_data' in request.data:
            import json
            student_data = json.loads(request.data['student_data'])
            
            # Get the current instance
            instance = self.get_object()
            
            # Prepare user data
            user_data = {
                'first_name': request.data.get('user.first_name'),
                'last_name': request.data.get('user.last_name'),
                'email': request.data.get('user.email')
            }
            
            # Debug print statements
            print("Update - User data:", user_data)
            print("Update - Student data:", student_data)
            
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
                'comments': student_data.get('comments', '')
            }
            
            # Handle file uploads if they exist
            if 'profile_image' in request.FILES:
                serializer_data['profile_image'] = request.FILES['profile_image']
                
            if 'resume' in request.FILES:
                serializer_data['resume'] = request.FILES['resume']
            
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
        
        # SuperAdmin can see all leads
        if user.role == 'SuperAdmin':
            return Lead.objects.all()
            
        # Branch Manager, Counsellor, and Receptionist can see leads in their branch
        if user.role in ['BranchManager', 'Counsellor', 'Receptionist'] and hasattr(user, 'employee_profile'):
            user_branch = user.employee_profile.branch
            return Lead.objects.filter(branch=user_branch)
            
        # Other roles can't see leads
        return Lead.objects.none()

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
        if self.action == 'create':
            # Anyone can apply for a job
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only SuperAdmin and BranchManager (of the job) can modify job responses
            permission_classes = [IsSuperAdmin | BranchManagerPermission]
        else:
            # SuperAdmin and BranchManager can view responses
            permission_classes = [IsSuperAdmin | BranchManagerPermission]
        return [permission() for permission in permission_classes]
        
    def get_queryset(self):
        user = self.request.user
        
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
