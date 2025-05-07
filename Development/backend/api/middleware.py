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
            # Blogs
            (r'^/api/blogs/', {
                'POST': 'CREATE',
                'PUT': 'UPDATE',
                'PATCH': 'UPDATE',
                'DELETE': 'DELETE',
                'GET': 'VIEW'
            }),
            # Jobs
            (r'^/api/jobs/', {
                'POST': 'CREATE',
                'PUT': 'UPDATE',
                'PATCH': 'UPDATE',
                'DELETE': 'DELETE',
                'GET': 'VIEW'
            }),
        ]
    
    def __call__(self, request):
        # Debug: Print path, method, and authentication status
        print(f"[ActivityLogMiddleware] Path: {request.path}, Method: {request.method}, Auth: {getattr(request.user, 'is_authenticated', False)}")
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
                if len(path_parts) > 2:
                    entity_type = path_parts[2]  # e.g., 'students', 'employees', etc.
                    print(f"[ActivityLogMiddleware] entity_type: {entity_type}")
                    action_details = None
                    if request.method == 'POST':
                        # Handle creation
                        try:
                            import json
                            if hasattr(request, '_body'):
                                data = json.loads(request._body.decode('utf-8'))
                            elif hasattr(request, 'POST'):
                                data = request.POST.dict()
                            else:
                                data = {}
                            print(f"[ActivityLogMiddleware] data: {data}")
                            if 'student_data' in data:
                                student_data = json.loads(data['student_data'])
                                if entity_type == 'students':
                                    from .models import Branch
                                    branch_id = student_data.get('branch')
                                    try:
                                        branch = Branch.objects.get(id=branch_id)
                                        branch_name = branch.name
                                    except Branch.DoesNotExist:
                                        branch_name = str(branch_id)
                                    first_name = request.POST.get('user.first_name', '')
                                    last_name = request.POST.get('user.last_name', '')
                                    name = f"{first_name} {last_name}".strip()
                                    action_details = f"{request.user.get_full_name()} added student {name} in {branch_name}"
                            elif isinstance(data, dict):
                                if entity_type == 'employees':
                                    employee_data = data.get('employee_data')
                                    if employee_data:
                                        try:
                                            employee_data = json.loads(employee_data)
                                            branch_id = employee_data.get('branch')
                                        except json.JSONDecodeError:
                                            branch_id = None
                                    else:
                                        branch_id = None
                                    role = data.get('user.role', '')
                                    first_name = data.get('user.first_name', '')
                                    last_name = data.get('user.last_name', '')
                                    try:
                                        branch = Branch.objects.get(id=branch_id) if branch_id else None
                                        branch_name = branch.name if branch else 'Unknown Branch'
                                    except Branch.DoesNotExist:
                                        branch_name = str(branch_id)
                                    name = f"{first_name} {last_name}".strip()
                                    action_details = f"{request.user.get_full_name()} added {role} {name} in {branch_name}"
                                elif entity_type == 'branches':
                                    branch_name = data.get('name', '')
                                    action_details = f"{request.user.get_full_name()} added branch {branch_name}"
                                elif entity_type == 'blogs':
                                    title = data.get('title', '')
                                    action_details = f"{request.user.get_full_name()} added blog '{title}'"
                                elif entity_type == 'jobs':
                                    title = data.get('title', '')
                                    action_details = f"{request.user.get_full_name()} added job '{title}'"
                        except (json.JSONDecodeError, UnicodeDecodeError, AttributeError) as e:
                            print(f"[ActivityLogMiddleware] Exception in POST data parsing: {e}")
                            return self.get_response(request)
                    elif request.method in ['PUT', 'PATCH']:
                        entity_id = path_parts[-2] if len(path_parts) > 3 else 'unknown'
                        if entity_type == 'students':
                            action_details = f"{request.user.get_full_name()} updated student details"
                        elif entity_type == 'employees':
                            action_details = f"{request.user.get_full_name()} updated employee details"
                        elif entity_type == 'branches':
                            action_details = f"{request.user.get_full_name()} updated branch details"
                        elif entity_type == 'blogs':
                            action_details = f"{request.user.get_full_name()} updated blog"
                        elif entity_type == 'jobs':
                            action_details = f"{request.user.get_full_name()} updated job"
                    elif request.method == 'DELETE':
                        entity_id = path_parts[-2] if len(path_parts) > 3 else 'unknown'
                        if entity_type == 'students':
                            action_details = f"{request.user.get_full_name()} removed a student"
                        elif entity_type == 'employees':
                            action_details = f"{request.user.get_full_name()} removed an employee"
                        elif entity_type == 'branches':
                            action_details = f"{request.user.get_full_name()} removed a branch"
                        elif entity_type == 'blogs':
                            action_details = f"{request.user.get_full_name()} removed a blog"
                        elif entity_type == 'jobs':
                            action_details = f"{request.user.get_full_name()} removed a job"
                    if action_details:
                        ActivityLog.objects.create(
                            user=request.user,
                            action_type=action_type,
                            action_model=model_name,
                            action_details=action_details,
                            ip_address=request.META.get('REMOTE_ADDR')
                        )
                        print(f"[ActivityLogMiddleware] Logged: {action_type} {model_name} - {action_details}")
                break
        
        return response