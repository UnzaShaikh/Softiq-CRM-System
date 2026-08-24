"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsNav from "@/components/project-settings/SettingsNav";
import {
  getEmailSettings,
  updateEmailSettings,
  sendTestEmail,
} from "@/lib/projectSettingsApi";
import Link from "next/link";
import { HiSave, HiEye, HiEyeOff, HiGlobe, HiPhone, HiMail, HiLocationMarker } from "react-icons/hi";
import { FiSend } from "react-icons/fi";

interface OutgoingEmail {
  fromName: string; fromEmail: string; replyTo: string; signature: string;
}
interface SmtpConfig {
  host: string; port: string; encryption: string; username: string; password: string;
}
interface EmailPrefs {
  enableTracking: boolean; enableLinkTracking: boolean;
  logToActivity: boolean; attachSignature: boolean;
}
interface FormErrors {
  fromName?: string; fromEmail?: string; smtpHost?: string;
  smtpPort?: string; username?: string; password?: string; testEmail?: string;
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      style={{ width: 44, height: 24, borderRadius: "9999px", border: "none", background: value ? "#4f46e5" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: "2px", left: value ? "22px" : "2px", width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </button>
  );
}

export default function EmailSettingsPage() {
  const [outgoing, setOutgoing] = useState<OutgoingEmail>({
    fromName: "", fromEmail: "", replyTo: "", signature: "Default Signature",
  });
  const [smtp, setSmtp] = useState<SmtpConfig>({
    host: "", port: "587", encryption: "STARTTLS", username: "", password: "",
  });
  const [prefs, setPrefs] = useState<EmailPrefs>({
    enableTracking: true, enableLinkTracking: true,
    logToActivity: false, attachSignature: true,
  });
  const [testEmail, setTestEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [testSuccess, setTestSuccess] = useState("");
  const [testError, setTestError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  // Whether a password is stored on the server (never returned to the client).
  const [hasStoredPassword, setHasStoredPassword] = useState(false);

  const fetchEmailSettings = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const s = await getEmailSettings();
      setHasStoredPassword(s.has_smtp_password);
      setOutgoing({
        fromName: s.from_name,
        fromEmail: s.from_email,
        replyTo: s.reply_to_email,
        signature: s.email_signature || "Default Signature",
      });
      setSmtp({
        host: s.smtp_host,
        port: String(s.smtp_port ?? 587),
        encryption: ["STARTTLS", "SSL/TLS", "None"].includes(s.smtp_encryption) ? s.smtp_encryption : "STARTTLS",
        username: s.smtp_username,
        password: "",
      });
      setPrefs({
        enableTracking: s.enable_email_tracking,
        enableLinkTracking: s.enable_link_tracking,
        logToActivity: s.log_emails_to_activity,
        attachSignature: s.attach_email_signature,
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load email settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmailSettings(); }, [fetchEmailSettings]);

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: "100%", padding: "10px 14px",
    border: `1.5px solid ${err ? "#fca5a5" : "#e2e8f0"}`,
    borderRadius: "8px", background: "#fff", color: "#0f172a",
    fontSize: "0.875rem", fontFamily: "inherit", outline: "none",
  });

  const selectStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
    borderRadius: "8px", background: "#fff", color: "#374151",
    fontSize: "0.875rem", fontFamily: "inherit", outline: "none", cursor: "pointer",
  };

  function handleOutgoing(field: keyof OutgoingEmail, value: string) {
    setOutgoing(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }

  function handleSmtp(field: keyof SmtpConfig, value: string) {
    setSmtp(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field as keyof FormErrors]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!outgoing.fromName.trim()) e.fromName = "From name is required.";
    if (!outgoing.fromEmail.trim()) e.fromEmail = "From email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(outgoing.fromEmail)) e.fromEmail = "Enter a valid email.";
    if (!smtp.host.trim()) e.smtpHost = "SMTP host is required.";
    if (!smtp.port.trim()) e.smtpPort = "SMTP port is required.";
    else if (isNaN(Number(smtp.port))) e.smtpPort = "Enter a valid port number.";
    if (!smtp.username.trim()) e.username = "Username is required.";
    // A password is only required when none is stored on the server yet.
    if (!smtp.password.trim() && !hasStoredPassword) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate() || saving) return;
    setSaving(true);
    setSuccess("");
    setSaveError("");
    try {
      await updateEmailSettings({
        from_name: outgoing.fromName.trim(),
        from_email: outgoing.fromEmail.trim(),
        reply_to_email: outgoing.replyTo.trim(),
        email_signature: outgoing.signature,
        smtp_host: smtp.host.trim(),
        smtp_port: Number(smtp.port),
        smtp_encryption: smtp.encryption,
        smtp_username: smtp.username.trim(),
        // Only send a new password when the user typed one; otherwise the
        // stored password is kept untouched on the server.
        ...(smtp.password ? { smtp_password: smtp.password } : {}),
        enable_email_tracking: prefs.enableTracking,
        enable_link_tracking: prefs.enableLinkTracking,
        log_emails_to_activity: prefs.logToActivity,
        attach_email_signature: prefs.attachSignature,
      });
      if (smtp.password) {
        setHasStoredPassword(true);
        setSmtp(prev => ({ ...prev, password: "" }));
      }
      setHasChanges(false);
      setSuccess("Email settings saved successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save email settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTest() {
    if (!testEmail.trim()) { setErrors(prev => ({ ...prev, testEmail: "Enter an email address." })); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) { setErrors(prev => ({ ...prev, testEmail: "Enter a valid email." })); return; }
    setErrors(prev => ({ ...prev, testEmail: undefined }));
    setSending(true);
    setTestSuccess("");
    setTestError("");
    try {
      const res = await sendTestEmail(testEmail.trim());
      setTestSuccess(res.detail || `Test email sent to ${testEmail} successfully.`);
      setTimeout(() => setTestSuccess(""), 6000);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "Failed to send test email.");
      setTimeout(() => setTestError(""), 8000);
    } finally {
      setSending(false);
    }
  }

  const EMAIL_PREFS = [
    { key: "enableTracking", label: "Enable Email Tracking", sub: "Track when emails are opened." },
    { key: "enableLinkTracking", label: "Enable Link Tracking", sub: "Track clicks on links in emails." },
    { key: "logToActivity", label: "Log Emails to Activity", sub: "Automatically log sent emails in activity feed." },
    { key: "attachSignature", label: "Attach Email Signature", sub: "Include signature in all outgoing emails." },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: "0.8125rem", color: "#94a3b8" }}>
          <Link href="/settings/project" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>Project Settings</Link>
          <span style={{ color: "#cbd5e1" }}>›</span>
          <span style={{ color: "#374151" }}>Email Settings</span>
        </div>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title">Email Settings</h1>
            <p className="page-subtitle">Configure outgoing email, SMTP and email preferences.</p>
          </div>
          <button onClick={handleSave} disabled={saving || !hasChanges} className="btn-add"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", opacity: !hasChanges ? 0.6 : 1, cursor: !hasChanges ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : <><HiSave size={15} /> Save Changes</>}
          </button>
        </div>

        {loadError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "0.8125rem", color: "#b91c1c" }}>
            ❌ {loadError}{" "}
            <button onClick={fetchEmailSettings} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontFamily: "inherit", fontSize: "0.8125rem" }}>
              Retry
            </button>
          </div>
        )}
        {saveError && <div className="msg-error" style={{ marginBottom: "16px", whiteSpace: "pre-line" }}>❌ {saveError}</div>}
        {success && <div className="msg-success" style={{ marginBottom: "16px" }}>✅ {success}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 300px", gap: "20px", alignItems: "start" }}>

          <SettingsNav />

          {/* Center — Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Email Settings</h2>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>Configure your outgoing email settings and preferences.</p>
              </div>

              {loading ? (
                <div style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
                  Loading email settings...
                </div>
              ) : (

              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Section 1 */}
                <div>
                  <p style={{ margin: "0 0 14px", fontSize: "0.8125rem", fontWeight: 700, color: "#4f46e5" }}>1. Outgoing Email Configuration</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">From Name <span style={{ color: "var(--error)" }}>*</span></label>
                      <input value={outgoing.fromName} onChange={e => handleOutgoing("fromName", e.target.value)}
                        style={inputStyle(errors.fromName)} placeholder="Softiq Tech CRM" />
                      {errors.fromName && <p className="form-error">{errors.fromName}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">From Email Address <span style={{ color: "var(--error)" }}>*</span></label>
                      <input type="email" value={outgoing.fromEmail} onChange={e => handleOutgoing("fromEmail", e.target.value)}
                        style={inputStyle(errors.fromEmail)} placeholder="no-reply@softiqtech.com" />
                      {errors.fromEmail && <p className="form-error">{errors.fromEmail}</p>}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">Reply-To Email (Optional)</label>
                      <input type="email" value={outgoing.replyTo} onChange={e => handleOutgoing("replyTo", e.target.value)}
                        style={inputStyle()} placeholder="support@softiqtech.com" />
                      <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>Replies to your emails will be sent to this address.</p>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Organization Email Signature</label>
                      <select value={outgoing.signature} onChange={e => handleOutgoing("signature", e.target.value)} style={selectStyle}>
                        <option>Default Signature</option>
                        <option>Professional</option>
                        <option>Minimal</option>
                        <option>Custom</option>
                      </select>
                      <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>Choose the default signature for outgoing emails.</p>
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: "#f1f5f9" }} />

                {/* Section 2 — SMTP */}
                <div>
                  <p style={{ margin: "0 0 14px", fontSize: "0.8125rem", fontWeight: 700, color: "#4f46e5" }}>2. SMTP Configuration</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">SMTP Host <span style={{ color: "var(--error)" }}>*</span></label>
                      <input value={smtp.host} onChange={e => handleSmtp("host", e.target.value)}
                        style={inputStyle(errors.smtpHost)} placeholder="smtp.softiqtech.com" />
                      {errors.smtpHost && <p className="form-error">{errors.smtpHost}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">SMTP Port <span style={{ color: "var(--error)" }}>*</span></label>
                      <input type="number" value={smtp.port} onChange={e => handleSmtp("port", e.target.value)}
                        style={inputStyle(errors.smtpPort)} placeholder="587" />
                      {errors.smtpPort && <p className="form-error">{errors.smtpPort}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Encryption <span style={{ color: "var(--error)" }}>*</span></label>
                      <select value={smtp.encryption} onChange={e => handleSmtp("encryption", e.target.value)} style={selectStyle}>
                        <option>STARTTLS</option><option>SSL/TLS</option><option>None</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                    <div className="form-group">
                      <label className="form-label">SMTP Username <span style={{ color: "var(--error)" }}>*</span></label>
                      <input value={smtp.username} onChange={e => handleSmtp("username", e.target.value)}
                        style={inputStyle(errors.username)} placeholder="no-reply@softiqtech.com" />
                      {errors.username && <p className="form-error">{errors.username}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">SMTP Password <span style={{ color: "var(--error)" }}>*</span></label>
                      <div style={{ position: "relative" }}>
                        <input type={showPassword ? "text" : "password"} value={smtp.password}
                          onChange={e => handleSmtp("password", e.target.value)}
                          placeholder={hasStoredPassword ? "•••••••• (saved — leave blank to keep)" : ""}
                          style={{ ...inputStyle(errors.password), paddingRight: "40px" }} />
                        <button type="button" onClick={() => setShowPassword(p => !p)}
                          style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                          {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                        </button>
                      </div>
                      {errors.password && <p className="form-error">{errors.password}</p>}
                    </div>
                  </div>

                  {/* Send Test Email */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <button onClick={handleSendTest} disabled={sending}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "1.5px solid #4f46e5", borderRadius: "8px", background: "#eef2ff", color: "#4f46e5", fontSize: "0.875rem", fontFamily: "inherit", cursor: sending ? "not-allowed" : "pointer", fontWeight: 600 }}>
                      <FiSend size={14} /> {sending ? "Sending..." : "Send Test Email"}
                    </button>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <input type="email" value={testEmail} onChange={e => { setTestEmail(e.target.value); setErrors(prev => ({ ...prev, testEmail: undefined })); }}
                        style={inputStyle(errors.testEmail)} placeholder="Send a test email to verify your SMTP settings." />
                      {errors.testEmail && <p className="form-error">{errors.testEmail}</p>}
                    </div>
                  </div>
                  {testSuccess && <div className="msg-success" style={{ marginTop: "10px" }}>✅ {testSuccess}</div>}
                  {testError && <div className="msg-error" style={{ marginTop: "10px", whiteSpace: "pre-line" }}>❌ {testError}</div>}
                </div>

                <div style={{ height: 1, background: "#f1f5f9" }} />

                {/* Section 3 — Email Preferences */}
                <div>
                  <p style={{ margin: "0 0 14px", fontSize: "0.8125rem", fontWeight: 700, color: "#4f46e5" }}>3. Email Preferences</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    {EMAIL_PREFS.map(item => (
                      <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "12px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px" }}>
                        <div>
                          <p style={{ margin: "0 0 2px", fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{item.label}</p>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{item.sub}</p>
                        </div>
                        <Toggle
                          value={prefs[item.key as keyof EmailPrefs]}
                          onChange={() => { setPrefs(p => ({ ...p, [item.key]: !p[item.key as keyof EmailPrefs] })); setHasChanges(true); }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* Right — Email Config Preview */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "sticky", top: "20px" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: "0 0 2px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Email Configuration Preview</h3>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>This is how your emails will appear to recipients.</p>
            </div>

            {/* Email preview */}
            <div style={{ padding: "16px" }}>
              {/* Sender info */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", padding: "10px 12px", background: "#f8fafc", borderRadius: "8px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "8px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem" }}>S</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "0.8rem", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {outgoing.fromName || "Softiq Tech CRM"}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {outgoing.fromEmail || "no-reply@softiqtech.com"}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>To: Recipient</p>
                </div>
              </div>

              {/* Email body */}
              <div style={{ fontSize: "0.8125rem", color: "#374151", lineHeight: 1.7, marginBottom: "14px" }}>
                <p style={{ margin: "0 0 8px" }}>Hello,</p>
                <p style={{ margin: "0 0 8px", color: "#64748b", fontStyle: "italic" }}>
                  This is a preview of how your emails will appear to recipients. You can customize your signature from the settings.
                </p>
                <p style={{ margin: 0 }}>Best regards,<br />
                  <strong style={{ color: "#4f46e5" }}>{outgoing.fromName || "Softiq Tech CRM"} Team</strong>
                </p>
              </div>

              {/* Company footer */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "6px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.65rem" }}>S</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, color: "#0f172a" }}>Softiq Tech (Pvt) Ltd.</p>
                    <p style={{ margin: 0, fontSize: "0.68rem", color: "#64748b" }}>Building Smarter Solutions</p>
                  </div>
                </div>
                {[
                  { icon: <HiGlobe size={11} />, text: "https://softiqtech.com" },
                  { icon: <HiPhone size={11} />, text: "+92 300 1234567" },
                  { icon: <HiMail size={11} />, text: outgoing.replyTo || "support@softiqtech.com" },
                  { icon: <HiLocationMarker size={11} />, text: "Office # 204, 2nd Floor, Tech Plaza, Karachi." },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
                    <span style={{ color: "#94a3b8", flexShrink: 0, marginTop: "1px" }}>{row.icon}</span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", wordBreak: "break-word" }}>{row.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
