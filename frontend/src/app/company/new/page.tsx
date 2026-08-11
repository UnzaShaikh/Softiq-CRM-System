"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyForm, {
  CompanyFormData,
} from "@/components/company/CompanyForm";

export default function AddCompanyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Empty form for adding a new company
  const initialData: CompanyFormData = {
    name: "",
    industry: "",
    website: "",
    phone: "",
    email: "",
    address: "",
  };

  const handleSubmit = async (data: CompanyFormData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Temporary frontend-only functionality
      console.log("New Company:", data);

      // Backend API integration baad mein hogi
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Company created successfully.");

      setTimeout(() => {
        router.push("/company");
      }, 1000);
    } catch {
      setError("Something went wrong while creating the company.");
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
              Add Company
            </h1>

            <p className="company-page-subtitle">
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
            initialData={initialData}
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