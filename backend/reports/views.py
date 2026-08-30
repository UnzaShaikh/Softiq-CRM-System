
import json
from calendar import month_name

from django.db.models import Avg, Count, Q, Sum
from django.db.models.functions import ExtractMonth
from django.http import HttpResponse
from django.utils import timezone

from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from deals.models import Deal

from .models import Report
from .serializers import ReportSerializer


# =========================================================
# Pipeline configuration
# =========================================================

ACTIVE_STAGES = [
    "lead",
    "qualified",
    "proposal",
    "negotiation",
]


# =========================================================
# Report CRUD
# =========================================================

class ReportListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reports = Report.objects.select_related(
            "generated_by"
        ).all()

        serializer = ReportSerializer(
            reports,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = ReportSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save(
                generated_by=request.user
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ReportDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Report.objects.select_related(
                "generated_by"
            ).get(pk=pk)
        except Report.DoesNotExist:
            return None

    def get(self, request, pk):
        report = self.get_object(pk)

        if report is None:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ReportSerializer(report)

        return Response(serializer.data)

    def put(self, request, pk):
        report = self.get_object(pk)

        if report is None:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ReportSerializer(
            report,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, pk):
        report = self.get_object(pk)

        if report is None:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ReportSerializer(
            report,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        report = self.get_object(pk)

        if report is None:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        report.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# =========================================================
# Generate Report
# =========================================================

class ReportGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        try:
            report = Report.objects.get(pk=pk)

        except Report.DoesNotExist:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # -------------------------------------------------
        # Sales report
        # -------------------------------------------------

        if report.report_type == "sales":

            deals = Deal.objects.all()

            total_deals = deals.count()

            pipeline_value = (
                deals.aggregate(
                    total=Sum("value")
                )["total"] or 0
            )

            active_deals = deals.filter(
                stage__in=ACTIVE_STAGES
            ).count()

            closed_won = deals.filter(
                stage="closed_won"
            ).count()

            closed_lost = deals.filter(
                stage="closed_lost"
            ).count()

            revenue_generated = (
                deals.filter(
                    stage="closed_won"
                ).aggregate(
                    total=Sum("value")
                )["total"] or 0
            )

            closed_deals = (
                closed_won + closed_lost
            )

            win_rate = (
                round(
                    (
                        closed_won
                        / closed_deals
                    ) * 100,
                    2
                )
                if closed_deals
                else 0
            )

            average_deal_value = (
                deals.aggregate(
                    average=Avg("value")
                )["average"] or 0
            )

            report.data = {
                "total_deals": total_deals,
                "pipeline_value": float(
                    pipeline_value
                ),
                "active_deals": active_deals,
                "closed_won": closed_won,
                "closed_lost": closed_lost,
                "revenue_generated": float(
                    revenue_generated
                ),
                "win_rate": win_rate,
                "average_deal_value": float(
                    average_deal_value
                ),
            }

        # -------------------------------------------------
        # Pipeline report
        # -------------------------------------------------

        elif report.report_type == "pipeline":

            deals = Deal.objects.all()

            metrics = deals.aggregate(
                total_deals=Count("id"),

                pipeline_value=Sum(
                    "value"
                ),

                active_deals=Count(
                    "id",
                    filter=Q(
                        stage__in=ACTIVE_STAGES
                    )
                ),

                closed_won=Count(
                    "id",
                    filter=Q(
                        stage="closed_won"
                    )
                ),

                closed_lost=Count(
                    "id",
                    filter=Q(
                        stage="closed_lost"
                    )
                ),
            )

            stage_distribution = (
                deals
                .values("stage")
                .annotate(
                    deal_count=Count("id"),
                    total_value=Sum("value")
                )
                .order_by("stage")
            )

            stage_labels = dict(
                Deal.STAGE_CHOICES
            )

            distribution = []

            for item in stage_distribution:

                distribution.append({
                    "stage": item["stage"],
                    "label": stage_labels.get(
                        item["stage"],
                        item["stage"]
                    ),
                    "deal_count": (
                        item["deal_count"] or 0
                    ),
                    "total_value": float(
                        item["total_value"] or 0
                    ),
                })

            report.data = {
                "total_deals": (
                    metrics["total_deals"] or 0
                ),

                "pipeline_value": float(
                    metrics["pipeline_value"] or 0
                ),

                "active_deals": (
                    metrics["active_deals"] or 0
                ),

                "closed_won": (
                    metrics["closed_won"] or 0
                ),

                "closed_lost": (
                    metrics["closed_lost"] or 0
                ),

                "stage_distribution": distribution,
            }

        else:

            report.data = {
                "message": (
                    "Report generation is "
                    "not implemented for this "
                    "report type."
                )
            }

        report.status = "generated"
        report.generated_at = timezone.now()

        report.save(
            update_fields=[
                "data",
                "status",
                "generated_at",
            ]
        )

        return Response(
            ReportSerializer(report).data,
            status=status.HTTP_200_OK
        )


# =========================================================
# View Report
# =========================================================

class ReportViewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        try:
            report = Report.objects.get(pk=pk)

        except Report.DoesNotExist:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        report.views += 1
        report.last_viewed_at = timezone.now()

        report.save(
            update_fields=[
                "views",
                "last_viewed_at",
            ]
        )

        return Response(
            ReportSerializer(report).data
        )


# =========================================================
# Download Report
# =========================================================
class ReportDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            report = Report.objects.get(pk=pk)
        except Report.DoesNotExist:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        format_type = request.query_params.get(
            "export_format",
            request.query_params.get("format", "csv")
        ).lower()
        data = report.data or {}

        # =========================
        # CSV
        # =========================
        if format_type == "csv":
            response = HttpResponse(
                content_type="text/csv"
            )

            response["Content-Disposition"] = (
                f'attachment; filename="{report.name}.csv"'
            )

            writer = csv.writer(response)

            writer.writerow(["Metric", "Value"])

            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    value = json.dumps(value)

                writer.writerow([key, value])

            return response

        # =========================
        # Excel
        # =========================
        if format_type in ("xlsx", "excel"):
            workbook = Workbook()
            worksheet = workbook.active
            worksheet.title = "Report"

            worksheet.append(["Metric", "Value"])

            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    value = json.dumps(value)

                worksheet.append([key, value])

            response = HttpResponse(
                content_type=(
                    "application/"
                    "vnd.openxmlformats-officedocument."
                    "spreadsheetml.sheet"
                )
            )

            response["Content-Disposition"] = (
                f'attachment; filename="{report.name}.xlsx"'
            )

            workbook.save(response)

            return response

        # =========================
        # PDF
        # =========================
        if format_type == "pdf":
            response = HttpResponse(
                content_type="application/pdf"
            )

            response["Content-Disposition"] = (
                f'attachment; filename="{report.name}.pdf"'
            )

            document = SimpleDocTemplate(
                response,
                pagesize=A4,
                rightMargin=36,
                leftMargin=36,
                topMargin=36,
                bottomMargin=36,
            )

            title_style = ParagraphStyle(
                "ReportTitle",
                fontName="Helvetica-Bold",
                fontSize=20,
                leading=24,
                alignment=1,
                spaceAfter=6,
            )

            subtitle_style = ParagraphStyle(
                "ReportSubtitle",
                fontName="Helvetica",
                fontSize=9,
                leading=12,
                alignment=1,
                textColor=colors.grey,
                spaceAfter=18,
            )

            section_style = ParagraphStyle(
                "SectionTitle",
                fontName="Helvetica-Bold",
                fontSize=12,
                leading=15,
                spaceBefore=12,
                spaceAfter=8,
            )

            body_style = ParagraphStyle(
                "ReportBody",
                fontName="Helvetica",
                fontSize=9,
                leading=12,
            )

            header_style = ParagraphStyle(
                "ReportHeader",
                fontName="Helvetica-Bold",
                fontSize=9,
                leading=11,
                textColor=colors.white,
            )

            elements = []

            elements.append(
                Paragraph(
                    str(report.name).upper(),
                    title_style,
                )
            )
            elements.append(
                Paragraph(
                    f"CRM Analytics Report &nbsp;|&nbsp; "
                    f"Generated {timezone.localtime().strftime('%d %b %Y, %H:%M')}",
                    subtitle_style,
                )
            )

            def money(value):
                try:
                    return f"${float(value or 0):,.2f}"
                except (TypeError, ValueError):
                    return str(value or "-")

            def metric_label(key):
                return str(key).replace("_", " ").title()

            # Summary section
            summary_items = [
                ("Total Deals", data.get("total_deals", 0)),
                ("Active Deals", data.get("active_deals", 0)),
                ("Pipeline Value", money(data.get("pipeline_value", 0))),
                ("Closed Won", data.get("closed_won", 0)),
                ("Closed Lost", data.get("closed_lost", 0)),
            ]

            if any(key in data for key in (
                "revenue_generated",
                "win_rate",
                "average_deal_value",
            )):
                summary_items.extend([
                    ("Revenue Generated", money(data.get("revenue_generated", 0))),
                    ("Win Rate", f"{data.get('win_rate', 0)}%"),
                    ("Average Deal Value", money(data.get("average_deal_value", 0))),
                ])

            elements.append(Paragraph("SUMMARY", section_style))

            summary_rows = []
            for index in range(0, len(summary_items), 2):
                row = []
                for label, value in summary_items[index:index + 2]:
                    row.extend([
                        Paragraph(f"<b>{label}</b>", body_style),
                        Paragraph(str(value), body_style),
                    ])
                if len(row) == 2:
                    row.extend([Paragraph("", body_style), Paragraph("", body_style)])
                summary_rows.append(row)

            summary_table = Table(
                summary_rows,
                colWidths=[105, 135, 105, 135],
                hAlign="LEFT",
            )
            summary_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]))
            elements.append(summary_table)

            # Pipeline by stage
            stage_distribution = data.get("stage_distribution") or []
            if stage_distribution:
                elements.append(Paragraph("PIPELINE BY STAGE", section_style))

                stage_rows = [[
                    Paragraph("Stage", header_style),
                    Paragraph("Deals", header_style),
                    Paragraph("Pipeline Value", header_style),
                    Paragraph("Share", header_style),
                ]]

                for stage in stage_distribution:
                    label = stage.get("label") or stage.get("stage") or "-"
                    count = stage.get("deal_count", 0) or 0
                    value = stage.get("total_value", 0) or 0
                    percentage = stage.get("percentage")
                    if percentage is None:
                        total_deals = data.get("total_deals", 0) or 0
                        percentage = (float(count) / total_deals * 100) if total_deals else 0

                    stage_rows.append([
                        Paragraph(str(label), body_style),
                        Paragraph(str(count), body_style),
                        Paragraph(money(value), body_style),
                        Paragraph(f"{float(percentage):.1f}%", body_style),
                    ])

                stage_table = Table(
                    stage_rows,
                    colWidths=[205, 70, 145, 60],
                    repeatRows=1,
                    hAlign="LEFT",
                )
                stage_table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 7),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ]))
                elements.append(stage_table)

            # Additional metrics
            excluded = {
                "total_deals",
                "active_deals",
                "pipeline_value",
                "closed_won",
                "closed_lost",
                "revenue_generated",
                "win_rate",
                "average_deal_value",
                "stage_distribution",
            }

            additional = [
                (key, value)
                for key, value in data.items()
                if key not in excluded
            ]

            if additional:
                elements.append(Paragraph("ADDITIONAL METRICS", section_style))

                additional_rows = [[
                    Paragraph("Metric", header_style),
                    Paragraph("Value", header_style),
                ]]

                for key, value in additional:
                    if isinstance(value, (dict, list)):
                        value = json.dumps(value, indent=2)

                    additional_rows.append([
                        Paragraph(metric_label(key), body_style),
                        Paragraph(str(value), body_style),
                    ])

                additional_table = Table(
                    additional_rows,
                    colWidths=[180, 300],
                    repeatRows=1,
                    hAlign="LEFT",
                )
                additional_table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 7),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ]))
                elements.append(additional_table)

            document.build(elements)
            return response

        return Response(
            {
                "detail": (
                    "Unsupported format. "
                    "Use csv, xlsx or pdf."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

# =========================================================
# SALES REPORT
# =========================================================

class SalesReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # IMPORTANT:
        # Sales data comes directly from Deal.
        # Report model is NOT used as the data source.

        deals = Deal.objects.all()

        total_deals = deals.count()

        pipeline_value = (
            deals.aggregate(
                total=Sum("value")
            )["total"] or 0
        )

        active_deals = deals.filter(
            stage__in=ACTIVE_STAGES
        ).count()

        closed_won = deals.filter(
            stage="closed_won"
        ).count()

        closed_lost = deals.filter(
            stage="closed_lost"
        ).count()

        revenue_generated = (
            deals.filter(
                stage="closed_won"
            ).aggregate(
                total=Sum("value")
            )["total"] or 0
        )

        closed_deals = (
            closed_won + closed_lost
        )

        win_rate = (
            round(
                (
                    closed_won
                    / closed_deals
                ) * 100,
                2
            )
            if closed_deals
            else 0
        )

        average_deal_value = (
            deals.aggregate(
                average=Avg("value")
            )["average"] or 0
        )

        return Response({
            "total_deals": total_deals,

            "pipeline_value": float(
                pipeline_value
            ),

            "active_deals": active_deals,

            "closed_won": closed_won,

            "closed_lost": closed_lost,

            "revenue_generated": float(
                revenue_generated
            ),

            "win_rate": win_rate,

            "average_deal_value": float(
                average_deal_value
            ),
        })


# =========================================================
# PIPELINE REPORT
# =========================================================

class PipelineReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # IMPORTANT:
        # Pipeline report reads directly from
        # the existing Deals/Sales Pipeline data.

        deals = Deal.objects.all()

        # -------------------------------------------------
        # Summary
        # -------------------------------------------------

        metrics = deals.aggregate(
            total_deals=Count("id"),

            pipeline_value=Sum(
                "value"
            ),

            active_deals=Count(
                "id",
                filter=Q(
                    stage__in=ACTIVE_STAGES
                )
            ),

            closed_won=Count(
                "id",
                filter=Q(
                    stage="closed_won"
                )
            ),

            closed_lost=Count(
                "id",
                filter=Q(
                    stage="closed_lost"
                )
            ),
        )

        total_deals = (
            metrics["total_deals"] or 0
        )

        # -------------------------------------------------
        # Stage distribution
        # -------------------------------------------------

        grouped = (
            deals
            .values("stage")
            .annotate(
                deal_count=Count("id"),
                total_value=Sum("value")
            )
            .order_by("stage")
        )

        stage_labels = dict(
            Deal.STAGE_CHOICES
        )

        stage_distribution = []

        for item in grouped:

            deal_count = (
                item["deal_count"] or 0
            )

            stage_distribution.append({
                "stage": item["stage"],

                "label": stage_labels.get(
                    item["stage"],
                    item["stage"]
                ),

                "deal_count": deal_count,

                "total_value": float(
                    item["total_value"] or 0
                ),

                "percentage": (
                    round(
                        (
                            deal_count
                            / total_deals
                        ) * 100,
                        2
                    )
                    if total_deals
                    else 0
                ),
            })

        # -------------------------------------------------
        # Recent deals
        # -------------------------------------------------

        recent_deals = (
            deals
            .select_related("customer")
            .order_by(
                "-created_at"
            )[:10]
        )

        recent_data = []

        for deal in recent_deals:

            customer_name = "Unknown"

            company = "N/A"

            if deal.customer:

                customer_name = (
                    f"{deal.customer.first_name} "
                    f"{deal.customer.last_name}"
                ).strip()

                if not customer_name:
                    customer_name = (
                        deal.customer.email
                        or "Unknown"
                    )

                company = (
                    deal.customer.company
                    or "N/A"
                )

            recent_data.append({
                "id": deal.id,

                "name": deal.name,

                "customer": customer_name,

                "company": company,

                "value": float(
                    deal.value or 0
                ),

                "stage": deal.stage,

                "stage_label": (
                    stage_labels.get(
                        deal.stage,
                        deal.stage
                    )
                ),

                "expected_close_date": (
                    deal.expected_close_date
                ),

                "closed_date": (
                    deal.closed_date
                ),

                "probability": (
                    deal.probability
                ),

                "created_at": (
                    deal.created_at
                ),
            })

        # -------------------------------------------------
        # Monthly pipeline trend
        # -------------------------------------------------

        year_param = request.query_params.get(
            "year"
        )

        try:
            year = int(
                year_param
                if year_param
                else timezone.now().year
            )

        except (TypeError, ValueError):

            return Response(
                {
                    "detail": (
                        "Invalid year parameter."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        created_rows = (
            deals
            .filter(
                created_at__year=year
            )
            .annotate(
                month=ExtractMonth(
                    "created_at"
                )
            )
            .values("month")
            .annotate(
                count=Count("id"),
                value=Sum("value")
            )
            .order_by("month")
        )

        created_by_month = {
            int(row["month"]): {
                "count": row["count"] or 0,
                "value": float(
                    row["value"] or 0
                ),
            }
            for row in created_rows
        }

        months = [
            month[:3]
            for month in list(
                month_name
            )[1:]
        ]

        deals_created = [
            created_by_month.get(
                month,
                {"count": 0}
            )["count"]
            for month in range(1, 13)
        ]

        pipeline_created_value = [
            created_by_month.get(
                month,
                {"value": 0}
            )["value"]
            for month in range(1, 13)
        ]

        # -------------------------------------------------
        # Response
        # -------------------------------------------------

        return Response({
            "summary": {
                "total_deals": total_deals,

                "pipeline_value": float(
                    metrics[
                        "pipeline_value"
                    ] or 0
                ),

                "active_deals": (
                    metrics[
                        "active_deals"
                    ] or 0
                ),

                "closed_won": (
                    metrics[
                        "closed_won"
                    ] or 0
                ),

                "closed_lost": (
                    metrics[
                        "closed_lost"
                    ] or 0
                ),
            },

            "stage_distribution": (
                stage_distribution
            ),

            "recent_deals": recent_data,

            "trend": {
                "year": year,

                "months": months,

                "deals_created": (
                    deals_created
                ),

                "pipeline_created_value": (
                    pipeline_created_value
                ),
            },
        })