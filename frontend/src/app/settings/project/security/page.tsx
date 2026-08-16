"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsNav from "@/components/project-settings/SettingsNav";
import Link from "next/link";
import {
  HiChevronRight, HiSave, HiShieldCheck, HiLockClosed,
  HiEye, HiEyeOff, HiDeviceMobile, HiRefresh, HiExclamationCircle,
} from "react-icons/hi";

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      style={{ width: 44, height: 24, borderRadius: "9999px", border: "none", background: value ? "#4f46e5" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </button>
  );
}

const ACTIVE_SESSIONS = [
  { id: 1, device: "Chrome on Windows", location: "Lahore, Pakistan", ip: "192.168.1.45", lastActive: "Just now", current: true },
  { id: 2, device: "Firefox on MacOS",  location: "Karachi, Pakistan", ip: "192.168.2.10", lastActive: "2 hours ago", current: false },
  { id: 3, device: "Safari on iPhone",  location: "Islamabad, Pakistan", ip: "192.168.3.55", lastActive: "Yesterday", current: false },
];

export default function SecurityPage() {
  const [settings, setSettings] = useState({
    twoFactorAuth:     false,
    loginNotifications: true,
    sessionTimeout:    "30",
    maxLoginAttempts:  "5",
    passwordExpiry:    "90",
    requireUppercase:  true,
    requireNumbers:    true,
    requireSymbols:    false,
    minPasswordLength: "8",
    ipWhitelist:       "",
    forceHttps:        true,
    auditLog:          true,
  });

  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");

  function set<K extends keyof typeof settings>(key: K, val: typeof settings[K]) {
    setSettings(p => ({ ...p, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSuccess("Security settings saved successfully.");
    setTimeout(() => setSuccess(""), 4000);
  }

  const selectStyle: React.CSSProperties = {
    padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px",
    background: "#fff", color: "#0f172a", fontSize: "0.875rem",
    fontFamily: "inherit", outline: "none", cursor: "pointer", width: "100%",
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px",
    background: "#fff", color: "#0f172a", fontSize: "0.875rem",
    fontFamily: "inherit", outline: "none", width: "100%",
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: "0.8125rem", color: "#94a3b8" }}>
          <Link href="/settings/project" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>Project Settings</Link>
          <HiChevronRight size={14} />
          <span style={{ color: "#374151" }}>Security</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Security</h1>
            <p className="page-subtitle">Manage authentication, session controls, and access security settings.</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-add"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {saving ? "Saving…" : <><HiSave size={15} /> Save Changes</>}
          </button>
        </div>

        {success && <div className="msg-success" style={{ marginBottom: 16 }}>✅ {success}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 20, alignItems: "start" }}>
          <SettingsNav />

          {/* Center */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Two-Factor Auth */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HiDeviceMobile size={17} color="#4f46e5" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Two-Factor Authentication</h2>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Add an extra layer of security to your account</p>
                </div>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: settings.twoFactorAuth ? "#f0fdf4" : "#f8fafc", borderRadius: 10, border: `1px solid ${settings.twoFactorAuth ? "#bbf7d0" : "#e2e8f0"}` }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>
                      {settings.twoFactorAuth ? "2FA is Enabled" : "2FA is Disabled"}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>
                      {settings.twoFactorAuth ? "Your account is protected with two-factor authentication." : "Enable 2FA to secure your account with an authenticator app."}
                    </p>
                  </div>
                  <Toggle value={settings.twoFactorAuth} onChange={() => set("twoFactorAuth", !settings.twoFactorAuth)} />
                </div>
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Login Notifications</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Get notified when a new login occurs</p>
                  </div>
                  <Toggle value={settings.loginNotifications} onChange={() => set("loginNotifications", !settings.loginNotifications)} />
                </div>
              </div>
            </div>

            {/* Session & Access */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HiLockClosed size={17} color="#4f46e5" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Session & Access Control</h2>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Configure session timeouts and login policies</p>
                </div>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Session Timeout (minutes)</label>
                    <select value={settings.sessionTimeout} onChange={e => set("sessionTimeout", e.target.value)} style={selectStyle}>
                      {["15","30","60","120","Never"].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Login Attempts</label>
                    <select value={settings.maxLoginAttempts} onChange={e => set("maxLoginAttempts", e.target.value)} style={selectStyle}>
                      {["3","5","10","Unlimited"].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password Expiry (days)</label>
                    <select value={settings.passwordExpiry} onChange={e => set("passwordExpiry", e.target.value)} style={selectStyle}>
                      {["30","60","90","180","Never"].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">IP Whitelist</label>
                  <input value={settings.ipWhitelist} onChange={e => set("ipWhitelist", e.target.value)}
                    style={inputStyle} placeholder="e.g. 192.168.1.0/24, 10.0.0.1 (comma-separated)" />
                  <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>Leave empty to allow all IPs. Separate multiple IPs with commas.</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { key: "forceHttps",  label: "Force HTTPS",    sub: "Redirect all HTTP traffic to HTTPS" },
                    { key: "auditLog",    label: "Enable Audit Log", sub: "Log all security-related actions" },
                  ].map(item => (
                    <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>{item.label}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{item.sub}</p>
                      </div>
                      <Toggle value={settings[item.key as keyof typeof settings] as boolean} onChange={() => set(item.key as keyof typeof settings, !settings[item.key as keyof typeof settings] as boolean)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Password Policy */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HiShieldCheck size={17} color="#4f46e5" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Password Policy</h2>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Define password requirements for all users</p>
                </div>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="form-group" style={{ maxWidth: 200 }}>
                  <label className="form-label">Minimum Password Length</label>
                  <select value={settings.minPasswordLength} onChange={e => set("minPasswordLength", e.target.value)} style={selectStyle}>
                    {["6","8","10","12","16"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                {[
                  { key: "requireUppercase", label: "Require uppercase letters", sub: "At least one uppercase letter (A–Z)" },
                  { key: "requireNumbers",   label: "Require numbers",           sub: "At least one number (0–9)" },
                  { key: "requireSymbols",   label: "Require special characters", sub: "At least one symbol (!@#$%)" },
                ].map(item => (
                  <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{item.sub}</p>
                    </div>
                    <Toggle value={settings[item.key as keyof typeof settings] as boolean} onChange={() => set(item.key as keyof typeof settings, !settings[item.key as keyof typeof settings] as boolean)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Security Score */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Security Score</h3>
              <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 12px" }}>
                <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.8" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#4f46e5" strokeWidth="3.8"
                    strokeDasharray="72 100" strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#4f46e5" }}>72</p>
                  <p style={{ margin: 0, fontSize: "0.6rem", color: "#94a3b8" }}>/ 100</p>
                </div>
              </div>
              <p style={{ margin: "0 0 4px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Good</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Enable 2FA to reach Excellent</p>
            </div>

            {/* Active Sessions */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Active Sessions</h3>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "0.78rem", fontWeight: 600, fontFamily: "inherit" }}>
                  Revoke All
                </button>
              </div>
              <div style={{ padding: "10px 0" }}>
                {ACTIVE_SESSIONS.map(s => (
                  <div key={s.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <HiDeviceMobile size={16} color="#4f46e5" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }}>{s.device}</p>
                        {s.current && <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "1px 6px", borderRadius: 999 }}>Current</span>}
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>{s.location} · {s.ip}</p>
                      <p style={{ margin: "1px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>{s.lastActive}</p>
                    </div>
                    {!s.current && (
                      <button style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: "#ef4444", fontSize: "0.72rem", fontWeight: 600, fontFamily: "inherit", flexShrink: 0 }}>
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <HiExclamationCircle size={16} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#92400e", lineHeight: 1.5 }}>
                Changes to security settings may affect all logged-in users and require re-authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
