from django.db.models import Q

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from customers.models import Customer
from leads.models import Lead
from companies.models import Company
from contacts.models import Contact
from opportunities.models import Opportunity
from activities.models import Activity
from notes.models import Note
from followups.models import FollowUp
from email_templates.models import EmailTemplate


class GlobalSearchView(APIView):
    """
    Global Search API

    Endpoints:
        GET /api/search/?q=<query>
        GET /api/search/?q=<query>&module=<module>
        GET /api/search/?q=<query>&module=<module1,module2>
        GET /api/search/?q=<query>&page=1&page_size=10

    Supported modules:
        customer
        lead
        company
        contact
        opportunity
        activity
        note
        followup
        email_template
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        # =========================================================
        # MODULE FILTER
        # =========================================================

        module_param = (
            request.query_params.get("module", "")
            .strip()
            .lower()
        )

        requested_modules = []

        if module_param:
            requested_modules = [
                item.strip()
                for item in module_param.split(",")
                if item.strip()
            ]

        valid_modules = {
            "customer",
            "lead",
            "company",
            "contact",
            "opportunity",
            "activity",
            "note",
            "followup",
            "email_template",
        }

        invalid_modules = [
            item
            for item in requested_modules
            if item not in valid_modules
        ]

        if invalid_modules:
            return Response(
                {
                    "detail": (
                        f"Unsupported search module(s): "
                        f"{', '.join(invalid_modules)}. "
                        f"Valid modules are: "
                        f"{', '.join(sorted(valid_modules))}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =========================================================
        # HELPER
        # =========================================================

        def should_search(module_name):
            return (
                not requested_modules
                or module_name in requested_modules
            )

        # =========================================================
        # EMPTY QUERY
        # =========================================================

        if not query:
            return Response(
                {
                    "query": "",
                    "count": 0,
                    "total_pages": 0,
                    "current_page": 1,
                    "page_size": 10,
                    "next": None,
                    "previous": None,
                    "results": [],
                },
                status=status.HTTP_200_OK,
            )

        results = []

        # =========================================================
        # CUSTOMER SEARCH
        # =========================================================

        if should_search("customer"):

            customers = (
                Customer.objects
                .filter(
                    Q(first_name__icontains=query)
                    | Q(last_name__icontains=query)
                    | Q(email__icontains=query)
                    | Q(phone__icontains=query)
                    | Q(company__icontains=query)
                    | Q(status__icontains=query)
                )
                .order_by("-created_at")[:20]
            )

            for customer in customers:

                full_name = (
                    f"{customer.first_name} "
                    f"{customer.last_name}"
                ).strip()

                results.append(
                    {
                        "id": customer.id,
                        "module": "customer",
                        "title": full_name,
                        "subtitle": (
                            customer.company
                            or customer.email
                            or ""
                        ),
                        "status": customer.status,
                        "url": f"/customers/{customer.id}/",
                    }
                )

        # =========================================================
        # LEAD SEARCH
        # =========================================================

        if should_search("lead"):

            leads = (
                Lead.objects
                .filter(
                    Q(first_name__icontains=query)
                    | Q(last_name__icontains=query)
                    | Q(email__icontains=query)
                    | Q(phone__icontains=query)
                    | Q(company__icontains=query)
                    | Q(source__icontains=query)
                    | Q(status__icontains=query)
                )
                .order_by("-created_at")[:20]
            )

            for lead in leads:

                full_name = (
                    f"{lead.first_name} "
                    f"{lead.last_name}"
                ).strip()

                results.append(
                    {
                        "id": lead.id,
                        "module": "lead",
                        "title": full_name,
                        "subtitle": (
                            lead.company
                            or lead.email
                            or ""
                        ),
                        "status": lead.status,
                        "url": f"/leads/{lead.id}/",
                    }
                )

        # =========================================================
        # COMPANY SEARCH
        # =========================================================

        if should_search("company"):

            companies = (
                Company.objects
                .filter(
                    Q(name__icontains=query)
                    | Q(industry__icontains=query)
                    | Q(website__icontains=query)
                    | Q(phone__icontains=query)
                    | Q(email__icontains=query)
                    | Q(address__icontains=query)
                    | Q(size__icontains=query)
                    | Q(status__icontains=query)
                    | Q(description__icontains=query)
                )
                .order_by("-created_at")[:20]
            )

            for company in companies:

                results.append(
                    {
                        "id": company.id,
                        "module": "company",
                        "title": company.name,
                        "subtitle": (
                            company.industry
                            or company.email
                            or ""
                        ),
                        "status": company.status,
                        "url": f"/companies/{company.id}/",
                    }
                )

        # =========================================================
        # CONTACT SEARCH
        # =========================================================

        if should_search("contact"):

            contacts = (
                Contact.objects
                .filter(
                    Q(full_name__icontains=query)
                    | Q(company__icontains=query)
                    | Q(email__icontains=query)
                    | Q(phone__icontains=query)
                    | Q(job_title__icontains=query)
                    | Q(status__icontains=query)
                )
                .order_by("-created_at")[:20]
            )

            for contact in contacts:

                results.append(
                    {
                        "id": contact.id,
                        "module": "contact",
                        "title": contact.full_name,
                        "subtitle": (
                            contact.company
                            or contact.email
                            or ""
                        ),
                        "status": contact.status,
                        "url": f"/contacts/{contact.id}/",
                    }
                )

        # =========================================================
        # OPPORTUNITY SEARCH
        # =========================================================

        if should_search("opportunity"):

            opportunities = (
                Opportunity.objects
                .select_related("customer")
                .filter(
                    Q(name__icontains=query)
                    | Q(stage__icontains=query)
                    | Q(status__icontains=query)
                    | Q(notes__icontains=query)
                    | Q(
                        customer__first_name__icontains=query
                    )
                    | Q(
                        customer__last_name__icontains=query
                    )
                    | Q(
                        customer__company__icontains=query
                    )
                )
                .order_by("-created_at")[:20]
            )

            for opportunity in opportunities:

                customer_name = ""

                if opportunity.customer:
                    customer_name = (
                        f"{opportunity.customer.first_name} "
                        f"{opportunity.customer.last_name}"
                    ).strip()

                results.append(
                    {
                        "id": opportunity.id,
                        "module": "opportunity",
                        "title": opportunity.name,
                        "subtitle": (
                            customer_name
                            or str(opportunity.stage)
                            or ""
                        ),
                        "status": opportunity.status,
                        "url": (
                            f"/opportunities/"
                            f"{opportunity.id}/"
                        ),
                    }
                )

        # =========================================================
        # ACTIVITY SEARCH
        # =========================================================

        if should_search("activity"):

            activities = (
                Activity.objects
                .select_related(
                    "customer",
                    "lead",
                )
                .filter(
                    Q(title__icontains=query)
                    | Q(type__icontains=query)
                    | Q(status__icontains=query)
                    | Q(priority__icontains=query)
                    | Q(description__icontains=query)
                    | Q(location__icontains=query)
                    | Q(
                        customer__first_name__icontains=query
                    )
                    | Q(
                        customer__last_name__icontains=query
                    )
                    | Q(
                        lead__first_name__icontains=query
                    )
                    | Q(
                        lead__last_name__icontains=query
                    )
                )
                .order_by("-date", "-time")[:20]
            )

            for activity in activities:

                related_name = ""

                if activity.customer:
                    related_name = (
                        f"{activity.customer.first_name} "
                        f"{activity.customer.last_name}"
                    ).strip()

                elif activity.lead:
                    related_name = (
                        f"{activity.lead.first_name} "
                        f"{activity.lead.last_name}"
                    ).strip()

                results.append(
                    {
                        "id": activity.id,
                        "module": "activity",
                        "title": activity.title,
                        "subtitle": (
                            related_name
                            or activity.type
                            or ""
                        ),
                        "status": activity.status,
                        "url": f"/activities/{activity.id}/",
                    }
                )

        # =========================================================
        # NOTE SEARCH
        # =========================================================

        if should_search("note"):

            notes = (
                Note.objects
                .select_related(
                    "customer",
                    "lead",
                    "category",
                )
                .filter(
                    Q(title__icontains=query)
                    | Q(content__icontains=query)
                    | Q(priority__icontains=query)
                    | Q(
                        category__name__icontains=query
                    )
                    | Q(
                        customer__first_name__icontains=query
                    )
                    | Q(
                        customer__last_name__icontains=query
                    )
                    | Q(
                        lead__first_name__icontains=query
                    )
                    | Q(
                        lead__last_name__icontains=query
                    )
                )
                .order_by(
                    "-pinned",
                    "-created_at",
                )[:20]
            )

            for note in notes:

                related_name = ""

                if note.customer:
                    related_name = (
                        f"{note.customer.first_name} "
                        f"{note.customer.last_name}"
                    ).strip()

                elif note.lead:
                    related_name = (
                        f"{note.lead.first_name} "
                        f"{note.lead.last_name}"
                    ).strip()

                results.append(
                    {
                        "id": note.id,
                        "module": "note",
                        "title": note.title,
                        "subtitle": (
                            related_name
                            or (
                                note.content[:100]
                                if note.content
                                else ""
                            )
                        ),
                        "status": (
                            "archived"
                            if note.archived
                            else "active"
                        ),
                        "url": f"/notes/{note.id}/",
                    }
                )

        # =========================================================
        # FOLLOW-UP SEARCH
        # =========================================================

        if should_search("followup"):

            followups = (
                FollowUp.objects
                .select_related(
                    "customer",
                    "lead",
                    "company",
                )
                .filter(
                    Q(subject__icontains=query)
                    | Q(notes__icontains=query)
                    | Q(followup_id__icontains=query)
                    | Q(type__icontains=query)
                    | Q(priority__icontains=query)
                    | Q(status__icontains=query)
                    | Q(
                        customer__first_name__icontains=query
                    )
                    | Q(
                        customer__last_name__icontains=query
                    )
                    | Q(
                        customer__company__icontains=query
                    )
                    | Q(
                        lead__first_name__icontains=query
                    )
                    | Q(
                        lead__last_name__icontains=query
                    )
                    | Q(
                        lead__company__icontains=query
                    )
                    | Q(
                        company__name__icontains=query
                    )
                )
                .order_by(
                    "due_date",
                    "due_time",
                )[:20]
            )

            for followup in followups:

                related_name = ""

                if followup.customer:
                    related_name = (
                        f"{followup.customer.first_name} "
                        f"{followup.customer.last_name}"
                    ).strip()

                elif followup.lead:
                    related_name = (
                        f"{followup.lead.first_name} "
                        f"{followup.lead.last_name}"
                    ).strip()

                elif followup.company:
                    related_name = followup.company.name

                results.append(
                    {
                        "id": followup.id,
                        "module": "followup",
                        "title": followup.subject,
                        "subtitle": (
                            related_name
                            or followup.notes
                            or followup.followup_id
                            or ""
                        ),
                        "status": followup.status or "",
                        "url": f"/followups/{followup.id}/",
                    }
                )

        # =========================================================
        # EMAIL TEMPLATE SEARCH
        # =========================================================

        if should_search("email_template"):

            templates = (
                EmailTemplate.objects
                .filter(
                    Q(name__icontains=query)
                    | Q(subject__icontains=query)
                    | Q(content__icontains=query)
                    | Q(description__icontains=query)
                    | Q(category__icontains=query)
                    | Q(template_type__icontains=query)
                    | Q(status__icontains=query)
                    | Q(language__icontains=query)
                )
                .order_by("-updated_at")[:20]
            )

            for template in templates:

                results.append(
                    {
                        "id": template.id,
                        "module": "email_template",
                        "title": template.name,
                        "subtitle": (
                            template.subject
                            or template.description
                            or ""
                        ),
                        "status": template.status,
                        "url": (
                            f"/email-templates/"
                            f"{template.id}/"
                        ),
                    }
                )

        # =========================================================
        # PAGINATION
        # =========================================================

        page_param = request.query_params.get("page", "1")
        page_size_param = request.query_params.get(
            "page_size",
            "10",
        )

        # Validate page
        try:
            page = int(page_param)
        except (TypeError, ValueError):
            return Response(
                {
                    "detail": "Page must be a valid integer."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate page size
        try:
            page_size = int(page_size_param)
        except (TypeError, ValueError):
            return Response(
                {
                    "detail": (
                        "Page size must be a valid integer."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if page < 1:
            return Response(
                {
                    "detail": (
                        "Page must be greater than or "
                        "equal to 1."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if page_size < 1:
            return Response(
                {
                    "detail": (
                        "Page size must be greater than "
                        "or equal to 1."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Maximum allowed page size
        max_page_size = 50

        if page_size > max_page_size:
            page_size = max_page_size

        # Total result count
        total_count = len(results)

        # Calculate total pages
        total_pages = (
            (total_count + page_size - 1)
            // page_size
            if total_count
            else 0
        )

        # Page out of range
        if total_pages and page > total_pages:
            return Response(
                {
                    "detail": "Page number is out of range."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Calculate result indexes
        start_index = (page - 1) * page_size
        end_index = start_index + page_size

        paginated_results = results[
            start_index:end_index
        ]

        # Next page
        next_page = (
            page + 1
            if total_pages and page < total_pages
            else None
        )

        # Previous page
        previous_page = (
            page - 1
            if page > 1 and total_pages
            else None
        )

        # =========================================================
        # FINAL RESPONSE
        # =========================================================

        return Response(
            {
                "query": query,
                "count": total_count,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
                "next": next_page,
                "previous": previous_page,
                "results": paginated_results,
            },
            status=status.HTTP_200_OK,
        )