"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
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

const segColors = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

const base = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "1.5rem",
    position: "relative" as const,
    overflow: "hidden",
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: "1.25rem",
    boxShadow: "0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "480px",
    position: "relative" as const,
    zIndex: 1,
  },
  logoBox: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 20px rgba(79,70,229,0.4)",
    margin: "0 auto 1.25rem",
  },
  heading: {
    fontSize: "1.625rem",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.025em",
    margin: 0,
    textAlign: "center" as const,
  },
  sub: {
    marginTop: "0.375rem",
    fontSize: "0.9375rem",
    color: "#64748b",
    textAlign: "center" as const,
    marginBottom: "1.75rem",
  },
  alertOk: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    padding: "0.875rem 1rem",
    borderRadius: "0.625rem",
    background: "#f0fdf4",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "#15803d",
    fontSize: "0.875rem",
    marginBottom: "1.25rem",
  },
  alertErr: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    padding: "0.875rem 1rem",
    borderRadius: "0.625rem",
    background: "#fef2f2",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#b91c1c",
    fontSize: "0.875rem",
    marginBottom: "1.25rem",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
  },
  group: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#0f172a",
    userSelect: "none" as const,
  },
  wrap: { position: "relative" as const },
  icon: {
    position: "absolute" as const,
    left: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    pointerEvents: "none" as const,
    width: "18px",
    height: "18px",
  },
  toggle: {
    position: "absolute" as const,
    right: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldErr: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.8125rem",
    color: "#ef4444",
  },
  checkRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.625rem",
    cursor: "pointer",
  },
  checkLabel: {
    fontSize: "0.875rem",
    color: "#64748b",
    userSelect: "none" as const,
    lineHeight: "1.5",
  },
  footer: {
    textAlign: "center" as const,
    marginTop: "1.75rem",
    fontSize: "0.9rem",
    color: "#64748b",
  },
};

function inp(hasErr: boolean, iconLeft = true, iconRight = false): React.CSSProperties {
  return {
    width: "100%",
    padding: "0.675rem 0.875rem",
    paddingLeft: iconLeft ? "2.625rem" : "0.875rem",
    paddingRight: iconRight ? "2.75rem" : "0.875rem",
    borderRadius: "0.625rem",
    border: `1.5px solid ${hasErr ? "#ef4444" : "#e2e8f0"}`,
    background: hasErr ? "#fef2f2" : "#ffffff",
    color: "#0f172a",
    fontSize: "0.9375rem",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s ease",
  };
}

function ErrIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
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
  const [btnHover, setBtnHover] = useState(false);

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
    else if (strength.score < 2) e.password = "Too weak — add uppercase, numbers or symbols.";
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
      // Save user to global auth context
      login({ firstName: form.firstName, lastName: form.lastName, email: form.email });
      setSuccess("Account created! Redirecting to dashboard…");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch {
      setGError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={base.page}>
      {/* Background blobs */}
      <div aria-hidden="true" style={{ position:"absolute", top:"-100px", right:"-100px", width:"400px", height:"400px", borderRadius:"50%", background:"rgba(255,255,255,0.07)", pointerEvents:"none" }} />
      <div aria-hidden="true" style={{ position:"absolute", bottom:"-80px", left:"-80px", width:"300px", height:"300px", borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }} />

      <div style={base.card}>
        {/* Logo */}
        <div style={base.logoBox}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>

        <h1 style={base.heading}>Create your account</h1>
        <p style={base.sub}>Start managing your customers today</p>

        {/* Alerts */}
        {success && (
          <div style={base.alertOk} role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:"1px" }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {success}
          </div>
        )}
        {gError && (
          <div style={base.alertErr} role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:"1px" }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {gError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display:"flex", flexDirection:"column", gap:"1.125rem" }}>
          {/* Name row */}
          <div style={base.grid2}>
            <div style={base.group}>
              <label htmlFor="firstName" style={base.label}>First name</label>
              <input id="firstName" type="text" style={inp(!!errors.firstName, false)} placeholder="John"
                value={form.firstName} onChange={(e) => set("firstName", e.target.value)} autoComplete="given-name" />
              {errors.firstName && <span style={base.fieldErr}><ErrIcon />{errors.firstName}</span>}
            </div>
            <div style={base.group}>
              <label htmlFor="lastName" style={base.label}>Last name</label>
              <input id="lastName" type="text" style={inp(!!errors.lastName, false)} placeholder="Doe"
                value={form.lastName} onChange={(e) => set("lastName", e.target.value)} autoComplete="family-name" />
              {errors.lastName && <span style={base.fieldErr}><ErrIcon />{errors.lastName}</span>}
            </div>
          </div>

          {/* Email */}
          <div style={base.group}>
            <label htmlFor="reg-email" style={base.label}>Email address</label>
            <div style={base.wrap}>
              <svg style={base.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input id="reg-email" type="email" style={inp(!!errors.email)} placeholder="you@company.com"
                value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
            </div>
            {errors.email && <span style={base.fieldErr}><ErrIcon />{errors.email}</span>}
          </div>

          {/* Password */}
          <div style={base.group}>
            <label htmlFor="reg-pw" style={base.label}>Password</label>
            <div style={base.wrap}>
              <svg style={base.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input id="reg-pw" type={showPw ? "text" : "password"} style={inp(!!errors.password, true, true)}
                placeholder="Min. 8 characters" value={form.password}
                onChange={(e) => set("password", e.target.value)} autoComplete="new-password" />
              <button type="button" style={base.toggle} onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                {showPw
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div>
                <div style={{ display:"flex", gap:"4px", marginTop:"6px" }}>
                  {segColors.map((color, i) => (
                    <div key={i} style={{ flex:1, height:"3px", borderRadius:"9999px", background: i < strength.score ? color : "#e2e8f0", transition:"background 0.3s ease" }} />
                  ))}
                </div>
                <p style={{ fontSize:"0.75rem", marginTop:"4px", color: strength.color, fontWeight:500 }}>
                  {strength.label} password
                </p>
              </div>
            )}
            {errors.password && <span style={base.fieldErr}><ErrIcon />{errors.password}</span>}
          </div>

          {/* Confirm password */}
          <div style={base.group}>
            <label htmlFor="reg-cpw" style={base.label}>Confirm password</label>
            <div style={base.wrap}>
              <svg style={base.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <input id="reg-cpw" type={showCpw ? "text" : "password"} style={inp(!!errors.confirmPassword, true, true)}
                placeholder="Repeat your password" value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)} autoComplete="new-password" />
              <button type="button" style={base.toggle} onClick={() => setShowCpw(v => !v)} aria-label="Toggle confirm password">
                {showCpw
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {errors.confirmPassword && <span style={base.fieldErr}><ErrIcon />{errors.confirmPassword}</span>}
          </div>

          {/* Terms */}
          <div style={base.group}>
            <label style={base.checkRow}>
              <input type="checkbox" checked={form.agreeToTerms}
                onChange={(e) => set("agreeToTerms", e.target.checked)}
                style={{ width:"16px", height:"16px", accentColor:"#4f46e5", cursor:"pointer", flexShrink:0, marginTop:"2px" }} />
              <span style={base.checkLabel}>
                I agree to the{" "}
                <Link href="/terms" style={{ color:"#4f46e5", fontWeight:500, textDecoration:"none" }}>Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" style={{ color:"#4f46e5", fontWeight:500, textDecoration:"none" }}>Privacy Policy</Link>
              </span>
            </label>
            {errors.agreeToTerms && <span style={base.fieldErr}><ErrIcon />{errors.agreeToTerms}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width:"100%",
              padding:"0.8125rem 1.5rem",
              borderRadius:"0.625rem",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color:"#ffffff",
              fontSize:"0.9375rem",
              fontWeight:700,
              fontFamily:"inherit",
              border:"none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              gap:"0.5rem",
              letterSpacing:"0.01em",
              boxShadow: btnHover && !loading ? "0 8px 24px rgba(79,70,229,0.55)" : "0 4px 14px rgba(79,70,229,0.4)",
              transform: btnHover && !loading ? "translateY(-1px)" : "translateY(0)",
              transition:"transform 0.15s ease, box-shadow 0.15s ease",
              marginTop:"0.375rem",
            }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
          >
            {loading ? (
              <>
                <span style={{ width:"18px", height:"18px", border:"2.5px solid rgba(255,255,255,0.35)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.65s linear infinite" }} />
                Creating account…
              </>
            ) : (
              <>
                Create account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p style={base.footer}>
          Already have an account?{" "}
          <Link href="/login" style={{ color:"#4f46e5", fontWeight:700, textDecoration:"none" }}>Sign in</Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
