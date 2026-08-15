"use client";

import { TaskStatus } from "@/data/tasks";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

const STATUS_CONFIG: Record<
  TaskStatus,
  { bg: string; color: string; border: string; dot: string }
> = {
  "To Do": {
    bg: "#eff6ff",
    color: "#2563eb",
    border: "#bfdbfe",
    dot: "#3b82f6",
  },
  "In Progress": {
    bg: "#fef3c7",
    color: "#b45309",
    border: "#fde68a",
    dot: "#f59e0b",
  },
  Completed: {
    bg: "#dcfce7",
    color: "#15803d",
    border: "#bbf7d0",
    dot: "#22c55e",
  },
  "On Hold": {
    bg: "#f1f5f9",
    color: "#475569",
    border: "#cbd5e1",
    dot: "#64748b",
  },
  Cancelled: {
    bg: "#fef2f2",
    color: "#dc2626",
    border: "#fecaca",
    dot: "#ef4444",
  },
};

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["To Do"];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px 3px 8px",
        borderRadius: 999,
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        userSelect: "none",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}
