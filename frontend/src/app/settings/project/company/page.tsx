"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsNav from "@/components/project-settings/SettingsNav";
import {
  getCompanyInfo,
  updateCompanyInfo,
} from "@/lib/projectSettingsApi";
import { HiSave, HiGlobe, HiPhone, HiMail, HiLocationMarker, HiReceiptTax, HiCurrencyDollar, HiChevronRight } from "react-icons/hi";
import Link from "next/link";

interface CompanyForm {
  companyName: string; website: string; tagline: string; industry: string;
  address: string; city: string; state: string; postalCode: string;
  country: string; phone: string; email: string; taxNumber: string;
  currency: string; description: string; logoUrl: string | null;
}
interface FormErrors {
  companyName?: string; email?: string; website?: string; phone?: string;
}

const INDUSTRIES = ["Software & IT Services","Information Technology","Finance","Healthcare","Education","Retail","Manufacturing","Real Estate","Consulting","Media","Other"];
const COUNTRIES = ["Pakistan","United States","United Kingdom","Canada","Australia","Germany","France","India","UAE","Saudi Arabia"];
const CURRENCIES = ["PKR - Pakistani Rupee (Rs.)","USD - US Dollar ($)","EUR - Euro (€)","GBP - British Pound (£)","AED - UAE Dirham (د.إ)"];

const selectStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
  borderRadius: "8px", background: "#fff", color: "#374151",
  fontSize: "0.875rem", fontFamily: "inherit", outline: "none", cursor: "pointer",
};

export default function CompanyInformationPage() {
  const [form, setForm] = useState<CompanyForm>({
    companyName: "", website: "", tagline: "", industry: "Software & IT Services",
    address: "", city: "", state: "", postalCode: "", country: "Pakistan",
    phone: "", email: "", taxNumber: "",
    currency: "PKR - Pakistani Rupee (Rs.)",
    description: "",
    logoUrl: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const c = await getCompanyInfo();
      setForm(prev => ({
        ...prev,
        companyName: c.company_name,
        website: c.website,
        tagline: c.tagline,
        industry: INDUSTRIES.includes(c.industry) ? c.industry : prev.industry,
        address: c.address,
        city: c.city,
        state: c.state,
        postalCode: c.postal_code,
        country: COUNTRIES.includes(c.country) ? c.country : prev.country,
        phone: c.phone,
        email: c.email,
        taxNumber: c.tax_number,
        currency: CURRENCIES.includes(c.currency) ? c.currency : prev.currency,
        description: c.company_description,
      }));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load company information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  function handleChange(field: keyof CompanyForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field as keyof FormErrors]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.website && !/^https?:\/\/.+/.test(form.website)) e.website = "Enter a valid URL (https://...).";
    if (form.phone && !/^[+\d\s\-()]{7,20}$/.test(form.phone)) e.phone = "Enter a valid phone number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate() || saving) return;
    setSaving(true);
    setSuccess("");
    setSaveError("");
    try {
      await updateCompanyInfo({
        company_name: form.companyName.trim(),
        website: form.website.trim(),
        tagline: form.tagline.trim(),
        industry: form.industry,
        address: form.address,
        city: form.city.trim(),
        state: form.state.trim(),
        postal_code: form.postalCode.trim(),
        country: form.country,
        phone: form.phone.trim(),
        email: form.email.trim(),
        tax_number: form.taxNumber.trim(),
        currency: form.currency,
        company_description: form.description,
      });
      setHasChanges(false);
      setSuccess("Company information saved successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save company information.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: "100%", padding: "10px 14px",
    border: `1.5px solid ${err ? "#fca5a5" : "#e2e8f0"}`,
    borderRadius: "8px", background: "#fff", color: "#0f172a",
    fontSize: "0.875rem", fontFamily: "inherit", outline: "none",
  });

  // Company Preview initials
  const initials = form.companyName ? form.companyName.charAt(0).toUpperCase() : "S";

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: "0.8125rem", color: "#94a3b8" }}>
          <Link href="/settings/project" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>Project Settings</Link>
          <span style={{ color: "#cbd5e1" }}>›</span>
          <span style={{ color: "#374151" }}>Company Information</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title">Company Information</h1>
            <p className="page-subtitle">Update your company details and branding information.</p>
          </div>
          <button onClick={handleSave} disabled={saving || !hasChanges} className="btn-add"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", opacity: !hasChanges ? 0.6 : 1, cursor: !hasChanges ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : <><HiSave size={15} /> Save Changes</>}
          </button>
        </div>

        {loadError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "0.8125rem", color: "#b91c1c" }}>
            ❌ {loadError}{" "}
            <button onClick={fetchCompany} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontFamily: "inherit", fontSize: "0.8125rem" }}>
              Retry
            </button>
          </div>
        )}
        {saveError && <div className="msg-error" style={{ marginBottom: "16px", whiteSpace: "pre-line" }}>❌ {saveError}</div>}
        {success && <div className="msg-success" style={{ marginBottom: "16px" }}>✅ {success}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: "20px", alignItems: "start" }}>

          <SettingsNav />

          {/* Center — Form */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Company Information</h2>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>Update your company details that will appear in your CRM documents and communications.</p>
            </div>

            {loading ? (
              <div style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
                Loading company information...
              </div>
            ) : (

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Company Name + Website */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Company Name <span style={{ color: "var(--error)" }}>*</span></label>
                  <input value={form.companyName} onChange={e => handleChange("companyName", e.target.value)}
                    style={inputStyle(errors.companyName)} placeholder="e.g. Softiq Tech (Pvt) Ltd." />
                  {errors.companyName && <p className="form-error">{errors.companyName}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <div style={{ position: "relative" }}>
                    <HiGlobe size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input value={form.website} onChange={e => handleChange("website", e.target.value)}
                      style={{ ...inputStyle(errors.website), paddingLeft: "34px" }} placeholder="https://softiqtech.com" />
                  </div>
                  {errors.website && <p className="form-error">{errors.website}</p>}
                </div>
              </div>

              {/* Tagline + Industry */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Tagline / Motto</label>
                  <input value={form.tagline} onChange={e => handleChange("tagline", e.target.value)}
                    style={inputStyle()} placeholder="e.g. Building Smarter Solutions" />
                </div>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select value={form.industry} onChange={e => handleChange("industry", e.target.value)} style={selectStyle}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea value={form.address} onChange={e => handleChange("address", e.target.value)}
                  rows={3} style={{ ...inputStyle(), resize: "vertical" }} placeholder="Full company address" />
              </div>

              {/* City + State + Postal */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input value={form.city} onChange={e => handleChange("city", e.target.value)} style={inputStyle()} placeholder="e.g. Karachi" />
                </div>
                <div className="form-group">
                  <label className="form-label">State / Province</label>
                  <input value={form.state} onChange={e => handleChange("state", e.target.value)} style={inputStyle()} placeholder="e.g. Sindh" />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input value={form.postalCode} onChange={e => handleChange("postalCode", e.target.value)} style={inputStyle()} placeholder="e.g. 75350" />
                </div>
              </div>

              {/* Country + Phone + Email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select value={form.country} onChange={e => handleChange("country", e.target.value)} style={selectStyle}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <div style={{ position: "relative" }}>
                    <HiPhone size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input type="tel" value={form.phone} onChange={e => handleChange("phone", e.target.value)}
                      style={{ ...inputStyle(errors.phone), paddingLeft: "32px" }} placeholder="+92 300 1234567" />
                  </div>
                  {errors.phone && <p className="form-error">{errors.phone}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div style={{ position: "relative" }}>
                    <HiMail size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input type="email" value={form.email} onChange={e => handleChange("email", e.target.value)}
                      style={{ ...inputStyle(errors.email), paddingLeft: "32px" }} placeholder="info@company.com" />
                  </div>
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
              </div>

              {/* Tax + Currency */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Tax / VAT Number</label>
                  <input value={form.taxNumber} onChange={e => handleChange("taxNumber", e.target.value)} style={inputStyle()} placeholder="e.g. 1234567-8" />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select value={form.currency} onChange={e => handleChange("currency", e.target.value)} style={selectStyle}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Company Description</label>
                <textarea value={form.description} onChange={e => handleChange("description", e.target.value)}
                  rows={4} style={{ ...inputStyle(), resize: "vertical" }} maxLength={500}
                  placeholder="Describe your company..." />
                <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#94a3b8", textAlign: "right" }}>{form.description.length}/500</p>
              </div>
            </div>
            )}
          </div>

          {/* Right — Company Preview */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "sticky", top: "20px" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Company Preview</h3>
            <p style={{ margin: "0 0 16px", fontSize: "0.75rem", color: "#94a3b8" }}>This is how your company information will appear on documents and emails.</p>

            {/* Logo */}
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "12px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.5rem" }}>{initials}</span>
              </div>
              <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>{form.companyName || "Company Name"}</p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#4f46e5", fontWeight: 500 }}>{form.tagline || ""}</p>
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { icon: <HiGlobe size={14} color="#4f46e5" />, label: "WEBSITE", value: form.website },
                { icon: <HiPhone size={14} color="#4f46e5" />, label: "PHONE", value: form.phone },
                { icon: <HiMail size={14} color="#4f46e5" />, label: "EMAIL", value: form.email },
                { icon: <HiLocationMarker size={14} color="#4f46e5" />, label: "ADDRESS", value: form.address.replace(/\n/g, ", ") },
                { icon: <HiReceiptTax size={14} color="#4f46e5" />, label: "TAX / VAT", value: form.taxNumber },
                { icon: <HiCurrencyDollar size={14} color="#4f46e5" />, label: "CURRENCY", value: form.currency.split(" - ")[0] + " (" + (form.currency.match(/\(([^)]+)\)/)?.[1] || "") + ")" },
              ].filter(r => r.value).map(row => (
                <div key={row.label} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, marginTop: "1px" }}>{row.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: "0 0 1px", fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</p>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#374151", wordBreak: "break-word" }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
