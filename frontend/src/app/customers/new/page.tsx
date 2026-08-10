"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import { CustomerStatus, STATUS_TO_API } from "@/data/customers";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";

interface FormValues {
  first_name: string; last_name: string; email: string;
  phone: string; company: string;
  status: CustomerStatus | "";
}
interface FormErrors {
  first_name?: string; last_name?: string; email?: string;
  phone?: string; company?: string; status?: string;
}

const INITIAL: FormValues = { first_name: "", last_name: "", email: "", phone: "", company: "", status: "" };

export default function AddCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[\d\s+\-()]{7,15}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (!form.company.trim()) e.company = "Company name is required";
    if (!form.status) e.status = "Please select a status";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await apiRequest("/api/customers/", {
        method: "POST",
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
      setTimeout(() => router.push("/customers"), 1800);
    } catch (err) {
      setSubmitError((err as Error).message);
      if (!getAccessToken()) router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="form-card">
        <div style={{ padding: "0 0 0.75rem" }}>
          <button className="back-btn" onClick={() => router.push("/customers")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Customers
          </button>
          <h1 className="page-title">Add Customer</h1>
          <p className="page-subtitle">Fill in the details below to add a new customer.</p>
        </div>

        {success && (
          <div className="msg-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Customer added successfully! Redirecting...
          </div>
        )}
        {submitError && (
          <div className="msg-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {submitError}
          </div>
        )}

        <div className="form-card-header">
          <h2 className="form-card-title">Customer Information</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-card-body">
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

          <div className="form-card-footer">
            <button type="button" className="btn-secondary" onClick={() => router.push("/customers")} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-add" disabled={loading || success}>
              {loading ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>
              ) : success ? "Saved!" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
