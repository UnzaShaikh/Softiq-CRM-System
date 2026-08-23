"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ContactStatus, STATUS_TO_API } from "@/data/contact";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";

interface FormState {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  submit?: string;
}

export default function AddContactPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    fullName: "", company: "", email: "",
    phone: "", jobTitle: "", status: "Active",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Please enter a valid email address.";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await apiRequest("/api/contacts/", {
        method: "POST",
        body: {
          full_name: form.fullName,
          company: form.company,
          email: form.email,
          phone: form.phone,
          job_title: form.jobTitle,
          status: STATUS_TO_API[form.status as ContactStatus],
        },
      });
      emitDataChanged();
      setSuccess(true);
      setTimeout(() => router.push("/contacts"), 1500);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Something went wrong." });
      if (!getAccessToken()) router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Add Contact</h1>
            <p className="page-subtitle">Create a new contact for your CRM.</p>
          </div>
        </div>

        {/* Success */}
        {success && (
          <div className="msg-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Contact added successfully! Redirecting...
          </div>
        )}

        {/* Submit error */}
        {errors.submit && (
          <div className="msg-error">{errors.submit}</div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="company-form-card">
          <div className="form-section">
            <div className="form-section-header">
              <h2>Contact Information</h2>
              <p>Enter the basic information for this contact.</p>
            </div>

            <div className="contact-form-grid">
              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                  className={`form-input${errors.fullName ? " error" : ""}`} placeholder="e.g. Ali Raza" />
                {errors.fullName && <p className="form-error">{errors.fullName}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Company</label>
                <input type="text" name="company" value={form.company} onChange={handleChange}
                  className="form-input" placeholder="e.g. Tech Solutions" />
              </div>

              <div className="form-group">
                <label className="form-label">Email <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className={`form-input${errors.email ? " error" : ""}`} placeholder="e.g. ali@company.com" />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange}
                  className={`form-input${errors.phone ? " error" : ""}`} placeholder="e.g. 03001234567" />
                {errors.phone && <p className="form-error">{errors.phone}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input type="text" name="jobTitle" value={form.jobTitle} onChange={handleChange}
                  className="form-input" placeholder="e.g. Manager" />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="form-input" style={{ cursor: "pointer" }}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Lead</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Link href="/contacts" className="btn-secondary" style={{ textDecoration: "none" }}>Cancel</Link>
            <button type="submit" disabled={loading} className="btn-add"
              style={{ cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
