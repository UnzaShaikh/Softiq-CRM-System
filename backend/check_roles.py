import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from project_settings.models import Role
from django.contrib.auth import get_user_model
from user_profile.models import UserProfile

User = get_user_model()

print("=== ALL ROLES AND THEIR PERMISSIONS ===")
for role in Role.objects.all():
    print(f"\n--- {role.name} (id={role.id}, is_system={role.is_system}) ---")
    for mod, perms in role.permissions.items():
        actions = [a for a, v in perms.items() if v]
        print(f"  {mod:<15}: {actions if actions else 'NONE'}")

print("\n\n=== USERS AND THEIR ROLES ===")
for u in User.objects.all():
    try:
        profile = u.profile
        role_id = profile.role
        if role_id:
            role = Role.objects.get(pk=int(role_id))
            role_name = role.name
        else:
            role_name = "(no role)"
    except Exception:
        role_name = "(no profile)"
    print(f"{u.username:<20} email={u.email:<35} is_staff={str(u.is_staff):<8} role={role_name}")
