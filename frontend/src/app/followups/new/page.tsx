"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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

const selectStyle = {
  padding: "12px 14px", border: "1px solid #E5E7EB", borderRadius: "10px",
  background: "#fff", color: "#1F2937", fontSize: "14px",
  fontFamily: "inherit", outline: "none", width: "100%",
};

export default function AddFollowupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>({
    subject: "", relatedTo: "", company: "", type: "",
    status: "", priority: "", dueDate: "", dueTime: "",
    assignedTo: "", notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.relatedTo.trim()) e.relatedTo = "Related contact is required.";
    if (!form.type) e.type = "Please select a type.";
    if (!form.status) e.status = "Please select a status.";
    if (!form.priority) e.priority = "Please select a priority.";
    if (!form.dueDate) e.dueDate = "Due date is required.";
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
    setSuccess("Follow-up created successfully.");
    setTimeout(() => router.push("/followups"), 1500);
  }

  return (
    <DashboardLayout>
      <div className="company-page">
        <div className="company-page-header">
          <div>
            <h1 className="company-page-title">Create Follow-up</h1>
            <p className="company-page-subtitle">Schedule a new follow-up activity.</p>
          </div>
          <button type="button" className="filter-btn" onClick={() => router.push("/followups")}>← Back</button>
        </div>

        <div className="company-form-card">
          {submitError && <div className="msg-error" role="alert">❌ {submitError}</div>}
          {success && <div className="msg-success" role="status">✅ {success}</div>}

          <form onSubmit={handleSubmit} noValidate>

            {/* Subject */}
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input id="subject" name="subject" type="text" value={form.subject}
                onChange={handleChange} placeholder="e.g. Product Demo Follow-up"
                className={errors.subject ? "input-error" : ""} disabled={loading} />
              {errors.subject && <span className="form-field-error">{errors.subject}</span>}
            </div>

            {/* Related To + Company */}
            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="relatedTo">Related To *</label>
                <input id="relatedTo" name="relatedTo" type="text" value={form.relatedTo}
                  onChange={handleChange} placeholder="e.g. Ahmed Khan"
                  className={errors.relatedTo ? "input-error" : ""} disabled={loading} />
                {errors.relatedTo && <span className="form-field-error">{errors.relatedTo}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" type="text" value={form.company}
                  onChange={handleChange} placeholder="e.g. SoftiqTech" disabled={loading} />
              </div>
            </div>

            {/* Type + Priority */}
            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="type">Type *</label>
                <select id="type" name="type" value={form.type} onChange={handleChange}
                  style={selectStyle} className={errors.type ? "input-error" : ""} disabled={loading}>
                  <option value="">Select type</option>
                  {["Call","Email","Meeting","Task","Follow-up"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <span className="form-field-error">{errors.type}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="priority">Priority *</label>
                <select id="priority" name="priority" value={form.priority} onChange={handleChange}
                  style={selectStyle} className={errors.priority ? "input-error" : ""} disabled={loading}>
                  <option value="">Select priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                {errors.priority && <span className="form-field-error">{errors.priority}</span>}
              </div>
            </div>

            {/* Status + Assigned To */}
            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select id="status" name="status" value={form.status} onChange={handleChange}
                  style={selectStyle} className={errors.status ? "input-error" : ""} disabled={loading}>
                  <option value="">Select status</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {errors.status && <span className="form-field-error">{errors.status}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="assignedTo">Assigned To</label>
                <input id="assignedTo" name="assignedTo" type="text" value={form.assignedTo}
                  onChange={handleChange} placeholder="e.g. Khaanzadi" disabled={loading} />
              </div>
            </div>

            {/* Due Date + Time */}
            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="dueDate">Due Date *</label>
                <input id="dueDate" name="dueDate" type="date" value={form.dueDate}
                  onChange={handleChange} style={{ padding: "12px 14px", border: "1px solid #E5E7EB", borderRadius: "10px", background: "#fff", color: "#1F2937", fontSize: "14px", fontFamily: "inherit", outline: "none", width: "100%" }}
                  className={errors.dueDate ? "input-error" : ""} disabled={loading} />
                {errors.dueDate && <span className="form-field-error">{errors.dueDate}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="dueTime">Due Time</label>
                <input id="dueTime" name="dueTime" type="time" value={form.dueTime}
                  onChange={handleChange} style={{ padding: "12px 14px", border: "1px solid #E5E7EB", borderRadius: "10px", background: "#fff", color: "#1F2937", fontSize: "14px", fontFamily: "inherit", outline: "none", width: "100%" }}
                  disabled={loading} />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" value={form.notes}
                onChange={handleChange} placeholder="Add any notes or details…" disabled={loading} />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className="filter-btn" onClick={() => router.push("/followups")} disabled={loading}>Cancel</button>
              <button type="submit" className="save-company-btn" disabled={loading}>
                {loading ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>) : "Create Follow-up"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
