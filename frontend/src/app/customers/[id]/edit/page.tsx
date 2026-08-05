"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";
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
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [notFound, setNotFound] = useState(false);

  // Load customer data
  useEffect(() => {
    const customer = customersData.find((c) => c.id === id);
    if (!customer) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const [first_name, ...rest] = customer.name.split(" ");
    setForm({
      first_name: first_name || "",
      last_name: rest.join(" ") || "",
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      location: customer.location,
      status: customer.status,
    });
    setLoading(false);
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.first_name.trim()) newErrors.first_name = "First name is required";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s+\-()]{7,15}$/.test(form.phone)) {
      newErrors.phone = "Enter a valid phone number";
    }
    if (!form.company.trim()) newErrors.company = "Company name is required";
    if (!form.status) newErrors.status = "Please select a status";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => router.push(`/customers/${id}`), 1800);
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "12px", color: "#64748b" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Loading customer...
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </DashboardLayout>
    );
  }

  // Not found
  if (notFound) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
          <h2 style={{ margin: "0 0 8px", color: "#0f172a" }}>Customer Not Found</h2>
          <p style={{ color: "#64748b", margin: "0 0 20px" }}>No customer found with ID: {id}</p>
          <button onClick={() => router.push("/customers")} style={{ padding: "10px 20px", borderRadius: "8px", background: "#4f46e5", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Back to Customers
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={() => router.push(`/customers/${id}`)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "0.875rem", fontFamily: "inherit", padding: "0 0 12px", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Customer
          </button>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Edit Customer
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Update the customer details below.
          </p>
        </div>

        {/* Success */}
        {success && (
          <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p style={{ margin: 0, color: "#15803d", fontWeight: 600, fontSize: "0.9rem" }}>Changes saved successfully! Redirecting...</p>
          </div>
        )}

        {/* Error */}
        {submitError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={{ margin: 0, color: "#dc2626", fontWeight: 500, fontSize: "0.9rem" }}>{submitError}</p>
          </div>
        )}

        {/* Form Card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Customer Information</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} error={errors.first_name} placeholder="e.g. Ahmed" required />
                <FormField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} error={errors.last_name} placeholder="e.g. Ali" required />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="e.g. ahmed@example.com" required />
                <FormField label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="e.g. +92 300 1234567" required />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Company" name="company" value={form.company} onChange={handleChange} error={errors.company} placeholder="e.g. TechVision Pvt Ltd" required />
                <FormField label="Location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Karachi, Pakistan" />
              </div>

              <FormField
                label="Status" name="status" type="select" value={form.status}
                onChange={handleChange} error={errors.status} required
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                  { label: "Lead", value: "Lead" },
                ]}
              />
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button" onClick={() => router.push(`/customers/${id}`)} disabled={saving}
                style={{ padding: "10px 20px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, fontSize: "0.9rem", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: saving ? 0.6 : 1 }}
                onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
              >
                Cancel
              </button>
              <button
                type="submit" disabled={saving || success}
                style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", fontWeight: 600, fontSize: "0.9rem", cursor: saving || success ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: saving || success ? 0.75 : 1, boxShadow: "0 2px 8px rgba(79,70,229,0.35)", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                {saving ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Saving...
                  </>
                ) : success ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
