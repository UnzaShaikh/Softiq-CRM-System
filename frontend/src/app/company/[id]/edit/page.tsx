"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import CompanyForm, {
  CompanyFormData,
} from "@/components/company/CompanyForm";

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();

  const companyId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Temporary dummy data.
  // Backend API connect hone ke baad yahan API data ayega.
  const company: CompanyFormData = {
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
      console.log("Updated Company:", companyId, data);

      // API integration baad mein hogi.
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      setSuccess("Company updated successfully.");

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
        initialData={company}
        onSubmit={handleSubmit}
        submitText="Update Company"
        loading={loading}
        error={error}
        success={success}
      />
    </div>
  );
}