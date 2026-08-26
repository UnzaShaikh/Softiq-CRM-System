"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import FormField from "@/components/customers/FormField";
import { createAdminUser, listRoles, type Role } from "@/lib/projectSettingsApi";

export default function NewUserPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    first_name: "", last_name: "", username: "", email: "", password: "", role_id: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    listRoles().then(r => { setRoles(r); setLoadingRoles(false); }).catch(() => setLoadingRoles(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await createAdminUser({
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        password: form.password,
        role_id: form.role_id ? Number(form.role_id) : null,
      });
      setSuccess(true);
      setTimeout(() => router.push("/admin/users"), 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Page Header */}
        <div>
          <button className="back-btn" onClick={() => router.push("/admin/users")} style={{ marginBottom: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Users
          </button>
          <h1 className="page-title">Add New User</h1>
          <p className="page-subtitle">Fill in the details below to create a new user account.</p>
        </div>

        {success && (
          <div className="msg-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            User created successfully! Redirecting...
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
              <h2>User Information</h2>
              <p>Fill in all the required fields below.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="form-row-2">
                <FormField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} error={errors.first_name} placeholder="John" />
                <FormField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} error={errors.last_name} placeholder="Doe" />
              </div>
              <div className="form-row-2">
                <FormField label="Username" name="username" value={form.username} onChange={handleChange} error={errors.username} placeholder="johndoe" required />
                <FormField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="john@example.com" required />
              </div>
              <div className="form-row-2">
                <FormField label="Password" name="password" type="text" value={form.password} onChange={handleChange} error={errors.password} placeholder="Min 8 characters" required />
                <FormField
                  label="Role" name="role_id" type="select" value={form.role_id} onChange={handleChange}
                  options={roles.map(r => ({ label: r.name, value: String(r.id) }))}
                  disabled={loadingRoles}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => router.push("/admin/users")} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-add" disabled={loading || success}>
              {loading ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Saving...</>
              ) : success ? "Saved!" : "Add User"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
