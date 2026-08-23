from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ChecklistItemViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'checklist-items', ChecklistItemViewSet, basename='checklist-item')

urlpatterns = [
    path('', include(router.urls)),
]