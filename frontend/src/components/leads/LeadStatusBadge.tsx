import { LeadStatus } from "@/data/leads";

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

const STATUS_STYLES: Record<LeadStatus, { bg: string; color: string; border: string; dot: string }> = {
  "New":         { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
  "Contacted":   { bg: "#fef3c7", color: "#b45309", border: "#fde68a", dot: "#f59e0b" },
  "Qualified":   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  "Lost":        { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#ef4444" },
};

export default function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const s = STATUS_STYLES[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "9999px", fontSize: "0.75rem",
      fontWeight: 600, letterSpacing: "0.02em",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}
