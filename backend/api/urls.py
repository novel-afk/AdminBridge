from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, BranchViewSet, EmployeeViewSet, StudentViewSet,
    LeadViewSet, JobViewSet, JobResponseViewSet, BlogViewSet,
    StudentProfileView, StudentJobResponseView, StudentJobResponseListView,
    StudentAttendanceViewSet, EmployeeAttendanceViewSet, ActivityLogViewSet,
    admin_stats, branch_manager_stats, counsellor_stats, receptionist_stats, bank_manager_stats,
    CustomTokenObtainPairView
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'branches', BranchViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'students', StudentViewSet)
router.register(r'leads', LeadViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'job-responses', JobResponseViewSet)
router.register(r'blogs', BlogViewSet)
router.register(r'employee-attendance', EmployeeAttendanceViewSet)
router.register(r'student-attendance', StudentAttendanceViewSet)
router.register(r'activity-logs', ActivityLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # JWT Authentication
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Student portal endpoints
    path('student-profile/', StudentProfileView.as_view(), name='student-profile'),
    path('job-responses/', StudentJobResponseView.as_view(), name='job-responses'),
    path('my-job-applications/', StudentJobResponseListView.as_view(), name='my-job-applications'),
    
    # Dashboard stats endpoints
    path('admin/stats/', admin_stats, name='admin-stats'),
    path('branch-manager/stats/', branch_manager_stats, name='branch-manager-stats'),
    path('counsellor/stats/', counsellor_stats, name='counsellor-stats'),
    path('receptionist/stats/', receptionist_stats, name='receptionist-stats'),
    path('bank-manager/stats/', bank_manager_stats, name='bank-manager-stats'),
] 