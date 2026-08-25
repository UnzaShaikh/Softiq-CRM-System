from django.contrib import admin

from .models import ProjectSettings, Role


@admin.register(ProjectSettings)
class ProjectSettingsAdmin(admin.ModelAdmin):
    list_display = ("project_name", "project_code", "company_name", "updated_at")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "access_level", "is_system", "users_assigned")
