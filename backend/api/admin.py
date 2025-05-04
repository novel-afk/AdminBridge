from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import (
    User, Branch, Employee, Student, Lead,
    Job, JobResponse, Blog, StudentAttendance, EmployeeAttendance
)

class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Role'), {'fields': ('role',)}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                      'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'role'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)


class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('get_employee_name', 'employee_id', 'get_role', 'branch', 'gender', 'nationality', 'salary')
    list_filter = ('branch', 'user__role', 'gender', 'nationality')
    search_fields = ('user__first_name', 'user__last_name', 'employee_id', 'user__role', 'nationality')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'employee_id', 'branch', 'gender', 'dob', 'nationality')
        }),
        ('Contact Information', {
            'fields': ('contact_number', 'emergency_contact', 'address')
        }),
        ('Employment Details', {
            'fields': ('salary',)
        }),
        ('Documents', {
            'fields': ('profile_image', 'citizenship_document')
        }),
    )
    
    def get_employee_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_employee_name.short_description = 'Name'
    
    def get_role(self, obj):
        return obj.user.role
    get_role.short_description = 'Role'


class StudentAdmin(admin.ModelAdmin):
    list_display = ('get_student_name', 'branch', 'student_id', 'age', 'gender', 'institution_name', 'language_test')
    list_filter = ('branch', 'gender', 'language_test', 'nationality')
    search_fields = ('user__first_name', 'user__last_name', 'student_id', 'institution_name', 'nationality')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'student_id', 'branch', 'age', 'gender', 'nationality')
        }),
        ('Education Information', {
            'fields': ('institution_name', 'language_test')
        }),
        ('Contact Information', {
            'fields': ('contact_number', 'emergency_contact', 'address')
        }),
        ('Family Information', {
            'fields': ('mother_name', 'father_name', 'parent_number')
        }),
        ('Documents & Notes', {
            'fields': ('profile_image', 'resume', 'comments')
        }),
    )
    
    def get_student_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_student_name.short_description = 'Name'


class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'nationality', 'branch', 'interested_course', 'lead_source', 'created_by')
    list_filter = ('branch', 'lead_source', 'interested_degree', 'interested_country', 'language_test')
    search_fields = ('name', 'email', 'phone', 'nationality', 'interested_course')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'email', 'phone', 'nationality', 'branch', 'lead_source')
        }),
        ('Education Interests', {
            'fields': ('interested_country', 'interested_degree', 'interested_course', 'courses_studied', 'gpa')
        }),
        ('Language Information', {
            'fields': ('language_test', 'language_score')
        }),
        ('Additional Information', {
            'fields': ('referred_by', 'notes')
        }),
        ('Assignment', {
            'fields': ('created_by', 'assigned_to')
        }),
    )


class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'branch', 'job_type', 'is_active', 'created_by')
    list_filter = ('branch', 'job_type', 'is_active')
    search_fields = ('title', 'description', 'requirements')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'branch', 'job_type', 'is_active')
        }),
        ('Job Details', {
            'fields': ('description', 'requirements', 'salary_range')
        }),
        ('System Information', {
            'fields': ('created_by',)
        }),
    )


class JobResponseAdmin(admin.ModelAdmin):
    list_display = ('name', 'job', 'email', 'status', 'created_at')
    list_filter = ('job', 'status')
    search_fields = ('name', 'email', 'job__title')


class BlogAdmin(admin.ModelAdmin):
    list_display = ('title', 'branch', 'author', 'is_published', 'published_date')
    list_filter = ('branch', 'is_published')
    search_fields = ('title', 'content')


class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'country', 'address')
    list_filter = ('country', 'city')
    search_fields = ('name', 'city', 'country', 'address')
    
    fieldsets = (
        ('Branch Information', {
            'fields': ('name', 'country', 'city', 'address')
        }),
    )


class StudentAttendanceAdmin(admin.ModelAdmin):
    list_display = ('get_student_name', 'date', 'time_in', 'time_out', 'status', 'created_by')
    list_filter = ('date', 'status', 'student__branch')
    search_fields = ('student__user__first_name', 'student__user__last_name', 'student__student_id')
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Attendance Information', {
            'fields': ('student', 'date', 'time_in', 'time_out', 'status')
        }),
        ('Additional Information', {
            'fields': ('remarks', 'created_by', 'updated_by')
        }),
    )
    
    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"
    get_student_name.short_description = 'Student Name'


class EmployeeAttendanceAdmin(admin.ModelAdmin):
    list_display = ('get_employee_name', 'get_role', 'date', 'time_in', 'time_out', 'status', 'created_by')
    list_filter = ('date', 'status', 'employee__branch')
    search_fields = ('employee__user__first_name', 'employee__user__last_name', 'employee__employee_id')
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Attendance Information', {
            'fields': ('employee', 'date', 'time_in', 'time_out', 'status')
        }),
        ('Additional Information', {
            'fields': ('remarks', 'created_by', 'updated_by')
        }),
    )
    
    def get_employee_name(self, obj):
        return f"{obj.employee.user.first_name} {obj.employee.user.last_name}"
    get_employee_name.short_description = 'Employee Name'
    
    def get_role(self, obj):
        return obj.employee.user.role
    get_role.short_description = 'Role'


# Register models
admin.site.register(User, UserAdmin)
admin.site.register(Branch, BranchAdmin)
admin.site.register(Employee, EmployeeAdmin)
admin.site.register(Student, StudentAdmin)
admin.site.register(Lead, LeadAdmin)
admin.site.register(Job, JobAdmin)
admin.site.register(JobResponse, JobResponseAdmin)
admin.site.register(Blog, BlogAdmin)
admin.site.register(StudentAttendance, StudentAttendanceAdmin)
admin.site.register(EmployeeAttendance, EmployeeAttendanceAdmin)
