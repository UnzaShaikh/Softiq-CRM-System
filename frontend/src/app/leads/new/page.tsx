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
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={() => router.push("/leads")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              fontSize: "0.875rem",
              fontFamily: "inherit",
              padding: "0 0 12px",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Leads
          </button>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Add Lead
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Fill in the details below to add a new lead.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p style={{ margin: 0, color: "#15803d", fontWeight: 600, fontSize: "0.9rem" }}>
              Lead added successfully! Redirecting...
            </p>
          </div>
        )}

        {/* Form Card */}
        <div style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
              Lead Information
            </h2>
          </div>

          <div style={{ padding: "24px" }}>
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
