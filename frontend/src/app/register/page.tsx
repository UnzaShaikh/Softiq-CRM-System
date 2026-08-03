"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface FormData {
  firstName: string; lastName: string; email: string;
  password: string; confirmPassword: string; agreeToTerms: boolean;
}
interface FormErrors {
  firstName?: string; lastName?: string; email?: string;
  password?: string; confirmPassword?: string; agreeToTerms?: string;
}

function getStrength(pw: string) {
  if (!pw) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: 1, label: "Weak", color: "#ef4444" };
  if (s === 2) return { score: 2, label: "Fair", color: "#f59e0b" };
  if (s === 3) return { score: 3, label: "Good", color: "#3b82f6" };
  return { score: 4, label: "Strong", color: "#22c55e" };
}

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "", agreeToTerms: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [gError, setGError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const strength = useMemo(() => getStrength(form.password), [form.password]);

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "At least 8 characters required.";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (!form.agreeToTerms) e.agreeToTerms = "You must accept the terms to continue.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGError(""); setSuccess("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1800));
      login({ firstName: form.firstName, lastName: form.lastName, email: form.email });
      setSuccess("Account created! Redirecting…");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setGError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputBase = (hasErr: boolean, pl = "42px", pr = "14px"): React.CSSProperties => ({
    width: "100%", padding: `11px ${pr} 11px ${pl}`,
    border: `1.5px solid ${hasErr ? "#ef4444" : "#e2e8f0"}`,
    borderRadius: 10, background: hasErr ? "#fef2f2" : "#f8fafc",
    color: "#0f172a", fontSize: "0.9375rem", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
  });

  const iconStyle: React.CSSProperties = {
    position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
    color: "#94a3b8", pointerEvents: "none",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#4f46e5";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
    e.currentTarget.style.background = "#fff";
  };
  const onBlur = (hasErr: boolean) => (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = hasErr ? "#ef4444" : "#e2e8f0";
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.background = hasErr ? "#fef2f2" : "#f8fafc";
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "1.5rem",
      position: "relative",
      overflow: "hidden",
      fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    }}>
      {/* Background blobs */}
      <div aria-hidden="true" style={{ position: "absolute", top: "-100px", right: "-100px", width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: "-80px", left: "-80px", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

      <div style={{
        width: "100%", maxWidth: 460,
        background: "#ffffff", borderRadius: 20,
        boxShadow: "0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)",
        padding: "2.5rem",
        position: "relative", zIndex: 1,
      }}>

        {/* Logo + heading */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.125rem",
            boxShadow: "0 8px 20px rgba(79,70,229,0.35)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em" }}>
            Create your account
          </h1>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Start managing your customers today
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid rgba(34,197,94,0.2)", color: "#15803d", fontSize: "0.875rem", marginBottom: "1.25rem" }} role="alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            {success}
          </div>
        )}
        {gError && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid rgba(239,68,68,0.2)", color: "#b91c1c", fontSize: "0.875rem", marginBottom: "1.25rem" }} role="alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {gError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* First + Last name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(["firstName", "lastName"] as const).map((field) => (
              <div key={field} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
                  {field === "firstName" ? "First name" : "Last name"}
                </label>
                <input type="text"
                  placeholder={field === "firstName" ? "John" : "Doe"}
                  value={form[field]}
                  onChange={(e) => set(field, e.target.value)}
                  autoComplete={field === "firstName" ? "given-name" : "family-name"}
                  style={inputBase(!!errors[field], "14px")}
                  onFocus={onFocus} onBlur={onBlur(!!errors[field])}
                />
                {errors[field] && <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>{errors[field]}</span>}
              </div>
            ))}
          </div>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Email address</label>
            <div style={{ position: "relative" }}>
              <svg style={iconStyle} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
              <input type="email" placeholder="you@company.com" value={form.email}
                onChange={(e) => set("email", e.target.value)} autoComplete="email"
                style={inputBase(!!errors.email)} onFocus={onFocus} onBlur={onBlur(!!errors.email)} />
            </div>
            {errors.email && <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Password</label>
            <div style={{ position: "relative" }}>
              <svg style={iconStyle} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input type={showPw ? "text" : "password"} placeholder="Min. 8 characters"
                value={form.password} onChange={(e) => set("password", e.target.value)}
                autoComplete="new-password"
                style={inputBase(!!errors.password, "42px", "42px")}
                onFocus={onFocus} onBlur={onBlur(!!errors.password)} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex" }}>
                {showPw
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
            </div>
            {form.password && (
              <div>
                <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                  {["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"].map((color, i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < strength.score ? color : "#e2e8f0", transition: "background 0.3s" }} />
                  ))}
                </div>
                <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: strength.color, fontWeight: 600 }}>{strength.label} password</p>
              </div>
            )}
            {errors.password && <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>{errors.password}</span>}
          </div>

          {/* Confirm password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Confirm password</label>
            <div style={{ position: "relative" }}>
              <svg style={iconStyle} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <input type={showCpw ? "text" : "password"} placeholder="Repeat your password"
                value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)}
                autoComplete="new-password"
                style={inputBase(!!errors.confirmPassword, "42px", "42px")}
                onFocus={onFocus} onBlur={onBlur(!!errors.confirmPassword)} />
              <button type="button" onClick={() => setShowCpw(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex" }}>
                {showCpw
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
            </div>
            {errors.confirmPassword && <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>{errors.confirmPassword}</span>}
          </div>

          {/* Terms */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={form.agreeToTerms}
                onChange={(e) => set("agreeToTerms", e.target.checked)}
                style={{ width: 15, height: 15, accentColor: "#4f46e5", cursor: "pointer", flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.5, userSelect: "none" }}>
                I agree to the{" "}
                <Link href="/terms" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>Privacy Policy</Link>
              </span>
            </label>
            {errors.agreeToTerms && <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>{errors.agreeToTerms}</span>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: "12px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "#fff", fontSize: "0.9375rem", fontWeight: 700,
              fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 16px rgba(79,70,229,0.35)", marginTop: 4,
            }}>
            {loading ? (
              <>
                <span style={{ width: 17, height: 17, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.65s linear infinite" }} />
                Creating account…
              </>
            ) : "Create account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "#64748b" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
