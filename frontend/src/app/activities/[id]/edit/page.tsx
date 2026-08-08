"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import { activities as activitiesData, ActivityType, ActivityStatus, ActivityPriority } from "@/data/activities";

interface FormValues {
  title: string; type: ActivityType | ""; status: ActivityStatus | "";
  priority: ActivityPriority | ""; date: string; time: string;
  duration: string; assignedTo: string; relatedTo: string;
  relatedType: "Customer" | "Lead" | "Opportunity" | "";
  location: string; description: string;
}
interface FormErrors {
  title?: string; type?: string; status?: string; priority?: string;
  date?: string; time?: string; duration?: string; relatedTo?: string;
}

export default function EditActivityPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<FormValues>({ title: "", type: "", status: "", priority: "", date: "", time: "", duration: "", assignedTo: "", relatedTo: "", relatedType: "", location: "", description: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const activity = activitiesData.find(a => a.id === id);
    if (!activity) { setNotFound(true); setLoading(false); return; }
    setForm({ title: activity.title, type: activity.type, status: activity.status, priority: activity.priority, date: activity.date, time: activity.time, duration: String(activity.duration), assignedTo: activity.assignedTo, relatedTo: activity.relatedTo, relatedType: activity.relatedType, location: activity.location, description: activity.description });
    setLoading(false);
  }, [id]);

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
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => router.push(`/activities/${id}`), 1800);
  }

  if (loading) return (
    <DashboardLayout>
      <div className="loading-state">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        Loading activity...
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </DashboardLayout>
  );

  if (notFound) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Activity Not Found</h2>
        <p>No activity found with ID: {id}</p>
        <button className="btn-add" onClick={() => router.push("/activities")}>Back to Activities</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="form-card">
        <div style={{ padding: "0 0 0.75rem" }}>
          <button className="back-btn" onClick={() => router.push(`/activities/${id}`)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Activity
          </button>
          <h1 className="page-title">Edit Activity</h1>
          <p className="page-subtitle">Update the activity details below.</p>
        </div>

        {success && <div className="msg-success"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Changes saved! Redirecting...</div>}

        <div className="form-card-header">
          <h2 className="form-card-title">Activity Details</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-card-body">
            <FormField label="Activity Title" name="title" value={form.title} onChange={handleChange} error={errors.title} required />
            <div className="form-row-2">
              <FormField label="Type" name="type" type="select" value={form.type} onChange={handleChange} error={errors.type} required options={["Call","Meeting","Email","Task","Follow-up"].map(t => ({ label: t, value: t }))} />
              <FormField label="Priority" name="priority" type="select" value={form.priority} onChange={handleChange} error={errors.priority} required options={["High","Medium","Low"].map(p => ({ label: p, value: p }))} />
            </div>
            <div className="form-row-2">
              <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} error={errors.status} required options={["Scheduled","Completed","Cancelled","Overdue"].map(s => ({ label: s, value: s }))} />
              <FormField label="Assigned To" name="assignedTo" value={form.assignedTo} onChange={handleChange} />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Date <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="date" name="date" value={form.date} onChange={handleChange} className={`form-input${errors.date ? " error" : ""}`} />
                {errors.date && <p className="form-error">{errors.date}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Time <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="time" name="time" value={form.time} onChange={handleChange} className={`form-input${errors.time ? " error" : ""}`} />
                {errors.time && <p className="form-error">{errors.time}</p>}
              </div>
            </div>
            <div className="form-row-2">
              <FormField label="Duration (minutes)" name="duration" value={form.duration} onChange={handleChange} error={errors.duration} required />
              <FormField label="Location" name="location" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-row-2">
              <FormField label="Related To" name="relatedTo" value={form.relatedTo} onChange={handleChange} error={errors.relatedTo} required />
              <FormField label="Related Type" name="relatedType" type="select" value={form.relatedType} onChange={handleChange} options={["Customer","Lead","Opportunity"].map(t => ({ label: t, value: t }))} />
            </div>
            <FormField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} />
          </div>

          <div className="form-card-footer">
            <button type="button" className="btn-secondary" onClick={() => router.push(`/activities/${id}`)} disabled={saving}>Cancel</button>
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
