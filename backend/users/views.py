from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


# ---------- Registration ----------
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user.
    Expects: username, email, password, password2 (and optional first_name, last_name)
    Returns: user data + JWT tokens (access & refresh)
    """
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        },
        status=status.HTTP_201_CREATED,
    )


# ---------- Email‑based login (instead of username) ----------
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer that looks up the user by email instead of username.
    The frontend sends the email in the 'username' field.
    """
    def validate(self, attrs):
        email = attrs.get("username")  # frontend sends email as "username"
        try:
            user = User.objects.get(email=email)
            attrs["username"] = user.username   # replace with the actual username
        except User.DoesNotExist:
            pass   # let default validation fail with "No active account found"
        return super().validate(attrs)


class EmailTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that accepts an email in the 'username' field.
    Use this instead of the default TokenObtainPairView.
    """
    serializer_class = EmailTokenObtainPairSerializer