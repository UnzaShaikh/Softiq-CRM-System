"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsNav from "@/components/project-settings/SettingsNav";
import {
  getLocalizationSettings,
  updateLocalizationSettings,
} from "@/lib/projectSettingsApi";
import { HiSave, HiRefresh, HiChevronRight } from "react-icons/hi";
import Link from "next/link";

interface LocalizationForm {
  language: string; region: string; timezone: string;
  weekStartsOn: string; fiscalYearStart: string;
  dateFormat: string; timeFormat: string; dateTimeFormat: string;
  currency: string; currencyPosition: string;
  decimalSeparator: string; thousandsSeparator: string; decimalPlaces: string;
}

const DEFAULTS: LocalizationForm = {
  language: "English (en)", region: "Pakistan",
  timezone: "(GMT+05:00) Asia/Karachi", weekStartsOn: "Monday",
  fiscalYearStart: "January", dateFormat: "DD/MM/YYYY",
  timeFormat: "12 Hour (AM/PM)", dateTimeFormat: "DD/MM/YYYY hh:mm A",
  currency: "PKR - Pakistani Rupee (Rs.)", currencyPosition: "Before Amount (Rs. 1,234.56)",
  decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: "2",
};

function SelectRow({ label, value, onChange, options, example }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; example?: string;
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="form-input" style={{ cursor: "pointer" }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      {example && <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#64748b" }}>Example: <strong>{example}</strong></p>}
    </div>
  );
}

export default function LocalizationPage() {
  const [form, setForm] = useState<LocalizationForm>({ ...DEFAULTS });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fetchLocalization = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const s = await getLocalizationSettings();
      setForm({
        language: s.language || DEFAULTS.language,
        region: s.region || DEFAULTS.region,
        timezone: s.timezone || DEFAULTS.timezone,
        weekStartsOn: s.week_starts_on || DEFAULTS.weekStartsOn,
        fiscalYearStart: s.fiscal_year_start || DEFAULTS.fiscalYearStart,
        dateFormat: s.date_format || DEFAULTS.dateFormat,
        timeFormat: s.time_format || DEFAULTS.timeFormat,
        dateTimeFormat: s.datetime_format || DEFAULTS.dateTimeFormat,
        currency: s.localization_currency || DEFAULTS.currency,
        currencyPosition: s.currency_position || DEFAULTS.currencyPosition,
        decimalSeparator: s.decimal_separator || DEFAULTS.decimalSeparator,
        thousandsSeparator: s.thousands_separator || DEFAULTS.thousandsSeparator,
        decimalPlaces: String(s.decimal_places ?? DEFAULTS.decimalPlaces),
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load localization settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLocalization(); }, [fetchLocalization]);

  function handleChange(field: keyof LocalizationForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setSuccess("");
    setSaveError("");
    try {
      const updated = await updateLocalizationSettings({
        language: form.language,
        region: form.region,
        timezone: form.timezone,
        week_starts_on: form.weekStartsOn,
        fiscal_year_start: form.fiscalYearStart,
        date_format: form.dateFormat,
        time_format: form.timeFormat,
        datetime_format: form.dateTimeFormat,
        localization_currency: form.currency,
        currency_position: form.currencyPosition,
        decimal_separator: form.decimalSeparator,
        thousands_separator: form.thousandsSeparator,
        decimal_places: Number(form.decimalPlaces),
      });
      setForm(prev => ({
        ...prev,
        decimalPlaces: String(updated.decimal_places),
      }));
      setHasChanges(false);
      setSuccess("Localization settings saved successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save localization settings.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setForm({ ...DEFAULTS });
    setHasChanges(true);
    setShowResetConfirm(false);
    setSuccess("Settings reset to default. Click \"Save Changes\" to apply.");
    setTimeout(() => setSuccess(""), 3000);
  }

  // Dynamic preview values
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const previewDate = form.dateFormat === "DD/MM/YYYY" ? `${day}/${month}/${year}` : form.dateFormat === "MM/DD/YYYY" ? `${month}/${day}/${year}` : `${year}-${month}-${day}`;
  const previewTime = form.timeFormat === "12 Hour (AM/PM)" ? "02:30 PM" : "14:30";
  const previewDateTime = `${previewDate} ${previewTime}`;
  const currencySymbol = form.currency.includes("PKR") ? "Rs." : form.currency.includes("USD") ? "$" : form.currency.includes("EUR") ? "€" : "£";
  const previewCurrency = `${currencySymbol} 1${form.thousandsSeparator}234${form.decimalSeparator}56`;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", fontSize: "0.8125rem", color: "#94a3b8" }}>
          <Link href="/settings/project" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>Project Settings</Link>
          <HiChevronRight size={14} />
          <span style={{ color: "#374151" }}>Localization</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title">Localization</h1>
            <p className="page-subtitle">Configure language, region and formats to personalize your CRM experience.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowResetConfirm(true)} className="btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <HiRefresh size={15} /> Reset to Default
            </button>
            <button onClick={handleSave} disabled={saving || !hasChanges} className="btn-add"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              {saving ? "Saving..." : <><HiSave size={15} /> Save Changes</>}
            </button>
          </div>
        </div>

        {loadError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "0.8125rem", color: "#b91c1c" }}>
            ❌ {loadError}{" "}
            <button onClick={fetchLocalization} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontFamily: "inherit", fontSize: "0.8125rem" }}>
              Retry
            </button>
          </div>
        )}
        {saveError && <div className="msg-error" style={{ marginBottom: "16px", whiteSpace: "pre-line" }}>❌ {saveError}</div>}
        {success && <div className="msg-success" style={{ marginBottom: "16px" }}>✅ {success}</div>}

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: "20px", alignItems: "start" }}>

          <SettingsNav />

          {/* Center — Settings */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {loading && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "60px 24px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
                Loading localization settings...
              </div>
            )}
            {!loading && (<>

            {/* Language & Region */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Language & Region</h2>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <SelectRow label="Language" value={form.language} onChange={v => handleChange("language", v)}
                    options={["English (en)", "Urdu (ur)", "Arabic (ar)", "French (fr)"]} />
                  <SelectRow label="Region" value={form.region} onChange={v => handleChange("region", v)}
                    options={["Pakistan", "United States", "United Kingdom", "India", "UAE"]} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <SelectRow label="Timezone" value={form.timezone} onChange={v => handleChange("timezone", v)}
                    options={["(GMT+05:00) Asia/Karachi", "(GMT+00:00) UTC", "(GMT-05:00) America/New_York", "(GMT+05:30) Asia/Kolkata"]} />
                  <SelectRow label="Week Starts On" value={form.weekStartsOn} onChange={v => handleChange("weekStartsOn", v)}
                    options={["Monday", "Sunday", "Saturday"]} />
                </div>
                <div style={{ maxWidth: "50%" }}>
                  <SelectRow label="First Day of Fiscal Year" value={form.fiscalYearStart} onChange={v => handleChange("fiscalYearStart", v)}
                    options={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]} />
                </div>
              </div>
            </div>

            {/* Date & Time Format */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Date & Time Format</h2>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <SelectRow label="Date Format" value={form.dateFormat} onChange={v => handleChange("dateFormat", v)}
                    options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]} example={previewDate} />
                  <SelectRow label="Time Format" value={form.timeFormat} onChange={v => handleChange("timeFormat", v)}
                    options={["12 Hour (AM/PM)", "24 Hour"]} example={previewTime} />
                  <SelectRow label="Date & Time Format" value={form.dateTimeFormat} onChange={v => handleChange("dateTimeFormat", v)}
                    options={["DD/MM/YYYY hh:mm A", "MM/DD/YYYY hh:mm A", "YYYY-MM-DD HH:mm"]} example={previewDateTime} />
                </div>
              </div>
            </div>

            {/* Number & Currency Format */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Number & Currency Format</h2>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <SelectRow label="Currency" value={form.currency} onChange={v => handleChange("currency", v)}
                    options={["PKR - Pakistani Rupee (Rs.)", "USD - US Dollar ($)", "EUR - Euro (€)", "GBP - British Pound (£)"]} />
                  <SelectRow label="Currency Position" value={form.currencyPosition} onChange={v => handleChange("currencyPosition", v)}
                    options={["Before Amount (Rs. 1,234.56)", "After Amount (1,234.56 Rs.)"]} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <SelectRow label="Decimal Separator" value={form.decimalSeparator} onChange={v => handleChange("decimalSeparator", v)}
                    options={[".", ","]} />
                  <SelectRow label="Thousands Separator" value={form.thousandsSeparator} onChange={v => handleChange("thousandsSeparator", v)}
                    options={[",", ".", " "]} />
                  <SelectRow label="Number of Decimal Places" value={form.decimalPlaces} onChange={v => handleChange("decimalPlaces", v)}
                    options={["0", "1", "2", "3"]} example={`1${form.thousandsSeparator}234${form.decimalSeparator}${"0".repeat(Number(form.decimalPlaces))}`} />
                </div>
              </div>
            </div>

            {/* Info note */}
            <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ color: "#4f46e5", fontSize: "1rem", flexShrink: 0 }}>ℹ️</span>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "#4338ca" }}>
                  These settings will be applied across the entire system. Users can override language preference from their profile settings.
                </p>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#4f46e5", fontSize: "0.8125rem", fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap", marginLeft: "12px" }}>
                  Learn more ↗
                </button>
              </div>
            </div>
            </>)}
          </div>

          {/* Right Previews */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Language Preview */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Language Preview</h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>This is how your system will appear.</p>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", margin: "12px" }}>
                <div style={{ background: "#1e1b4b", padding: "10px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "5px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: "0.6rem" }}>S</span>
                  </div>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.72rem" }}>Softiq Tech CRM</span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                    {["🔔", "✉️", "📅"].map((icon, i) => <span key={i} style={{ fontSize: "0.7rem" }}>{icon}</span>)}
                  </div>
                </div>
                <div style={{ padding: "8px 12px", background: "#f8fafc" }}>
                  {["Dashboard", "Customers", "Leads", "Reports"].map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 0" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "2px", background: "#e2e8f0" }} />
                      <span style={{ fontSize: "0.72rem", color: "#374151" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Date & Number Preview */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Date & Number Format Preview</h3>
              <p style={{ margin: "0 0 14px", fontSize: "0.72rem", color: "#94a3b8" }}>This is how dates, times and numbers will appear.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "Date", value: previewDate },
                  { label: "Time", value: previewTime },
                  { label: "Date & Time", value: previewDateTime },
                  { label: "Number", value: `1${form.thousandsSeparator}234${form.decimalSeparator}56` },
                  { label: "Currency", value: previewCurrency },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>{row.label}</span>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#4f46e5" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowResetConfirm(false); }}>
          <div className="modal-box">
            <div className="modal-icon"><HiRefresh size={24} color="#4f46e5" /></div>
            <h2 className="modal-title">Reset to Default?</h2>
            <p className="modal-text">All localization settings will be reset to their default values. This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button className="btn-add" onClick={handleReset}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
