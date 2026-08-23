"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LeadForm from "@/components/leads/LeadForm";

export default function AddLeadPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Header */}
        <div>
          <button className="back-btn" onClick={() => router.push("/leads")} style={{ marginBottom: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Leads
          </button>
          <h1 className="page-title">Add Lead</h1>
          <p className="page-subtitle">Fill in the details below to add a new lead.</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="msg-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Lead added successfully! Redirecting...
          </div>
        )}

        {/* Form Card */}
        <div className="company-form-card">
          <div className="form-section">
            <div className="form-section-header">
              <h2>Lead Information</h2>
              <p>Fill in all the required fields below.</p>
            </div>
            <LeadForm
              submitLabel="Add Lead"
              onSuccess={() => {
                setSuccess(true);
                setTimeout(() => router.push("/leads"), 1800);
              }}
              onCancel={() => router.push("/leads")}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
