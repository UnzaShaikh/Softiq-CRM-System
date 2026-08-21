"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import { ApiOpportunity, OpportunityFormValues, OpportunityStage, OpportunityStatus, STAGE_TO_API, STATUS_TO_API, toFormValues } from "@/data/opportunities";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";
import ThemeLoader from "@/components/ui/ThemeLoader";

interface FormErrors {
  name?: string; customer?: string; value?: string;
  stage?: string; probability?: string; expectedCloseDate?: string; status?: string;
}

interface CustomerOption {
  id: number;
  name: string;
  company: string;
}

const STAGE_OPTIONS: OpportunityStage[] = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const STATUS_OPTIONS: OpportunityStatus[] = ["Active", "On Hold", "Inactive", "Closed Won", "Closed Lost"];

export default function EditOpportunityPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<OpportunityFormValues | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const [oppData, custData] = await Promise.all([
          apiRequest<ApiOpportunity>(`/api/opportunities/${id}/`),
          apiRequest<CustomerOption[]>("/api/opportunities/dropdowns/customers/"),
        ]);
        if (cancelled) return;
        setForm(toFormValues(oppData));
        setCustomers(custData);
      } catch (err) {
        if (cancelled) return;
        setSubmitError((err as Error).message);
        setNotFound(true);
        if (!getAccessToken()) router.push("/login");
      } finally {
        if (!cancelled) setLoading(false);
        if (!cancelled) setCustomersLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [id, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...(prev as OpportunityFormValues), [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate(): boolean {
    const f = form as OpportunityFormValues;
    const e: FormErrors = {};
    if (!f.name.trim()) e.name = "Opportunity name is required";
    if (!f.customer.trim()) e.customer = "Please select a customer";
    if (!f.value.trim()) e.value = "Deal value is required";
    else if (isNaN(Number(f.value)) || Number(f.value) < 0) e.value = "Enter a valid amount";
    if (!f.stage) e.stage = "Please select a stage";
    if (!f.probability.trim()) e.probability = "Probability is required";
    else if (isNaN(Number(f.probability)) || Number(f.probability) < 0 || Number(f.probability) > 100) e.probability = "Enter 0–100";
    if (!f.expected_close_date) e.expectedCloseDate = "Close date is required";
    if (!f.status) e.status = "Please select a status";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !validate()) return;
    setSaving(true);
    setSubmitError("");
    try {
      await apiRequest(`/api/opportunities/${id}/`, {
        method: "PATCH",
        body: {
          name: form.name,
          customer: Number(form.customer),
          value: Number(form.value),
          stage: STAGE_TO_API[form.stage as OpportunityStage],
          status: STATUS_TO_API[form.status as OpportunityStatus],
          probability: Number(form.probability),
          expected_close_date: form.expected_close_date,
          notes: form.notes,
        },
      });
      emitDataChanged();
      setSuccess(true);
      setTimeout(() => router.push(`/opportunities/${id}`), 1800);
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <DashboardLayout>
      <ThemeLoader label="Loading..." />
    </DashboardLayout>
  );

  if (notFound || !form) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Opportunity Not Found</h2>
        <p>{submitError || `No opportunity found with ID: ${id}`}</p>
        <button className="btn-add" onClick={() => router.push("/opportunities")}>Back to Opportunities</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Page Header */}
        <div>
          <button className="back-btn" onClick={() => router.push(`/opportunities/${id}`)} style={{ marginBottom: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Opportunity
          </button>
          <h1 className="page-title">Edit Opportunity</h1>
          <p className="page-subtitle">Update the opportunity details below.</p>
        </div>

        {success && <div className="msg-success"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Changes saved! Redirecting...</div>}
        {submitError && <div className="msg-error">{submitError}</div>}

        {/* Form Card */}
        <form onSubmit={handleSubmit} noValidate className="company-form-card">
          <div className="form-section">
            <div className="form-section-header">
              <h2>Opportunity Details</h2>
              <p>Update all the required fields below.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <FormField label="Opportunity Name" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
              <FormField label="Customer" name="customer" type="select" value={form.customer} onChange={handleChange} error={errors.customer} required disabled={customersLoading}
                options={customers.map((c) => ({ label: c.company ? `${c.name} — ${c.company}` : c.name, value: String(c.id) }))} />
              <div className="form-row-2">
                <FormField label="Deal Value ($)" name="value" value={form.value} onChange={handleChange} error={errors.value} required />
                <FormField label="Probability (%)" name="probability" value={form.probability} onChange={handleChange} error={errors.probability} required />
              </div>
              <div className="form-row-2">
                <FormField label="Stage" name="stage" type="select" value={form.stage} onChange={handleChange} error={errors.stage} required
                  options={STAGE_OPTIONS.map((s) => ({ label: s, value: s }))} />
                <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} error={errors.status} required
                  options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Expected Close Date <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="date" name="expected_close_date" value={form.expected_close_date} onChange={handleChange}
                  className={`form-input${errors.expectedCloseDate ? " error" : ""}`} />
                {errors.expectedCloseDate && <p className="form-error">{errors.expectedCloseDate}</p>}
              </div>
              <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={handleChange} />
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
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
