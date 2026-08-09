"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { customers as customersData, CustomerStatus } from "@/data/customers";

interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  status: CustomerStatus | "";
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
}

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<FormValues>({
    first_name: "", last_name: "", email: "",
    phone: "", company: "", location: "", status: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const customer = customersData.find(c => c.id === id);
    if (!customer) { setNotFound(true); setLoading(false); return; }
    const [first_name, ...rest] = customer.name.split(" ");
    setForm({
      first_name: first_name || "", last_name: rest.join(" ") || "",
      email: customer.email, phone: customer.phone,
      company: customer.company, location: customer.location,
      status: customer.status,
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
    if (!form.first_name.trim()) e.first_name = "First name is required.";
    if (!form.last_name.trim()) e.last_name = "Last name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email address.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (!/^[\d\s+\-()]{7,20}$/.test(form.phone)) e.phone = "Please enter a valid phone number.";
    if (!form.company.trim()) e.company = "Company name is required.";
    if (!form.status) e.status = "Please select a status.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSuccess("Customer updated successfully.");
    setTimeout(() => router.push(`/customers/${id}`), 1500);
  }

  if (loading) return (
    <DashboardLayout>
      <div className="loading-state">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        Loading customer...
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </DashboardLayout>
  );

  if (notFound) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Customer Not Found</h2>
        <p>No customer found with ID: {id}</p>
        <button className="save-company-btn" onClick={() => router.push("/customers")}>Back to Customers</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="company-page">

        {/* Header */}
        <div className="company-page-header">
          <div>
            <h1 className="company-page-title">Edit Customer</h1>
            <p className="company-page-subtitle">Update customer information.</p>
          </div>
          <button type="button" className="filter-btn" onClick={() => router.push(`/customers/${id}`)}>
            ← Back
          </button>
        </div>

        {/* Form Card */}
        <div className="company-form-card">

          {success && (
            <div className="msg-success" role="status">✅ {success}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* First Name + Last Name */}
            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input id="first_name" name="first_name" type="text" value={form.first_name}
                  onChange={handleChange} placeholder="e.g. Ahmed"
                  className={errors.first_name ? "input-error" : ""} disabled={saving} />
                {errors.first_name && <span className="form-field-error">{errors.first_name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input id="last_name" name="last_name" type="text" value={form.last_name}
                  onChange={handleChange} placeholder="e.g. Ali"
                  className={errors.last_name ? "input-error" : ""} disabled={saving} />
                {errors.last_name && <span className="form-field-error">{errors.last_name}</span>}
              </div>
            </div>

            {/* Email + Phone */}
            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email}
                  onChange={handleChange} placeholder="e.g. ahmed@example.com"
                  className={errors.email ? "input-error" : ""} disabled={saving} />
                {errors.email && <span className="form-field-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" value={form.phone}
                  onChange={handleChange} placeholder="e.g. +92 300 1234567"
                  className={errors.phone ? "input-error" : ""} disabled={saving} />
                {errors.phone && <span className="form-field-error">{errors.phone}</span>}
              </div>
            </div>

            {/* Company */}
            <div className="form-group">
              <label htmlFor="company">Company *</label>
              <input id="company" name="company" type="text" value={form.company}
                onChange={handleChange} placeholder="e.g. TechVision Pvt Ltd"
                className={errors.company ? "input-error" : ""} disabled={saving} />
              {errors.company && <span className="form-field-error">{errors.company}</span>}
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input id="location" name="location" type="text" value={form.location}
                onChange={handleChange} placeholder="e.g. Karachi, Pakistan" disabled={saving} />
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}
                className={errors.status ? "input-error" : ""} disabled={saving}
                style={{ padding: "12px 14px", border: "1px solid #E5E7EB", borderRadius: "10px", background: "#fff", color: "#1F2937", fontSize: "14px", fontFamily: "inherit", outline: "none" }}>
                <option value="">Select status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Lead">Lead</option>
              </select>
              {errors.status && <span className="form-field-error">{errors.status}</span>}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className="filter-btn" onClick={() => router.push(`/customers/${id}`)} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="save-company-btn" disabled={saving}>
                {saving ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>
                ) : "Update Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
