"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  HiDocumentReport, HiCalendar, HiCheckCircle, HiEye,
  HiDownload, HiArrowRight, HiTrendingUp, HiChartBar,
} from "react-icons/hi";
import { FiDownload } from "react-icons/fi";

// ── Dummy Data ──────────────────────────────────
const OVERVIEW_CARDS = [
  { label: "Total Reports", value: 18, change: "+20%", up: true, icon: <HiDocumentReport size={22} />, color: "#4f46e5", bg: "#eef2ff" },
  { label: "Scheduled Reports", value: 6, change: "+50%", up: true, icon: <HiCalendar size={22} />, color: "#d97706", bg: "#fef3c7" },
  { label: "Reports Generated", value: 32, change: "+14%", up: true, icon: <HiCheckCircle size={22} />, color: "#16a34a", bg: "#dcfce7" },
  { label: "Reports Viewed", value: 128, change: "+18%", up: true, icon: <HiEye size={22} />, color: "#0891b2", bg: "#ecfeff" },
];

const CHART_DATA: Record<string, number[]> = {
  Monthly: [8, 15, 12, 18, 22, 28, 38, 25, 20, 15, 10, 6],
  Quarterly: [35, 78, 83, 31],
  Yearly: [180, 220, 280],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const YEARS = ["2022", "2023", "2024"];

const REPORT_TYPES = [
  { label: "Sales Reports", count: 12, pct: 37.5, color: "#4f46e5" },
  { label: "Pipeline Reports", count: 8, pct: 25, color: "#0891b2" },
  { label: "Activity Reports", count: 6, pct: 18.8, color: "#f59e0b" },
  { label: "Customer Reports", count: 4, pct: 12.5, color: "#16a34a" },
  { label: "Other Reports", count: 2, pct: 6.2, color: "#ef4444" },
];

const RECENT_REPORTS = [
  { id: 1, name: "Sales Performance Report", type: "Sales", typeColor: "#4f46e5", typeBg: "#eef2ff", date: "May 29, 2025 10:30 AM", generatedBy: "Test User" },
  { id: 2, name: "Pipeline Analysis Report", type: "Pipeline", typeColor: "#0891b2", typeBg: "#ecfeff", date: "May 29, 2025 09:15 AM", generatedBy: "Test User" },
  { id: 3, name: "Lead Source Report", type: "Activity", typeColor: "#f59e0b", typeBg: "#fef3c7", date: "May 28, 2025 04:45 PM", generatedBy: "Test User" },
  { id: 4, name: "Revenue Summary Report", type: "Sales", typeColor: "#4f46e5", typeBg: "#eef2ff", date: "May 28, 2025 02:20 PM", generatedBy: "Test User" },
];

const TOP_REPORTS = [
  { rank: 1, name: "Sales Performance Report", views: 28 },
  { rank: 2, name: "Pipeline Analysis Report", views: 22 },
  { rank: 3, name: "Revenue Summary Report", views: 18 },
  { rank: 4, name: "Lead Conversion Report", views: 14 },
  { rank: 5, name: "Activity Overview Report", views: 12 },
];

// ── Simple Line Chart ──────────────────────────
function LineChart({ data, labels }: { data: number[]; labels: string[] }) {
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
    x: padL + (i / (data.length - 1)) * chartW,
    y: padT + chartH - ((v - min) / (max - min || 1)) * chartH,
  }));

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");
  const area = `${points[0].x},${padT + chartH} ${polyline} ${points[points.length - 1].x},${padT + chartH}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Y grid lines */}
      {[0, 10, 20, 30, 40].map(v => {
        const y = padT + chartH - ((v - min) / (max - min || 1)) * chartH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 4} y={y + 4} fontSize="9" fill="#94a3b8" textAnchor="end">{v}</text>
          </g>
        );
      })}
      {/* Area */}
      <polygon points={area} fill="url(#areaGrad)" />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
      ))}
      {/* X labels */}
      {labels.map((l, i) => (
        <text key={i} x={padL + (i / (labels.length - 1)) * chartW} y={H - 6} fontSize="9" fill="#94a3b8" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

// ── Donut Chart ────────────────────────────────
function DonutChart({ data, total }: { data: typeof REPORT_TYPES; total: number }) {
  const R = 55;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * R;
  let offset = 0;

  return (
    <svg viewBox="0 0 160 160" style={{ width: 160, height: 160 }}>
      {data.map((item, i) => {
        const dash = (item.pct / 100) * circumference;
        const gap = circumference - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={R}
            fill="none" stroke={item.color} strokeWidth="22"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#0f172a">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#94a3b8">Total</text>
    </svg>
  );
}

// ── Main Page ──────────────────────────────────
export default function ReportsDashboardPage() {
  const [period, setPeriod] = useState<"Monthly" | "Quarterly" | "Yearly">("Monthly");
  const [dateRange] = useState("May 1, 2025 - May 31, 2025");

  const chartData = CHART_DATA[period];
  const labels = period === "Monthly" ? MONTHS : period === "Quarterly" ? QUARTERS : YEARS;
  const total = REPORT_TYPES.reduce((s, r) => s + r.count, 0);

  const peakIdx = chartData.indexOf(Math.max(...chartData));
  const peakLabel = labels[peakIdx];
  const peakVal = chartData[peakIdx];
  const avg = Math.round(chartData.reduce((s, v) => s + v, 0) / chartData.length);

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Reports Dashboard</h1>
            <p className="page-subtitle">Track performance and insights with detailed reports.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Date range */}
            <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "8px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8125rem", fontFamily: "inherit", cursor: "pointer", fontWeight: 500 }}>
              <HiCalendar size={15} color="#4f46e5" />
              {dateRange}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {/* Export */}
            <button style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "none", borderRadius: "8px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", fontSize: "0.8125rem", fontFamily: "inherit", cursor: "pointer", fontWeight: 600, boxShadow: "0 2px 8px rgba(79,70,229,0.3)" }}>
              <FiDownload size={14} /> Export
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {OVERVIEW_CARDS.map(card => (
            <div key={card.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</p>
                  <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.1 }}>{card.value}</p>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: "10px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                  {card.icon}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: card.up ? "#16a34a" : "#dc2626", background: card.up ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)", padding: "2px 6px", borderRadius: "9999px" }}>
                  {card.up ? "↑" : "↓"} {card.change}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "16px" }}>

          {/* Reports Overview Chart */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: "0 0 2px", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Reports Overview</h3>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>Reports generated over time</p>
              </div>
              <select value={period} onChange={e => setPeriod(e.target.value as "Monthly" | "Quarterly" | "Yearly")}
                style={{ padding: "5px 28px 5px 10px", border: "1.5px solid #e2e8f0", borderRadius: "7px", background: "#fff", color: "#374151", fontSize: "0.8rem", fontFamily: "inherit", outline: "none", cursor: "pointer", appearance: "none" }}>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <LineChart data={chartData} labels={labels} />

            {/* Summary stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
              {[
                { icon: "🏆", label: "PEAK MONTH", value: peakLabel, sub: `${peakVal} reports` },
                { icon: "📋", label: "TOTAL REPORTS", value: "32", sub: "this period" },
                { icon: "📊", label: "AVG / MONTH", value: String(avg), sub: "reports" },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <p style={{ margin: "0 0 2px", fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {stat.icon} {stat.label}
                  </p>
                  <p style={{ margin: "0 0 1px", fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>{stat.value}</p>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reports by Type */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ margin: "0 0 2px", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Reports by Type</h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>Distribution of reports by category</p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <DonutChart data={REPORT_TYPES} total={total} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {REPORT_TYPES.map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.8125rem", color: "#374151" }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }}>
                    {item.count} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({item.pct}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "16px" }}>

          {/* Recent Reports */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: "0 0 2px", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Recent Reports</h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>Recently generated reports</p>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "inherit" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["REPORT NAME", "TYPE", "DATE GENERATED", "GENERATED BY", "ACTION"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_REPORTS.map((r, idx) => (
                  <tr key={r.id} style={{ borderBottom: idx === RECENT_REPORTS.length - 1 ? "none" : "1px solid #f1f5f9", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                    <td style={{ padding: "12px 16px", fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{r.name}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, background: r.typeBg, color: r.typeColor }}>{r.type}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "#64748b" }}>{r.date}</td>
                    <td style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "#64748b" }}>{r.generatedBy}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button title="View" style={{ width: 30, height: 30, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5", borderRadius: "6px" }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#eef2ff"}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}>
                          <HiEye size={16} />
                        </button>
                        <button title="Download" style={{ width: 30, height: 30, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", borderRadius: "6px" }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#dcfce7"}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}>
                          <HiDownload size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9" }}>
              <button style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "#4f46e5", fontSize: "0.875rem", fontWeight: 600, fontFamily: "inherit" }}>
                View all reports <HiArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Top Reports */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ margin: "0 0 2px", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Top Reports</h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>Most viewed reports</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {TOP_REPORTS.map((r, idx) => (
                <div key={r.rank} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: idx === TOP_REPORTS.length - 1 ? "none" : "1px solid #f1f5f9" }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: r.rank <= 3 ? "#eef2ff" : "#f1f5f9", color: r.rank <= 3 ? "#4f46e5" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                    {r.rank}
                  </span>
                  <p style={{ margin: 0, flex: 1, fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>{r.name}</p>
                  <span style={{ fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>{r.views} views</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
              <button style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "#4f46e5", fontSize: "0.875rem", fontWeight: 600, fontFamily: "inherit" }}>
                View full analytics <HiArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
