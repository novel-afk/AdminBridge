from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    def _create_user(self, email, password=None, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        
        # Set default password for non-SuperAdmin roles
        if not password and extra_fields.get('role') and extra_fields.get('role') != 'SuperAdmin':
            password = 'Nepal@123'
            
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'SuperAdmin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model with roles"""
    ROLE_CHOICES = (
        ('SuperAdmin', 'SuperAdmin'),
        ('BranchManager', 'BranchManager'),
        ('Counsellor', 'Counsellor'),
        ('Receptionist', 'Receptionist'),
        ('BankManager', 'BankManager'),
        ('Student', 'Student'),
    )
    
    username = None
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    # Add related_name to avoid clashes with auth.User
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name=_('groups'),
        blank=True,
        help_text=_(
            'The groups this user belongs to. A user will get all permissions '
            'granted to each of their groups.'
        ),
        related_name='api_user_set',
        related_query_name='api_user'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name='api_user_set',
        related_query_name='api_user'
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']
    
    objects = UserManager()
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"
        
    def set_default_password(self):
        """Set the default password for non-SuperAdmin users"""
        if self.role != 'SuperAdmin':
            self.set_password('Nepal@123')
            self.save(update_fields=['password'])
            return True
        return False


class Branch(models.Model):
    """Branch model representing different locations"""
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        if self.city and self.country:
            return f"{self.name} ({self.city}, {self.country})"
        return self.name


class Employee(models.Model):
    """Employee model connected to User"""
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )
    
    # Basic Information
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='employees')
    employee_id = models.CharField(max_length=50, unique=True)
    joining_date = models.DateField(null=True, blank=True)
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # Check if this employee is a branch manager
        if self.user.role == 'BranchManager':
            # Check if there's already a branch manager for this branch
            existing_manager = Employee.objects.filter(
                branch=self.branch,
                user__role='BranchManager'
            ).exclude(id=self.id).first()
            
            if existing_manager:
                raise ValidationError({
                    'branch': f'Branch {self.branch.name} already has a manager: {existing_manager.user.get_full_name()}'
                })
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    # New Required Fields (nullable for migration, but should be filled)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    dob = models.DateField(verbose_name="Date of Birth", blank=True, null=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    contact_number = models.CharField(max_length=20)
    address = models.TextField()
    
    # Optional Fields
    profile_image = models.ImageField(upload_to='employee_profiles/', blank=True, null=True)
    emergency_contact = models.CharField(max_length=20, blank=True, null=True)
    citizenship_document = models.FileField(upload_to='employee_documents/', blank=True, null=True, 
                                          help_text="Upload citizenship document (PDF only)")
    
    # System Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.user.role}"


class Student(models.Model):
    """Student model connected to User"""
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )
    
    LANGUAGE_TEST_CHOICES = (
        ('IELTS', 'IELTS'),
        ('PTE', 'PTE'),
        ('TOEFL', 'TOEFL'),
        ('None', 'None'),
    )
    
    # Basic Information
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='students')
    student_id = models.CharField(max_length=50, unique=True)
    enrollment_date = models.DateField(auto_now_add=True)
    
    # Required Fields
    age = models.IntegerField(default=18)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Other')
    nationality = models.CharField(max_length=100, default='Unknown')
    contact_number = models.CharField(max_length=20)
    address = models.TextField()
    
    # School/College Information
    institution_name = models.CharField(max_length=200, verbose_name="College/School Name", default='Unknown')
    language_test = models.CharField(max_length=10, choices=LANGUAGE_TEST_CHOICES, default='None')
    
    # Optional Fields
    profile_image = models.ImageField(upload_to='student_profiles/', blank=True, null=True)
    emergency_contact = models.CharField(max_length=20, blank=True, null=True)
    mother_name = models.CharField(max_length=100, blank=True, null=True)
    father_name = models.CharField(max_length=100, blank=True, null=True)
    parent_number = models.CharField(max_length=20, blank=True, null=True)
    resume = models.FileField(upload_to='student_resumes/', blank=True, null=True,
                            help_text="Upload CV/Resume (PDF only)")
    
    # System Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.institution_name}"


class Lead(models.Model):
    """Lead model for prospective students"""
    LEAD_SOURCE_CHOICES = (
        ('Website', 'Website'),
        ('Social Media', 'Social Media'),
        ('Referral', 'Referral'),
        ('Walk-in', 'Walk-in'),
        ('Phone Inquiry', 'Phone Inquiry'),
        ('Email', 'Email'),
        ('Event', 'Event'),
        ('Other', 'Other'),
    )
    
    DEGREE_CHOICES = (
        ('Diploma', 'Diploma'),
        ('Bachelor', 'Bachelor'),
        ('Master', 'Master'),
        ('PhD', 'PhD'),
    )
    
    COUNTRY_CHOICES = (
        ('USA', 'USA'),
        ('UK', 'UK'),
        ('Canada', 'Canada'),
        ('Australia', 'Australia'),
        ('New Zealand', 'New Zealand'),
        ('Germany', 'Germany'),
        ('France', 'France'),
        ('Japan', 'Japan'),
        ('Singapore', 'Singapore'),
        ('South Korea', 'South Korea'),
    )
    
    LANGUAGE_TEST_CHOICES = (
        ('None', 'None'),
        ('IELTS', 'IELTS'),
        ('TOEFL', 'TOEFL'),
        ('N1', 'N1'),
        ('N2', 'N2'),
        ('N3', 'N3'),
    )
    
    # Required Fields
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    nationality = models.CharField(max_length=100)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='leads')
    
    # Optional Fields
    interested_country = models.CharField(max_length=50, choices=COUNTRY_CHOICES, blank=True, null=True)
    interested_degree = models.CharField(max_length=20, choices=DEGREE_CHOICES, blank=True, null=True)
    language_test = models.CharField(max_length=10, choices=LANGUAGE_TEST_CHOICES, default='None')
    language_score = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    referred_by = models.CharField(max_length=100, blank=True, null=True)
    courses_studied = models.CharField(max_length=200, blank=True, null=True)
    interested_course = models.CharField(max_length=200, blank=True, null=True)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    lead_source = models.CharField(max_length=50, choices=LEAD_SOURCE_CHOICES, default='Other')
    notes = models.TextField(blank=True, null=True)
    
    # System Fields
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_leads')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_leads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.interested_course or 'No course specified'}"


class Job(models.Model):
    """Job posting model"""
    JOB_TYPE_CHOICES = (
        ('Full-Time', 'Full-Time'),
        ('Part-Time', 'Part-Time'),
        ('Contract', 'Contract'),
        ('Internship', 'Internship'),
        ('Remote', 'Remote'),
    )
    
    title = models.CharField(max_length=100)
    description = models.TextField()
    requirements = models.TextField()
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='jobs')
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='Full-Time')
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_jobs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    location = models.CharField(max_length=255, default='Not specified')
    required_experience = models.CharField(max_length=255, default='Not specified')
    
    def __str__(self):
        return self.title


class JobResponse(models.Model):
    """Job application responses"""
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='responses')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    resume = models.FileField(upload_to='resumes/')
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='New')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.job.title}"


class Blog(models.Model):
    """Blog model for articles and announcements"""
    title = models.CharField(max_length=200)
    content = models.TextField()
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='blogs')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blogs')
    featured_image = models.ImageField(upload_to='blog_images/', blank=True, null=True)
    is_published = models.BooleanField(default=False)
    published_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title


class EmployeeAttendance(models.Model):
    """Employee attendance tracking model"""
    ATTENDANCE_STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Half Day', 'Half Day'),
        ('On Leave', 'On Leave'),
    )
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS_CHOICES, default='Present')
    remarks = models.TextField(blank=True, null=True)
    
    # For tracking who made changes
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='employee_attendance_created')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='employee_attendance_updated')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['-date', 'employee__user__first_name']
    
    def __str__(self):
        return f"{self.employee.user.first_name} {self.employee.user.last_name} - {self.date} - {self.status}"


class StudentAttendance(models.Model):
    """Student attendance tracking model"""
    ATTENDANCE_STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Half Day', 'Half Day'),
        ('On Leave', 'On Leave'),
    )
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS_CHOICES, default='Present')
    remarks = models.TextField(blank=True, null=True)
    
    # For tracking who made changes
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='student_attendance_created')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='student_attendance_updated')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('student', 'date')
        ordering = ['-date', 'student__user__first_name']
    
    def __str__(self):
        return f"{self.student.user.first_name} {self.student.user.last_name} - {self.date} - {self.status}"


class ActivityLog(models.Model):
    """Activity log model to track user actions"""
    ACTION_TYPES = (
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('VIEW', 'View'),
        ('OTHER', 'Other'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    action_model = models.CharField(max_length=50, help_text='The model/table being acted upon')
    action_details = models.TextField(help_text='Details of the action performed')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.action_type} - {self.created_at}"
