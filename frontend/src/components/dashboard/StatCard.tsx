"use client";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ReactNode;
  color?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(79,70,229,${alpha})`;
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${alpha})`;
}

export default function StatCard({ label, value, change, up, icon, color = "#4f46e5" }: StatCardProps) {
  const lightColor = hexToRgba(color, 0.1);

  return (
    <div
      className="stat-card-dashboard"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Icon */}
      <div
        className="stat-card-dashboard-icon"
        style={{ background: lightColor, color: color }}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="stat-card-dashboard-content">
        <p className="stat-card-dashboard-label">{label}</p>
        <p className="stat-card-dashboard-value">{value}</p>
        <div className="stat-card-dashboard-change">
          <span
            className="stat-card-dashboard-badge"
            style={{
              color: up ? "#16a34a" : "#dc2626",
              background: up ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
            }}
          >
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: up ? "none" : "rotate(180deg)" }}
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
            {change}
          </span>
          <span className="stat-card-dashboard-since">vs last month</span>
        </div>
      </div>
    </div>
  );
}
