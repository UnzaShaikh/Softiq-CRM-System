"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import { OpportunityStage, OpportunityStatus, STAGE_TO_API, STATUS_TO_API } from "@/data/opportunities";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";

interface FormValues {
  name: string; customer: string; value: string;
  stage: OpportunityStage | ""; probability: string; expectedCloseDate: string;
  status: OpportunityStatus | ""; notes: string;
}
interface FormErrors {
  name?: string; customer?: string; value?: string;
  stage?: string; probability?: string; expectedCloseDate?: string; status?: string;
}

interface CustomerOption {
  id: number;
  name: string;
  company: string;
}

const INITIAL: FormValues = { name: "", customer: "", value: "", stage: "", probability: "", expectedCloseDate: "", status: "", notes: "" };

const STAGE_OPTIONS: OpportunityStage[] = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const STATUS_OPTIONS: OpportunityStatus[] = ["Active", "On Hold", "Inactive", "Closed Won", "Closed Lost"];

export default function AddOpportunityPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadCustomers = async () => {
      try {
        const data = await apiRequest<CustomerOption[]>("/api/opportunities/dropdowns/customers/");
        if (cancelled) return;
        setCustomers(data);
      } catch (err) {
        if (cancelled) return;
        setSubmitError(`Failed to load customers: ${(err as Error).message}`);
        if (!getAccessToken()) router.push("/login");
      } finally {
        if (!cancelled) setCustomersLoading(false);
      }
    };
    void loadCustomers();
    return () => { cancelled = true; };
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Opportunity name is required";
    if (!form.customer.trim()) e.customer = "Please select a customer";
    if (!form.value.trim()) e.value = "Deal value is required";
    else if (isNaN(Number(form.value)) || Number(form.value) < 0) e.value = "Enter a valid amount";
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
    setSubmitError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await apiRequest("/api/opportunities/", {
        method: "POST",
        body: {
          name: form.name,
          customer: Number(form.customer),
          value: Number(form.value),
          stage: STAGE_TO_API[form.stage as OpportunityStage],
          status: STATUS_TO_API[form.status as OpportunityStatus],
          probability: Number(form.probability),
          expected_close_date: form.expectedCloseDate,
          notes: form.notes,
        },
      });
      emitDataChanged();
      setSuccess(true);
      setTimeout(() => router.push("/opportunities"), 1800);
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="form-card">
        <div style={{ padding: "0 0 0.75rem" }}>
          <button className="back-btn" onClick={() => router.push("/opportunities")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Opportunities
          </button>
          <h1 className="page-title">Add Opportunity</h1>
          <p className="page-subtitle">Fill in the details to create a new opportunity.</p>
        </div>

        {success && <div className="msg-success"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Opportunity created! Redirecting...</div>}
        {submitError && <div className="msg-error">{submitError}</div>}

        <div className="form-card-header">
          <h2 className="form-card-title">Opportunity Details</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-card-body">
            <FormField label="Opportunity Name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="e.g. Enterprise CRM License" required />
            <FormField label="Customer" name="customer" type="select" value={form.customer} onChange={handleChange} error={errors.customer} required disabled={customersLoading}
              options={customers.map((c) => ({ label: c.company ? `${c.name} — ${c.company}` : c.name, value: String(c.id) }))} />
            <div className="form-row-2">
              <FormField label="Deal Value ($)" name="value" value={form.value} onChange={handleChange} error={errors.value} placeholder="e.g. 50000" required />
              <FormField label="Probability (%)" name="probability" value={form.probability} onChange={handleChange} error={errors.probability} placeholder="0 – 100" required />
            </div>
            <div className="form-row-2">
              <FormField label="Stage" name="stage" type="select" value={form.stage} onChange={handleChange} error={errors.stage} required
                options={STAGE_OPTIONS.map((s) => ({ label: s, value: s }))} />
              <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} error={errors.status} required
                options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Close Date <span style={{ color: "var(--error)" }}>*</span></label>
              <input type="date" name="expectedCloseDate" value={form.expectedCloseDate} onChange={handleChange}
                className={`form-input${errors.expectedCloseDate ? " error" : ""}`} />
              {errors.expectedCloseDate && <p className="form-error">{errors.expectedCloseDate}</p>}
            </div>
            <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={handleChange} placeholder="Add any additional notes…" />
          </div>
          <div className="form-card-footer">
            <button type="button" className="btn-secondary" onClick={() => router.push("/opportunities")} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-add" disabled={loading || success}>
              {loading ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>) : success ? "Saved!" : "Add Opportunity"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
