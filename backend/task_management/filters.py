import django_filters
from .models import Task


class TaskFilter(django_filters.FilterSet):
    due_date = django_filters.DateFilter(field_name='due_date', lookup_expr='date')
    due_date_after = django_filters.DateTimeFilter(field_name='due_date', lookup_expr='gte')
    due_date_before = django_filters.DateTimeFilter(field_name='due_date', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    tags = django_filters.CharFilter(field_name='tags__name', lookup_expr='iexact')

    class Meta:
        model = Task
        fields = ['status', 'priority', 'assignee', 'due_date']