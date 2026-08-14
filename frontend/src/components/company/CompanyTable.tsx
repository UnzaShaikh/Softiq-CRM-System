"use client";

import Link from "next/link";
import { Company } from "@/data/company";

interface CompanyTableProps {
  companies: Company[];
  onDelete: (company: Company) => void;
  sortBy?: "name" | "created_at";
  sortDir?: "asc" | "desc";
  onSort?: (field: "name" | "created_at") => void;
}

function SortIcon({
  active,
  dir,
}: {
  active: boolean;
  dir: "asc" | "desc";
}) {
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
      aria-hidden="true"
    >
      {active && dir === "asc" ? (
        <polyline points="18 15 12 9 6 15" />
      ) : active && dir === "desc" ? (
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

const thStyle: React.CSSProperties = {
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

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: "0.875rem",
  color: "#374151",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "middle",
};

function getAvatarColors(name: string): [string, string] {
  const colors: [string, string][] = [
    ["#4f46e5", "#7c3aed"],
    ["#0891b2", "#0e7490"],
    ["#059669", "#047857"],
    ["#d97706", "#b45309"],
    ["#dc2626", "#b91c1c"],
    ["#7c3aed", "#6d28d9"],
  ];

  const index =
    ((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) %
    colors.length;

  return colors[index];
}

function formatCreatedDate(value: string): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CompanyTable({
  companies,
  onDelete,
  sortBy,
  sortDir,
  onSort,
}: CompanyTableProps) {
  const handleSort = (field: "name" | "created_at") => {
    if (onSort) {
      onSort(field);
    }
  };

  if (companies.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#94a3b8",
        }}
      >
        <svg
          style={{
            margin: "0 auto 12px",
            display: "block",
            opacity: 0.4,
          }}
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 21h18" />
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
          <path d="M9 7h1" />
          <path d="M14 7h1" />
          <path d="M9 11h1" />
          <path d="M14 11h1" />
          <path d="M9 15h1" />
          <path d="M14 15h1" />
        </svg>

        <p
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: "0.95rem",
            color: "#64748b",
          }}
        >
          No companies found
        </p>

        <p
          style={{
            margin: "4px 0 0",
            fontSize: "0.8125rem",
          }}
        >
          Try adjusting your search or filter.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: "900px",
          borderCollapse: "collapse",
          fontFamily:
            "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <thead>
          <tr>
            {/* Company */}
            <th
              style={{
                ...thStyle,
                cursor: "pointer",
              }}
              onClick={() => handleSort("name")}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                Company
                <SortIcon
                  active={sortBy === "name"}
                  dir={sortDir ?? "asc"}
                />
              </span>
            </th>

            {/* Industry */}
            <th style={thStyle}>Industry</th>

            {/* Contacts */}
            <th style={thStyle}>Contacts</th>

            {/* Deals */}
            <th style={thStyle}>Deals</th>

            {/* Status */}
            <th style={thStyle}>Status</th>

            {/* Created */}
            <th
              style={{
                ...thStyle,
                cursor: "pointer",
              }}
              onClick={() => handleSort("created_at")}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                Created On
                <SortIcon
                  active={sortBy === "created_at"}
                  dir={sortDir ?? "desc"}
                />
              </span>
            </th>

            {/* Actions */}
            <th
              style={{
                ...thStyle,
                textAlign: "center",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {companies.map((company, index) => {
            const [c1, c2] = getAvatarColors(company.name);
            const isLast = index === companies.length - 1;

            const rowTd: React.CSSProperties = {
              ...tdStyle,
              borderBottom: isLast
                ? "none"
                : "1px solid #f1f5f9",
            };

            return (
              <tr
                key={company.id}
                style={{
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "#fafafa";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "transparent";
                }}
              >
                {/* Company */}
                <td style={rowTd}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
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
                      {company.name
                        .substring(0, 2)
                        .toUpperCase()}
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
                        {company.name}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.75rem",
                          color: "#94a3b8",
                        }}
                      >
                        ID: {company.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Industry */}
                <td style={rowTd}>
                  <span
                    style={{
                      color: "#374151",
                      fontWeight: 500,
                    }}
                  >
                    {company.industry || "—"}
                  </span>
                </td>

                {/* Contacts */}
                <td style={rowTd}>
                  <span
                    style={{
                      color: "#374151",
                      fontWeight: 500,
                    }}
                  >
                    {company.contacts ?? 0}
                  </span>
                </td>

                {/* Deals */}
                <td style={rowTd}>
                  <span
                    style={{
                      color: "#374151",
                      fontWeight: 500,
                    }}
                  >
                    {company.deals ?? 0}
                  </span>
                </td>

                {/* Status */}
                {/* Status */}
<td>
  <span
    className={`badge ${
      company.status === "Active"
        ? "badge-active"
        : "badge-inactive"
    }`}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
    }}
  >
    <span
      aria-hidden="true"
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background:
          company.status === "Active"
            ? "#22c55e"
            : "#94a3b8",
        flexShrink: 0,
      }}
    />
    {company.status}
  </span>
</td>

                {/* Created */}
                <td style={rowTd}>
                  <span
                    style={{
                      color: "#475569",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {formatCreatedDate(company.createdOn)}
                  </span>
                </td>

                {/* Actions */}
                <td
                  style={{
                    ...rowTd,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {/* View */}
                    <Link
                      href={`/company/${company.id}`}
                      title="View company"
                      aria-label={`View ${company.name}`}
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
                        transition:
                          "background 0.12s ease, border-color 0.12s ease",
                        padding: 0,
                        textDecoration: "none",
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background =
                          "#eef2ff";
                        event.currentTarget.style.borderColor =
                          "#a5b4fc";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background =
                          "#fff";
                        event.currentTarget.style.borderColor =
                          "#e2e8f0";
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </Link>

                    {/* Edit */}
                    <Link
                      href={`/company/${company.id}/edit`}
                      title="Edit company"
                      aria-label={`Edit ${company.name}`}
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
                        transition:
                          "background 0.12s ease, border-color 0.12s ease",
                        padding: 0,
                        textDecoration: "none",
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background =
                          "#ecfeff";
                        event.currentTarget.style.borderColor =
                          "#a5f3fc";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background =
                          "#fff";
                        event.currentTarget.style.borderColor =
                          "#e2e8f0";
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>

                    {/* Delete */}
                    <button
                      type="button"
                      title="Delete company"
                      aria-label={`Delete ${company.name}`}
                      onClick={() => onDelete(company)}
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
                        transition:
                          "background 0.12s ease, border-color 0.12s ease",
                        padding: 0,
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background =
                          "#fef2f2";
                        event.currentTarget.style.borderColor =
                          "#fca5a5";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background =
                          "#fff";
                        event.currentTarget.style.borderColor =
                          "#e2e8f0";
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
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