"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyForm from "@/components/company/CompanyForm";
import {
  apiErrorMessage,
  CompanyFormValues,
  toCompanyApiPayload,
} from "@/data/company";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";

export default function AddCompanyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (data: CompanyFormValues) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest("/api/companies/", {
        method: "POST",
        body: toCompanyApiPayload(data),
      });

      emitDataChanged();

      setSuccess("Company created successfully.");

      setTimeout(() => {
        router.push("/company");
      }, 1000);
    } catch (err) {
      setError(apiErrorMessage(err));

      if (!getAccessToken()) router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Add Company
            </h1>

            <p className="page-subtitle">
              Create a new company record.
            </p>
          </div>

          <div className="page-header-actions">
            <Link href="/company">
              <button
                type="button"
                className="filter-btn"
              >
                ← Back
              </button>
            </Link>
          </div>
        </div>

        {/* Company Form */}
        <div className="company-form-card">
          <CompanyForm
            onSubmit={handleSubmit}
            submitText="Save Company"
            loading={loading}
            error={error}
            success={success}
          />
        </div>

      </div>
    </DashboardLayout>
  );
}
