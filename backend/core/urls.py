from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from users.views import register_view, EmailTokenObtainPairView   # 👈 import the custom view

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT Auth endpoints
    path('api/auth/login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),  # 👈 replaced
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/auth/register/', register_view, name='register'),

    # Dashboard
    path('api/', include('dashboard.urls')),
]