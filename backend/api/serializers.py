from rest_framework import serializers
from .models import (
    User, Branch, Employee, Student, Lead, 
    Job, JobResponse, Blog, StudentAttendance, EmployeeAttendance, ActivityLog
)
from django.contrib.auth.password_validation import validate_password
import uuid
from datetime import date


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    branch = serializers.SerializerMethodField()
    branch_name = serializers.SerializerMethodField()
    
    def get_branch(self, obj):
        if obj.role == 'BranchManager' and hasattr(obj, 'employee_profile') and obj.employee_profile.branch:
            return obj.employee_profile.branch.id
        return None

    def get_branch_name(self, obj):
        if obj.role == 'BranchManager' and hasattr(obj, 'employee_profile') and obj.employee_profile.branch:
            return obj.employee_profile.branch.name
        return None

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'password', 'branch', 'branch_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'validators': []}
        }
        
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data['role']
        )
        return user


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    employee_id = serializers.CharField(read_only=True)
    joining_date = serializers.DateField(read_only=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)
    citizenship_document = serializers.FileField(required=False, allow_null=True)
    nationality = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    dob = serializers.DateField(required=False, allow_null=True)
    
    def validate(self, data):
        # Get the user data and branch
        user_data = data.get('user', {})
        role = user_data.get('role')
        branch = data.get('branch')
        
        # If this is a branch manager
        if role == 'BranchManager' and branch:
            # Check if there's already a branch manager for this branch
            instance_id = self.instance.id if self.instance else None
            existing_manager = Employee.objects.filter(
                branch=branch,
                user__role='BranchManager'
            ).exclude(id=instance_id).first()
            
            if existing_manager:
                raise serializers.ValidationError({
                    'branch': f'Branch {branch.name} already has a manager: {existing_manager.user.get_full_name()}'
                })
        
        return data
    
    class Meta:
        model = Employee
        fields = ['id', 'user', 'branch', 'branch_name', 'employee_id', 
                  'joining_date', 'salary', 'contact_number', 'address', 
                  'profile_image', 'citizenship_document', 'emergency_contact',
                  'nationality', 'gender', 'dob',
                  'created_at', 'updated_at']
        
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = UserSerializer().create(user_data)
        
        # Generate unique employee ID
        employee_id = f"EMP{str(uuid.uuid4())[:8].upper()}"
        
        # Set joining date to today
        joining_date = date.today()
        
        employee = Employee.objects.create(
            user=user, 
            employee_id=employee_id,
            joining_date=joining_date,
            **validated_data
        )
        return employee
        
    def update(self, instance, validated_data):
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            user = instance.user
            
            # Update user fields directly in the database to bypass validation
            User.objects.filter(id=user.id).update(
                first_name=user_data.get('first_name', user.first_name),
                last_name=user_data.get('last_name', user.last_name),
                email=user_data.get('email', user.email),
                role=user_data.get('role', user.role)
            )
            
            if 'password' in user_data:
                user.set_password(user_data['password'])
                user.save()
            
        return super().update(instance, validated_data)


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    student_id = serializers.CharField(read_only=True)
    enrollment_date = serializers.DateField(read_only=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)
    resume = serializers.FileField(required=False, allow_null=True)
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'branch', 'branch_name', 'student_id', 
                  'enrollment_date', 'age', 'gender', 'nationality',
                  'contact_number', 'address', 'institution_name', 'language_test',
                  'profile_image', 'emergency_contact', 'mother_name',
                  'father_name', 'parent_number', 'resume',
                  'created_at', 'updated_at']
        
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = UserSerializer().create(user_data)
        # Generate unique student ID
        student_id = f"STD{str(uuid.uuid4())[:8].upper()}"
        student = Student.objects.create(
            user=user, 
            student_id=student_id,
            **validated_data
        )
        return student
        
    def update(self, instance, validated_data):
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            user = instance.user
            
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.email = user_data.get('email', user.email)
            
            if 'password' in user_data:
                user.set_password(user_data['password'])
                
            user.save()
            
        # Ensure parent fields and resume are updated
        for attr in ['mother_name', 'father_name', 'parent_number', 'resume']:
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])
        
        return super().update(instance, validated_data)


class StudentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Student model with user and branch details"""
    user = UserSerializer(read_only=True)
    branch = BranchSerializer(read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'user', 'branch', 'student_id', 'age', 'gender', 
            'nationality', 'contact_number', 'address', 'institution_name',
            'language_test', 'emergency_contact', 'mother_name', 'father_name',
            'parent_number', 'profile_image', 'enrollment_date'
        ]
        read_only_fields = ['student_id', 'enrollment_date']


class StudentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating student profile details"""
    profile_image = serializers.ImageField(required=False)
    
    class Meta:
        model = Student
        fields = [
            'nationality', 'contact_number', 'address', 'institution_name',
            'language_test', 'emergency_contact', 'mother_name', 'father_name',
            'parent_number', 'profile_image'
        ]


class LeadSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    
    class Meta:
        model = Lead
        fields = ['id', 'name', 'email', 'phone', 'nationality', 
                  'interested_country', 'interested_degree', 'language_test', 
                  'language_score', 'referred_by', 'courses_studied', 
                  'interested_course', 'gpa', 'branch', 'branch_name', 
                  'lead_source', 'notes', 'created_by', 'created_by_name', 
                  'assigned_to', 'assigned_to_name', 
                  'created_at', 'updated_at']
        read_only_fields = ['created_by']
        
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)
        
    def to_representation(self, instance):
        # This improves performance by reducing database queries
        representation = super().to_representation(instance)
        # Add any additional transformations to speed up serialization
        return representation


class JobSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    branch_location = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'requirements', 
                  'branch', 'branch_name', 'branch_location', 'job_type',
                  'salary_range', 'is_active', 'created_by', 'created_by_name', 
                  'created_at', 'updated_at', 'location', 'required_experience']
        read_only_fields = ['created_by']
        
    def get_branch_location(self, obj):
        if obj.branch:
            if obj.branch.city and obj.branch.country:
                return f"{obj.branch.city}, {obj.branch.country}"
            return obj.branch.address
        return ""
        
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)


class JobResponseSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    
    class Meta:
        model = JobResponse
        fields = ['id', 'job', 'job_title', 'name', 'email', 'phone', 
                  'resume', 'cover_letter', 'status', 
                  'created_at', 'updated_at']


class BlogSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    
    class Meta:
        model = Blog
        fields = ['id', 'title', 'content', 'branch', 'branch_name', 
                  'author', 'author_name', 'featured_image', 
                  'is_published', 'published_date', 
                  'created_at', 'updated_at']
        read_only_fields = ['author']
        
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['author'] = user
        return super().create(validated_data)


class EmployeeAttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_role = serializers.SerializerMethodField()
    employee_id = serializers.SerializerMethodField()
    branch_name = serializers.SerializerMethodField()
    
    class Meta:
        model = EmployeeAttendance
        fields = [
            'id', 'employee', 'employee_name', 'employee_role', 'employee_id', 
            'branch_name', 'date', 'time_in', 'time_out', 'status', 'remarks',
            'created_by', 'updated_by', 'created_at', 'updated_at'
        ]
    
    def get_employee_name(self, obj):
        return f"{obj.employee.user.first_name} {obj.employee.user.last_name}"
    
    def get_employee_role(self, obj):
        return obj.employee.user.role
    
    def get_employee_id(self, obj):
        return obj.employee.employee_id
    
    def get_branch_name(self, obj):
        return obj.employee.branch.name
    
    def create(self, validated_data):
        # Set the created_by field if not provided
        request = self.context.get('request')
        if request and not validated_data.get('created_by'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Set the updated_by field
        request = self.context.get('request')
        if request:
            validated_data['updated_by'] = request.user
            
        return super().update(instance, validated_data)


class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    branch_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentAttendance
        fields = [
            'id', 'student', 'student_name', 'student_id', 'branch_name',
            'date', 'time_in', 'time_out', 'status', 'remarks',
            'created_by', 'updated_by', 'created_at', 'updated_at'
        ]
    
    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"
    
    def get_student_id(self, obj):
        return obj.student.student_id
    
    def get_branch_name(self, obj):
        return obj.student.branch.name
    
    def create(self, validated_data):
        # Set the created_by field if not provided
        request = self.context.get('request')
        if request and not validated_data.get('created_by'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Set the updated_by field
        request = self.context.get('request')
        if request:
            validated_data['updated_by'] = request.user
            
        return super().update(instance, validated_data) 


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'user_name', 'user_role', 'action_type', 'action_model', 
                'action_details', 'ip_address', 'created_at']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_user_role(self, obj):
        return obj.user.role