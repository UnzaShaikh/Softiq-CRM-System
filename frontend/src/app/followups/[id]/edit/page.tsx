"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import followupsData, { FollowupType, FollowupStatus, FollowupPriority } from "@/data/followups";

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

export default function EditFollowupPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<FormValues>({
    subject: "", relatedTo: "", company: "", type: "",
    status: "", priority: "", dueDate: "", dueTime: "",
    assignedTo: "", notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const f = followupsData.find(f => f.id === id);
    if (!f) { setNotFound(true); setLoading(false); return; }
    setForm({
      subject: f.subject, relatedTo: f.relatedTo, company: f.company,
      type: f.type, status: f.status, priority: f.priority,
      dueDate: f.dueDate, dueTime: f.dueTime,
      assignedTo: f.assignedTo, notes: f.notes,
    });
    setLoading(false);
  }, [id]);

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
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSuccess("Follow-up updated successfully.");
    setTimeout(() => router.push(`/followups/${id}`), 1500);
  }

  if (loading) return (
    <DashboardLayout>
      <div className="loading-state">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        Loading...
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </DashboardLayout>
  );

  if (notFound) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Follow-up Not Found</h2>
        <button className="save-company-btn" onClick={() => router.push("/followups")}>Back to Follow-ups</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="company-page">
        <div className="company-page-header">
          <div>
            <h1 className="company-page-title">Edit Follow-up</h1>
            <p className="company-page-subtitle">Update follow-up details.</p>
          </div>
          <button type="button" className="filter-btn" onClick={() => router.push(`/followups/${id}`)}>← Back</button>
        </div>

        <div className="company-form-card">
          {success && <div className="msg-success" role="status">✅ {success}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input id="subject" name="subject" type="text" value={form.subject}
                onChange={handleChange} className={errors.subject ? "input-error" : ""} disabled={saving} />
              {errors.subject && <span className="form-field-error">{errors.subject}</span>}
            </div>

            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="relatedTo">Related To *</label>
                <input id="relatedTo" name="relatedTo" type="text" value={form.relatedTo}
                  onChange={handleChange} className={errors.relatedTo ? "input-error" : ""} disabled={saving} />
                {errors.relatedTo && <span className="form-field-error">{errors.relatedTo}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" type="text" value={form.company}
                  onChange={handleChange} disabled={saving} />
              </div>
            </div>

            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="type">Type *</label>
                <select id="type" name="type" value={form.type} onChange={handleChange}
                  style={selectStyle} className={errors.type ? "input-error" : ""} disabled={saving}>
                  <option value="">Select type</option>
                  {["Call","Email","Meeting","Task","Follow-up"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <span className="form-field-error">{errors.type}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="priority">Priority *</label>
                <select id="priority" name="priority" value={form.priority} onChange={handleChange}
                  style={selectStyle} className={errors.priority ? "input-error" : ""} disabled={saving}>
                  <option value="">Select priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                {errors.priority && <span className="form-field-error">{errors.priority}</span>}
              </div>
            </div>

            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select id="status" name="status" value={form.status} onChange={handleChange}
                  style={selectStyle} className={errors.status ? "input-error" : ""} disabled={saving}>
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
                  onChange={handleChange} disabled={saving} />
              </div>
            </div>

            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="dueDate">Due Date *</label>
                <input id="dueDate" name="dueDate" type="date" value={form.dueDate}
                  onChange={handleChange} style={{ padding: "12px 14px", border: "1px solid #E5E7EB", borderRadius: "10px", background: "#fff", color: "#1F2937", fontSize: "14px", fontFamily: "inherit", outline: "none", width: "100%" }}
                  className={errors.dueDate ? "input-error" : ""} disabled={saving} />
                {errors.dueDate && <span className="form-field-error">{errors.dueDate}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="dueTime">Due Time</label>
                <input id="dueTime" name="dueTime" type="time" value={form.dueTime}
                  onChange={handleChange} style={{ padding: "12px 14px", border: "1px solid #E5E7EB", borderRadius: "10px", background: "#fff", color: "#1F2937", fontSize: "14px", fontFamily: "inherit", outline: "none", width: "100%" }}
                  disabled={saving} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} disabled={saving} />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className="filter-btn" onClick={() => router.push(`/followups/${id}`)} disabled={saving}>Cancel</button>
              <button type="submit" className="save-company-btn" disabled={saving}>
                {saving ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>) : "Update Follow-up"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
