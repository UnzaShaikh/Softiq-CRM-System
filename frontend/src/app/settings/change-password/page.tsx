"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProfileNav } from "../page";
import { HiLockClosed, HiEye, HiEyeOff, HiCheckCircle, HiShieldCheck } from "react-icons/hi";
import { MdNumbers } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";

function getStrength(pwd: string): { label: string; color: string; pct: number } {
  if (!pwd) return { label: "", color: "#e2e8f0", pct: 0 };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: "Weak", color: "#ef4444", pct: 25 };
  if (score === 2) return { label: "Fair", color: "#f59e0b", pct: 50 };
  if (score === 3) return { label: "Good", color: "#3b82f6", pct: 75 };
  return { label: "Strong", color: "#22c55e", pct: 100 };
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  const strength = getStrength(form.newPwd);
  const passwordsMatch = form.confirm.length > 0 && form.newPwd === form.confirm;
  const passwordsMismatch = form.confirm.length > 0 && form.newPwd !== form.confirm;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.current) e.current = "Current password is required.";
    if (!form.newPwd) e.newPwd = "New password is required.";
    else if (form.newPwd.length < 8) e.newPwd = "Password must be at least 8 characters.";
    if (!form.confirm) e.confirm = "Please confirm your password.";
    else if (form.newPwd !== form.confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSuccess("Password updated successfully.");
    setForm({ current: "", newPwd: "", confirm: "" });
    setTimeout(() => setSuccess(""), 4000);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 40px 10px 14px", border: "1.5px solid #e2e8f0",
    borderRadius: "8px", background: "#fff", color: "#0f172a",
    fontSize: "0.875rem", fontFamily: "inherit", outline: "none",
  };

  const TIPS = [
    { icon: <HiShieldCheck size={16} color="#4f46e5" />, title: "Use at least 8 characters", sub: "The longer, the better" },
    { icon: <span style={{ width: 16, height: 16, borderRadius: "4px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: "#4f46e5" }}>A</span>, title: "Mix letters and numbers", sub: "Use both uppercase and lowercase" },
    { icon: <MdNumbers size={16} color="#4f46e5" />, title: "Add special characters", sub: "Use symbols like ! @ # $ %" },
    { icon: <RiLockPasswordLine size={16} color="#4f46e5" />, title: "Avoid common passwords", sub: "Don't use easily guessable passwords" },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your password to keep your account secure</p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", fontSize: "0.8125rem", color: "#94a3b8" }}>
            <a href="/settings" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>My Profile</a>
            <span>›</span>
            <span>Change Password</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <ProfileNav active="password" />

            {/* Security Tips */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Password Security Tips</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {TIPS.map((tip, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "6px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {tip.icon}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 1px", fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }}>{tip.title}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{tip.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HiLockClosed size={17} color="#4f46e5" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Update Password</h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Enter your current password and choose a new one</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {success && <div className="msg-success">✅ {success}</div>}
              {submitError && <div className="msg-error">❌ {submitError}</div>}

              {/* Current Password */}
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div style={{ position: "relative" }}>
                  <input name="current" type={show.current ? "text" : "password"} value={form.current}
                    onChange={handleChange} style={{ ...inputStyle, borderColor: errors.current ? "#fca5a5" : "#e2e8f0" }}
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShow(p => ({ ...p, current: !p.current }))}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                    {show.current ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                  </button>
                </div>
                {errors.current && <p className="form-error">{errors.current}</p>}
              </div>

              {/* New Password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: "relative" }}>
                  <input name="newPwd" type={show.newPwd ? "text" : "password"} value={form.newPwd}
                    onChange={handleChange} style={{ ...inputStyle, borderColor: errors.newPwd ? "#fca5a5" : "#e2e8f0" }}
                    placeholder="••••••••••••••" />
                  <button type="button" onClick={() => setShow(p => ({ ...p, newPwd: !p.newPwd }))}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                    {show.newPwd ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.newPwd && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ height: "4px", borderRadius: "9999px", background: "#e2e8f0", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${strength.pct}%`, background: strength.color, borderRadius: "9999px", transition: "width 0.3s ease" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Use at least 8 characters with a mix of letters, numbers &amp; symbols</p>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: strength.color }}>{strength.label}</span>
                    </div>
                  </div>
                )}
                {errors.newPwd && <p className="form-error">{errors.newPwd}</p>}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: "relative" }}>
                  <input name="confirm" type={show.confirm ? "text" : "password"} value={form.confirm}
                    onChange={handleChange} style={{ ...inputStyle, borderColor: errors.confirm ? "#fca5a5" : passwordsMismatch ? "#fca5a5" : "#e2e8f0" }}
                    placeholder="••••••••••••••" />
                  <button type="button" onClick={() => setShow(p => ({ ...p, confirm: !p.confirm }))}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                    {show.confirm ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                  </button>
                </div>
                {passwordsMatch && (
                  <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                    <HiCheckCircle size={14} /> Passwords match
                  </p>
                )}
                {(passwordsMismatch || errors.confirm) && (
                  <p className="form-error">{errors.confirm || "Passwords do not match"}</p>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px" }}>
                <button type="button" className="btn-secondary" onClick={() => router.push("/settings")}>Cancel</button>
                <button type="submit" className="btn-add" disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  {saving ? "Updating..." : <><HiLockClosed size={14} /> Update Password</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
