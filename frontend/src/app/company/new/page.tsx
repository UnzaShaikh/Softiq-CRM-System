"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CompanyForm, {
  CompanyFormData,
} from "@/components/company/CompanyForm";

export default function NewCompanyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (data: CompanyFormData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Frontend-only implementation for now.
      console.log("New Company:", data);

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      setSuccess("Company created successfully.");

      setTimeout(() => {
        router.push("/company");
      }, 1000);
    } catch {
      setError(
        "Something went wrong while creating the company."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}