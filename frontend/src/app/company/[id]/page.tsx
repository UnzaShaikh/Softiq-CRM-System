"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { usePermission } from "@/hooks/usePermissions";
import ThemeLoader from "@/components/ui/ThemeLoader";

import {
  ApiCompany,
  Company,
  toCompany,
} from "@/data/company";

import {
  getCachedCompany,
  setCachedCompany,
  subscribeCompanyCache,
} from "@/data/companyCache";

import {
  apiRequest,
  getAccessToken,
} from "@/lib/api";

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();

  const companyId = Number(params?.id);

  const cachedCompany =
    useSyncExternalStore(
      subscribeCompanyCache,
      () =>
        companyId
          ? getCachedCompany(companyId)
          : null,
      () => null
    );

  const [company, setCompany] =
    useState<Company | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [notFound, setNotFound] =
    useState(false);

  const displayCompany =
    company ?? cachedCompany;

  const canEdit = usePermission("companies", "edit");

  useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    /*
     * Cached company is immediately available.
     * Do not show the loader in this case.
     */
    if (cachedCompany) {
      setCompany(cachedCompany);
      setLoading(false);
    }

    const run = async () => {
      try {
        const data =
          await apiRequest<ApiCompany>(
            `/api/companies/${companyId}/`
          );

        if (cancelled) return;

        const mapped = toCompany(data);

        setCompany(mapped);
        setCachedCompany(mapped);
        setError(null);
        setNotFound(false);
      } catch (err) {
        if (cancelled) return;

        /*
         * If cached data exists, keep showing it.
         * Only treat the request as a missing company
         * when there is no cached company.
         */
        if (!cachedCompany) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load company."
          );

          setNotFound(true);
        }

        if (!getAccessToken()) {
          router.push("/login");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    companyId,
    router,
    cachedCompany,
  ]);

  const missingId = !companyId;

  if (missingId || notFound) {
    return (
      <DashboardLayout>
        <div className="page-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                Company Not Found
              </h1>

              <p className="page-subtitle">
                {error ||
                  "We couldn't find a company with this ID."}
              </p>
            </div>

            <Link href="/company">
              <button className="filter-btn">
                ← Back to Companies
              </button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /*
   * Only show the spinner when there is no cached
   * company and the API request is still running.
   */
  if (loading && !displayCompany) {
    return (
      <DashboardLayout>
        <ThemeLoader label="Loading company..." />
      </DashboardLayout>
    );
  }

  if (!displayCompany) {
    return (
      <DashboardLayout>
        <div className="page-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                Company Not Found
              </h1>

              <p className="page-subtitle">
                We couldn&apos;t find a company
                with this ID.
              </p>
            </div>

            <Link href="/company">
              <button className="filter-btn">
                ← Back to Companies
              </button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const description =
    displayCompany.description ||
    `${displayCompany.name} is a ${displayCompany.industry.toLowerCase()} company with ${displayCompany.contacts} contacts and ${displayCompany.deals} active deals.`;

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Company Details
            </h1>

            <p className="page-subtitle">
              View company information
            </p>
          </div>

          <div className="company-detail-actions">
            <Link href="/company">
              <button className="filter-btn">
                ← Back to Companies
              </button>
            </Link>

            {canEdit && (
              <Link
                href={`/company/${displayCompany.id}/edit`}
              >
                <button className="add-company-btn">
                  Edit Company
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className="company-detail-card">
          {/* Profile */}
          <div className="company-profile">
            <div className="company-avatar">
              {displayCompany.name
                .substring(0, 2)
                .toUpperCase()}
            </div>

            <div className="company-profile-content">
              <div className="company-profile-title-row">
                <h2>
                  {displayCompany.name}
                </h2>

                <span
                  className={
                    displayCompany.status ===
                    "Active"
                      ? "status-badge status-active"
                      : "status-badge status-inactive"
                  }
                >
                  {displayCompany.status}
                </span>
              </div>

              <p className="company-profile-meta">
                {displayCompany.industry ||
                  "—"}

                {displayCompany.size
                  ? ` • ${displayCompany.size}`
                  : ""}
              </p>
            </div>
          </div>

          {/* Company Information */}
          <div className="company-detail-section">
            <h3 className="company-detail-section-title">
              Company Information
            </h3>

            <div className="company-info-grid">
              <div className="company-info-item">
                <label>
                  <span
                    className="company-info-icon"
                    aria-hidden="true"
                  >
                    🏭
                  </span>
                  Industry
                </label>

                <p>
                  {displayCompany.industry ||
                    "—"}
                </p>
              </div>

              <div className="company-info-item">
                <label>
                  <span
                    className="company-info-icon"
                    aria-hidden="true"
                  >
                    🏢
                  </span>
                  Company Size
                </label>

                <p>
                  {displayCompany.size ||
                    "—"}
                </p>
              </div>

              <div className="company-info-item">
                <label>
                  <span
                    className="company-info-icon"
                    aria-hidden="true"
                  >
                    🌐
                  </span>
                  Website
                </label>

                <p>
                  {displayCompany.website ? (
                    <a
                      href={
                        displayCompany.website
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {
                        displayCompany.website
                      }
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              <div className="company-info-item">
                <label>
                  <span
                    className="company-info-icon"
                    aria-hidden="true"
                  >
                    📅
                  </span>
                  Created On
                </label>

                <p>
                  {displayCompany.createdOn ||
                    "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="company-detail-section">
            <h3 className="company-detail-section-title">
              Contact Information
            </h3>

            <div className="company-info-grid">
              <div className="company-info-item">
                <label>
                  <span
                    className="company-info-icon"
                    aria-hidden="true"
                  >
                    ✉️
                  </span>
                  Email
                </label>

                <p>
                  {displayCompany.email ? (
                    <a
                      href={`mailto:${displayCompany.email}`}
                    >
                      {displayCompany.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              <div className="company-info-item">
                <label>
                  <span
                    className="company-info-icon"
                    aria-hidden="true"
                  >
                    📞
                  </span>
                  Phone
                </label>

                <p>
                  {displayCompany.phone ||
                    "—"}
                </p>
              </div>

              <div className="company-info-item">
                <label>
                  <span
                    className="company-info-icon"
                    aria-hidden="true"
                  >
                    👥
                  </span>
                  Contacts
                </label>

                <p>
                  {displayCompany.contacts ??
                    0}
                </p>
              </div>

              <div className="company-info-item">
                <label>
                  <span
                    className="company-info-icon"
                    aria-hidden="true"
                  >
                    💼
                  </span>
                  Deals
                </label>

                <p>
                  {displayCompany.deals ??
                    0}
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="company-detail-section">
            <h3 className="company-detail-section-title">
              Address
            </h3>

            <div className="company-info-item company-info-full">
              <label>
                <span
                  className="company-info-icon"
                  aria-hidden="true"
                >
                  📍
                </span>
                Address
              </label>

              <p>
                {displayCompany.address ||
                  "—"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="company-detail-section">
            <h3 className="company-detail-section-title">
              Description
            </h3>

            <div className="company-description">
              {description}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}