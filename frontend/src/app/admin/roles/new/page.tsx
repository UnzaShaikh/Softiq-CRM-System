"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import { createRole } from "@/lib/projectSettingsApi";

const ACCESS_LEVELS = [
  { label: "Full System Access", value: "full" },
  { label: "Manage Team and Data", value: "team" },
  { label: "Sales Access", value: "sales" },
  { label: "View Only", value: "view" },
  { label: "Custom Access", value: "custom" },
];

export default function NewRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({ name: "", description: "", access_level: "custom" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Role name is required";
    else if (form.name.trim().length > 50) e.name = "Max 50 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const created = await createRole({
        name: form.name.trim(),
        description: form.description.trim(),
        access_level: form.access_level,
        color: "#7c3aed",
        bg_color: "#f5f3ff",
      });
      setSuccess(true);
      setTimeout(() => router.push(`/admin/roles/${created.id}`), 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create role.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Page Header */}
        <div>
          <button className="back-btn" onClick={() => router.push("/admin/roles")} style={{ marginBottom: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Roles
          </button>
          <h1 className="page-title">Add New Role</h1>
          <p className="page-subtitle">Fill in the details below to create a new role.</p>
        </div>

        {success && (
          <div className="msg-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            Role created successfully! Redirecting...
          </div>
        )}
        {submitError && (
          <div className="msg-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            {submitError}
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} noValidate className="company-form-card">
          <div className="form-section">
            <div className="form-section-header">
              <h2>Role Information</h2>
              <p>Fill in all the required fields below.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <FormField label="Role Name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="e.g. Sales Manager" required />
              <FormField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} error={errors.description} placeholder="Describe the responsibilities..." />
              <FormField label="Access Level" name="access_level" type="select" value={form.access_level} onChange={handleChange} options={ACCESS_LEVELS} />
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => router.push("/admin/roles")} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-add" disabled={loading || success}>
              {loading ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Saving...</>
              ) : success ? "Saved!" : "Create Role"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
