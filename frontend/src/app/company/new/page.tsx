"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyForm from "@/components/company/CompanyForm";
import {
  apiErrorMessage,
  CompanyFormValues,
  toCompanyApiPayload,
} from "@/data/company";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";

export default function NewCompanyPage() {
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
      <div className="company-page">
        {/* Header */}
        <div className="company-page-header">
          <div>
            <h1 className="company-page-title">
              Add Company
            </h1>

            <p className="company-page-subtitle">
              Create a new company record.
            </p>
          </div>
        </div>

        {/* Company Form */}
        <CompanyForm
          onSubmit={handleSubmit}
          submitText="Save Company"
          loading={loading}
          error={error}
          success={success}
        />
      </div>
    </DashboardLayout>
  );
}
