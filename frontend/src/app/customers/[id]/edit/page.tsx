"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import { ApiCustomer, CustomerFormValues, CustomerStatus, STATUS_TO_API, toFormValues } from "@/data/customers";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";
import ThemeLoader from "@/components/ui/ThemeLoader";

interface FormErrors {
  first_name?: string; last_name?: string; email?: string;
  phone?: string; company?: string; status?: string;
}

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<CustomerFormValues | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await apiRequest<ApiCustomer>(`/api/customers/${id}/`);
        if (cancelled) return;
        setForm(toFormValues(data));
      } catch (err) {
        if (cancelled) return;
        setSubmitError((err as Error).message);
        setNotFound(true);
        if (!getAccessToken()) router.push("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...(prev as CustomerFormValues), [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate(): boolean {
    const f = form as CustomerFormValues;
    const e: FormErrors = {};
    if (!f.first_name.trim()) e.first_name = "First name is required";
    if (!f.last_name.trim()) e.last_name = "Last name is required";
    if (!f.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email address";
    if (!f.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[\d\s+\-()]{7,15}$/.test(f.phone)) e.phone = "Enter a valid phone number";
    if (!f.company.trim()) e.company = "Company name is required";
    if (!f.status) e.status = "Please select a status";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !validate()) return;
    setSaving(true);
    setSubmitError("");
    try {
      await apiRequest(`/api/customers/${id}/`, {
        method: "PATCH",
        body: {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          status: STATUS_TO_API[form.status as CustomerStatus],
        },
      });
      emitDataChanged();
      setSuccess(true);
      setTimeout(() => router.push(`/customers/${id}`), 1800);
    } catch (err) {
      setSubmitError((err as Error).message);
      if (!getAccessToken()) router.push("/login");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <DashboardLayout>
      <ThemeLoader label="Loading customer..." />
    </DashboardLayout>
  );

  if (notFound || !form) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Customer Not Found</h2>
        <p>{submitError || `No customer found with ID: ${id}`}</p>
        <button className="btn-add" onClick={() => router.push("/customers")}>Back to Customers</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Page Header */}
        <div>
          <button className="back-btn" onClick={() => router.push(`/customers/${id}`)} style={{ marginBottom: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Customer
          </button>
          <h1 className="page-title">Edit Customer</h1>
          <p className="page-subtitle">Update the customer details below.</p>
        </div>

        {success && (
          <div className="msg-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Changes saved successfully! Redirecting...
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
              <h2>Customer Information</h2>
              <p>Update all the required fields below.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="form-row-2">
                <FormField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} error={errors.first_name} placeholder="e.g. Ahmed" required />
                <FormField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} error={errors.last_name} placeholder="e.g. Ali" required />
              </div>
              <div className="form-row-2">
                <FormField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="e.g. ahmed@example.com" required />
                <FormField label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="e.g. +92 300 1234567" required />
              </div>
              <div className="form-row-2">
                <FormField label="Company" name="company" value={form.company} onChange={handleChange} error={errors.company} placeholder="e.g. TechVision Pvt Ltd" required />
                <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} error={errors.status} required
                  options={[{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }, { label: "Lead", value: "Lead" }]} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => router.push(`/customers/${id}`)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-add" disabled={saving || success}>
              {saving ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>
              ) : success ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
