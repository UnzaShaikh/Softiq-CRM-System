"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
import { customers as customersData, CustomerStatus } from "@/data/customers";

interface FormValues {
  first_name: string; last_name: string; email: string;
  phone: string; company: string; location: string;
  status: CustomerStatus | "";
}
interface FormErrors {
  first_name?: string; last_name?: string; email?: string;
  phone?: string; company?: string; status?: string;
}

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<FormValues>({ first_name: "", last_name: "", email: "", phone: "", company: "", location: "", status: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const customer = customersData.find((c) => c.id === id);
    if (!customer) { setNotFound(true); setLoading(false); return; }
    const [first_name, ...rest] = customer.name.split(" ");
    setForm({ first_name: first_name || "", last_name: rest.join(" ") || "", email: customer.email, phone: customer.phone, company: customer.company, location: customer.location, status: customer.status });
    setLoading(false);
  }, [id]);

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
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => router.push(`/customers/${id}`), 1800);
  }

  if (loading) return (
    <DashboardLayout>
      <div className="loading-state">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        Loading customer...
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </DashboardLayout>
  );

  if (notFound) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Customer Not Found</h2>
        <p>No customer found with ID: {id}</p>
        <button className="btn-add" onClick={() => router.push("/customers")}>Back to Customers</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="form-card">
        <div style={{ padding: "0 0 0.75rem" }}>
          <button className="back-btn" onClick={() => router.push(`/customers/${id}`)}>
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
              <FormField label="Location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Karachi, Pakistan" />
            </div>
            <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} error={errors.status} required
              options={[{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }, { label: "Lead", value: "Lead" }]} />
          </div>

          <div className="form-card-footer">
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
