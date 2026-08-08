"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import { ActivityType, ActivityStatus, ActivityPriority } from "@/data/activities";

interface FormValues {
  title: string;
  type: ActivityType | "";
  status: ActivityStatus | "";
  priority: ActivityPriority | "";
  date: string;
  time: string;
  duration: string;
  assignedTo: string;
  relatedTo: string;
  relatedType: "Customer" | "Lead" | "Opportunity" | "";
  location: string;
  description: string;
}

interface FormErrors {
  title?: string;
  type?: string;
  status?: string;
  priority?: string;
  date?: string;
  time?: string;
  duration?: string;
  relatedTo?: string;
}

const INITIAL: FormValues = {
  title: "", type: "", status: "", priority: "",
  date: "", time: "", duration: "", assignedTo: "",
  relatedTo: "", relatedType: "", location: "", description: "",
};

export default function AddActivityPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(INITIAL);
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
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.type) e.type = "Please select a type";
    if (!form.status) e.status = "Please select a status";
    if (!form.priority) e.priority = "Please select a priority";
    if (!form.date) e.date = "Date is required";
    if (!form.time) e.time = "Time is required";
    if (!form.duration.trim()) e.duration = "Duration is required";
    else if (isNaN(Number(form.duration)) || Number(form.duration) <= 0) e.duration = "Enter valid minutes";
    if (!form.relatedTo.trim()) e.relatedTo = "Related contact is required";
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
    setTimeout(() => router.push("/activities"), 1800);
  }

  return (
    <DashboardLayout>
      <div className="form-card">
        <div style={{ padding: "0 0 0.75rem" }}>
          <button className="back-btn" onClick={() => router.push("/activities")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Activities
          </button>
          <h1 className="page-title">Schedule Activity</h1>
          <p className="page-subtitle">Fill in the details to schedule a new activity.</p>
        </div>

        {success && (
          <div className="msg-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Activity scheduled successfully! Redirecting...
          </div>
        )}
        {submitError && <div className="msg-error">{submitError}</div>}

        <div className="form-card-header">
          <h2 className="form-card-title">Activity Details</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-card-body">
            <FormField label="Activity Title" name="title" value={form.title} onChange={handleChange} error={errors.title} placeholder="e.g. Discovery Call with Ahmed Ali" required />

            <div className="form-row-2">
              <FormField label="Type" name="type" type="select" value={form.type} onChange={handleChange} error={errors.type} required
                options={["Call","Meeting","Email","Task","Follow-up"].map(t => ({ label: t, value: t }))} />
              <FormField label="Priority" name="priority" type="select" value={form.priority} onChange={handleChange} error={errors.priority} required
                options={["High","Medium","Low"].map(p => ({ label: p, value: p }))} />
            </div>

            <div className="form-row-2">
              <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} error={errors.status} required
                options={["Scheduled","Completed","Cancelled","Overdue"].map(s => ({ label: s, value: s }))} />
              <FormField label="Assigned To" name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="e.g. Khaanzadi" />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Date <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="date" name="date" value={form.date} onChange={handleChange}
                  className={`form-input${errors.date ? " error" : ""}`} />
                {errors.date && <p className="form-error">{errors.date}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Time <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="time" name="time" value={form.time} onChange={handleChange}
                  className={`form-input${errors.time ? " error" : ""}`} />
                {errors.time && <p className="form-error">{errors.time}</p>}
              </div>
            </div>

            <div className="form-row-2">
              <FormField label="Duration (minutes)" name="duration" value={form.duration} onChange={handleChange} error={errors.duration} placeholder="e.g. 30" required />
              <FormField label="Location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Zoom, Phone, Office" />
            </div>

            <div className="form-row-2">
              <FormField label="Related To" name="relatedTo" value={form.relatedTo} onChange={handleChange} error={errors.relatedTo} placeholder="e.g. Ahmed Ali" required />
              <FormField label="Related Type" name="relatedType" type="select" value={form.relatedType} onChange={handleChange}
                options={["Customer","Lead","Opportunity"].map(t => ({ label: t, value: t }))} />
            </div>

            <FormField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} placeholder="Add any notes or details…" />
          </div>

          <div className="form-card-footer">
            <button type="button" className="btn-secondary" onClick={() => router.push("/activities")} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-add" disabled={loading || success}>
              {loading ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>
              ) : success ? "Saved!" : "Schedule Activity"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
