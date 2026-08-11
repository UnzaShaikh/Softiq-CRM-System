"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import { ApiCompany, Company, toCompany } from "@/data/company";
import { apiRequest, getAccessToken } from "@/lib/api";

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = Number(params?.id);

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const missingId = !companyId;

  useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    const run = async () => {
      try {
        const data = await apiRequest<ApiCompany>(
          `/api/companies/${companyId}/`
        );
        if (cancelled) return;
        setCompany(toCompany(data));
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setNotFound(true);
        if (!getAccessToken()) router.push("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [companyId, router]);

  if (missingId || notFound) {
    return (
      <DashboardLayout>
        <div className="page-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">Company Not Found</h1>
              <p className="page-subtitle">
                {error || "We couldn't find a company with this ID."}
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

  if (loading) {
    return (
      <DashboardLayout>
        <ThemeLoader label="Loading company..." />
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout>
        <div className="page-wrapper">
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
    { icon: "🏭", label: "Industry", value: company.industry || "—" },
    {
      icon: "🌐",
      label: "Website",
      value: company.website ? (
        <a href={company.website} target="_blank" rel="noopener noreferrer">
          {company.website}
        </a>
      ) : (
        "—"
      ),
    },
    { icon: "📞", label: "Phone", value: company.phone || "—" },
    {
      icon: "✉️",
      label: "Email",
      value: company.email ? (
        <a href={`mailto:${company.email}`}>{company.email}</a>
      ) : (
        "—"
      ),
    },
    { icon: "👥", label: "Contacts", value: company.contacts },
    { icon: "💼", label: "Deals", value: company.deals },
    { icon: "📅", label: "Created On", value: company.createdOn || "—" },
    { icon: "📍", label: "Address", value: company.address || "—" },
    { icon: "🏢", label: "Company Size", value: company.size || "—" },
  ];

  return (
    <DashboardLayout>
      <div className="page-wrapper">
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
