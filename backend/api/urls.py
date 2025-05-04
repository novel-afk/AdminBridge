from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, BranchViewSet, EmployeeViewSet, StudentViewSet,
    LeadViewSet, JobViewSet, JobResponseViewSet, BlogViewSet,
    StudentProfileView, StudentJobResponseView, StudentJobResponseListView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'branches', BranchViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'students', StudentViewSet)
router.register(r'leads', LeadViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'job-responses', JobResponseViewSet)
router.register(r'blogs', BlogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # JWT Authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Student portal endpoints
    path('student-profile/', StudentProfileView.as_view(), name='student-profile'),
    path('job-responses/', StudentJobResponseView.as_view(), name='job-responses'),
    path('my-job-applications/', StudentJobResponseListView.as_view(), name='my-job-applications'),
] 