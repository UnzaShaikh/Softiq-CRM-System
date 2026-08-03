from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    # Placeholder data — replace with real DB queries once
    # Customer, Lead, Opportunity, and Task models exist.
    data = {
        "total_customers": 125,
        "total_leads": 64,
        "opportunities": 18,
        "revenue": 24500,
        "tasks_due": 9,
    }
    return Response(data)