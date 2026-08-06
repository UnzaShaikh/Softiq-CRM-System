"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import { OpportunityStage, OpportunityStatus } from "@/data/opportunities";

interface FormValues {
  name: string; customerName: string; company: string;
  dealValue: string; stage: OpportunityStage | "";
  probability: string; expectedCloseDate: string;
  status: OpportunityStatus | ""; assignedTo: string; notes: string;
}
interface FormErrors {
  name?: string; customerName?: string; company?: string;
  dealValue?: string; stage?: string; probability?: string;
  expectedCloseDate?: string; status?: string;
}

const INITIAL: FormValues = { name: "", customerName: "", company: "", dealValue: "", stage: "", probability: "", expectedCloseDate: "", status: "", assignedTo: "", notes: "" };

export default function AddOpportunityPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Opportunity name is required";
    if (!form.customerName.trim()) e.customerName = "Customer name is required";
    if (!form.company.trim()) e.company = "Company is required";
    if (!form.dealValue.trim()) e.dealValue = "Deal value is required";
    else if (isNaN(Number(form.dealValue)) || Number(form.dealValue) < 0) e.dealValue = "Enter a valid amount";
    if (!form.stage) e.stage = "Please select a stage";
    if (!form.probability.trim()) e.probability = "Probability is required";
    else if (isNaN(Number(form.probability)) || Number(form.probability) < 0 || Number(form.probability) > 100) e.probability = "Enter a value between 0 and 100";
    if (!form.expectedCloseDate) e.expectedCloseDate = "Close date is required";
    if (!form.status) e.status = "Please select a status";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => router.push("/opportunities"), 1800);
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <button onClick={() => router.push("/opportunities")} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "0.875rem", fontFamily: "inherit", padding: "0 0 12px" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")} onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Opportunities
          </button>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>Add Opportunity</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.9rem" }}>Fill in the details to create a new opportunity.</p>
        </div>

        {success && (
          <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            <p style={{ margin: 0, color: "#15803d", fontWeight: 600, fontSize: "0.9rem" }}>Opportunity created successfully! Redirecting...</p>
          </div>
        )}
        {submitError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <p style={{ margin: 0, color: "#dc2626", fontWeight: 500, fontSize: "0.9rem" }}>{submitError}</p>
          </div>
        )}

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Opportunity Details</h2>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <FormField label="Opportunity Name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="e.g. Enterprise CRM License" required />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Customer Name" name="customerName" value={form.customerName} onChange={handleChange} error={errors.customerName} placeholder="e.g. Ahmed Ali" required />
                <FormField label="Company" name="company" value={form.company} onChange={handleChange} error={errors.company} placeholder="e.g. TechVision Pvt Ltd" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Deal Value ($)" name="dealValue" value={form.dealValue} onChange={handleChange} error={errors.dealValue} placeholder="e.g. 50000" required />
                <FormField label="Probability (%)" name="probability" value={form.probability} onChange={handleChange} error={errors.probability} placeholder="0 - 100" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Stage" name="stage" type="select" value={form.stage} onChange={handleChange} error={errors.stage} required
                  options={["Prospecting","Qualification","Proposal","Negotiation","Closed Won","Closed Lost"].map((s) => ({ label: s, value: s }))} />
                <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} error={errors.status} required
                  options={[{ label: "Active", value: "Active" }, { label: "On Hold", value: "On Hold" }, { label: "Inactive", value: "Inactive" }]} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }}>Expected Close Date <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="date" name="expectedCloseDate" value={form.expectedCloseDate} onChange={handleChange}
                    style={{ padding: "10px 14px", border: `1.5px solid ${errors.expectedCloseDate ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "8px", background: "#fff", color: "#0f172a", fontSize: "0.9rem", fontFamily: "inherit", outline: "none" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.expectedCloseDate ? "#fca5a5" : "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                  {errors.expectedCloseDate && <p style={{ margin: 0, fontSize: "0.775rem", color: "#ef4444" }}>{errors.expectedCloseDate}</p>}
                </div>
                <FormField label="Assigned To" name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="e.g. Khaanzadi" />
              </div>
              <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={handleChange} placeholder="Add any additional notes…" />
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button type="button" onClick={() => router.push("/opportunities")} disabled={loading}
                style={{ padding: "10px 20px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.6 : 1 }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
              >Cancel</button>
              <button type="submit" disabled={loading || success}
                style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", fontWeight: 600, fontSize: "0.9rem", cursor: loading || success ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading || success ? 0.75 : 1, boxShadow: "0 2px 8px rgba(79,70,229,0.35)", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                {loading ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>) : success ? "Saved!" : "Add Opportunity"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
