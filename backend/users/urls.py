from rest_framework.routers import DefaultRouter

from .views import AdminUserViewSet


router = DefaultRouter()

router.register(
    r"admin",
    AdminUserViewSet,
    basename="admin-users",
)


urlpatterns = router.urls