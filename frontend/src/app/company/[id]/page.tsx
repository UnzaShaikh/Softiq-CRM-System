"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id;

  // Dummy data (Frontend UI only)
  const company = {
    id: companyId,
    name: "SoftiqTech",
    industry: "Software",
    website: "https://softiqtech.com",
    phone: "+92 300 1234567",
    email: "info@softiqtech.com",
    address: "Karachi, Pakistan",
    contacts: 10,
    deals: 5,
    status: "Active",
    createdOn: "2026-08-07",
    description:
      "SoftiqTech is a software company specializing in CRM solutions, web development, and modern business applications.",
  };

  return (
    <div className="company-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Company Details</h1>
          <p>View company information</p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/company">
            <button className="filter-btn">
              ← Back
            </button>
          </Link>

          <Link href={`/company/${companyId}/edit`}>
            <button className="add-company-btn">
              Edit Company
            </button>
          </Link>
        </div>
      </div>

      {/* Company Card */}
      <div className="company-detail-card">
        {/* Profile */}
        <div className="company-profile">
          <div className="company-avatar">
            {company.name.substring(0, 2).toUpperCase()}
          </div>

          <div>
            <h2>{company.name}</h2>

            <span
              className={
                company.status === "Active"
                  ? "status-badge status-active"
                  : "status-badge status-inactive"
              }
            >
              {company.status}
            </span>
          </div>
        </div>

        {/* Information */}
        <div className="company-info-grid">
          <div>
            <label>Industry</label>
            <p>{company.industry}</p>
          </div>

          <div>
            <label>Website</label>
            <p>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {company.website}
              </a>
            </p>
          </div>

          <div>
            <label>Phone</label>
            <p>{company.phone}</p>
          </div>

          <div>
            <label>Email</label>
            <p>
              <a href={`mailto:${company.email}`}>
                {company.email}
              </a>
            </p>
          </div>

          <div>
            <label>Contacts</label>
            <p>{company.contacts}</p>
          </div>

          <div>
            <label>Deals</label>
            <p>{company.deals}</p>
          </div>

          <div>
            <label>Created On</label>
            <p>{company.createdOn}</p>
          </div>

          <div>
            <label>Address</label>
            <p>{company.address}</p>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Description</label>
            <p>{company.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}