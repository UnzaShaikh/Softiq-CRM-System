"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsNav from "@/components/project-settings/SettingsNav";
import { HiSave, HiEye, HiEyeOff, HiMail, HiChevronRight } from "react-icons/hi";
import { FiSend } from "react-icons/fi";
import Link from "next/link";

interface SmtpForm {
  fromName: string; fromEmail: string; smtpHost: string; smtpPort: string;
  encryption: string; authentication: string; username: string; password: string;
}
interface EmailPrefs {
  sendEmailNotifs: boolean; useHtmlFormat: boolean;
  trackEmailOpens: boolean; trackClicks: boolean; addUnsubscribeLink: boolean;
}
interface SmtpErrors {
  fromName?: string; fromEmail?: string; smtpHost?: string;
  smtpPort?: string; username?: string; password?: string;
}

export default function EmailSettingsPage() {
  const [smtp, setSmtp] = useState<SmtpForm>({
    fromName: "Softiq Tech CRM", fromEmail: "no-reply@softiqtech.com",
    smtpHost: "smtp.sendgrid.net", smtpPort: "587",
    encryption: "STARTTLS", authentication: "Login",
    username: "apikey", password: "••••••••••••",
  });
  const [prefs, setPrefs] = useState<EmailPrefs>({
    sendEmailNotifs: true, useHtmlFormat: true,
    trackEmailOpens: false, trackClicks: false, addUnsubscribeLink: true,
  });
  const [replyToEmail, setReplyToEmail] = useState("support@softiqtech.com");
  const [signature, setSignature] = useState("Best Regards,\nSoftiq Tech Team\nwww.softiqtech.com\n+92 300 1234567");
  const [testEmail, setTestEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [smtpErrors, setSmtpErrors] = useState<SmtpErrors>({});
  const [replyToError, setReplyToError] = useState("");
  const [testEmailError, setTestEmailError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [testSuccess, setTestSuccess] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const selectStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
    borderRadius: "8px", background: "#fff", color: "#0f172a",
    fontSize: "0.875rem", fontFamily: "inherit", outline: "none", cursor: "pointer",
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%", padding: "10px 14px",
    border: `1.5px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`,
    borderRadius: "8px", background: "#fff", color: "#0f172a",
    fontSize: "0.875rem", fontFamily: "inherit", outline: "none",
  });

  function handleSmtp(field: keyof SmtpForm, value: string) {
    setSmtp(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (smtpErrors[field as keyof SmtpErrors]) setSmtpErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validateSmtp(): boolean {
    const e: SmtpErrors = {};
    if (!smtp.fromName.trim()) e.fromName = "From name is required.";
    if (!smtp.fromEmail.trim()) e.fromEmail = "From email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(smtp.fromEmail)) e.fromEmail = "Enter a valid email.";
    if (!smtp.smtpHost.trim()) e.smtpHost = "SMTP host is required.";
    if (!smtp.smtpPort.trim()) e.smtpPort = "SMTP port is required.";
    if (!smtp.username.trim()) e.username = "Username is required.";
    if (!smtp.password.trim()) e.password = "Password is required.";
    setSmtpErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validateSmtp()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setHasChanges(false);
    setSuccess("Email settings saved successfully.");
    setTimeout(() => setSuccess(""), 4000);
  }

  async function handleSendTest() {
    if (!testEmail.trim()) { setTestEmailError("Please enter an email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) { setTestEmailError("Enter a valid email address."); return; }
    setTestEmailError("");
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setTestSuccess(`Test email sent to ${testEmail} successfully.`);
    setTimeout(() => setTestSuccess(""), 4000);
  }

  function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
    return (
      <button type="button" onClick={onChange}
        style={{ width: 44, height: 24, borderRadius: "9999px", border: "none", background: value ? "#4f46e5" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: "2px", left: value ? "22px" : "2px", width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
      </button>
    );
  }

  const EMAIL_PREFS = [
    { key: "sendEmailNotifs", label: "Send Email Notifications", sub: "Enable to send email notifications to users." },
    { key: "useHtmlFormat", label: "Use HTML Format", sub: "Send emails in HTML format." },
    { key: "trackEmailOpens", label: "Track Email Opens", sub: "Track when emails are opened by recipients." },
    { key: "trackClicks", label: "Track Clicks", sub: "Track links clicked in emails." },
    { key: "addUnsubscribeLink", label: "Add Unsubscribe Link", sub: "Add unsubscribe link in email footer." },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", fontSize: "0.8125rem", color: "#94a3b8" }}>
          <Link href="/settings/project" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>Project Settings</Link>
          <HiChevronRight size={14} />
          <span style={{ color: "#374151" }}>Email Settings</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title">Email Settings</h1>
            <p className="page-subtitle">Configure outgoing email server, reply-to, and email preferences.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => { setTestEmail("testuser@example.com"); }} className="btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <FiSend size={14} /> Send Test Email
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-add"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              {saving ? "Saving..." : <><HiSave size={15} /> Save Changes</>}
            </button>
          </div>
        </div>

        {success && <div className="msg-success" style={{ marginBottom: "16px" }}>✅ {success}</div>}

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: "20px", alignItems: "start" }}>

          <SettingsNav />

          {/* Center */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* SMTP */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: "0 0 2px", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Outgoing Email (SMTP)</h2>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>Configure SMTP server to send emails from the system.</p>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">From Name <span style={{ color: "var(--error)" }}>*</span></label>
                    <input value={smtp.fromName} onChange={e => handleSmtp("fromName", e.target.value)}
                      style={inputStyle(!!smtpErrors.fromName)} placeholder="e.g. Softiq Tech CRM" />
                    {smtpErrors.fromName && <p className="form-error">{smtpErrors.fromName}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">From Email <span style={{ color: "var(--error)" }}>*</span></label>
                    <input type="email" value={smtp.fromEmail} onChange={e => handleSmtp("fromEmail", e.target.value)}
                      style={inputStyle(!!smtpErrors.fromEmail)} placeholder="no-reply@example.com" />
                    {smtpErrors.fromEmail && <p className="form-error">{smtpErrors.fromEmail}</p>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">SMTP Host <span style={{ color: "var(--error)" }}>*</span></label>
                    <input value={smtp.smtpHost} onChange={e => handleSmtp("smtpHost", e.target.value)}
                      style={inputStyle(!!smtpErrors.smtpHost)} placeholder="smtp.sendgrid.net" />
                    {smtpErrors.smtpHost && <p className="form-error">{smtpErrors.smtpHost}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">SMTP Port <span style={{ color: "var(--error)" }}>*</span></label>
                    <input type="number" value={smtp.smtpPort} onChange={e => handleSmtp("smtpPort", e.target.value)}
                      style={inputStyle(!!smtpErrors.smtpPort)} placeholder="587" />
                    {smtpErrors.smtpPort && <p className="form-error">{smtpErrors.smtpPort}</p>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Encryption <span style={{ color: "var(--error)" }}>*</span></label>
                    <select value={smtp.encryption} onChange={e => handleSmtp("encryption", e.target.value)} style={selectStyle}>
                      <option>STARTTLS</option><option>SSL/TLS</option><option>None</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Authentication <span style={{ color: "var(--error)" }}>*</span></label>
                    <select value={smtp.authentication} onChange={e => handleSmtp("authentication", e.target.value)} style={selectStyle}>
                      <option>Login</option><option>Plain</option><option>CRAM-MD5</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Username <span style={{ color: "var(--error)" }}>*</span></label>
                    <input value={smtp.username} onChange={e => handleSmtp("username", e.target.value)}
                      style={inputStyle(!!smtpErrors.username)} placeholder="apikey" />
                    {smtpErrors.username && <p className="form-error">{smtpErrors.username}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password <span style={{ color: "var(--error)" }}>*</span></label>
                    <div style={{ position: "relative" }}>
                      <input type={showPassword ? "text" : "password"} value={smtp.password}
                        onChange={e => handleSmtp("password", e.target.value)}
                        style={{ ...inputStyle(!!smtpErrors.password), paddingRight: "40px" }}
                        placeholder="••••••••••••" />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                        {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                      </button>
                    </div>
                    {smtpErrors.password && <p className="form-error">{smtpErrors.password}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Reply-To Settings */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Reply-To Settings</h2>
              <p style={{ margin: "0 0 14px", fontSize: "0.78rem", color: "#94a3b8" }}>Set default reply-to email for all outgoing messages.</p>
              <div className="form-group">
                <label className="form-label">Reply-To Email</label>
                <input type="email" value={replyToEmail}
                  onChange={e => { setReplyToEmail(e.target.value); setHasChanges(true); setReplyToError(""); }}
                  style={inputStyle(!!replyToError)} placeholder="support@example.com" />
                {replyToError && <p className="form-error">{replyToError}</p>}
                <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>Replies to system emails will be sent to this address.</p>
              </div>
            </div>

            {/* Email Signature */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: "0 0 2px", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Email Signature</h2>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>This signature will be added to the end of all outgoing emails.</p>
              </div>
              <div style={{ padding: "20px 24px" }}>
                {/* Toolbar */}
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px 8px 0 0", padding: "8px 12px", background: "#f8fafc", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <select style={{ padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "0.78rem", fontFamily: "inherit", background: "#fff", color: "#374151" }}>
                    <option>Segoe UI</option><option>Arial</option><option>Times New Roman</option>
                  </select>
                  <select style={{ padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "0.78rem", fontFamily: "inherit", background: "#fff", color: "#374151" }}>
                    <option>14</option><option>12</option><option>16</option><option>18</option>
                  </select>
                  <div style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 2px" }} />
                  {["B","I","U","S"].map(b => (
                    <button key={b} type="button" style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", borderRadius: "4px", color: "#374151", fontSize: "0.85rem", fontWeight: b === "B" ? 700 : 400, fontStyle: b === "I" ? "italic" : "normal", textDecoration: b === "U" ? "underline" : b === "S" ? "line-through" : "none" }}>{b}</button>
                  ))}
                  <div style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 2px" }} />
                  {["≡","≡","≡","•","1.","⇤","⇥","🔗","📷","</>"].map((icon, i) => (
                    <button key={i} type="button" style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", borderRadius: "4px", color: "#374151", fontSize: "0.85rem" }}>{icon}</button>
                  ))}
                </div>
                <textarea value={signature} onChange={e => { setSignature(e.target.value); setHasChanges(true); }}
                  rows={6} className="form-input"
                  style={{ borderRadius: "0 0 8px 8px", resize: "vertical", minHeight: "120px" }} />
              </div>
            </div>

            {/* Footer info */}
            <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "#4f46e5", fontSize: "1rem", flexShrink: 0 }}>ℹ️</span>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#4338ca" }}>
                These email settings will be used for all system-generated emails, notifications, and email templates.
              </p>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Email Preferences */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Email Preferences</h3>
              <p style={{ margin: "0 0 14px", fontSize: "0.75rem", color: "#94a3b8" }}>Configure email sending preferences.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {EMAIL_PREFS.map(item => (
                  <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 1px", fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{item.sub}</p>
                    </div>
                    <Toggle
                      value={prefs[item.key as keyof EmailPrefs]}
                      onChange={() => { setPrefs(p => ({ ...p, [item.key]: !p[item.key as keyof EmailPrefs] })); setHasChanges(true); }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Test Email */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Test Your Email Settings</h3>
              <p style={{ margin: "0 0 12px", fontSize: "0.75rem", color: "#94a3b8" }}>Send a test email to verify your SMTP configuration.</p>
              {testSuccess && <div className="msg-success" style={{ marginBottom: "10px", fontSize: "0.8rem" }}>✅ {testSuccess}</div>}
              <div className="form-group" style={{ marginBottom: "10px" }}>
                <label className="form-label" style={{ fontSize: "0.8rem" }}>Send Test Email To</label>
                <input type="email" value={testEmail} onChange={e => { setTestEmail(e.target.value); setTestEmailError(""); }}
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${testEmailError ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "8px", background: "#fff", color: "#0f172a", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none" }}
                  placeholder="testuser@example.com" />
                {testEmailError && <p className="form-error">{testEmailError}</p>}
                <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>Enter an email address to send a test email.</p>
              </div>
              <button onClick={handleSendTest} disabled={sending}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px", border: "none", borderRadius: "8px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", fontWeight: 600, fontSize: "0.875rem", cursor: sending ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: sending ? 0.75 : 1 }}>
                <FiSend size={14} /> {sending ? "Sending..." : "Send Test Email"}
              </button>
            </div>

            {/* Email Usage */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <HiMail size={16} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Email Usage</h3>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>Emails sent this month</p>
                  <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>2,450 <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "#94a3b8" }}>/ 10,000</span></p>
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4f46e5" }}>24.5%</span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 8, borderRadius: "9999px", background: "#e2e8f0", overflow: "hidden", marginBottom: "6px" }}>
                <div style={{ width: "24.5%", height: "100%", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", borderRadius: "9999px" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>24.5% of monthly limit used</p>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#4f46e5", fontSize: "0.78rem", fontWeight: 600, fontFamily: "inherit" }}>
                  View Usage Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
