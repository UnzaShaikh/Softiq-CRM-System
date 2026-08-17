from rest_framework.pagination import PageNumberPagination


class GlobalSearchPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50
    page_query_param = "page"

    def get_paginated_response(self, data):
        return {
            "count": self.page.paginator.count,
            "total_pages": self.page.paginator.num_pages,
            "current_page": self.page.number,
            "page_size": self.get_page_size(self.request),
            "next": self.page.next_page_number()
            if self.page.has_next()
            else None,
            "previous": self.page.previous_page_number()
            if self.page.has_previous()
            else None,
            "results": data,
        }