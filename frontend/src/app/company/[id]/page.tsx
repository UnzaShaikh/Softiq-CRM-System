"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { companies } from "@/data/company";

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = Number(params.id);

  const company = companies.find((c) => c.id === companyId);

  if (!company) {
    return (
      <DashboardLayout>
        <div className="company-page">
          <div className="page-header">
            <div>
              <h1 className="page-title">Company Not Found</h1>
              <p className="page-subtitle">
                We couldn&apos;t find a company with this ID.
              </p>
            </div>

            <Link href="/company">
              <button className="filter-btn">← Back to Companies</button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const description =
    company.description ||
    `${company.name} is a ${company.industry.toLowerCase()} company with ${company.contacts} contacts and ${company.deals} active deals.`;

  const infoFields = [
    { icon: "🏭", label: "Industry", value: company.industry },
    {
      icon: "🌐",
      label: "Website",
      value: (
        <a href={company.website} target="_blank" rel="noopener noreferrer">
          {company.website}
        </a>
      ),
    },
    { icon: "📞", label: "Phone", value: company.phone },
    {
      icon: "✉️",
      label: "Email",
      value: <a href={`mailto:${company.email}`}>{company.email}</a>,
    },
    { icon: "👥", label: "Contacts", value: company.contacts },
    { icon: "💼", label: "Deals", value: company.deals },
    { icon: "📅", label: "Created On", value: company.createdOn },
    { icon: "📍", label: "Address", value: company.address },
    { icon: "🏢", label: "Company Size", value: company.size },
  ];

  return (
    <DashboardLayout>
      <div className="company-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Company Details</h1>
            <p className="page-subtitle">View company information</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/company">
              <button className="filter-btn">← Back</button>
            </Link>

            <Link href={`/company/${company.id}/edit`}>
              <button className="add-company-btn">Edit Company</button>
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
            {infoFields.map((field) => (
              <div key={field.label} className="company-info-item">
                <label>
                  <span className="company-info-icon" aria-hidden="true">
                    {field.icon}
                  </span>
                  {field.label}
                </label>
                <p>{field.value}</p>
              </div>
            ))}

            <div style={{ gridColumn: "1 / -1" }} className="company-info-item">
              <label>
                <span className="company-info-icon" aria-hidden="true">📝</span>
                Description
              </label>
              <p>{description}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}