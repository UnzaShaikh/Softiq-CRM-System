"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Company } from "@/data/company";

interface CompanyTableProps {
  companies: Company[];
  onDelete: (company: Company) => void;
}

export default function CompanyTable({ companies, onDelete }: CompanyTableProps) {
  return (
    <div className="company-table-container">
      <table className="data-table company-table">
        <thead>
          <tr>
            <th><span className="th-inner">Company</span></th>
            <th><span className="th-inner">Industry</span></th>
            <th><span className="th-inner">Contacts</span></th>
            <th><span className="th-inner">Deals</span></th>
            <th>Status</th>
            <th><span className="th-inner">Created On</span></th>
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
                <div className="contacts-actions">
                  <Link href={`/company/${company.id}`} className="contacts-action-button contacts-action-view" title="View Company" aria-label="View Company">
                    <Eye size={16} strokeWidth={2} />
                  </Link>
                  <Link href={`/company/${company.id}/edit`} className="contacts-action-button contacts-action-edit" title="Edit Company" aria-label="Edit Company">
                    <Pencil size={16} strokeWidth={2} />
                  </Link>
                  <button type="button" className="contacts-action-button contacts-action-delete" title="Delete Company" aria-label="Delete Company" onClick={() => onDelete(company)}>
                    <Trash2 size={16} strokeWidth={2} />
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
