from django.http import HttpResponseForbidden
from django.urls import resolve
import re
import json
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import User, ActivityLog, Branch


class RoleBasedAccessMiddleware:
    """
    Middleware to enforce role-based access control at a URL level
    before the request reaches the view or permission classes.
    
    This is a first line of defense that can be used in conjunction with
    DRF permissions for more granular control.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # URLs that require SuperAdmin role
        self.superadmin_urls = [
            r'^/api/users/\d+/delete/$',  # Delete users
            r'^/api/branches/create/$',   # Create branches
        ]
        
        # URLs that require BranchManager role or above
        self.branch_manager_urls = [
            r'^/api/employees/create/$',  # Create employees
            r'^/api/jobs/create/$',       # Create jobs
            r'^/api/blogs/create/$',      # Create blogs
        ]

    def __call__(self, request):
        # Skip middleware for non-API requests or OPTIONS requests
        if not request.path.startswith('/api/') or request.method == 'OPTIONS':
            return self.get_response(request)
            
        # Skip middleware for authentication endpoints
        if request.path.startswith('/api/token/'):
            return self.get_response(request)
            
        # Check if user is authenticated
        if not request.user.is_authenticated:
            # Let the view handle authentication errors
            return self.get_response(request)
            
        # Check SuperAdmin-restricted URLs
        for pattern in self.superadmin_urls:
            if re.match(pattern, request.path) and request.user.role != 'SuperAdmin':
                return HttpResponseForbidden("Access denied: SuperAdmin role required")
                
        # Check BranchManager-restricted URLs
        for pattern in self.branch_manager_urls:
            if re.match(pattern, request.path) and request.user.role not in ['SuperAdmin', 'BranchManager']:
                return HttpResponseForbidden("Access denied: BranchManager role or higher required")
        
        # If all checks pass, continue to view
        return self.get_response(request)


class BranchAccessMiddleware:
    """
    Middleware to enforce branch-based access restrictions
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # URL patterns with branch IDs
        self.branch_url_patterns = [
            (r'^/api/branches/(?P<branch_id>\d+)/', 'branch_id'),
            (r'^/api/students/(?P<branch>\d+)/', 'branch'),
            (r'^/api/employees/(?P<branch>\d+)/', 'branch'),
            (r'^/api/jobs/(?P<branch>\d+)/', 'branch'),
            (r'^/api/blogs/(?P<branch>\d+)/', 'branch'),
        ]

    def __call__(self, request):
        # Skip middleware for non-API requests or OPTIONS requests
        if not request.path.startswith('/api/') or request.method == 'OPTIONS':
            return self.get_response(request)
            
        # Skip middleware for authentication endpoints
        if request.path.startswith('/api/token/'):
            return self.get_response(request)
            
        # Skip if user is SuperAdmin (they have access to all branches)
        if request.user.is_authenticated and request.user.role == 'SuperAdmin':
            return self.get_response(request)
            
        # Check if user is authenticated and has an employee profile
        if not request.user.is_authenticated or not hasattr(request.user, 'employee_profile'):
            # Let the view handle authentication errors
            return self.get_response(request)
            
        # Get the user's branch
        user_branch_id = request.user.employee_profile.branch.id
            
        # Check URL patterns with branch IDs
        for pattern, param_name in self.branch_url_patterns:
            match = re.match(pattern, request.path)
            if match:
                branch_id = match.group(param_name)
                # If the branch ID in the URL doesn't match the user's branch ID
                if int(branch_id) != user_branch_id:
                    return HttpResponseForbidden("Access denied: You don't have permission to access this branch")
        
        # If all checks pass, continue to view
        return self.get_response(request)


class DefaultPasswordFlagMiddleware:
    """
    Middleware that adds a header flag to the response if a user is using the default password.
    This helps the frontend to show appropriate notifications.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_auth = JWTAuthentication()
        
    def __call__(self, request):
        # Process request first, check if this is a token response
        response = self.get_response(request)
        
        # Check if this is the token endpoint
        if request.path == '/api/token/' and request.method == 'POST' and hasattr(request, 'data'):
            try:
                # Try to extract the email from the request
                email = request.data.get('email')
                if email:
                    from api.models import User
                    # Check if this user exists and is not a SuperAdmin
                    try:
                        user = User.objects.get(email=email)
                        if user.role != 'SuperAdmin':
                            # Add a header to indicate this might be a default password
                            response['X-Default-Password'] = 'true'
                    except User.DoesNotExist:
                        pass
            except Exception as e:
                # Don't crash if there's an error
                print(f"Error in DefaultPasswordFlagMiddleware: {e}")
                
        return response 


class ActivityLogMiddleware:
    """Middleware to log user activities"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Define which URLs and methods to log
        self.logged_patterns = [
            # User management
            (r'^/api/users/', {
                'POST': 'CREATE',
                'PUT': 'UPDATE',
                'DELETE': 'DELETE',
                'GET': 'VIEW'
            }),
            # Authentication
            (r'^/api/token/', {
                'POST': 'LOGIN',
                'DELETE': 'LOGOUT'
            }),
            # Students
            (r'^/api/students/', {
                'POST': 'CREATE',
                'PUT': 'UPDATE',
                'DELETE': 'DELETE',
                'GET': 'VIEW'
            }),
            # Employees
            (r'^/api/employees/', {
                'POST': 'CREATE',
                'PUT': 'UPDATE',
                'DELETE': 'DELETE',
                'GET': 'VIEW'
            }),
            # Branches
            (r'^/api/branches/', {
                'POST': 'CREATE',
                'PUT': 'UPDATE',
                'DELETE': 'DELETE',
                'GET': 'VIEW'
            }),
            # Jobs
            (r'^/api/jobs/', {
                'POST': 'CREATE',
                'PUT': 'UPDATE',
                'DELETE': 'DELETE',
                'GET': 'VIEW'
            }),
            # Leads
            (r'^/api/leads/', {
                'POST': 'CREATE',
                'PUT': 'UPDATE',
                'DELETE': 'DELETE',
                'GET': 'VIEW'
            }),
            # Blogs
            (r'^/api/blogs/', {
                'POST': 'CREATE',
                'PUT': 'UPDATE',
                'DELETE': 'DELETE',
                'GET': 'VIEW'
            }),
        ]
    
    def __call__(self, request):
        # Get response first
        response = self.get_response(request)
        
        # Only log if user is authenticated
        if not request.user.is_authenticated:
            return response
            
        # Check if this request should be logged
        for pattern, methods in self.logged_patterns:
            if re.match(pattern, request.path):
                # Get the action type based on HTTP method
                action_type = methods.get(request.method, 'OTHER')
                
                # Get the model name from the URL
                model_name = request.path.split('/')[2].upper()
                
                # Create activity log
                from .models import User, ActivityLog, Branch
                
                # Only log POST, PUT, PATCH, and DELETE actions
                if request.method not in ['POST', 'PUT', 'PATCH', 'DELETE']:
                    return self.get_response(request)
                
                # Extract entity type from path
                path_parts = request.path.split('/')
                entity_type = path_parts[2] if len(path_parts) > 2 else ''
                action_details = ''
                if request.method == 'POST':
                    if entity_type == 'students':
                        action_details = f"{request.user.get_full_name()} added a new student"
                    elif entity_type == 'employees':
                        action_details = f"{request.user.get_full_name()} added a new employee"
                    elif entity_type == 'branches':
                        action_details = f"{request.user.get_full_name()} added a new branch"
                    elif entity_type == 'jobs':
                        action_details = f"{request.user.get_full_name()} created a job"
                    elif entity_type == 'leads':
                        action_details = f"{request.user.get_full_name()} created a lead"
                    elif entity_type == 'blogs':
                        action_details = f"{request.user.get_full_name()} created a blog"
                elif request.method in ['PUT', 'PATCH']:
                    entity_id = path_parts[-2] if len(path_parts) > 3 else 'unknown'
                    if entity_type == 'students':
                        action_details = f"{request.user.get_full_name()} updated student details"
                    elif entity_type == 'employees':
                        action_details = f"{request.user.get_full_name()} updated employee details"
                    elif entity_type == 'branches':
                        action_details = f"{request.user.get_full_name()} updated branch details"
                    elif entity_type == 'jobs':
                        action_details = f"{request.user.get_full_name()} updated a job"
                    elif entity_type == 'leads':
                        action_details = f"{request.user.get_full_name()} updated a lead"
                    elif entity_type == 'blogs':
                        action_details = f"{request.user.get_full_name()} updated a blog"
                elif request.method == 'DELETE':
                    entity_id = path_parts[-2] if len(path_parts) > 3 else 'unknown'
                    if entity_type == 'students':
                        action_details = f"{request.user.get_full_name()} removed a student"
                    elif entity_type == 'employees':
                        action_details = f"{request.user.get_full_name()} removed an employee"
                    elif entity_type == 'branches':
                        action_details = f"{request.user.get_full_name()} removed a branch"
                    elif entity_type == 'jobs':
                        action_details = f"{request.user.get_full_name()} deleted a job"
                    elif entity_type == 'leads':
                        action_details = f"{request.user.get_full_name()} deleted a lead"
                    elif entity_type == 'blogs':
                        action_details = f"{request.user.get_full_name()} deleted a blog"
                
                ActivityLog.objects.create(
                    user=request.user,
                    action_type=action_type,
                    action_model=model_name,
                    action_details=action_details,
                    ip_address=request.META.get('REMOTE_ADDR')
                )
                break
        
        return response