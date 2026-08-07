"use client";

import { useState } from "react";
import type { DonutSource } from "@/lib/dashboard";

const CX = 80, CY = 80, R = 60;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  // Avoid full-circle edge case
  if (end - start >= 360) end = start + 359.999;
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

interface LeadsDonutChartProps {
  sources: DonutSource[];
}

export default function LeadsDonutChart({ sources }: LeadsDonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const TOTAL = sources.reduce((s, x) => s + x.value, 0);

  // Build cumulative angles without mutating a variable during render
  const segments = sources.reduce<
    Array<DonutSource & { startAngle: number; endAngle: number }>
  >((acc, src) => {
    const prev = acc[acc.length - 1];
    const startAngle = prev ? prev.endAngle : 0;
    const endAngle = startAngle + (src.value / TOTAL) * 360;
    acc.push({ ...src, startAngle, endAngle });
    return acc;
  }, []);

  const active = hovered !== null ? sources[hovered] : null;

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "1rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Leads by Source</h3>
        <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "#64748b" }}>
          {TOTAL} total leads this quarter
        </p>
      </div>

      {TOTAL === 0 ? (
        <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
          No leads recorded yet.
        </div>
      ) : (
        /* Chart + legend */
        <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>

          {/* Donut SVG */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg width={160} height={160} viewBox="0 0 160 160">
              {/* Background track */}
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={22} />

              {segments.map((seg, i) => {
                const isHovered = hovered === i;
                const outerR = isHovered ? R + 5 : R;
                return (
                  <path
                    key={i}
                    d={describeArc(CX, CY, outerR, seg.startAngle, seg.endAngle)}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isHovered ? 26 : 22}
                    strokeLinecap="butt"
                    style={{ cursor: "pointer", transition: "stroke-width 0.15s, stroke 0.15s" }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}

              {/* Inner label */}
              <text x={CX} y={CY - 8} textAnchor="middle" fontSize="18" fontWeight="800" fill="#0f172a" fontFamily="inherit">
                {active ? active.value : TOTAL}
              </text>
              <text x={CX} y={CY + 10} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="inherit" fontWeight="600">
                {active ? "leads" : "total leads"}
              </text>
              {active && (
                <text x={CX} y={CY + 24} textAnchor="middle" fontSize="9" fill={active.color} fontFamily="inherit" fontWeight="700">
                  {Math.round((active.value / TOTAL) * 100)}%
                </text>
              )}
            </svg>
          </div>

          {/* Legend */}
          <div style={{ flex: 1, minWidth: 140, display: "flex", flexDirection: "column", gap: 8 }}>
            {sources.map((src, i) => (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  cursor: "pointer", opacity: hovered !== null && hovered !== i ? 0.45 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 3, background: src.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "0.8125rem", color: "#374151", fontWeight: 500 }}>{src.label}</span>
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>{src.value}</span>
                <span style={{
                  fontSize: "0.72rem", fontWeight: 700,
                  color: src.color,
                  background: `${src.color}15`,
                  padding: "1px 6px", borderRadius: 9999,
                }}>
                  {Math.round((src.value / TOTAL) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
