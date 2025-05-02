from rest_framework import serializers
from .models import (
    User, Branch, Employee, Student, Lead, 
    Job, JobResponse, Blog
)
from django.contrib.auth.password_validation import validate_password
import uuid
from datetime import date


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
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
    profile_image = serializers.ImageField(required=False)
    citizenship_document = serializers.FileField(required=False)
    nationality = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    gender = serializers.CharField(required=False, default='Other')
    dob = serializers.DateField(required=False, allow_null=True)
    
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
            
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.email = user_data.get('email', user.email)
            
            if 'role' in user_data:
                user.role = user_data.get('role')
                
            if 'password' in user_data:
                user.set_password(user_data['password'])
                
            user.save()
            
        return super().update(instance, validated_data)


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    student_id = serializers.CharField(read_only=True)
    enrollment_date = serializers.DateField(read_only=True)
    profile_image = serializers.ImageField(required=False)
    resume = serializers.FileField(required=False)
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'branch', 'branch_name', 'student_id', 
                  'enrollment_date', 'age', 'gender', 'nationality',
                  'contact_number', 'address', 'institution_name', 'language_test',
                  'profile_image', 'emergency_contact', 'mother_name',
                  'father_name', 'parent_number', 'resume', 'comments',
                  'created_at', 'updated_at']
        
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = 'Student'
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
            
        return super().update(instance, validated_data)


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


class JobSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'requirements', 
                  'location', 'branch', 'branch_name', 'salary_range', 
                  'is_active', 'created_by', 'created_by_name', 
                  'created_at', 'updated_at']
        read_only_fields = ['created_by']
        
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