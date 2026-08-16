"use client";

import { TaskPriority } from "@/data/tasks";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { dot: string; color: string }
> = {
  Low:    { dot: "#22c55e", color: "#15803d" },
  Medium: { dot: "#f59e0b", color: "#b45309" },
  High:   { dot: "#ef4444", color: "#dc2626" },
  Urgent: { dot: "#7c3aed", color: "#6d28d9" },
};

export default function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG["Medium"];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: "0.8125rem",
        fontWeight: 600,
        color: cfg.color,
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {priority}
    </span>
  );
}
