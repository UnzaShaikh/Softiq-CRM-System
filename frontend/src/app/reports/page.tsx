"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  HiDocumentReport,
  HiCalendar,
  HiCheckCircle,
  HiEye,
  HiDownload,
  HiArrowRight,
} from "react-icons/hi";
import { FiDownload } from "react-icons/fi";
import { apiRequest, apiDownload } from "@/lib/api";


// ── API Data ────────────────────────────────────

type ReportRecord = {
  id: number;
  name: string;
  report_type: string;
  type?: string;
  status: string;
  generated_at: string;
  generated_by_name?: string;
  views: number;
};

type DisplayReport = {
  id: number;
  name: string;
  report_type: string;
  type: string;
  typeColor: string;
  typeBg: string;
  status: string;
  generated_at: string;
  generated_by_name: string;
  views: number;
};

function toReportArray(value: unknown): ReportRecord[] {
  if (Array.isArray(value)) {
    return value as ReportRecord[];
  }

  if (
    value &&
    typeof value === "object" &&
    "results" in value
  ) {
    const results = (value as { results?: unknown }).results;

    return Array.isArray(results)
      ? (results as ReportRecord[])
      : [];
  }

  return [];
}

// ── Initial UI Data ─────────────────────────────

const OVERVIEW_CARDS = [
  {
    label: "Total Reports",
    value: 18,
    change: "+20%",
    up: true,
    icon: <HiDocumentReport size={18} />,
    color: "#4f46e5",
    bg: "#eef2ff",
  },
  {
    label: "Scheduled Reports",
    value: 6,
    change: "+50%",
    up: true,
    icon: <HiCalendar size={18} />,
    color: "#d97706",
    bg: "#fef3c7",
  },
  {
    label: "Reports Generated",
    value: 32,
    change: "+14%",
    up: true,
    icon: <HiCheckCircle size={18} />,
    color: "#16a34a",
    bg: "#dcfce7",
  },
  {
    label: "Reports Viewed",
    value: 128,
    change: "+18%",
    up: true,
    icon: <HiEye size={18} />,
    color: "#0891b2",
    bg: "#ecfeff",
  },
];

const CHART_DATA: Record<string, number[]> = {
  Monthly: [8, 15, 12, 18, 22, 28, 38, 25, 20, 15, 10, 6],
  Quarterly: [35, 78, 83, 31],
  Yearly: [180, 220, 280],
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

const YEARS = ["2024", "2025", "2026"];

const REPORT_TYPES = [
  {
    label: "Sales Reports",
    count: 12,
    pct: 37.5,
    color: "#4f46e5",
  },
  {
    label: "Pipeline Reports",
    count: 8,
    pct: 25,
    color: "#0891b2",
  },
  {
    label: "Activity Reports",
    count: 6,
    pct: 18.8,
    color: "#f59e0b",
  },
  {
    label: "Customer Reports",
    count: 4,
    pct: 12.5,
    color: "#16a34a",
  },
  {
    label: "Other Reports",
    count: 2,
    pct: 6.2,
    color: "#ef4444",
  },
];

const RECENT_REPORTS = [
  {
    id: 1,
    name: "Sales Performance Report",
    type: "Sales",
    typeColor: "#4f46e5",
    typeBg: "#eef2ff",
    date: "May 29, 2025 10:30 AM",
    generatedBy: "Test User",
  },
  {
    id: 2,
    name: "Pipeline Analysis Report",
    type: "Pipeline",
    typeColor: "#0891b2",
    typeBg: "#ecfeff",
    date: "May 29, 2025 09:15 AM",
    generatedBy: "Test User",
  },
  {
    id: 3,
    name: "Lead Source Report",
    type: "Activity",
    typeColor: "#f59e0b",
    typeBg: "#fef3c7",
    date: "May 28, 2025 04:45 PM",
    generatedBy: "Test User",
  },
  {
    id: 4,
    name: "Revenue Summary Report",
    type: "Sales",
    typeColor: "#4f46e5",
    typeBg: "#eef2ff",
    date: "May 28, 2025 02:20 PM",
    generatedBy: "Test User",
  },
];

const TOP_REPORTS = [
  {
    rank: 1,
    name: "Sales Performance Report",
    views: 28,
  },
  {
    rank: 2,
    name: "Pipeline Analysis Report",
    views: 22,
  },
  {
    rank: 3,
    name: "Revenue Summary Report",
    views: 18,
  },
  {
    rank: 4,
    name: "Lead Conversion Report",
    views: 14,
  },
  {
    rank: 5,
    name: "Activity Overview Report",
    views: 12,
  },
];

// ── Report Type Colors ──────────────────────────

const TYPE_COLORS: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  sales: {
    color: "#4f46e5",
    bg: "#eef2ff",
    label: "Sales",
  },
  pipeline: {
    color: "#0891b2",
    bg: "#ecfeff",
    label: "Pipeline",
  },
  activity: {
    color: "#f59e0b",
    bg: "#fef3c7",
    label: "Activity",
  },
  customer: {
    color: "#16a34a",
    bg: "#dcfce7",
    label: "Customer",
  },
  other: {
    color: "#ef4444",
    bg: "#fee2e2",
    label: "Other",
  },
};

function getReportTypeStyle(reportType: string) {
  const normalized = String(reportType || "").toLowerCase();

  return (
    TYPE_COLORS[normalized] || {
      color: "#64748b",
      bg: "#f1f5f9",
      label:
        normalized.charAt(0).toUpperCase() +
        normalized.slice(1) ||
        "Other",
    }
  );
}

// ── Date Formatter ──────────────────────────────
// Fixed locale/timezone prevents server/client hydration differences.

function formatReportDate(value: string) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${month} ${day}, ${year} ${hours}:${minutes} ${period}`;
}

// ── Simple Line Chart ──────────────────────────

function LineChart({
  data,
  labels,
}: {
  data: number[];
  labels: string[];
}) {
  const max = Math.max(...data);
  const min = 0;

  const W = 420;
  const H = 140;

  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 25;

  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const points = data.map((v, i) => ({
    x:
      padL +
      (i / Math.max(data.length - 1, 1)) * chartW,

    y:
      padT +
      chartH -
      ((v - min) / (max - min || 1)) * chartH,
  }));

  const polyline = points
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const area =
    points.length > 0
      ? `${points[0].x},${padT + chartH} ${polyline} ${points[points.length - 1].x},${padT + chartH}`
      : "";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{
        width: "100%",
        height: "auto",
      }}
    >
      <defs>
        <linearGradient
          id="areaGrad"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#4f46e5"
            stopOpacity="0.15"
          />
          <stop
            offset="100%"
            stopColor="#4f46e5"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      {[0, 10, 20, 30, 40].map((v) => {
        const y =
          padT +
          chartH -
          ((v - min) / (max - min || 1)) * chartH;

        return (
          <g key={v}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="#f1f5f9"
              strokeWidth="1"
            />

            <text
              x={padL - 4}
              y={y + 4}
              fontSize="9"
              fill="#94a3b8"
              textAnchor="end"
            >
              {v}
            </text>
          </g>
        );
      })}

      {points.length > 0 && (
        <polygon
          points={area}
          fill="url(#areaGrad)"
        />
      )}

      {points.length > 0 && (
        <polyline
          points={polyline}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3.5"
          fill="#fff"
          stroke="#4f46e5"
          strokeWidth="2"
        />
      ))}

      {labels.map((l, i) => (
        <text
          key={i}
          x={
            padL +
            (i / Math.max(labels.length - 1, 1)) *
              chartW
          }
          y={H - 6}
          fontSize="9"
          fill="#94a3b8"
          textAnchor="middle"
        >
          {l}
        </text>
      ))}
    </svg>
  );
}

// ── Donut Chart ────────────────────────────────

function DonutChart({
  data,
  total,
}: {
  data: {
    label: string;
    count: number;
    pct: number;
    color: string;
  }[];
  total: number;
}) {
  const R = 55;
  const cx = 80;
  const cy = 80;

  const circumference = 2 * Math.PI * R;

  let offset = 0;

  return (
    <svg
      viewBox="0 0 160 160"
      style={{
        width: 160,
        height: 160,
      }}
    >
      {data.map((item, i) => {
        const dash =
          (item.pct / 100) * circumference;

        const gap = circumference - dash;

        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={item.color}
            strokeWidth="22"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: `${cx}px ${cy}px`,
            }}
          />
        );

        offset += dash;

        return el;
      })}

      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        fill="#0f172a"
      >
        {total}
      </text>

      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fontSize="9"
        fill="#94a3b8"
      >
        Total
      </text>
    </svg>
  );
}


// ── Loading Skeleton ─────────────────────────────
function Skeleton({
  width = "100%",
  height = 12,
  radius = 6,
  style,
}: {
  width?: number | string;
  height?: number;
  radius?: number | string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "block",
        width,
        height,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
        backgroundSize: "200% 100%",
        animation: "reportsSkeleton 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

function ReportsDashboardSkeleton() {
  return (
    <>
      <style>{`
        @keyframes reportsSkeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Overview cards */}
      <div className="dashboard-stats-grid">
        {[
          "#eef2ff",
          "#fef3c7",
          "#dcfce7",
          "#ecfeff",
        ].map((bg, index) => (
          <div
            key={index}
            className="stat-card-dashboard"
          >
            <div
              className="stat-card-dashboard-icon"
              style={{ background: bg }}
            >
              <Skeleton
                width={18}
                height={18}
                radius={4}
              />
            </div>

            <div className="stat-card-dashboard-content">
              <Skeleton
                width="68%"
                height={10}
                radius={4}
              />
              <Skeleton
                width={index === 3 ? 42 : 30}
                height={25}
                radius={5}
                style={{ marginTop: 8 }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginTop: 8,
                }}
              >
                <Skeleton
                  width={48}
                  height={18}
                  radius={9}
                />
                <Skeleton
                  width={76}
                  height={9}
                  radius={4}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ width: "45%" }}>
              <Skeleton width="42%" height={15} radius={4} />
              <Skeleton
                width="82%"
                height={10}
                radius={4}
                style={{ marginTop: 7 }}
              />
            </div>
            <Skeleton
              width={92}
              height={28}
              radius={7}
            />
          </div>

          <Skeleton
            width="100%"
            height={140}
            radius={6}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "12px",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <Skeleton
                  width={i === 0 ? "52%" : "60%"}
                  height={9}
                  radius={4}
                  style={{ margin: "0 auto 8px" }}
                />
                <Skeleton
                  width={i === 0 ? 72 : 42}
                  height={24}
                  radius={5}
                  style={{ margin: "0 auto 5px" }}
                />
                <Skeleton
                  width="35%"
                  height={8}
                  radius={4}
                  style={{ margin: "0 auto" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <Skeleton width="45%" height={15} radius={4} />
            <Skeleton
              width="86%"
              height={10}
              radius={4}
              style={{ marginTop: 7 }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <Skeleton
              width={160}
              height={160}
              radius="50%"
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Skeleton width="48%" height={10} radius={4} />
                <Skeleton width="24%" height={10} radius={4} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <Skeleton width="25%" height={15} radius={4} />
            <Skeleton
              width="48%"
              height={10}
              radius={4}
              style={{ marginTop: 7 }}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "inherit",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Report Name",
                    "Type",
                    "Date Generated",
                    "Generated By",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        background: "#f8fafc",
                        borderBottom:
                          "1px solid #e2e8f0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3].map((i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i === 3
                          ? "none"
                          : "1px solid #f1f5f9",
                    }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <Skeleton width="78%" height={12} radius={4} />
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Skeleton width={72} height={22} radius={6} />
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Skeleton width={122} height={11} radius={4} />
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <Skeleton width={26} height={26} radius="50%" />
                        <Skeleton width={76} height={11} radius={4} />
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "inline-flex", gap: 5 }}>
                        <Skeleton width={30} height={30} radius={7} />
                        <Skeleton width={30} height={30} radius={7} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <Skeleton width={130} height={34} radius={8} />
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <Skeleton width="38%" height={15} radius={4} />
            <Skeleton
              width="55%"
              height={10}
              radius={4}
              style={{ marginTop: 7 }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 0",
                  borderBottom:
                    i === 4
                      ? "none"
                      : "1px solid #f1f5f9",
                }}
              >
                <Skeleton width={24} height={24} radius="50%" />
                <Skeleton width="62%" height={12} radius={4} />
                <Skeleton width={52} height={10} radius={4} />
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "14px",
              paddingTop: "14px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <Skeleton width={145} height={34} radius={8} />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ──────────────────────────────────

export default function ReportsDashboardPage() {
  const [period, setPeriod] = useState<
    "Monthly" | "Quarterly" | "Yearly"
  >("Monthly");

  const [dateRange] = useState(
    "May 1, 2025 - May 31, 2025"
  );

  const [reports, setReports] = useState<
    ReportRecord[]
  >([]);

  const [reportsLoaded, setReportsLoaded] =
    useState(false);

  const [isDownloading, setIsDownloading] =
    useState(false);

  // ── Load reports from backend ────────────────

  useEffect(() => {
    let cancelled = false;

    const loadReportsDashboard = async () => {
      try {
        const result =
          await apiRequest<unknown>(
            "/api/reports/"
          );

        if (cancelled) {
          return;
        }

        setReports(toReportArray(result));
        setReportsLoaded(true);
      } catch {
        if (!cancelled) {
          setReportsLoaded(true);
        }
      }
    };

    void loadReportsDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Convert API records to UI records ────────

  const liveReports: DisplayReport[] = reportsLoaded
    ? reports.map((report) => {
        const style = getReportTypeStyle(report.report_type);

        return {
          id: report.id,
          name: report.name,
          report_type: report.report_type,
          type: report.type || style.label,
          typeColor: style.color,
          typeBg: style.bg,
          status: report.status,
          generated_at: report.generated_at,
          generated_by_name:
            report.generated_by_name || "Unknown",
          views: report.views || 0,
        };
      })
    : [];

  // ── Chart data ───────────────────────────────

  const currentYear = 2026;

  const getMonthlyReportCounts = () => {
    const counts = Array(12).fill(
      0
    ) as number[];

    reports.forEach((report) => {
      const date = new Date(
        report.generated_at
      );

      if (
        !Number.isNaN(date.getTime()) &&
        date.getUTCFullYear() === currentYear
      ) {
        counts[date.getUTCMonth()] += 1;
      }
    });

    return counts;
  };

  const getQuarterlyReportCounts = () => {
    const counts = Array(4).fill(
      0
    ) as number[];

    reports.forEach((report) => {
      const date = new Date(
        report.generated_at
      );

      if (
        !Number.isNaN(date.getTime()) &&
        date.getUTCFullYear() === currentYear
      ) {
        counts[
          Math.floor(date.getUTCMonth() / 3)
        ] += 1;
      }
    });

    return counts;
  };

  const getYearlyReportCounts = () => {
    const years = [
      currentYear - 2,
      currentYear - 1,
      currentYear,
    ];

    return {
      years: years.map(String),

      counts: years.map((year) =>
        reports.filter((report) => {
          const date = new Date(
            report.generated_at
          );

          return (
            !Number.isNaN(date.getTime()) &&
            date.getUTCFullYear() === year
          );
        }).length
      ),
    };
  };

  const liveChartData =
    period === "Monthly"
      ? getMonthlyReportCounts()
      : period === "Quarterly"
        ? getQuarterlyReportCounts()
        : getYearlyReportCounts().counts;

  const chartData = reportsLoaded
  ? liveChartData
  : [];

  const yearlyLabels =
    getYearlyReportCounts().years;

  const labels =
    period === "Monthly"
      ? MONTHS
      : period === "Quarterly"
        ? QUARTERS
        : yearlyLabels;

  // ── Report totals ────────────────────────────

  const liveTotal = reports.length;

  const total = liveTotal;

  const peakIdx =
    chartData.length > 0
      ? chartData.indexOf(Math.max(...chartData))
      : -1;

  const peakLabel =
    peakIdx >= 0
      ? labels[peakIdx] ?? labels[0]
      : "—";

  const peakVal =
    peakIdx >= 0
      ? chartData[peakIdx] ?? 0
      : 0;

  const avg = Math.round(
    chartData.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
      (chartData.length || 1)
  );

  // ── Reports by type ─────────────────────────

const liveReportTypes = reportsLoaded
  ? Object.entries(
      reports.reduce<Record<string, number>>(
        (acc, report) => {
          const type = report.report_type || "other";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {}
      )
    ).map(([type, count]) => {
      const total = reports.length || 1;
      const pct = Math.round((count / total) * 1000) / 10;

      const style =
        TYPE_COLORS[type] || TYPE_COLORS.other;

      return {
        label: `${style.label} Reports`,
        count,
        pct,
        color: style.color,
      };
    })
  : [];

  // ── Recent reports ───────────────────────────

  const displayReports =
    liveReports.slice(0, 4);

  // ── Top reports ──────────────────────────────

const topReports = reportsLoaded
  ? [...reports]
      .sort(
        (a, b) =>
          (b.views || 0) -
          (a.views || 0)
      )
      .slice(0, 5)
      .map((report, index) => ({
        rank: index + 1,
        name: report.name,
        views: report.views || 0,
      }))
  : [];

  // ── Overview cards ──────────────────────────

  const overviewCards = [
    {
      ...OVERVIEW_CARDS[0],
      value: reports.length,
    },
    {
      ...OVERVIEW_CARDS[1],
      value: reports.filter(
        (report) => report.status === "scheduled"
      ).length,
    },
    {
      ...OVERVIEW_CARDS[2],
      value: reports.filter(
        (report) => report.status === "generated"
      ).length,
    },
    {
      ...OVERVIEW_CARDS[3],
      value: reports.reduce(
        (sum, report) => sum + (report.views || 0),
        0
      ),
    },
  ];

  // ── Actions ─────────────────────────────────

  const handleViewReport = async (
    id: number
  ) => {
    try {
      await apiRequest(
        `/api/reports/${id}/view/`
      );
    } catch {
      // Keep existing UI unchanged
    }
  };

const handleDownloadReport = async (id: number) => { 
  try { 
    console.log("=== REPORT DOWNLOAD DEBUG ==="); 
    console.log("Report ID:", id); 
    console.log( 
      "Download endpoint:", 
       `/api/reports/${id}/download/?export_format=pdf` 
    ); 
     
 
    const blob = await apiDownload( 
  `/api/reports/${id}/download/?export_format=pdf` 
); 
 
    console.log("Download successful"); 
    console.log("Blob type:", blob.type); 
    console.log("Blob size:", blob.size); 
 
    const blobUrl = window.URL.createObjectURL(blob); 
 
    const link = document.createElement("a"); 
    link.href = blobUrl; 
    link.download = `report-${id}.pdf`; 
 
    document.body.appendChild(link); 
    link.click(); 
    link.remove(); 
 
    window.setTimeout(() => { 
      window.URL.revokeObjectURL(blobUrl); 
    }, 1000); 
  } catch (error) { 
    console.error("=== REPORT DOWNLOAD ERROR ==="); 
    console.error(error); 
  } 
};


  return (
    <DashboardLayout>
      <div className="page-wrapper">

        {/* Header */}

        <div className="page-header">
          <div>
            <h1 className="page-title">
              Reports Dashboard
            </h1>

            <p className="page-subtitle">
              Track performance and insights
              with detailed reports.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* Date range */}

            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 14px",
                border:
                  "1.5px solid #e2e8f0",
                borderRadius: "8px",
                background: "#fff",
                color: "#374151",
                fontSize: "0.8125rem",
                fontFamily: "inherit",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <HiCalendar
                size={15}
                color="#4f46e5"
              />

              {dateRange}

              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Export */}

            <button
            onClick={() => {
    if (liveReports.length > 0) {
      handleDownloadReport(liveReports[0].id);
    }
  }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                border: "none",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                color: "#fff",
                fontSize: "0.8125rem",
                fontFamily: "inherit",
                cursor: "pointer",
                fontWeight: 600,
                boxShadow:
                  "0 2px 8px rgba(79,70,229,0.3)",
              }}
            >
              <FiDownload size={14} />

              Export

              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        {reportsLoaded ? (
          <>
        {/* Overview Cards */}

        <div className="dashboard-stats-grid">
          {overviewCards.map((card) => (
            <div
              key={card.label}
              className="stat-card-dashboard"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 6px 24px rgba(0,0,0,0.08)";

                e.currentTarget.style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 1px 4px rgba(0,0,0,0.05)";

                e.currentTarget.style.transform =
                  "translateY(0)";
              }}
            >
              <div
                className="stat-card-dashboard-icon"
                style={{
                  background: card.bg,
                  color: card.color,
                }}
              >
                {card.icon}
              </div>

              <div className="stat-card-dashboard-content">
                <p className="stat-card-dashboard-label">
                  {card.label}
                </p>

                <p className="stat-card-dashboard-value">
                  {card.value}
                </p>

                <div className="stat-card-dashboard-change">
                  <span
                    className="stat-card-dashboard-badge"
                    style={{
                      color: card.up
                        ? "#16a34a"
                        : "#dc2626",

                      background: card.up
                        ? "rgba(22,163,74,0.08)"
                        : "rgba(220,38,38,0.08)",
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: card.up
                          ? "none"
                          : "rotate(180deg)",
                      }}
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>

                    {card.change}
                  </span>

                  <span className="stat-card-dashboard-since">
                    vs last month
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}

        <div
          id="reports-charts"
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 380px",
            gap: "16px",
          }}
        >
          {/* Reports Overview Chart */}

          <div
            style={{
              background: "#fff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "20px",
              boxShadow:
                "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "flex-start",
                justifyContent:
                  "space-between",
                marginBottom: "16px",
              }}
            >
              <div>
                <h3
                  style={{
                    margin:
                      "0 0 2px",
                    fontSize:
                      "0.95rem",
                    fontWeight: 700,
                    color:
                      "#0f172a",
                  }}
                >
                  Reports Overview
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize:
                      "0.78rem",
                    color:
                      "#94a3b8",
                  }}
                >
                  Reports generated over time
                </p>
              </div>

              <select
                value={period}
                onChange={(e) =>
                  setPeriod(
                    e.target
                      .value as
                      | "Monthly"
                      | "Quarterly"
                      | "Yearly"
                  )
                }
                style={{
                  padding:
                    "5px 28px 5px 10px",
                  border:
                    "1.5px solid #e2e8f0",
                  borderRadius:
                    "7px",
                  background: "#fff",
                  color:
                    "#374151",
                  fontSize:
                    "0.8rem",
                  fontFamily:
                    "inherit",
                  outline: "none",
                  cursor:
                    "pointer",
                  appearance:
                    "none",
                }}
              >
                <option value="Monthly">
                  Monthly
                </option>

                <option value="Quarterly">
                  Quarterly
                </option>

                <option value="Yearly">
                  Yearly
                </option>
              </select>
            </div>

            <LineChart
              data={chartData}
              labels={labels}
            />

            {/* Summary stats */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "12px",
                marginTop: "16px",
                paddingTop: "16px",
                borderTop:
                  "1px solid #f1f5f9",
              }}
            >
              {[
                {
                  icon: "🏆",
                  label: "PEAK MONTH",
                  value:
                    peakLabel,
                  sub: `${peakVal} reports`,
                },

                {
                  icon: "📋",
                  label: "TOTAL REPORTS",
                  value: String(
                    total
                  ),
                  sub: "this period",
                },

                {
                  icon: "📊",
                  label: "AVG / MONTH",
                  value: String(
                    avg
                  ),
                  sub: "reports",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  <p
                    style={{
                      margin:
                        "0 0 2px",
                      fontSize:
                        "0.7rem",
                      color:
                        "#94a3b8",
                      fontWeight: 600,
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.05em",
                    }}
                  >
                    {stat.icon}{" "}
                    {stat.label}
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 1px",
                      fontSize:
                        "1.5rem",
                      fontWeight: 700,
                      color:
                        "#0f172a",
                    }}
                  >
                    {stat.value}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize:
                        "0.72rem",
                      color:
                        "#94a3b8",
                    }}
                  >
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reports by Type */}

          <div
            style={{
              background: "#fff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "20px",
              boxShadow:
                "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 2px",
                  fontSize:
                    "0.95rem",
                  fontWeight: 700,
                  color:
                    "#0f172a",
                }}
              >
                Reports by Type
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize:
                    "0.78rem",
                  color:
                    "#94a3b8",
                }}
              >
                Distribution of reports by category
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
                marginBottom:
                  "16px",
              }}
            >
              <DonutChart
                data={
                  liveReportTypes
                }
                total={total}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: "8px",
              }}
            >
              {liveReportTypes.map(
                (item) => (
                  <div
                    key={
                      item.label
                    }
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius:
                            "50%",
                          background:
                            item.color,
                          flexShrink: 0,
                        }}
                      />

                      <span
                        style={{
                          fontSize:
                            "0.8125rem",
                          color:
                            "#374151",
                        }}
                      >
                        {
                          item.label
                        }
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize:
                          "0.8125rem",
                        fontWeight: 600,
                        color:
                          "#374151",
                      }}
                    >
                      {item.count}{" "}
                      <span
                        style={{
                          color:
                            "#94a3b8",
                          fontWeight: 400,
                        }}
                      >
                        ({item.pct}%)
                      </span>
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}

        <div
          id="reports-table"
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 360px",
            gap: "16px",
          }}
        >
          {/* Recent Reports */}

          <div
            style={{
              background: "#fff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow:
                "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding:
                  "16px 20px",
                borderBottom:
                  "1px solid #f1f5f9",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 2px",
                  fontSize:
                    "0.95rem",
                  fontWeight: 700,
                  color:
                    "#0f172a",
                }}
              >
                Recent Reports
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize:
                    "0.78rem",
                  color:
                    "#94a3b8",
                }}
              >
                Recently generated reports
              </p>
            </div>

            <div
              style={{
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  fontFamily:
                    "inherit",
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Report Name",
                      "Type",
                      "Date Generated",
                      "Generated By",
                      "Actions",
                    ].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding:
                              "11px 16px",
                            textAlign:
                              "left",
                            fontSize:
                              "0.72rem",
                            fontWeight: 600,
                            color:
                              "#64748b",
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "0.06em",
                            background:
                              "#f8fafc",
                            borderBottom:
                              "1px solid #e2e8f0",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {displayReports.map(
                    (r, idx) => (
                      <tr
                        key={r.id}
                        style={{
                          borderBottom:
                            idx ===
                            displayReports.length -
                              1
                              ? "none"
                              : "1px solid #f1f5f9",

                          transition:
                            "background 0.12s ease",
                        }}
                        onMouseEnter={(
                          e
                        ) => {
                          e.currentTarget.style.background =
                            "#fafbff";
                        }}
                        onMouseLeave={(
                          e
                        ) => {
                          e.currentTarget.style.background =
                            "transparent";
                        }}
                      >
                        {/* Report Name */}

                        <td
                          style={{
                            padding:
                              "14px 16px",
                            fontSize:
                              "0.875rem",
                            fontWeight: 600,
                            color:
                              "#0f172a",
                          }}
                        >
                          {r.name}
                        </td>

                        {/* Type */}

                        <td
                          style={{
                            padding:
                              "14px 16px",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: 6,
                              padding:
                                "3px 10px",
                              borderRadius:
                                "6px",
                              fontSize:
                                "0.75rem",
                              fontWeight: 600,
                              background:
                                r.typeBg,
                              color:
                                r.typeColor,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius:
                                  "50%",
                                background:
                                  r.typeColor,
                                flexShrink: 0,
                              }}
                            />

                            {r.type}
                          </span>
                        </td>

                        {/* Date */}

                        <td
                          style={{
                            padding:
                              "14px 16px",
                            fontSize:
                              "0.8125rem",
                            color:
                              "#374151",
                          }}
                        >
                          {formatReportDate(
                            r.generated_at
                          )}
                        </td>

                        {/* Generated By */}

                        <td
                          style={{
                            padding:
                              "14px 16px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 7,
                            }}
                          >
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius:
                                  "50%",
                                background:
                                  "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                color:
                                  "#fff",
                                fontWeight: 700,
                                fontSize:
                                  "0.6rem",
                                flexShrink: 0,
                              }}
                            >
                              {r.generated_by_name
                                .split(
                                  " "
                                )
                                .filter(
                                  Boolean
                                )
                                .map(
                                  (
                                    n
                                  ) =>
                                    n[0]
                                )
                                .join(
                                  ""
                                )
                                .toUpperCase()}
                            </div>

                            <span
                              style={{
                                fontSize:
                                  "0.8125rem",
                                color:
                                  "#374151",
                              }}
                            >
                              {
                                r.generated_by_name
                              }
                            </span>
                          </div>
                        </td>

                        {/* Action Buttons */}

                        <td
                          style={{
                            padding:
                              "14px 16px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: 5,
                            }}
                          >
                            {[
                              {
                                title:
                                  "View",
                                color:
                                  "#4f46e5",
                                hoverBg:
                                  "#eef2ff",
                                hoverBorder:
                                  "#a5b4fc",
                                icon: (
                                  <HiEye
                                    size={
                                      14
                                    }
                                  />
                                ),
                              },
                              {
                                title:
                                  "Download",
                                color:
                                  "#16a34a",
                                hoverBg:
                                  "#dcfce7",
                                hoverBorder:
                                  "#bbf7d0",
                                icon: (
                                  <HiDownload
                                    size={
                                      13
                                    }
                                  />
                                ),
                              },
                            ].map(
                              (
                                btn
                              ) => (
                                <button
                                  key={
                                    btn.title
                                  }
                                  title={
                                    btn.title
                                  }
                                  onClick={() =>
                                    btn.title ===
                                    "View"
                                      ? handleViewReport(
                                          r.id
                                        )
                                      : handleDownloadReport(
                                          r.id
                                        )
                                  }
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderWidth:
                                      "1.5px",
                                    borderStyle:
                                      "solid",
                                    borderColor:
                                      "#e2e8f0",
                                    borderRadius:
                                      "7px",
                                    background:
                                      "#fff",
                                    color:
                                      btn.color,
                                    cursor:
                                      "pointer",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                    padding: 0,
                                    transition:
                                      "all 0.12s ease",
                                  }}
                                  onMouseEnter={(
                                    e
                                  ) => {
                                    e.currentTarget.style.background =
                                      btn.hoverBg;

                                    e.currentTarget.style.borderColor =
                                      btn.hoverBorder;

                                    e.currentTarget.style.transform =
                                      "translateY(-1px)";
                                  }}
                                  onMouseLeave={(
                                    e
                                  ) => {
                                    e.currentTarget.style.background =
                                      "#fff";

                                    e.currentTarget.style.borderColor =
                                      "#e2e8f0";

                                    e.currentTarget.style.transform =
                                      "none";
                                  }}
                                >
                                  {
                                    btn.icon
                                  }
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding:
                  "12px 20px",
                borderTop:
                  "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={() =>
                  document
                    .getElementById(
                      "reports-table"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: "6px",
                  padding:
                    "8px 16px",
                  borderWidth:
                    "1.5px",
                  borderStyle:
                    "solid",
                  borderColor:
                    "#4f46e5",
                  borderRadius:
                    "8px",
                  background:
                    "#fff",
                  color:
                    "#4f46e5",
                  fontSize:
                    "0.875rem",
                  fontWeight: 600,
                  fontFamily:
                    "inherit",
                  cursor:
                    "pointer",
                  transition:
                    "all 0.15s",
                }}
                onMouseEnter={(
                  e
                ) => {
                  e.currentTarget.style.background =
                    "#eef2ff";
                }}
                onMouseLeave={(
                  e
                ) => {
                  e.currentTarget.style.background =
                    "#fff";
                }}
              >
                View all reports{" "}
                <HiArrowRight
                  size={15}
                />
              </button>
            </div>
          </div>

          {/* Top Reports */}

          <div
            style={{
              background: "#fff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "20px",
              boxShadow:
                "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                marginBottom:
                  "16px",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 2px",
                  fontSize:
                    "0.95rem",
                  fontWeight: 700,
                  color:
                    "#0f172a",
                }}
              >
                Top Reports
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize:
                    "0.78rem",
                  color:
                    "#94a3b8",
                }}
              >
                Most viewed reports
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: "0",
              }}
            >
              {topReports.map(
                (r, idx) => (
                  <div
                    key={r.rank}
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "12px",
                      padding:
                        "12px 0",
                      borderBottom:
                        idx ===
                        topReports.length -
                          1
                          ? "none"
                          : "1px solid #f1f5f9",
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius:
                          "50%",
                        background:
                          r.rank <=
                          3
                            ? "#eef2ff"
                            : "#f1f5f9",
                        color:
                          r.rank <=
                          3
                            ? "#4f46e5"
                            : "#94a3b8",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize:
                          "0.75rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {r.rank}
                    </span>

                    <p
                      style={{
                        margin: 0,
                        flex: 1,
                        fontSize:
                          "0.875rem",
                        fontWeight: 500,
                        color:
                          "#374151",
                      }}
                    >
                      {r.name}
                    </p>

                    <span
                      style={{
                        fontSize:
                          "0.8125rem",
                        color:
                          "#94a3b8",
                        fontWeight: 500,
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {r.views} views
                    </span>
                  </div>
                )
              )}
            </div>

            <div
              style={{
                marginTop:
                  "14px",
                paddingTop:
                  "14px",
                borderTop:
                  "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={() =>
                  document
                    .getElementById(
                      "reports-charts"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: "6px",
                  padding:
                    "8px 16px",
                  borderWidth:
                    "1.5px",
                  borderStyle:
                    "solid",
                  borderColor:
                    "#4f46e5",
                  borderRadius:
                    "8px",
                  background:
                    "#fff",
                  color:
                    "#4f46e5",
                  fontSize:
                    "0.875rem",
                  fontWeight: 600,
                  fontFamily:
                    "inherit",
                  cursor:
                    "pointer",
                  transition:
                    "all 0.15s",
                }}
                onMouseEnter={(
                  e
                ) => {
                  e.currentTarget.style.background =
                    "#eef2ff";
                }}
                onMouseLeave={(
                  e
                ) => {
                  e.currentTarget.style.background =
                    "#fff";
                }}
              >
                View full analytics{" "}
                <HiArrowRight
                  size={15}
                />
              </button>
            </div>
          </div>
        </div>
          </>
        ) : (
          <ReportsDashboardSkeleton />
        )}

      </div>
    </DashboardLayout>
  );
}