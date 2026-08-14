"use client";

import { useState, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsNav from "@/components/project-settings/SettingsNav";
import { HiSave, HiUpload, HiTrash, HiChevronRight } from "react-icons/hi";
import Link from "next/link";

interface CompanyForm {
  companyName: string; companyEmail: string; phone: string; website: string;
  address: string; city: string; state: string; postalCode: string;
  country: string; taxNumber: string; industry: string; description: string;
  showCompanyName: boolean; logoUrl: string | null; faviconUrl: string | null;
}

interface FormErrors {
  companyName?: string; companyEmail?: string; website?: string;
}

const COUNTRIES = ["Pakistan", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "India", "UAE", "Saudi Arabia"];
const INDUSTRIES = ["Information Technology", "Finance", "Healthcare", "Education", "Retail", "Manufacturing", "Real Estate", "Consulting", "Media", "Other"];

export default function CompanyInformationPage() {
  const [form, setForm] = useState<CompanyForm>({
    companyName: "Softiq Tech Solutions", companyEmail: "info@softiqtech.com",
    phone: "+92 300 1234567", website: "https://www.softiqtech.com",
    address: "123 Business Avenue, Gulberg III, Lahore, Pakistan",
    city: "Lahore", state: "Punjab", postalCode: "54000", country: "Pakistan",
    taxNumber: "PK-1234567-8", industry: "Information Technology",
    description: "SoftiqTech Solutions is a customer relationship management company providing CRM solutions to help businesses grow and manage their customer relationships effectively.",
    showCompanyName: true, logoUrl: null, faviconUrl: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  function handleChange(field: keyof CompanyForm, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field as keyof FormErrors]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required.";
    if (!form.companyEmail.trim()) e.companyEmail = "Company email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.companyEmail)) e.companyEmail = "Enter a valid email address.";
    if (form.website && !/^https?:\/\/.+/.test(form.website)) e.website = "Enter a valid URL (https://...).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setHasChanges(false);
    setSuccess("Company information saved successfully.");
    setTimeout(() => setSuccess(""), 4000);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { alert("File size must be under 2MB."); return; }
    setLogoUploading(true);
    await new Promise(r => setTimeout(r, 800));
    setForm(prev => ({ ...prev, logoUrl: URL.createObjectURL(file) }));
    setHasChanges(true);
    setLogoUploading(false);
  }

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
    setForm(prev => ({ ...prev, faviconUrl: URL.createObjectURL(file) }));
    setHasChanges(true);
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%", padding: "10px 14px",
    border: `1.5px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`,
    borderRadius: "8px", background: "#fff", color: "#0f172a",
    fontSize: "0.875rem", fontFamily: "inherit", outline: "none",
  });

  const selectStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
    borderRadius: "8px", background: "#fff", color: "#0f172a",
    fontSize: "0.875rem", fontFamily: "inherit", outline: "none", cursor: "pointer",
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", fontSize: "0.8125rem", color: "#94a3b8" }}>
          <Link href="/settings/project" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>Project Settings</Link>
          <HiChevronRight size={14} />
          <span style={{ color: "#374151" }}>Company Information</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title">Company Information</h1>
            <p className="page-subtitle">Manage your company details and information that will be used across the system.</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-add"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {saving ? "Saving..." : <><HiSave size={15} /> Save Changes</>}
          </button>
        </div>

        {success && <div className="msg-success" style={{ marginBottom: "16px" }}>✅ {success}</div>}
        {hasChanges && !success && (
          <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "0.8125rem", color: "#b45309", fontWeight: 500 }}>
            ⚠️ You have unsaved changes.
          </div>
        )}

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: "20px", alignItems: "start" }}>

          {/* Left Nav */}
          <SettingsNav />

          {/* Center — Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Basic Information */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Basic Information</h2>
              </div>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Company Name <span style={{ color: "var(--error)" }}>*</span></label>
                    <input value={form.companyName} onChange={e => handleChange("companyName", e.target.value)}
                      style={inputStyle(!!errors.companyName)} placeholder="e.g. Softiq Tech Solutions" />
                    {errors.companyName && <p className="form-error">{errors.companyName}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Email <span style={{ color: "var(--error)" }}>*</span></label>
                    <input type="email" value={form.companyEmail} onChange={e => handleChange("companyEmail", e.target.value)}
                      style={inputStyle(!!errors.companyEmail)} placeholder="e.g. info@company.com" />
                    {errors.companyEmail && <p className="form-error">{errors.companyEmail}</p>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" value={form.phone} onChange={e => handleChange("phone", e.target.value)}
                      style={inputStyle()} placeholder="+92 300 1234567" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input type="url" value={form.website} onChange={e => handleChange("website", e.target.value)}
                      style={inputStyle(!!errors.website)} placeholder="https://www.example.com" />
                    {errors.website && <p className="form-error">{errors.website}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input value={form.address} onChange={e => handleChange("address", e.target.value)}
                    style={inputStyle()} placeholder="Full address" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input value={form.city} onChange={e => handleChange("city", e.target.value)}
                      style={inputStyle()} placeholder="e.g. Lahore" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State / Province</label>
                    <input value={form.state} onChange={e => handleChange("state", e.target.value)}
                      style={inputStyle()} placeholder="e.g. Punjab" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Postal / ZIP Code</label>
                    <input value={form.postalCode} onChange={e => handleChange("postalCode", e.target.value)}
                      style={inputStyle()} placeholder="e.g. 54000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <select value={form.country} onChange={e => handleChange("country", e.target.value)} style={selectStyle}>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Tax / VAT Number</label>
                    <input value={form.taxNumber} onChange={e => handleChange("taxNumber", e.target.value)}
                      style={inputStyle()} placeholder="e.g. PK-1234567-8" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <select value={form.industry} onChange={e => handleChange("industry", e.target.value)} style={selectStyle}>
                      {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Company Description</label>
                  <textarea value={form.description} onChange={e => handleChange("description", e.target.value)}
                    rows={4} style={{ ...inputStyle(), resize: "vertical" }}
                    placeholder="Describe your company..." maxLength={500} />
                  <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#94a3b8", textAlign: "right" }}>{form.description.length}/500</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h2 style={{ margin: "0 0 16px", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Additional Information</h2>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" checked={form.showCompanyName}
                  onChange={e => handleChange("showCompanyName", e.target.checked)}
                  style={{ marginTop: "2px", width: 16, height: 16, accentColor: "#4f46e5", cursor: "pointer" }} />
                <div>
                  <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>Show company name in the application</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b" }}>Company name will be displayed in the header and email templates.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Right — Logo + Preview + Favicon */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Company Logo */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Company Logo</h3>
              <p style={{ margin: "0 0 14px", fontSize: "0.75rem", color: "#94a3b8" }}>Upload your company logo. Recommended size is 512x512px.</p>

              {/* Logo Preview */}
              <div style={{ width: "100%", aspectRatio: "1", border: "2px dashed #e2e8f0", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", marginBottom: "12px", overflow: "hidden" }}>
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 60, height: 60, borderRadius: "12px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                      <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.5rem" }}>S</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>No logo uploaded</p>
                  </div>
                )}
              </div>

              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} id="logo-upload" />
              <div style={{ display: "flex", gap: "8px" }}>
                <label htmlFor="logo-upload" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer", fontWeight: 500 }}>
                  {logoUploading ? "Uploading..." : <><HiUpload size={13} /> Change Logo</>}
                </label>
                {form.logoUrl && (
                  <button onClick={() => { setForm(p => ({ ...p, logoUrl: null })); setHasChanges(true); }}
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "8px 12px", border: "1.5px solid #fca5a5", borderRadius: "8px", background: "#fef2f2", color: "#ef4444", fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer" }}>
                    <HiTrash size={13} /> Remove
                  </button>
                )}
              </div>
            </div>

            {/* Logo Preview */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Logo Preview</h3>
              <p style={{ margin: "0 0 12px", fontSize: "0.75rem", color: "#94a3b8" }}>This is how your logo will appear in the application.</p>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                {/* Mini sidebar preview */}
                <div style={{ background: "#1e1b4b", padding: "10px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "6px", background: form.logoUrl ? "transparent" : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", overflow: "hidden", flexShrink: 0 }}>
                    {form.logoUrl ? <img src={form.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontWeight: 800, fontSize: "0.75rem" }}>S</span></div>}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "#fff" }}>{form.companyName || "Company Name"}</p>
                    <p style={{ margin: 0, fontSize: "0.55rem", color: "rgba(255,255,255,0.5)" }}>CRM SYSTEM</p>
                  </div>
                </div>
                <div style={{ padding: "8px 12px", background: "#f8fafc" }}>
                  {["Dashboard", "Customers", "Leads", "Deals"].map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" }}>
                      <div style={{ width: 12, height: 12, borderRadius: "3px", background: "#e2e8f0" }} />
                      <div style={{ height: 8, borderRadius: "4px", background: "#e2e8f0", flex: 1 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Company Favicon */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Company Favicon</h3>
              <p style={{ margin: "0 0 12px", fontSize: "0.75rem", color: "#94a3b8" }}>This icon will appear in browser tabs.</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 36, height: 36, border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {form.faviconUrl ? <img src={form.faviconUrl} alt="Favicon" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                    <div style={{ width: 20, height: 20, borderRadius: "4px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontWeight: 800, fontSize: "0.6rem" }}>S</span>
                    </div>}
                </div>
                <input ref={faviconInputRef} type="file" accept="image/*" onChange={handleFaviconUpload} style={{ display: "none" }} id="favicon-upload" />
                <label htmlFor="favicon-upload" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer", fontWeight: 500 }}>
                  <HiUpload size={13} /> Change Favicon
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
