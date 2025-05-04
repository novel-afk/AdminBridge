from rest_framework import permissions
# from guardian.shortcuts import get_objects_for_user  # Temporarily commented out


class IsSuperAdmin(permissions.BasePermission):
    """
    Allows access only to SuperAdmin users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'SuperAdmin'


class IsBranchManager(permissions.BasePermission):
    """
    Allows access only to BranchManager users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'BranchManager'


class IsCounsellor(permissions.BasePermission):
    """
    Allows access only to Counsellor users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'Counsellor'


class IsReceptionist(permissions.BasePermission):
    """
    Allows access only to Receptionist users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'Receptionist'


class IsBankManager(permissions.BasePermission):
    """
    Allows access only to BankManager users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'BankManager'


class IsStudent(permissions.BasePermission):
    """
    Permission to only allow students to access their own data.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'Student'
    
    def has_object_permission(self, request, view, obj):
        # Check if the object has a user field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # If the object has a student field
        if hasattr(obj, 'student'):
            return obj.student.user == request.user
        
        return False


class BelongsToBranch(permissions.BasePermission):
    """
    Object-level permission to only allow users to access objects from their own branch.
    """
    def has_object_permission(self, request, view, obj):
        # SuperAdmin can access any branch
        if request.user.role == 'SuperAdmin':
            return True
            
        # Get the user's branch
        user_branch = None
        if hasattr(request.user, 'employee_profile'):
            user_branch = request.user.employee_profile.branch
        elif hasattr(request.user, 'student_profile'):
            user_branch = request.user.student_profile.branch
            
        # Check if the object belongs to the user's branch
        if hasattr(obj, 'branch'):
            return obj.branch == user_branch
        
        # For objects like User that don't have a direct branch field
        if hasattr(obj, 'employee_profile') and obj.employee_profile:
            return obj.employee_profile.branch == user_branch
        if hasattr(obj, 'student_profile') and obj.student_profile:
            return obj.student_profile.branch == user_branch
            
        return False


class BranchManagerPermission(permissions.BasePermission):
    """
    Complex permission for BranchManager:
    - Can manage employees and students in their branch
    - Can CRU leads in their branch
    - Can CRUD blogs and jobs in their branch
    - Can view and manage job responses related to jobs they created
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated or request.user.role != 'BranchManager':
            return False
            
        # For Lead, don't allow DELETE operation
        if hasattr(view, 'queryset') and view.queryset.model.__name__ == 'Lead' and request.method == 'DELETE':
            return False
            
        # For list views, we'll filter in the queryset
        # Allow permission here and filter in get_queryset
        return True
        
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated or request.user.role != 'BranchManager':
            return False
            
        # Get manager's branch
        manager_branch = request.user.employee_profile.branch
        
        # Check object type and permissions
        model_name = obj.__class__.__name__
        
        # For Employee and Student, check branch
        if model_name in ['Employee', 'Student']:
            return obj.branch == manager_branch
            
        # For Lead, check branch (CRU permissions)
        elif model_name == 'Lead':
            if request.method == 'DELETE':
                return False
            return obj.branch == manager_branch
            
        # For Blog and Job, check branch
        elif model_name in ['Blog', 'Job']:
            return obj.branch == manager_branch
            
        # For JobResponse, check if related to a job created by the manager
        elif model_name == 'JobResponse':
            return obj.job.created_by == request.user and obj.job.branch == manager_branch
            
        return False


class CounsellorPermission(permissions.BasePermission):
    """
    Complex permission for Counsellors:
    - Can CRU students in their branch
    - Can CRU leads in their branch 
    - Can view employees in their branch
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated or request.user.role != 'Counsellor':
            return False
            
        # For list views, we'll filter in get_queryset
        return True
        
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated or request.user.role != 'Counsellor':
            return False
            
        # Get counsellor's branch
        counsellor_branch = request.user.employee_profile.branch
        
        # Check object type and permissions
        model_name = obj.__class__.__name__
        
        # For Student, check branch and allow CRU
        if model_name == 'Student':
            if request.method == 'DELETE':
                return False
            return obj.branch == counsellor_branch
            
        # For Lead, check branch and allow CRU
        elif model_name == 'Lead':
            if request.method == 'DELETE':
                return False
            return obj.branch == counsellor_branch
            
        # For Employee, check branch and allow view only
        elif model_name == 'Employee':
            if request.method not in permissions.SAFE_METHODS:
                return False
            return obj.branch == counsellor_branch
            
        return False


class ReceptionistPermission(permissions.BasePermission):
    """
    Complex permission for Receptionists:
    - Can create/view leads in their branch
    - Can view students and employees in their branch
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated or request.user.role != 'Receptionist':
            return False
            
        # For list views, we'll filter in get_queryset
        model_name = view.queryset.model.__name__
        
        # For Lead, allow create
        if model_name == 'Lead' and request.method == 'POST':
            return True
            
        # For Lead, Student, Employee allow view
        if model_name in ['Lead', 'Student', 'Employee'] and request.method in permissions.SAFE_METHODS:
            return True
            
        return False
        
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated or request.user.role != 'Receptionist':
            return False
            
        # Get receptionist's branch
        receptionist_branch = request.user.employee_profile.branch
        
        # Check object type and permissions
        model_name = obj.__class__.__name__
        
        # For Lead, Student, Employee, check branch and allow view
        if model_name in ['Lead', 'Student', 'Employee']:
            if request.method not in permissions.SAFE_METHODS:
                # For Lead, allow update on objects created by the receptionist
                if model_name == 'Lead' and obj.created_by == request.user:
                    return True
                return False
            return obj.branch == receptionist_branch
            
        return False 