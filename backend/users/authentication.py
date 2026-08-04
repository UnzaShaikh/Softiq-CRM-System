from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Authenticate users using email instead of username
    and return JWT access/refresh tokens.
    """

    username_field = "email"

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "No active account found with the given credentials."}
            )

        authenticated_user = authenticate(
            username=user.username,
            password=password,
        )

        if authenticated_user is None:
            raise serializers.ValidationError(
                {"detail": "No active account found with the given credentials."}
            )

        refresh = self.get_token(authenticated_user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": authenticated_user.id,
                "username": authenticated_user.username,
                "email": authenticated_user.email,
                "first_name": authenticated_user.first_name,
                "last_name": authenticated_user.last_name,
            },
        }


class EmailTokenObtainPairView(TokenObtainPairView):
    """
    JWT login endpoint using email authentication.
    """

    serializer_class = EmailTokenObtainPairSerializer
