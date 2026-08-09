"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CustomerStatus } from "@/data/customers";

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

const INITIAL: FormValues = {
  first_name: "", last_name: "", email: "",
  phone: "", company: "", location: "", status: "",
};

export default function AddCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

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
    setSubmitError("");
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess("Customer created successfully.");
    setTimeout(() => router.push("/customers"), 1500);
  }

  return (
    <DashboardLayout>
      <div className="company-page">

        {/* Header */}
        <div className="company-page-header">
          <div>
            <h1 className="company-page-title">Add Customer</h1>
            <p className="company-page-subtitle">Create a new customer record.</p>
          </div>
          <button type="button" className="filter-btn" onClick={() => router.push("/customers")}>
            ← Back
          </button>
        </div>

        {/* Form Card */}
        <div className="company-form-card">

          {submitError && (
            <div className="msg-error" role="alert">❌ {submitError}</div>
          )}
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
                  className={errors.first_name ? "input-error" : ""} disabled={loading} />
                {errors.first_name && <span className="form-field-error">{errors.first_name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input id="last_name" name="last_name" type="text" value={form.last_name}
                  onChange={handleChange} placeholder="e.g. Ali"
                  className={errors.last_name ? "input-error" : ""} disabled={loading} />
                {errors.last_name && <span className="form-field-error">{errors.last_name}</span>}
              </div>
            </div>

            {/* Email + Phone */}
            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email}
                  onChange={handleChange} placeholder="e.g. ahmed@example.com"
                  className={errors.email ? "input-error" : ""} disabled={loading} />
                {errors.email && <span className="form-field-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" value={form.phone}
                  onChange={handleChange} placeholder="e.g. +92 300 1234567"
                  className={errors.phone ? "input-error" : ""} disabled={loading} />
                {errors.phone && <span className="form-field-error">{errors.phone}</span>}
              </div>
            </div>

            {/* Company */}
            <div className="form-group">
              <label htmlFor="company">Company *</label>
              <input id="company" name="company" type="text" value={form.company}
                onChange={handleChange} placeholder="e.g. TechVision Pvt Ltd"
                className={errors.company ? "input-error" : ""} disabled={loading} />
              {errors.company && <span className="form-field-error">{errors.company}</span>}
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input id="location" name="location" type="text" value={form.location}
                onChange={handleChange} placeholder="e.g. Karachi, Pakistan" disabled={loading} />
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}
                className={errors.status ? "input-error" : ""} disabled={loading}
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
              <button type="button" className="filter-btn" onClick={() => router.push("/customers")} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="save-company-btn" disabled={loading}>
                {loading ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>
                ) : "Save Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
