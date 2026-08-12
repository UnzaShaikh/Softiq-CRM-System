"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import {
  ApiActivity,
  ActivityType,
  ActivityStatus,
  ActivityPriority,
  ActivityFormValues,
  ActivityDropdowns,
  toActivityFormValues,
  toActivityApiPayload,
  apiErrorMessage,
} from "@/data/activity";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";
import ThemeLoader from "@/components/ui/ThemeLoader";

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

const TYPE_OPTIONS: ActivityType[] = ["Call", "Meeting", "Email", "Task", "Follow-up"];
const PRIORITY_OPTIONS: ActivityPriority[] = ["High", "Medium", "Low"];
const STATUS_OPTIONS: ActivityStatus[] = ["Scheduled", "Completed", "Cancelled", "Overdue"];

export default function EditActivityPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<ActivityFormValues | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [dropdowns, setDropdowns] = useState<ActivityDropdowns>({ users: [], customers: [], leads: [], deals: [] });
  const [dropdownsLoading, setDropdownsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const [actData, ddData] = await Promise.all([
          apiRequest<ApiActivity>(`/api/activities/${id}/`),
          apiRequest<ActivityDropdowns>("/api/activities/dropdowns/"),
        ]);
        if (cancelled) return;
        setForm(toActivityFormValues(actData));
        setDropdowns(ddData);
      } catch (err) {
        if (cancelled) return;
        setSubmitError(apiErrorMessage(err));
        setNotFound(true);
        if (!getAccessToken()) router.push("/login");
      } finally {
        if (!cancelled) setLoading(false);
        if (!cancelled) setDropdownsLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [id, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => {
      const base = (prev as ActivityFormValues);
      if (name === "relatedType") {
        return { ...base, relatedType: value as ActivityFormValues["relatedType"], relatedTo: "" };
      }
      return { ...base, [name]: value };
    });
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  const relatedOptions =
    form?.relatedType === "Customer" ? dropdowns.customers :
    form?.relatedType === "Lead" ? dropdowns.leads :
    form?.relatedType === "Deal" ? dropdowns.deals : [];

  function validate(): boolean {
    const f = form as ActivityFormValues;
    const e: FormErrors = {};
    if (!f.title.trim()) e.title = "Title is required";
    if (!f.type) e.type = "Please select a type";
    if (!f.status) e.status = "Please select a status";
    if (!f.priority) e.priority = "Please select a priority";
    if (!f.date) e.date = "Date is required";
    if (!f.time) e.time = "Time is required";
    if (!f.duration.trim()) e.duration = "Duration is required";
    else if (isNaN(Number(f.duration)) || Number(f.duration) <= 0) e.duration = "Enter valid minutes";
    if (f.relatedType && !f.relatedTo) e.relatedTo = "Please select the related record";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !validate()) return;
    setSaving(true);
    setSubmitError("");
    try {
      await apiRequest(`/api/activities/${id}/`, {
        method: "PATCH",
        body: toActivityApiPayload(form),
      });
      emitDataChanged();
      setSuccess(true);
      setTimeout(() => router.push(`/activities/${id}`), 1800);
    } catch (err) {
      setSubmitError(apiErrorMessage(err));
      if (!getAccessToken()) router.push("/login");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <DashboardLayout>
      <ThemeLoader label="Loading activity..." />
    </DashboardLayout>
  );

  if (notFound || !form) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Activity Not Found</h2>
        <p>{submitError || `No activity found with ID: ${id}`}</p>
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
        {submitError && <div className="msg-error">{submitError}</div>}

        <div className="form-card-header">
          <h2 className="form-card-title">Activity Details</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-card-body">
            <FormField label="Activity Title" name="title" value={form.title} onChange={handleChange} error={errors.title} required />
            <div className="form-row-2">
              <FormField label="Type" name="type" type="select" value={form.type} onChange={handleChange} error={errors.type} required options={TYPE_OPTIONS.map(t => ({ label: t, value: t }))} />
              <FormField label="Priority" name="priority" type="select" value={form.priority} onChange={handleChange} error={errors.priority} required options={PRIORITY_OPTIONS.map(p => ({ label: p, value: p }))} />
            </div>
            <div className="form-row-2">
              <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} error={errors.status} required options={STATUS_OPTIONS.map(s => ({ label: s, value: s }))} />
              <FormField label="Assigned To" name="assignedTo" type="select" value={form.assignedTo} onChange={handleChange} disabled={dropdownsLoading}
                options={dropdowns.users.map(u => ({ label: u.name, value: String(u.id) }))} />
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
              <FormField label="Related Type" name="relatedType" type="select" value={form.relatedType} onChange={handleChange} disabled={dropdownsLoading}
                options={[{ label: "Customer", value: "Customer" }, { label: "Lead", value: "Lead" }, { label: "Deal", value: "Deal" }]} />
              <FormField label="Related To" name="relatedTo" type="select" value={form.relatedTo} onChange={handleChange} error={errors.relatedTo} disabled={dropdownsLoading || !form.relatedType}
                options={relatedOptions.map(o => ({ label: o.name, value: String(o.id) }))} />
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
