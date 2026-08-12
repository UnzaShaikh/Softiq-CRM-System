import { ActivityStatus, ActivityType, ActivityPriority } from "@/data/activity";

const STATUS_STYLES: Record<ActivityStatus, { bg: string; color: string; border: string; dot: string }> = {
  "Scheduled":  { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
  "Completed":  { bg: "#dcfce7", color: "#15803d", border: "#86efac", dot: "#22c55e" },
  "Cancelled":  { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
  "Overdue":    { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#ef4444" },
};

const TYPE_STYLES: Record<ActivityType, { bg: string; color: string }> = {
  "Call":       { bg: "#eef2ff", color: "#4f46e5" },
  "Meeting":    { bg: "#faf5ff", color: "#7c3aed" },
  "Email":      { bg: "#ecfeff", color: "#0891b2" },
  "Task":       { bg: "#fef3c7", color: "#b45309" },
  "Follow-up":  { bg: "#f0fdf4", color: "#16a34a" },
};

const PRIORITY_STYLES: Record<ActivityPriority, { bg: string; color: string; border: string }> = {
  "High":   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
  "Medium": { bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
  "Low":    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
};

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

export function ActivityTypeBadge({ type }: { type: ActivityType }) {
  const s = TYPE_STYLES[type];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {type}
    </span>
  );
}

export function ActivityPriorityBadge({ priority }: { priority: ActivityPriority }) {
  const s = PRIORITY_STYLES[priority];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      {priority}
    </span>
  );
}
