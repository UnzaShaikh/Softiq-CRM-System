from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, NotFound


class EmailTemplatePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        # ---------------------------------------------------------
        # PAGE VALIDATION
        # ---------------------------------------------------------

        page_param = request.query_params.get(
            self.page_query_param
        )

        if page_param is not None:
            try:
                page_number = int(page_param)
            except (TypeError, ValueError):
                raise ValidationError(
                    {
                        "page": [
                            "Page must be a valid integer."
                        ]
                    }
                )

            if page_number < 1:
                raise ValidationError(
                    {
                        "page": [
                            "Page must be greater than or equal to 1."
                        ]
                    }
                )

        # ---------------------------------------------------------
        # PAGE SIZE VALIDATION
        # ---------------------------------------------------------

        page_size_param = request.query_params.get(
            self.page_size_query_param
        )

        if page_size_param is not None:
            try:
                page_size = int(page_size_param)
            except (TypeError, ValueError):
                raise ValidationError(
                    {
                        "page_size": [
                            "Page size must be a valid integer."
                        ]
                    }
                )

            if page_size < 1:
                raise ValidationError(
                    {
                        "page_size": [
                            "Page size must be greater than or equal to 1."
                        ]
                    }
                )

            if page_size > self.max_page_size:
                raise ValidationError(
                    {
                        "page_size": [
                            f"Page size cannot exceed "
                            f"{self.max_page_size}."
                        ]
                    }
                )

        # ---------------------------------------------------------
        # PAGINATION
        # ---------------------------------------------------------

        try:
            return super().paginate_queryset(
                queryset,
                request,
                view=view,
            )
        except NotFound:
            raise ValidationError(
                {
                    "page": [
                        "The requested page does not exist."
                    ]
                }
            )

    # ---------------------------------------------------------
    # PAGINATED RESPONSE
    # ---------------------------------------------------------

    def get_paginated_response(self, data):
        return Response(
            {
                "count": self.page.paginator.count,
                "total_pages": self.page.paginator.num_pages,
                "current_page": self.page.number,
                "page_size": self.get_page_size(
                    self.request
                ),
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )