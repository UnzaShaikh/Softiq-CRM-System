"use client";

import { useState, useRef, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  HiCog, HiOfficeBuilding, HiGlobe, HiMail, HiBell,
  HiShieldCheck, HiLink, HiArchive, HiClipboardList,
  HiSave, HiUpload, HiTrash, HiSupport,
} from "react-icons/hi";
import { MdOutlineDashboardCustomize } from "react-icons/md";

// ── Types ─────────────────────────────────────
interface ProjectFormData {
  name: string;
  key: string;
  description: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  weekStartsOn: string;
  logoUrl: string | null;
}

interface FormErrors {
  name?: string;
  key?: string;
}

// ── Settings Sidebar Nav ──────────────────────
const NAV_ITEMS = [
  { key: "general",     label: "General",            icon: <HiCog size={16} /> },
  { key: "company",     label: "Company Information", icon: <HiOfficeBuilding size={16} /> },
  { key: "localization",label: "Localization",        icon: <HiGlobe size={16} /> },
  { key: "email",       label: "Email Settings",      icon: <HiMail size={16} /> },
  { key: "notifs",      label: "Notifications",       icon: <HiBell size={16} /> },
  { key: "security",    label: "Security",            icon: <HiShieldCheck size={16} /> },
  { key: "integrations",label: "Integrations",        icon: <HiLink size={16} /> },
  { key: "backup",      label: "Backup & Export",     icon: <HiArchive size={16} /> },
  { key: "activity",    label: "Activity Log",        icon: <HiClipboardList size={16} /> },
];

// ── Placeholder content for non-General tabs ─
function PlaceholderSection({ label }: { label: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "40px 24px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ width: 56, height: 56, borderRadius: "12px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <MdOutlineDashboardCustomize size={28} color="#4f46e5" />
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>{label}</h3>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "#94a3b8" }}>
        This section will be available soon. Configuration options for {label.toLowerCase()} will appear here.
      </p>
    </div>
  );
}

// ── Select Field ──────────────────────────────
function SelectField({ label, value, onChange, options }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="form-input" style={{ cursor: "pointer" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Project Preview Card ──────────────────────
function ProjectPreview({ data }: { data: ProjectFormData }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "sticky", top: "20px" }}>
      <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Project Preview</h3>
      <p style={{ margin: "0 0 20px", fontSize: "0.75rem", color: "#94a3b8" }}>
        This is how your project information will appear across the system.
      </p>

      {/* Logo + Name */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {data.logoUrl ? (
          <img src={data.logoUrl} alt="Logo" style={{ width: 64, height: 64, borderRadius: "12px", objectFit: "cover", marginBottom: "12px" }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: "12px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem" }}>S</span>
          </div>
        )}
        <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>
          {data.name || "Project Name"}
        </p>
        <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#4f46e5" }}>
          {data.key || "KEY"}
        </p>
        <p style={{ margin: "8px 0 0", fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5, maxWidth: "200px", marginInline: "auto" }}>
          {data.description || "No description provided."}
        </p>
      </div>

      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {[
          { icon: "🕐", label: "Timezone", value: data.timezone.split(")")[1]?.trim() || data.timezone },
          { icon: "💱", label: "Currency", value: data.currency },
          { icon: "📅", label: "Date Format", value: data.dateFormat },
          { icon: "📆", label: "Week Starts On", value: data.weekStartsOn },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ fontSize: "0.9rem", flexShrink: 0, marginTop: "1px" }}>{item.icon}</span>
            <div>
              <p style={{ margin: "0 0 1px", fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#374151", fontWeight: 600 }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────
export default function ProjectSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProjectFormData>({
    name: "Softiq Tech CRM",
    key: "STCRM",
    description: "A modern Customer Relationship Management system to manage customers, leads, deals and activities efficiently.",
    timezone: "(GMT+05:00) Asia/Karachi",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12 Hour (AM/PM)",
    currency: "PKR (Rs.)",
    weekStartsOn: "Monday",
    logoUrl: null,
  });

  const [savedForm, setSavedForm] = useState<ProjectFormData>({ ...form });

  function handleChange(field: keyof ProjectFormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field as keyof FormErrors]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Project name is required.";
    if (!form.key.trim()) e.key = "Project key is required.";
    else if (!/^[A-Z0-9_-]+$/.test(form.key)) e.key = "Project key must be uppercase letters, numbers, hyphens, or underscores.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setSuccess("");
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSavedForm({ ...form });
    setHasChanges(false);
    setSuccess("Project settings saved successfully.");
    setTimeout(() => setSuccess(""), 4000);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { alert("File size must be under 2MB."); return; }
    setLogoUploading(true);
    await new Promise(r => setTimeout(r, 800));
    const url = URL.createObjectURL(file);
    setForm(prev => ({ ...prev, logoUrl: url }));
    setHasChanges(true);
    setLogoUploading(false);
  }

  function handleRemoveLogo() {
    setForm(prev => ({ ...prev, logoUrl: null }));
    setHasChanges(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%", padding: "10px 14px", border: `1.5px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`,
    borderRadius: "8px", background: "#fff", color: "#0f172a",
    fontSize: "0.875rem", fontFamily: "inherit", outline: "none",
  });

  const TIMEZONE_OPTIONS = [
    { label: "(GMT+05:00) Asia/Karachi", value: "(GMT+05:00) Asia/Karachi" },
    { label: "(GMT+00:00) UTC", value: "(GMT+00:00) UTC" },
    { label: "(GMT-05:00) America/New_York", value: "(GMT-05:00) America/New_York" },
    { label: "(GMT+01:00) Europe/London", value: "(GMT+01:00) Europe/London" },
    { label: "(GMT+05:30) Asia/Kolkata", value: "(GMT+05:30) Asia/Kolkata" },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title">Project Settings</h1>
            <p className="page-subtitle">Manage your CRM project details, preferences and configurations.</p>
          </div>
          <button onClick={handleSave} disabled={saving || !hasChanges}
            className="btn-add"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", opacity: !hasChanges ? 0.6 : 1, cursor: !hasChanges ? "not-allowed" : "pointer" }}>
            {saving ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>
            ) : (
              <><HiSave size={15} /> Save Changes</>
            )}
          </button>
        </div>

        {success && <div className="msg-success" style={{ marginBottom: "16px" }}>✅ {success}</div>}
        {hasChanges && !success && (
          <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "0.8125rem", color: "#b45309", fontWeight: 500 }}>
            ⚠️ You have unsaved changes. Click &quot;Save Changes&quot; to apply them.
          </div>
        )}

        {/* Three column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 260px", gap: "20px", alignItems: "start" }}>

          {/* ── Left: Settings Nav ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <nav style={{ padding: "6px" }}>
                {NAV_ITEMS.map(item => {
                  const isActive = activeTab === item.key;
                  return (
                    <button key={item.key} onClick={() => setActiveTab(item.key)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", border: "none", background: isActive ? "#eef2ff" : "transparent", color: isActive ? "#4f46e5" : "#475569", fontWeight: isActive ? 600 : 500, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit", textAlign: "left", marginBottom: "2px", transition: "all 0.15s" }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                      <span style={{ color: isActive ? "#4f46e5" : "#94a3b8", flexShrink: 0 }}>{item.icon}</span>
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Need Help */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                <HiSupport size={18} color="#4f46e5" />
              </div>
              <h4 style={{ margin: "0 0 6px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Need Help?</h4>
              <p style={{ margin: "0 0 12px", fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.5 }}>
                If you need help with project settings, please contact our support team.
              </p>
              <button style={{ padding: "6px 14px", border: "1.5px solid #4f46e5", borderRadius: "7px", background: "#fff", color: "#4f46e5", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>
                Contact Support
              </button>
            </div>
          </div>

          {/* ── Middle: Settings Content ── */}
          <div>
            {activeTab !== "general" ? (
              <PlaceholderSection label={NAV_ITEMS.find(n => n.key === activeTab)?.label ?? ""} />
            ) : (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
                  <h2 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>General Settings</h2>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>Update your project name, description and other general preferences.</p>
                </div>

                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* Project Name + Key */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">Project Name <span style={{ color: "var(--error)" }}>*</span></label>
                      <input value={form.name} onChange={e => handleChange("name", e.target.value)}
                        style={inputStyle(!!errors.name)} placeholder="e.g. Softiq Tech CRM" />
                      {errors.name && <p className="form-error">{errors.name}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Project Key <span style={{ color: "var(--error)" }}>*</span></label>
                      <input value={form.key} onChange={e => handleChange("key", e.target.value.toUpperCase())}
                        style={inputStyle(!!errors.key)} placeholder="e.g. STCRM" />
                      {errors.key && <p className="form-error">{errors.key}</p>}
                    </div>
                  </div>

                  {/* Description + Timezone */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">Project Description</label>
                      <textarea value={form.description} onChange={e => handleChange("description", e.target.value)}
                        rows={5} style={{ ...inputStyle(), resize: "vertical" }}
                        placeholder="Describe your project..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Project Timezone</label>
                      <select value={form.timezone} onChange={e => handleChange("timezone", e.target.value)}
                        className="form-input" style={{ cursor: "pointer" }}>
                        {TIMEZONE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Localization */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <SelectField label="Date Format" value={form.dateFormat} onChange={v => handleChange("dateFormat", v)}
                      options={[
                        { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
                        { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
                        { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
                      ]} />
                    <SelectField label="Time Format" value={form.timeFormat} onChange={v => handleChange("timeFormat", v)}
                      options={[
                        { label: "12 Hour (AM/PM)", value: "12 Hour (AM/PM)" },
                        { label: "24 Hour", value: "24 Hour" },
                      ]} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <SelectField label="Currency" value={form.currency} onChange={v => handleChange("currency", v)}
                      options={[
                        { label: "PKR - Pakistani Rupee (Rs.)", value: "PKR (Rs.)" },
                        { label: "USD - US Dollar ($)", value: "USD ($)" },
                        { label: "EUR - Euro (€)", value: "EUR (€)" },
                        { label: "GBP - British Pound (£)", value: "GBP (£)" },
                      ]} />
                    <SelectField label="Week Starts On" value={form.weekStartsOn} onChange={v => handleChange("weekStartsOn", v)}
                      options={[
                        { label: "Monday", value: "Monday" },
                        { label: "Sunday", value: "Sunday" },
                        { label: "Saturday", value: "Saturday" },
                      ]} />
                  </div>

                  {/* Project Logo */}
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Project Logo</h3>
                    <p style={{ margin: "0 0 14px", fontSize: "0.78rem", color: "#94a3b8" }}>
                      Upload your project logo. Recommended size: 200x200px
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "16px", border: "1.5px dashed #e2e8f0", borderRadius: "10px", background: "#f8fafc" }}>
                      {/* Preview */}
                      <div style={{ width: 80, height: 80, borderRadius: "12px", background: form.logoUrl ? "transparent" : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        {form.logoUrl ? (
                          <img src={form.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ textAlign: "center" }}>
                            <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem", display: "block" }}>S</span>
                            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.5rem", display: "block" }}>SOFTIQ TECH</span>
                          </div>
                        )}
                      </div>
                      {/* Actions */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload}
                          style={{ display: "none" }} id="logo-upload" />
                        <label htmlFor="logo-upload"
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.875rem", fontFamily: "inherit", cursor: "pointer", fontWeight: 500 }}>
                          {logoUploading ? (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Uploading...</>
                          ) : (
                            <><HiUpload size={14} /> Upload New Logo</>
                          )}
                        </label>
                        {form.logoUrl && (
                          <button onClick={handleRemoveLogo}
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "1.5px solid #fca5a5", borderRadius: "8px", background: "#fef2f2", color: "#ef4444", fontSize: "0.875rem", fontFamily: "inherit", cursor: "pointer", fontWeight: 500 }}>
                            <HiTrash size={14} /> Remove Logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Project Preview ── */}
          <ProjectPreview data={form} />
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
