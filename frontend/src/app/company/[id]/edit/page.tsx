"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import CompanyForm from "@/components/company/CompanyForm";
import {
  apiErrorMessage,
  ApiCompany,
  CompanyFormValues,
  toCompanyApiPayload,
  toCompanyFormValues,
} from "@/data/company";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();

  const companyId = params.id as string;

  const [initialData, setInitialData] =
    useState<CompanyFormValues | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        setInitialData(toCompanyFormValues(data));
      } catch {
        if (cancelled) return;
        setNotFound(true);
        if (!getAccessToken()) router.push("/login");
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [companyId, router]);

  const handleSubmit = async (data: CompanyFormValues) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest(`/api/companies/${companyId}/`, {
        method: "PATCH",
        body: toCompanyApiPayload(data),
      });

      emitDataChanged();

      setSuccess("Company updated successfully.");

      setTimeout(() => {
        router.push(`/company/${companyId}`);
      }, 1000);
    } catch (err) {
      setError(apiErrorMessage(err));

      if (!getAccessToken()) router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (missingId || notFound) {
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

  if (fetching) {
    return (
      <DashboardLayout>
        <ThemeLoader label="Loading company..." />
      </DashboardLayout>
    );
  }

  if (!initialData) {
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

  return (
    <DashboardLayout>
      <div className="company-page">
        {/* Header */}
        <div className="company-page-header">
          <div>
            <h1 className="company-page-title">
              Edit Company
            </h1>

            <p className="company-page-subtitle">
              Update company information.
            </p>
          </div>

          <Link href={`/company/${companyId}`}>
            <button
              type="button"
              className="filter-btn"
            >
              ← Back
            </button>
          </Link>
        </div>

        {/* Company Form */}
        <CompanyForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitText="Update Company"
          loading={loading}
          error={error}
          success={success}
        />
      </div>
    </DashboardLayout>
  );
}
