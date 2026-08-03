"use client";

import { useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DATA = {
  revenue: [42000, 51000, 47000, 63000, 58000, 72000, 68000, 84200, 79000, 91000, 88000, 97000],
  deals:   [18,    24,    21,    31,    28,    36,    33,    41,    38,    46,    44,    52],
};

type DataKey = keyof typeof DATA;

const W = 680;
const H = 220;
const PAD = { top: 20, right: 20, bottom: 36, left: 56 };

function normalize(values: number[]): number[] {
  const max = Math.max(...values);
  const min = Math.min(...values) * 0.85;
  return values.map((v) => (v - min) / (max - min));
}

function buildPath(normed: number[], fill = false): string {
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const pts = normed.map((n, i) => ({
    x: PAD.left + (i / (normed.length - 1)) * plotW,
    y: PAD.top + (1 - n) * plotH,
  }));

  // Smooth curve using cubic bezier
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cpx} ${pts[i - 1].y}, ${cpx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }

  if (fill) {
    const lastX = pts[pts.length - 1].x;
    const bottomY = PAD.top + plotH;
    d += ` L ${lastX} ${bottomY} L ${PAD.left} ${bottomY} Z`;
  }

  return d;
}

function buildPoints(normed: number[]): { x: number; y: number }[] {
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  return normed.map((n, i) => ({
    x: PAD.left + (i / (normed.length - 1)) * plotW,
    y: PAD.top + (1 - n) * plotH,
  }));
}

function formatValue(key: DataKey, v: number): string {
  if (key === "revenue") {
    return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;
  }
  return String(v);
}

export default function RevenueChart() {
  const [active, setActive] = useState<DataKey>("revenue");
  const [hovered, setHovered] = useState<number | null>(null);

  const values = DATA[active];
  const normed = normalize(values);
  const points = buildPoints(normed);
  const fillPath = buildPath(normed, true);
  const linePath = buildPath(normed, false);

  const gradId = `grad-${active}`;
  const plotH = H - PAD.top - PAD.bottom;
  const plotW = W - PAD.left - PAD.right;

  // Y axis tick labels (4 ticks)
  const maxV = Math.max(...values);
  const minV = Math.min(...values) * 0.85;
  const yTicks = [0, 0.33, 0.66, 1].map((t) => ({
    y: PAD.top + (1 - t) * plotH,
    label: formatValue(active, Math.round(minV + t * (maxV - minV))),
  }));

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "1rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Sales Overview</h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "#64748b" }}>Monthly trends — last 12 months</p>
        </div>
        {/* Toggle */}
        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
          {(["revenue", "deals"] as DataKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setActive(k)}
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                border: "none",
                background: active === k ? "#fff" : "transparent",
                color: active === k ? "#4f46e5" : "#64748b",
                fontWeight: active === k ? 700 : 500,
                fontSize: "0.8125rem",
                cursor: "pointer",
                boxShadow: active === k ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                fontFamily: "inherit",
                transition: "all 0.15s",
                textTransform: "capitalize",
              }}
            >
              {k === "revenue" ? "Revenue" : "Deals Closed"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: "8px 0 4px", position: "relative" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Y grid lines */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y}
                stroke="#f1f5f9" strokeWidth="1"
              />
              <text
                x={PAD.left - 8} y={t.y + 4}
                textAnchor="end"
                fontSize="11" fill="#94a3b8" fontFamily="inherit"
              >
                {t.label}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {MONTHS.map((m, i) => (
            <text
              key={m}
              x={PAD.left + (i / (MONTHS.length - 1)) * plotW}
              y={H - 6}
              textAnchor="middle"
              fontSize="11" fill="#94a3b8" fontFamily="inherit"
            >
              {m}
            </text>
          ))}

          {/* Area fill */}
          <path d={fillPath} fill={`url(#${gradId})`} />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Hover targets + dots */}
          {points.map((pt, i) => (
            <g key={i}>
              {/* Invisible wide hover target */}
              <rect
                x={pt.x - (plotW / MONTHS.length) / 2}
                y={PAD.top}
                width={plotW / MONTHS.length}
                height={plotH}
                fill="transparent"
                style={{ cursor: "crosshair" }}
                onMouseEnter={() => setHovered(i)}
              />
              {hovered === i && (
                <>
                  {/* Vertical guideline */}
                  <line
                    x1={pt.x} y1={PAD.top} x2={pt.x} y2={PAD.top + plotH}
                    stroke="#4f46e5" strokeWidth="1" strokeDasharray="4,3" opacity="0.5"
                  />
                  {/* Dot */}
                  <circle cx={pt.x} cy={pt.y} r={6} fill="#4f46e5" stroke="#fff" strokeWidth="2.5" />
                  {/* Tooltip box */}
                  <g>
                    <rect
                      x={pt.x - 38} y={pt.y - 38}
                      width={76} height={28}
                      rx={6} fill="#0f172a"
                    />
                    <text
                      x={pt.x} y={pt.y - 19}
                      textAnchor="middle" fontSize="12"
                      fontWeight="700" fill="#ffffff" fontFamily="inherit"
                    >
                      {formatValue(active, values[i])}
                    </text>
                  </g>
                </>
              )}
              {hovered !== i && (
                <circle cx={pt.x} cy={pt.y} r={3} fill="#4f46e5" opacity="0.4" />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Summary row */}
      <div style={{
        display: "flex", gap: 0,
        borderTop: "1px solid #f1f5f9",
      }}>
        {[
          { label: "Peak Month", value: MONTHS[values.indexOf(Math.max(...values))], icon: "🏆" },
          { label: "Total", value: active === "revenue" ? `$${(values.reduce((a, b) => a + b, 0) / 1000).toFixed(0)}k` : String(values.reduce((a, b) => a + b, 0)), icon: "📊" },
          { label: "Avg / Month", value: active === "revenue" ? `$${Math.round(values.reduce((a, b) => a + b, 0) / values.length / 1000)}k` : String(Math.round(values.reduce((a, b) => a + b, 0) / values.length)), icon: "📈" },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1,
            padding: "12px 16px",
            borderRight: i < 2 ? "1px solid #f1f5f9" : "none",
            textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {s.icon} {s.label}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
