"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import { FollowupType, FollowupStatus, FollowupPriority } from "@/data/followups";
import {
  createFollowUp, toTypeValue, toStatusValue, toPriorityValue, parseRelatedKey,
  getCustomerOptions, getLeadOptions, getDealOptions, getCompanyOptions,
  type RelatedOption,
} from "@/lib/followupsApi";

interface FormValues {
  subject: string; relatedKey: string; companyId: string;
  type: FollowupType | ""; status: FollowupStatus | "";
  priority: FollowupPriority | ""; dueDate: string; dueTime: string;
  notes: string;
}
interface FormErrors {
  subject?: string; relatedKey?: string; type?: string;
  status?: string; priority?: string; dueDate?: string;
}

export default function AddFollowupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>({
    subject: "", relatedKey: "", companyId: "", type: "",
    status: "", priority: "", dueDate: "", dueTime: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // Options for the Related To / Company selects.
  const [relatedOptions, setRelatedOptions] = useState<RelatedOption[]>([]);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCustomerOptions(), getLeadOptions(), getDealOptions(), getCompanyOptions()])
      .then(([customers, leads, deals, comps]) => {
        if (cancelled) return;
        setRelatedOptions([...customers, ...leads, ...deals]);
        setCompanies(comps);
      })
      .catch(() => { /* options stay empty; selects still render */ });
    return () => { cancelled = true; };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.relatedKey) e.relatedKey = "Please select a related record";
    if (!form.type) e.type = "Please select a type";
    if (!form.status) e.status = "Please select a status";
    if (!form.priority) e.priority = "Please select a priority";
    if (!form.dueDate) e.dueDate = "Due date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await createFollowUp({
        subject: form.subject.trim(),
        notes: form.notes,
        ...parseRelatedKey(form.relatedKey),
        company: form.companyId ? Number(form.companyId) : null,
        type: toTypeValue(form.type),
        status: toStatusValue(form.status),
        priority: toPriorityValue(form.priority),
        due_date: form.dueDate,
        due_time: form.dueTime || null,
      });
      setSuccess(true);
      setTimeout(() => router.push("/followups"), 1200);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create follow-up.");
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Page Header */}
        <div>
          <button className="back-btn" onClick={() => router.push("/followups")} style={{ marginBottom: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Follow-ups
          </button>
          <h1 className="page-title">Create Follow-up</h1>
          <p className="page-subtitle">Fill in the details to schedule a new follow-up.</p>
        </div>

        {success && (
          <div className="msg-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Follow-up created successfully! Redirecting...
          </div>
        )}
        {submitError && (
          <div className="msg-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {submitError}
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} noValidate className="company-form-card">
          <div className="form-section">
            <div className="form-section-header">
              <h2>Follow-up Details</h2>
              <p>Fill in all the required fields below.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Subject */}
            <FormField label="Subject" name="subject" value={form.subject}
              onChange={handleChange} error={errors.subject}
              placeholder="e.g. Product Demo Follow-up" required />

            {/* Related To + Company */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Related To <span style={{ color: "var(--error)" }}>*</span></label>
                <select name="relatedKey" value={form.relatedKey} onChange={handleChange}
                  className={`form-input${errors.relatedKey ? " error" : ""}`}>
                  <option value="">Select customer, lead, or deal</option>
                  <optgroup label="Customers">
                    {relatedOptions.filter(o => o.key.startsWith("customer:")).map(o => (
                      <option key={o.key} value={o.key}>{o.name}{o.detail ? ` — ${o.detail}` : ""}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Leads">
                    {relatedOptions.filter(o => o.key.startsWith("lead:")).map(o => (
                      <option key={o.key} value={o.key}>{o.name}{o.detail ? ` — ${o.detail}` : ""}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Deals">
                    {relatedOptions.filter(o => o.key.startsWith("deal:")).map(o => (
                      <option key={o.key} value={o.key}>{o.name}</option>
                    ))}
                  </optgroup>
                </select>
                {errors.relatedKey && <p className="form-error">{errors.relatedKey}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <select name="companyId" value={form.companyId} onChange={handleChange} className="form-input">
                  <option value="">No company</option>
                  {companies.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Type + Priority */}
            <div className="form-row-2">
              <FormField label="Type" name="type" type="select" value={form.type}
                onChange={handleChange} error={errors.type} required
                options={["Call","Email","Meeting","Task","Follow-up"].map(t => ({ label: t, value: t }))} />
              <FormField label="Priority" name="priority" type="select" value={form.priority}
                onChange={handleChange} error={errors.priority} required
                options={[{ label: "High", value: "High" }, { label: "Medium", value: "Medium" }, { label: "Low", value: "Low" }]} />
            </div>

            {/* Status */}
            <div className="form-row-2">
              <FormField label="Status" name="status" type="select" value={form.status}
                onChange={handleChange} error={errors.status} required
                options={[
                  { label: "Upcoming", value: "Upcoming" },
                  { label: "Completed", value: "Completed" },
                  { label: "Overdue", value: "Overdue" },
                  { label: "Cancelled", value: "Cancelled" },
                ]} />
              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <input value="You (creator)" disabled className="form-input"
                  style={{ background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }} />
                <p className="form-error" style={{ color: "#94a3b8" }}>Follow-ups are assigned to you when created.</p>
              </div>
            </div>

            {/* Due Date + Time */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Due Date <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange}
                  className={`form-input${errors.dueDate ? " error" : ""}`} />
                {errors.dueDate && <p className="form-error">{errors.dueDate}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Due Time</label>
                <input type="time" name="dueTime" value={form.dueTime} onChange={handleChange}
                  className="form-input" />
              </div>
            </div>

            {/* Notes */}
            <FormField label="Notes" name="notes" type="textarea" value={form.notes}
              onChange={handleChange} placeholder="Add any notes or details…" />
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary"
              onClick={() => router.push("/followups")} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-add" disabled={loading || success}>
              {loading ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>
              ) : success ? "Saved!" : "Create Follow-up"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
