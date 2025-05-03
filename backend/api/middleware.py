from django.http import HttpResponseForbidden
from django.urls import resolve
import re
from rest_framework_simplejwt.authentication import JWTAuthentication


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