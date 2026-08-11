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

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <span aria-hidden="true">▽</span>;
  return <span aria-hidden="true">{dir === "asc" ? "▲" : "▼"}</span>;
}

export default function CompanyTable({
  companies,
  onDelete,
  sortBy,
  sortDir,
  onSort,
}: CompanyTableProps) {
  const handleSort = (field: "name" | "created_at") => {
    if (onSort) onSort(field);
  };

  return (
    <div className="company-table-container">
      <table className="data-table company-table">
        <thead>
          <tr>
            <th>
              <button
                type="button"
                className={`th-sortable ${sortBy === "name" ? "active" : ""}`}
                onClick={() => handleSort("name")}
                title="Sort by company name"
              >
                Company{" "}
                <SortIcon
                  active={sortBy === "name"}
                  dir={sortDir ?? "asc"}
                />
              </button>
            </th>
            <th>
              <span className="th-inner">Industry <span aria-hidden="true">▽</span></span>
            </th>
            <th>
              <span className="th-inner">Contacts <span aria-hidden="true">▽</span></span>
            </th>
            <th>
              <span className="th-inner">Deals <span aria-hidden="true">▽</span></span>
            </th>
            <th>Status</th>
            <th>
              <button
                type="button"
                className={`th-sortable ${sortBy === "created_at" ? "active" : ""}`}
                onClick={() => handleSort("created_at")}
                title="Sort by created date"
              >
                Created On{" "}
                <SortIcon
                  active={sortBy === "created_at"}
                  dir={sortDir ?? "desc"}
                />
              </button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td>
                <div className="cell-user">
                  <div className="cell-avatar company-avatar">{company.name.substring(0, 2).toUpperCase()}</div>
                  <div>
                    <p className="cell-name">{company.name}</p>
                  </div>
                </div>
              </td>

              <td className="cell-primary">{company.industry}</td>
              <td className="cell-primary">{company.contacts}</td>
              <td className="cell-primary">{company.deals}</td>

              <td>
                <span className={`badge ${company.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                  {company.status}
                </span>
              </td>

              <td className="cell-muted">{company.createdOn}</td>

              <td>
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
                    title="View"
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
                      transition: "all 0.12s ease",
                      padding: 0,
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "#eef2ff";
                      (e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "#a5b4fc";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "#fff";
                      (e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "#e2e8f0";
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </Link>

                  {/* Edit */}
                  <Link
                    href={`/company/${company.id}/edit`}
                    title="Edit"
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
                      transition: "all 0.12s ease",
                      padding: 0,
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "#ecfeff";
                      (e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "#a5f3fc";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "#fff";
                      (e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "#e2e8f0";
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0891b2"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </Link>

                  {/* Delete */}
                  <button
                    type="button"
                    title="Delete"
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
                      transition: "all 0.12s ease",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#fef2f2";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#fca5a5";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#fff";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#e2e8f0";
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
