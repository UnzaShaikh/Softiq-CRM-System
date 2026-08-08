"use client";

import Link from "next/link";
import { Company } from "@/data/company";

interface CompanyTableProps {
  companies: Company[];
  onDelete: (company: Company) => void;
}

export default function CompanyTable({
  companies,
  onDelete,
}: CompanyTableProps) {
  return (
    <div className="company-table-container">
      <table className="company-table">
        <thead>
          <tr>
            <th>
              <span className="th-inner">Company <span aria-hidden="true">▲</span></span>
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
              <span className="th-inner">Created On <span aria-hidden="true">▽</span></span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td>
                <div className="cell-user">
                  <div className="company-avatar">
                    {company.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <p className="cell-name">{company.name}</p>
                  </div>
                </div>
              </td>

              <td>{company.industry}</td>

              <td>{company.contacts}</td>

              <td>{company.deals}</td>

              <td>
                <span
                  className={
                    company.status === "Active"
                      ? "status-badge status-active"
                      : "status-badge status-inactive"
                  }
                >
                  {company.status}
                </span>
              </td>

              <td>{company.createdOn}</td>

              <td>
                <div className="table-actions">
                  {/* View */}
                  <Link
                    href={`/company/${company.id}`}
                    className="company-action-btn view-btn"
                    title="View Company"
                  >
                    👁
                  </Link>

                  {/* Edit */}
                  <Link
                    href={`/company/${company.id}/edit`}
                    className="company-action-btn edit-btn"
                    title="Edit Company"
                  >
                    ✏️
                  </Link>

                  {/* Delete */}
                  <button
                    type="button"
                    className="company-action-btn delete-btn"
                    title="Delete Company"
                    onClick={() => onDelete(company)}
                  >
                    🗑️
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