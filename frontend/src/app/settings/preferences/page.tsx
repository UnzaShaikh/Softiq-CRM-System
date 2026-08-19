"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProfileNav } from "../page";
import { getPreferences, updatePreferences, ApiPreferences } from "@/lib/profileApi";
import { getProfile, updateProfile } from "@/lib/profileApi";
import { HiGlobe, HiCalendar, HiCurrencyDollar, HiColorSwatch, HiViewList, HiAdjustments, HiSave, HiSupport } from "react-icons/hi";
import { HiSun, HiMoon, HiDesktopComputer } from "react-icons/hi";

type Theme = "light" | "dark" | "system";

// Backend stores currency as a short code (e.g. "USD"); the UI shows a
// friendlier label. Keep these in sync with the <option> list below.
const CURRENCY_LABELS: Record<string, string> = {
  USD: "USD - US Dollar ($)",
  EUR: "EUR - Euro (€)",
  GBP: "GBP - British Pound (£)",
  PKR: "PKR - Pakistani Rupee (₨)",
};
const CURRENCY_CODES = Object.keys(CURRENCY_LABELS);
function codeForCurrencyLabel(label: string): string {
  const found = Object.entries(CURRENCY_LABELS).find(([, v]) => v === label);
  return found ? found[0] : label;
}

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState({
    language: "en",
    timezone: "(UTC-05:00) Eastern Time (US & Canada)",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h" as "12h" | "24h",
    currency: "USD",
    theme: "light" as Theme,
    itemsPerPage: 20,
    compactSidebar: false,
    soundNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, profile] = await Promise.all([getPreferences(), getProfile()]);
      setPrefs({
        language: profile.language,
        timezone: p.timezone,
        dateFormat: p.date_format,
        timeFormat: p.time_format,
        currency: p.currency,
        theme: p.theme,
        itemsPerPage: p.items_per_page,
        compactSidebar: p.compact_sidebar,
        soundNotifications: p.sound_notifications,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preferences.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const [updated] = await Promise.all([
        updatePreferences({
          timezone: prefs.timezone,
          date_format: prefs.dateFormat,
          time_format: prefs.timeFormat,
          currency: prefs.currency,
          theme: prefs.theme,
          items_per_page: prefs.itemsPerPage,
          compact_sidebar: prefs.compactSidebar,
          sound_notifications: prefs.soundNotifications,
        }),
        updateProfile({ language: prefs.language }),
      ]);
      setPrefs(prev => ({
        ...prev,
        timezone: updated.timezone,
        dateFormat: updated.date_format,
        timeFormat: updated.time_format,
        currency: updated.currency,
        theme: updated.theme,
        itemsPerPage: updated.items_per_page,
        compactSidebar: updated.compact_sidebar,
        soundNotifications: updated.sound_notifications,
      }));
      setSuccess("Preferences saved successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  }

  const selectStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
    borderRadius: "8px", background: "#fff", color: "#374151",
    fontSize: "0.875rem", fontFamily: "inherit", outline: "none", cursor: "pointer",
  };

  const THEMES: { key: Theme; label: string; sub: string; icon: React.ReactNode }[] = [
    { key: "light", label: "Light", sub: "Clean and bright interface", icon: <HiSun size={20} color="#f59e0b" /> },
    { key: "dark", label: "Dark", sub: "Easy on the eyes in low light", icon: <HiMoon size={20} color="#4f46e5" /> },
    { key: "system", label: "System", sub: "Use system preference", icon: <HiDesktopComputer size={20} color="#64748b" /> },
  ];

  function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
    return (
      <button type="button" onClick={onChange}
        style={{ width: 44, height: 24, borderRadius: "9999px", border: "none", background: value ? "#4f46e5" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: "2px", left: value ? "22px" : "2px", width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
      </button>
    );
  }

  const SECTIONS = [
    {
      icon: <HiGlobe size={18} color="#4f46e5" />, title: "Language & Region",
      sub: "Choose your language and regional settings.", bg: "#eef2ff",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Language</label>
            <select value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))} style={selectStyle}>
              <option value="en">English</option>
              <option value="ne">Nepali</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Time Zone</label>
            <select value={prefs.timezone} onChange={e => setPrefs(p => ({ ...p, timezone: e.target.value }))} style={selectStyle}>
              <option>(UTC-05:00) Eastern Time (US & Canada)</option>
              <option>(UTC+00:00) UTC</option>
              <option>(UTC+05:00) Pakistan Standard Time</option>
            </select>
          </div>
        </div>
      )
    },
    {
      icon: <HiCalendar size={18} color="#4f46e5" />, title: "Date & Time Format",
      sub: "Set your preferred date and time formats.", bg: "#eef2ff",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Date Format</label>
            <select value={prefs.dateFormat} onChange={e => setPrefs(p => ({ ...p, dateFormat: e.target.value }))} style={selectStyle}>
              <option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Time Format</label>
            <select value={prefs.timeFormat} onChange={e => setPrefs(p => ({ ...p, timeFormat: e.target.value as "12h" | "24h" }))} style={selectStyle}>
              <option value="12h">12 Hour (AM/PM)</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>
        </div>
      )
    },
    {
      icon: <HiCurrencyDollar size={18} color="#4f46e5" />, title: "Default Currency",
      sub: "Select your default currency for deals and reports.", bg: "#eef2ff",
      content: (
        <div style={{ maxWidth: "300px" }}>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select
              value={CURRENCY_LABELS[prefs.currency] ?? prefs.currency}
              onChange={e => setPrefs(p => ({ ...p, currency: codeForCurrencyLabel(e.target.value) }))}
              style={selectStyle}
            >
              {CURRENCY_CODES.map(code => <option key={code}>{CURRENCY_LABELS[code]}</option>)}
            </select>
          </div>
        </div>
      )
    },
    {
      icon: <HiColorSwatch size={18} color="#4f46e5" />, title: "Theme",
      sub: "Choose your preferred application theme.", bg: "#eef2ff",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {THEMES.map(t => (
            <button key={t.key} type="button" onClick={() => setPrefs(p => ({ ...p, theme: t.key }))}
              style={{ padding: "14px 12px", border: `2px solid ${prefs.theme === t.key ? "#4f46e5" : "#e2e8f0"}`, borderRadius: "10px", background: prefs.theme === t.key ? "#eef2ff" : "#fff", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>{t.icon}</div>
              <p style={{ margin: "0 0 2px", fontSize: "0.875rem", fontWeight: 700, color: prefs.theme === t.key ? "#4f46e5" : "#374151" }}>{t.label}</p>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{t.sub}</p>
            </button>
          ))}
        </div>
      )
    },
    {
      icon: <HiViewList size={18} color="#4f46e5" />, title: "Items Per Page",
      sub: "Set the default number of items to show per page in lists.", bg: "#eef2ff",
      content: (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select
            value={String(prefs.itemsPerPage)}
            onChange={e => setPrefs(p => ({ ...p, itemsPerPage: Number(e.target.value) }))}
            style={{ ...selectStyle, width: "120px" }}
          >
            {["10", "20", "25", "50", "100"].map(v => <option key={v}>{v}</option>)}
          </select>
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8" }}>Applies to all list views and tables.</p>
        </div>
      )
    },
    {
      icon: <HiAdjustments size={18} color="#4f46e5" />, title: "Other Preferences",
      sub: "Additional application preferences.", bg: "#eef2ff",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            { key: "compactSidebar", label: "Compact Sidebar", sub: "Reduce sidebar width to show more content" },
            { key: "soundNotifications", label: "Enable Sound Notifications", sub: "Play sounds for important notifications" },
          ].map(item => (
            <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: prefs[item.key as keyof typeof prefs] ? "#4f46e5" : "transparent" }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{item.sub}</p>
                </div>
              </div>
              <Toggle
                value={prefs[item.key as keyof typeof prefs] as boolean}
                onChange={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
              />
            </div>
          ))}
        </div>
      )
    },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 className="page-title">Preferences</h1>
          <p className="page-subtitle">Customize your experience and application settings</p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", fontSize: "0.8125rem", color: "#94a3b8" }}>
            <a href="/settings" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>My Profile</a>
            <span>›</span><span>Preferences</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <ProfileNav active="prefs" />
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                <HiSupport size={20} color="#4f46e5" />
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Need Help?</h3>
              <p style={{ margin: "0 0 12px", fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.5 }}>
                If you need assistance with your account settings, please contact our support team.
              </p>
              <button style={{ padding: "7px 16px", border: "1.5px solid #4f46e5", borderRadius: "8px", background: "#fff", color: "#4f46e5", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                Contact Support
              </button>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            {success && <div className="msg-success" style={{ margin: "16px 24px 0" }}>✅ {success}</div>}
            {error && <div className="msg-error" style={{ margin: "16px 24px 0" }}>{error}</div>}
            {loading && <div className="loading-state" style={{ margin: "16px 24px 0" }}>Loading preferences...</div>}

            {SECTIONS.map((section, idx) => (
              <div key={section.title} style={{ padding: "20px 24px", borderBottom: idx < SECTIONS.length - 1 ? "1px solid #f1f5f9" : "none", display: "grid", gridTemplateColumns: "220px 1fr", gap: "20px", alignItems: "start" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "8px", background: section.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {section.icon}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{section.title}</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.5 }}>{section.sub}</p>
                  </div>
                </div>
                <div>{section.content}</div>
              </div>
            ))}

            <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleSave} className="btn-add" disabled={saving || loading} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                {saving ? "Saving..." : <><HiSave size={15} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}