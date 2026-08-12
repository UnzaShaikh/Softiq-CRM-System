from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, NoteCategoryViewSet

router = DefaultRouter()
router.register(r"notes", NoteViewSet, basename="note")
router.register(r"note-categories", NoteCategoryViewSet, basename="note-category")

urlpatterns = router.urls