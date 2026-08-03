"use client";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ReactNode;
  color?: string; // accent color for the icon bg
}

export default function StatCard({ label, value, change, up, icon, color = "#4f46e5" }: StatCardProps) {
  const lightColor = hexToRgba(color, 0.1);

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "1rem",
      padding: "1.375rem 1.5rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      transition: "box-shadow 0.2s ease, transform 0.2s ease",
      cursor: "default",
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <p style={{
          margin: 0,
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}>
          {label}
        </p>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "0.625rem",
          background: lightColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <p style={{
        margin: 0,
        fontSize: "1.875rem",
        fontWeight: 700,
        color: "#0f172a",
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}>
        {value}
      </p>

      {/* Change badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.2rem",
          fontSize: "0.8rem",
          fontWeight: 700,
          color: up ? "#16a34a" : "#dc2626",
          background: up ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
          padding: "2px 7px",
          borderRadius: 9999,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: up ? "none" : "rotate(180deg)" }}>
            <polyline points="18 15 12 9 6 15" />
          </svg>
          {change}
        </span>
        <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>vs last month</span>
      </div>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(79,70,229,${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
