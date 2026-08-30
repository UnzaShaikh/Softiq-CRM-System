"use client";

import { useState, type CSSProperties } from "react";
import { Customer } from "@/data/customers";
import StatusBadge from "./StatusBadge";
import { usePermission } from "@/hooks/usePermissions";

interface CustomerTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

type SortKey = "name" | "company" | "status" | "joinedDate" | "totalRevenue";
type SortDir = "asc" | "desc";

const AVATAR_COLORS: [string, string][] = [
  ["#4f46e5", "#7c3aed"],
  ["#0891b2", "#0e7490"],
  ["#059669", "#047857"],
  ["#d97706", "#b45309"],
  ["#dc2626", "#b91c1c"],
  ["#7c3aed", "#6d28d9"],
];

function getAvatarColor(name: string): [string, string] {
  const idx =
    ((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function formatRevenue(value: number): string {
  if (value === 0) return "—";
  return "$" + value.toLocaleString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#4f46e5" : "#94a3b8"}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      {active && sortDir === "asc" ? (
        <polyline points="18 15 12 9 6 15" />
      ) : active && sortDir === "desc" ? (
        <polyline points="6 9 12 15 18 9" />
      ) : (
        <>
          <polyline points="18 15 12 9 6 15" opacity="0.4" />
          <polyline points="6 9 12 15 18 9" opacity="0.4" />
        </>
      )}
    </svg>
  );
}

export default function CustomerTable({
  customers,
  onView,
  onEdit,
  onDelete,
}: CustomerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const canEdit = usePermission("customers", "edit");
  const canDelete = usePermission("customers", "delete");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...customers].sort((a, b) => {
    let valA: string | number = a[sortKey] ?? "";
    let valB: string | number = b[sortKey] ?? "";
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const thStyle: CSSProperties = {
    padding: "11px 16px",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
    userSelect: "none",
  };

  const tdStyle: CSSProperties = {
    padding: "14px 16px",
    fontSize: "0.875rem",
    color: "#374151",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  };

  if (customers.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#94a3b8",
        }}
      >
        <svg
          style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }}
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem", color: "#64748b" }}>
          No customers found
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "0.8125rem" }}>
          Try adjusting your search or filter.
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <thead>
          <tr>
            {/* Customer */}
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("name")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                Customer <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            {/* Company */}
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("company")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                Company <SortIcon col="company" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            {/* Contact */}
            <th style={thStyle}>Contact</th>
            {/* Status */}
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("status")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            {/* Joined */}
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("joinedDate")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                Joined <SortIcon col="joinedDate" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            {/* Revenue */}
            <th
              style={{ ...thStyle, cursor: "pointer", textAlign: "right" }}
              onClick={() => handleSort("totalRevenue")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
                Revenue <SortIcon col="totalRevenue" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            {/* Actions */}
            <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((customer, idx) => {
            const [c1, c2] = getAvatarColor(customer.name);
            const isLast = idx === sorted.length - 1;
            const rowTd: CSSProperties = {
              ...tdStyle,
              borderBottom: isLast ? "none" : "1px solid #f1f5f9",
            };

            return (
              <tr
                key={customer.id}
                style={{ transition: "background 0.12s ease" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background = "#fafafa")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                }
              >
                {/* Customer name + id */}
                <td style={rowTd}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        flexShrink: 0,
                        userSelect: "none",
                      }}
                    >
                      {customer.avatar}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          color: "#0f172a",
                          fontSize: "0.875rem",
                        }}
                      >
                        {customer.name}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.75rem",
                          color: "#94a3b8",
                        }}
                      >
                        {customer.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Company */}
                <td style={rowTd}>
                  <span style={{ color: "#374151", fontWeight: 500 }}>
                    {customer.company}
                  </span>
                  <br />
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {customer.location}
                  </span>
                </td>

                {/* Contact */}
                <td style={rowTd}>
                  <p style={{ margin: 0, fontSize: "0.8125rem", color: "#374151" }}>
                    {customer.email}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>
                    {customer.phone}
                  </p>
                </td>

                {/* Status */}
                <td style={rowTd}>
                  <StatusBadge status={customer.status} />
                </td>

                {/* Joined */}
                <td style={rowTd}>
                  <span style={{ color: "#475569", fontSize: "0.8125rem" }}>
                    {formatDate(customer.joinedDate)}
                  </span>
                </td>

                {/* Revenue */}
                <td style={{ ...rowTd, textAlign: "right" }}>
                  <span
                    style={{
                      fontWeight: 600,
                      color: customer.totalRevenue > 0 ? "#059669" : "#94a3b8",
                    }}
                  >
                    {formatRevenue(customer.totalRevenue)}
                  </span>
                  {customer.totalDeals > 0 && (
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>
                      {customer.totalDeals} deal{customer.totalDeals !== 1 ? "s" : ""}
                    </p>
                  )}
                </td>

                {/* Actions */}
                <td style={{ ...rowTd, textAlign: "center" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {/* View */}
                    <button
                      onClick={() => onView(customer)}
                      title="View customer"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "7px",
                        border: "1.5px solid #e2e8f0",
                        background: "#fff",
                        color: "#4f46e5",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.12s ease, border-color 0.12s ease",
                        padding: 0,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#eef2ff";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#a5b4fc";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>

                    {/* Edit */}
                    {canEdit && (
                    <button
                      onClick={() => onEdit(customer)}
                      title="Edit customer"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "7px",
                        border: "1.5px solid #e2e8f0",
                        background: "#fff",
                        color: "#0891b2",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.12s ease, border-color 0.12s ease",
                        padding: 0,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#ecfeff";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#a5f3fc";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    )}

                    {/* Delete */}
                    {canDelete && (
                    <button
                      onClick={() => onDelete(customer)}
                      title="Delete customer"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "7px",
                        border: "1.5px solid #e2e8f0",
                        background: "#fff",
                        color: "#ef4444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.12s ease, border-color 0.12s ease",
                        padding: 0,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#fca5a5";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                    )}
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
