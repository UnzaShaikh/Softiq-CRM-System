"use client";

import { useState } from "react";
import { Task, getAvatarColor, getDaysRemaining } from "@/data/tasks";
import { usePermission } from "@/hooks/usePermissions";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskPriorityBadge from "./TaskPriorityBadge";

interface TaskTableProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

type SortKey = "title" | "assignee" | "priority" | "status" | "dueDate" | "createdDate";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<string, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};
const STATUS_ORDER: Record<string, number> = {
  "In Progress": 5, "To Do": 4, "On Hold": 3, Completed: 2, Cancelled: 1,
};

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  const active = sortKey === col;
  const color = active ? "#4f46e5" : "#94a3b8";
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      {active && sortDir === "asc" ? (
        <polyline points="18 15 12 9 6 15" />
      ) : active && sortDir === "desc" ? (
        <polyline points="6 9 12 15 18 9" />
      ) : (
        <>
          <polyline points="18 15 12 9 6 15" opacity="0.35" />
          <polyline points="6 9 12 15 18 9" opacity="0.35" />
        </>
      )}
    </svg>
  );
}

export default function TaskTable({ tasks, onView, onEdit, onDelete }: TaskTableProps) {
  const canEdit = usePermission("tasks", "edit");
  const canDelete = usePermission("tasks", "delete");
  const [sortKey, setSortKey] = useState<SortKey>("createdDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = [...tasks].sort((a, b) => {
    let vA: string | number;
    let vB: string | number;

    if (sortKey === "priority") {
      vA = PRIORITY_ORDER[a.priority] ?? 0;
      vB = PRIORITY_ORDER[b.priority] ?? 0;
    } else if (sortKey === "status") {
      vA = STATUS_ORDER[a.status] ?? 0;
      vB = STATUS_ORDER[b.status] ?? 0;
    } else {
      vA = (a[sortKey] ?? "").toString().toLowerCase();
      vB = (b[sortKey] ?? "").toString().toLowerCase();
    }

    if (vA < vB) return sortDir === "asc" ? -1 : 1;
    if (vA > vB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
  
  const thStyle: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
    userSelect: "none",
  };

  const tdStyle: React.CSSProperties = {
    padding: "14px 16px",
    fontSize: "0.875rem",
    color: "#374151",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  };

  if (tasks.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "64px 24px",
          color: "#94a3b8",
        }}
      >
        <svg
          style={{ margin: "0 auto 14px", display: "block", opacity: 0.35 }}
          width="52" height="52" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9375rem", color: "#64748b" }}>
          No tasks found
        </p>
        <p style={{ margin: "5px 0 0", fontSize: "0.8125rem" }}>
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          minWidth: 900,
          borderCollapse: "collapse",
          fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <thead>
          <tr>
            {/* Checkbox column */}
            <th style={{ ...thStyle, width: 44, paddingRight: 4 }}>
              <input
                type="checkbox"
                style={{ cursor: "pointer", accentColor: "#4f46e5" }}
                aria-label="Select all tasks"
              />
            </th>

            {/* Task */}
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("title")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                Task <SortIcon col="title" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>

            {/* Assignee */}
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("assignee")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                Assignee <SortIcon col="assignee" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>

            {/* Priority */}
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("priority")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                Priority <SortIcon col="priority" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>

            {/* Status */}
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("status")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>

            {/* Due Date */}
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("dueDate")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                Due Date <SortIcon col="dueDate" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>

            {/* Created At */}
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("createdDate")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                Created At <SortIcon col="createdDate" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>

            {/* Actions */}
            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((task, idx) => {
            const [c1, c2] = getAvatarColor(task.assignee);
            const isLast = idx === sorted.length - 1;
            const rowTd: React.CSSProperties = {
              ...tdStyle,
              borderBottom: isLast ? "none" : "1px solid #f1f5f9",
            };
            const due = getDaysRemaining(task.dueDate);

            return (
              <tr
                key={task.id}
                style={{ transition: "background 0.12s ease", cursor: "default" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background = "#fafbff")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                }
              >
                {/* Checkbox */}
                <td style={{ ...rowTd, paddingRight: 4 }}>
                  <input
                    type="checkbox"
                    style={{ cursor: "pointer", accentColor: "#4f46e5" }}
                    aria-label={`Select task: ${task.title}`}
                  />
                </td>

                {/* Task title + description */}
                <td style={rowTd}>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        color: "#0f172a",
                        fontSize: "0.875rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontSize: "0.75rem",
                          color: "#94a3b8",
                          maxWidth: 280,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.description}
                      </p>
                    )}
                  </div>
                </td>

                {/* Assignee */}
                <td style={rowTd}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        flexShrink: 0,
                        userSelect: "none",
                      }}
                    >
                      {task.assigneeInitials}
                    </div>
                    <span style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 500 }}>
                      {task.assignee}
                    </span>
                  </div>
                </td>

                {/* Priority */}
                <td style={rowTd}>
                  <TaskPriorityBadge priority={task.priority} />
                </td>

                {/* Status */}
                <td style={rowTd}>
                  <TaskStatusBadge status={task.status} />
                </td>

                {/* Due Date */}
                <td style={rowTd}>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.8125rem",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                    >
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                    {task.dueDate && task.status !== "Completed" && task.status !== "Cancelled" && (
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: due.isOverdue
                            ? "#ef4444"
                            : due.isToday
                            ? "#f59e0b"
                            : "#64748b",
                        }}
                      >
                        {due.label}
                      </p>
                    )}
                  </div>
                </td>

                {/* Created At */}
                <td style={rowTd}>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.8125rem",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                    >
                      {task.createdDate
                        ? new Date(task.createdDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                </td>

                {/* Actions */}
                <td style={{ ...rowTd, textAlign: "right" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      justifyContent: "flex-end",
                    }}
                  >
                    {[{
                      title: "View",
                        color: "#4f46e5",
                        hoverBg: "#eef2ff",
                        hoverBorder: "#a5b4fc",
                        action: () => onView(task),
                        icon: (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ),
                      },
                      ...(canEdit ? [{
                        title: "Edit",
                        color: "#0891b2",
                        hoverBg: "#ecfeff",
                        hoverBorder: "#a5f3fc",
                        action: () => onEdit(task),
                        icon: (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        ),
                      }] : []),
                      ...(canDelete ? [{
                        title: "Delete",
                        color: "#ef4444",
                        hoverBg: "#fef2f2",
                        hoverBorder: "#fca5a5",
                        action: () => onDelete(task),
                        icon: (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        ),
                      }] : []),
                    ].map((btn) => (
                      <button
                        key={btn.title}
                        onClick={btn.action}
                        title={btn.title}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 7,
                          border: "1.5px solid #e2e8f0",
                          background: "#fff",
                          color: btn.color,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.12s ease",
                          padding: 0,
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = btn.hoverBg;
                          (e.currentTarget as HTMLButtonElement).style.borderColor = btn.hoverBorder;
                          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                          (e.currentTarget as HTMLButtonElement).style.transform = "none";
                        }}
                      >
                        {btn.icon}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
