"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import { FollowupType, FollowupStatus, FollowupPriority } from "@/data/followups";

interface FormValues {
  subject: string; relatedTo: string; company: string;
  type: FollowupType | ""; status: FollowupStatus | "";
  priority: FollowupPriority | ""; dueDate: string; dueTime: string;
  assignedTo: string; notes: string;
}
interface FormErrors {
  subject?: string; relatedTo?: string; type?: string;
  status?: string; priority?: string; dueDate?: string;
}

export default function AddFollowupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>({
    subject: "", relatedTo: "", company: "", type: "",
    status: "", priority: "", dueDate: "", dueTime: "",
    assignedTo: "", notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.relatedTo.trim()) e.relatedTo = "Related contact is required";
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
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => router.push("/followups"), 1800);
  }

  return (
    <DashboardLayout>
      <div className="form-card">
        <div style={{ padding: "0 0 0.75rem" }}>
          <button className="back-btn" onClick={() => router.push("/followups")}>
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

        <div className="form-card-header">
          <h2 className="form-card-title">Follow-up Details</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-card-body">

            {/* Subject */}
            <FormField label="Subject" name="subject" value={form.subject}
              onChange={handleChange} error={errors.subject}
              placeholder="e.g. Product Demo Follow-up" required />

            {/* Related To + Company */}
            <div className="form-row-2">
              <FormField label="Related To" name="relatedTo" value={form.relatedTo}
                onChange={handleChange} error={errors.relatedTo}
                placeholder="e.g. Ahmed Khan" required />
              <FormField label="Company" name="company" value={form.company}
                onChange={handleChange} placeholder="e.g. SoftiqTech" />
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

            {/* Status + Assigned To */}
            <div className="form-row-2">
              <FormField label="Status" name="status" type="select" value={form.status}
                onChange={handleChange} error={errors.status} required
                options={[
                  { label: "Upcoming", value: "Upcoming" },
                  { label: "Completed", value: "Completed" },
                  { label: "Overdue", value: "Overdue" },
                  { label: "Cancelled", value: "Cancelled" },
                ]} />
              <FormField label="Assigned To" name="assignedTo" value={form.assignedTo}
                onChange={handleChange} placeholder="e.g. Khaanzadi" />
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

          <div className="form-card-footer">
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
