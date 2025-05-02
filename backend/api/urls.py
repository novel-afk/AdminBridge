from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, BranchViewSet, EmployeeViewSet, StudentViewSet,
    LeadViewSet, JobViewSet, JobResponseViewSet, BlogViewSet
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
] 