from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import DashboardSummarySerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """
    Return a summary of key CRM metrics for the authenticated user.

    Currently returns placeholder data. Once the Customer, Lead,
    Opportunity, and Task models exist, this view should be updated
    to query real database records instead.
    """
    data = {
        "total_customers": 125,
        "total_leads": 64,
        "opportunities": 18,
        "revenue": 24500,
        "tasks_due": 9,
    }

    serializer = DashboardSummarySerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)