"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import { opportunities as oppData, OpportunityStage, OpportunityStatus } from "@/data/opportunities";

interface FormValues {
  name: string; customerName: string; company: string; dealValue: string;
  stage: OpportunityStage | ""; probability: string; expectedCloseDate: string;
  status: OpportunityStatus | ""; assignedTo: string; notes: string;
}
interface FormErrors {
  name?: string; customerName?: string; company?: string; dealValue?: string;
  stage?: string; probability?: string; expectedCloseDate?: string; status?: string;
}

export default function EditOpportunityPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<FormValues>({ name: "", customerName: "", company: "", dealValue: "", stage: "", probability: "", expectedCloseDate: "", status: "", assignedTo: "", notes: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const opp = oppData.find((o) => o.id === id);
    if (!opp) { setNotFound(true); setLoading(false); return; }
    setForm({ name: opp.name, customerName: opp.customerName, company: opp.company, dealValue: String(opp.dealValue), stage: opp.stage, probability: String(opp.probability), expectedCloseDate: opp.expectedCloseDate, status: opp.status, assignedTo: opp.assignedTo, notes: opp.notes });
    setLoading(false);
  }, [id]);

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
    else if (isNaN(Number(form.probability)) || Number(form.probability) < 0 || Number(form.probability) > 100) e.probability = "Enter 0–100";
    if (!form.expectedCloseDate) e.expectedCloseDate = "Close date is required";
    if (!form.status) e.status = "Please select a status";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => router.push(`/opportunities/${id}`), 1800);
  }

  if (loading) return (
    <DashboardLayout>
      <div className="loading-state">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        Loading...
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </DashboardLayout>
  );

  if (notFound) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Opportunity Not Found</h2>
        <button className="btn-add" onClick={() => router.push("/opportunities")}>Back to Opportunities</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="form-card">
        <div style={{ padding: "0 0 0.75rem" }}>
          <button className="back-btn" onClick={() => router.push(`/opportunities/${id}`)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Opportunity
          </button>
          <h1 className="page-title">Edit Opportunity</h1>
          <p className="page-subtitle">Update the opportunity details below.</p>
        </div>

        {success && <div className="msg-success"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Changes saved! Redirecting...</div>}

        <div className="form-card-header">
          <h2 className="form-card-title">Opportunity Details</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-card-body">
            <FormField label="Opportunity Name" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
            <div className="form-row-2">
              <FormField label="Customer Name" name="customerName" value={form.customerName} onChange={handleChange} error={errors.customerName} required />
              <FormField label="Company" name="company" value={form.company} onChange={handleChange} error={errors.company} required />
            </div>
            <div className="form-row-2">
              <FormField label="Deal Value ($)" name="dealValue" value={form.dealValue} onChange={handleChange} error={errors.dealValue} required />
              <FormField label="Probability (%)" name="probability" value={form.probability} onChange={handleChange} error={errors.probability} required />
            </div>
            <div className="form-row-2">
              <FormField label="Stage" name="stage" type="select" value={form.stage} onChange={handleChange} error={errors.stage} required
                options={["Prospecting","Qualification","Proposal","Negotiation","Closed Won","Closed Lost"].map((s) => ({ label: s, value: s }))} />
              <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} error={errors.status} required
                options={[{ label: "Active", value: "Active" }, { label: "On Hold", value: "On Hold" }, { label: "Inactive", value: "Inactive" }]} />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Expected Close Date <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="date" name="expectedCloseDate" value={form.expectedCloseDate} onChange={handleChange}
                  className={`form-input${errors.expectedCloseDate ? " error" : ""}`} />
                {errors.expectedCloseDate && <p className="form-error">{errors.expectedCloseDate}</p>}
              </div>
              <FormField label="Assigned To" name="assignedTo" value={form.assignedTo} onChange={handleChange} />
            </div>
            <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={handleChange} />
          </div>
          <div className="form-card-footer">
            <button type="button" className="btn-secondary" onClick={() => router.push(`/opportunities/${id}`)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-add" disabled={saving || success}>
              {saving ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>) : success ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
