"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import FormField from "@/components/customers/FormField";
import { retrieveAdminUser, updateAdminUser, deleteAdminUser, listRoles, type AdminUser, type Role } from "@/lib/projectSettingsApi";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);

  const [user, setUser] = useState<AdminUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    first_name: "", last_name: "", username: "", email: "", password: "", role_id: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([retrieveAdminUser(userId), listRoles()]);
      setUser(u);
      setRoles(r);
      setForm({
        first_name: u.first_name ?? "",
        last_name: u.last_name ?? "",
        username: u.username,
        email: u.email,
        password: "",
        role_id: u.role ? String(u.role) : "",
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to load user.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    if (form.password && form.password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        role_id: form.role_id ? Number(form.role_id) : null,
      };
      if (form.password) payload.password = form.password;
      await updateAdminUser(userId, payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAdminUser(userId);
      router.push("/admin/users");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to delete user.");
      setDeleting(false);
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
          <h1 className="page-title">Edit User</h1>
          <p className="page-subtitle">Update user account details and role assignment.</p>
        </div>

        {success && (
          <div className="msg-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            User updated successfully!
          </div>
        )}
        {submitError && (
          <div className="msg-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            {submitError}
          </div>
        )}

        {loading ? (
          <ThemeLoader label="Loading user..." minHeight={300} />
        ) : user ? (
          <form onSubmit={handleSubmit} noValidate className="company-form-card">
            <div className="form-section">
              <div className="form-section-header">
                <h2>User Information</h2>
                <p>Update details for @{user.username}.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="form-row-2">
                  <FormField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} error={errors.first_name} />
                  <FormField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} error={errors.last_name} />
                </div>
                <div className="form-row-2">
                  <FormField label="Username" name="username" value={form.username} onChange={handleChange} error={errors.username} required />
                  <FormField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
                </div>
                <div className="form-row-2">
                  <FormField label="New Password" name="password" type="text" value={form.password} onChange={handleChange} error={errors.password} placeholder="Leave blank to keep current" />
                  <FormField
                    label="Role" name="role_id" type="select" value={form.role_id} onChange={handleChange}
                    options={roles.map(r => ({ label: r.name, value: String(r.id) }))}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="button" className="btn-danger" onClick={() => setShowDeleteModal(true)} disabled={saving || deleting}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                Delete User
              </button>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => router.push("/admin/users")} disabled={saving}>Cancel</button>
                <button type="submit" className="btn-add" disabled={saving || success}>
                  {saving ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Saving...</>
                  ) : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div className="modal-box" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Delete User</h2>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="msg-error" style={{ marginBottom: "16px" }}>
              <p style={{ margin: 0, fontWeight: 500 }}>Are you sure you want to delete <strong>&quot;{user?.username}&quot;</strong>?</p>
              <p style={{ margin: "6px 0 0", fontSize: "0.8125rem" }}>This action cannot be undone.</p>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
