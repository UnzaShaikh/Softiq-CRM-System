"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyForm from "@/components/company/CompanyForm";

import {
  apiErrorMessage,
  ApiCompany,
  CompanyFormValues,
  toCompany,
  toCompanyApiPayload,
} from "@/data/company";

import {
  setCachedCompany,
} from "@/data/companyCache";

import {
  apiRequest,
  emitDataChanged,
  getAccessToken,
} from "@/lib/api";

export default function AddCompanyPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSubmit = async (
    data: CompanyFormValues
  ) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      /*
       * Capture the created company so it can
       * immediately enter the individual cache.
       */
      const created =
        await apiRequest<ApiCompany>(
          "/api/companies/",
          {
            method: "POST",
            body:
              toCompanyApiPayload(data),
          }
        );

      /*
       * Store the newly-created company.
       */
      if (
  created &&
  typeof created.id === "number"
) {
  setCachedCompany(
    toCompany(created)
  );
}

      emitDataChanged();

      setSuccess(
        "Company created successfully."
      );

      setTimeout(() => {
        router.push("/company");
      }, 1000);
    } catch (err) {
      setError(
        apiErrorMessage(err)
      );

      if (!getAccessToken()) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div>
          <button
            className="back-btn"
            onClick={() =>
              router.push("/company")
            }
            style={{
              marginBottom: "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>

            Back to Companies
          </button>

          <h1 className="page-title">
            Add Company
          </h1>

          <p className="page-subtitle">
            Create a new company record.
          </p>
        </div>

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