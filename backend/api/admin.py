from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import (
    User, Branch, Employee, Student, Lead,
    Job, JobResponse, Blog
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
    list_display = ('get_student_name', 'branch', 'student_id', 'course', 'enrollment_date', 'fee_status')
    list_filter = ('branch', 'course', 'fee_status')
    search_fields = ('user__first_name', 'user__last_name', 'student_id', 'course')
    
    def get_student_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_student_name.short_description = 'Name'


class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'branch', 'course_interest', 'status', 'created_by')
    list_filter = ('branch', 'status', 'course_interest')
    search_fields = ('name', 'email', 'phone')


class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'branch', 'location', 'is_active', 'created_by')
    list_filter = ('branch', 'is_active')
    search_fields = ('title', 'description', 'requirements')


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


# Register models
admin.site.register(User, UserAdmin)
admin.site.register(Branch, BranchAdmin)
admin.site.register(Employee, EmployeeAdmin)
admin.site.register(Student, StudentAdmin)
admin.site.register(Lead, LeadAdmin)
admin.site.register(Job, JobAdmin)
admin.site.register(JobResponse, JobResponseAdmin)
admin.site.register(Blog, BlogAdmin)
