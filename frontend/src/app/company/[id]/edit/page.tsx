"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyForm, {
  CompanyFormData,
} from "@/components/company/CompanyForm";
import { companies } from "@/data/company";

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();

  const companyId = Number(params.id);

  const company = companies.find(
    (company) => company.id === companyId
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Company not found
  if (!company) {
    return (
      <DashboardLayout>
        <div className="company-page-container">
          <div className="page-header">
            <div>
              <h1 className="company-page-title">
                Company Not Found
              </h1>

              <p className="company-page-subtitle">
                We couldn't find a company with this ID.
              </p>
            </div>

            <div className="page-header-actions">
              <Link href="/company">
                <button
                  type="button"
                  className="filter-btn"
                >
                  ← Back to Companies
                </button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /*
   * Empty form fields.
   *
   * Backend API integration hone ke baad
   * yahan API se company data load kiya ja sakta hai.
   */
  const initialData: CompanyFormData = {
    name: "",
    industry: "",
    website: "",
    phone: "",
    email: "",
    address: "",
  };

  const handleSubmit = async (
    data: CompanyFormData
  ) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Temporary frontend-only update
      console.log("Updated Company:", {
        id: companyId,
        ...data,
      });

      // Backend API integration baad mein hogi
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      setSuccess(
        "Company updated successfully."
      );

      setTimeout(() => {
        router.push(`/company/${companyId}`);
      }, 1000);
    } catch {
      setError(
        "Something went wrong while updating the company."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="company-page-container">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="company-page-title">
              Edit Company
            </h1>

            <p className="company-page-subtitle">
              Update company information.
            </p>
          </div>

          <div className="page-header-actions">
            <Link href={`/company/${companyId}`}>
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
            initialData={initialData}
            onSubmit={handleSubmit}
            submitText="Update Company"
            loading={loading}
            error={error}
            success={success}
          />
        </div>

      </div>
    </DashboardLayout>
  );
}