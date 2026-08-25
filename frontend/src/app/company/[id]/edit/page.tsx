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

  const companyId = Number(params.id);

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

  const notFoundView = (message: string) => (
    <DashboardLayout>
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">Company Not Found</h1>
            <p className="page-subtitle">{message}</p>
          </div>

          <Link href="/company">
            <button className="filter-btn">← Back to Companies</button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );

  if (missingId || notFound) {
    return notFoundView("We couldn't find a company with this ID.");
  }

  if (fetching) {
    return (
      <DashboardLayout>
        <ThemeLoader label="Loading company..." />
      </DashboardLayout>
    );
  }

  if (!initialData) {
    return notFoundView("We couldn't find a company with this ID.");
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Page Header */}
        <div>
          <button className="back-btn" onClick={() => router.push(`/company/${companyId}`)} style={{ marginBottom: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Company
          </button>
          <h1 className="page-title">Edit Company</h1>
          <p className="page-subtitle">Update company information.</p>
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
