"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const S = {
  // Page wrapper
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
  blob1: {
    position: "absolute" as const,
    top: "-100px",
    right: "-100px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.07)",
    pointerEvents: "none" as const,
  },
  blob2: {
    position: "absolute" as const,
    bottom: "-80px",
    left: "-80px",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    pointerEvents: "none" as const,
  },
  blob3: {
    position: "absolute" as const,
    top: "40%",
    left: "10%",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "rgba(147,51,234,0.15)",
    pointerEvents: "none" as const,
  },
  // Card
  card: {
    background: "#ffffff",
    borderRadius: "1.25rem",
    boxShadow: "0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "440px",
    position: "relative" as const,
    zIndex: 1,
  },
  // Logo
  logoWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.25rem",
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
  },
  // Typography
  heading: {
    fontSize: "1.625rem",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.025em",
    margin: 0,
    textAlign: "center" as const,
  },
  subheading: {
    marginTop: "0.375rem",
    fontSize: "0.9375rem",
    color: "#64748b",
    textAlign: "center" as const,
  },
  // Alert
  alertError: {
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
  // Form
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.125rem",
  },
  formGroup: {
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
  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputWrap: { position: "relative" as const },
  inputIcon: {
    position: "absolute" as const,
    left: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    pointerEvents: "none" as const,
    width: "18px",
    height: "18px",
  },
  input: (hasError: boolean, hasRightPad?: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "0.675rem 0.875rem",
    paddingLeft: "2.625rem",
    paddingRight: hasRightPad ? "2.75rem" : "0.875rem",
    borderRadius: "0.625rem",
    border: `1.5px solid ${hasError ? "#ef4444" : "#e2e8f0"}`,
    background: hasError ? "#fef2f2" : "#ffffff",
    color: "#0f172a",
    fontSize: "0.9375rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    boxSizing: "border-box" as const,
  }),
  inputToggle: {
    position: "absolute" as const,
    right: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldError: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.8125rem",
    color: "#ef4444",
  },
  forgotLink: {
    fontSize: "0.8125rem",
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: 500,
  },
  // Remember me
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.625rem",
    cursor: "pointer",
  },
  checkLabel: {
    fontSize: "0.875rem",
    color: "#64748b",
    userSelect: "none" as const,
  },
  // Button
  btn: (loading: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "0.8125rem 1.5rem",
    borderRadius: "0.625rem",
    background: loading
      ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
      : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "#ffffff",
    fontSize: "0.9375rem",
    fontWeight: 700,
    fontFamily: "inherit",
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.75 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    letterSpacing: "0.01em",
    boxShadow: "0 4px 14px rgba(79,70,229,0.4)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    marginTop: "0.375rem",
  }),
  // Footer
  footer: {
    textAlign: "center" as const,
    marginTop: "1.75rem",
    fontSize: "0.9rem",
    color: "#64748b",
  },
  footerLink: {
    color: "#4f46e5",
    fontWeight: 700,
    textDecoration: "none",
  },
  // Divider
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    color: "#94a3b8",
    fontSize: "0.8125rem",
    margin: "0.25rem 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e2e8f0",
  },
} as const;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [btnHover, setBtnHover] = useState(false);

  function validate() {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    try {
  const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Invalid username or password.");
  }

 login(
  {
    username: data.user.username,
    email: data.user.email,
    firstName: data.user.first_name,
    lastName: data.user.last_name,
  },
  data.access,
  data.refresh
);

  router.push("/dashboard");

} catch (err: any) {
  setError(err.message || "Login failed.");
} finally {
  setIsLoading(false);
}
  }

  return (
    <div style={S.page}>
      <div aria-hidden="true" style={S.blob1} />
      <div aria-hidden="true" style={S.blob2} />
      <div aria-hidden="true" style={S.blob3} />

      <div style={S.card}>
        {/* Logo + Heading */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={S.logoWrap}>
            <div style={S.logoBox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <h1 style={S.heading}>Welcome back</h1>
          <p style={S.subheading}>Sign in to your CRM account</p>
        </div>

        {/* Error alert */}
        {error && (
          <div style={S.alertError} role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={S.form}>
          {/* Email */}
          <div style={S.formGroup}>
            <label htmlFor="email" style={S.label}>Email address</label>
            <div style={S.inputWrap}>
              <svg style={S.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="email"
                type="email"
                style={S.input(!!errors.email)}
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && (
              <span style={S.fieldError}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div style={S.formGroup}>
            <div style={S.labelRow}>
              <label htmlFor="password" style={S.label}>Password</label>
              <Link href="/forgot-password" style={S.forgotLink}>Forgot password?</Link>
            </div>
            <div style={S.inputWrap}>
              <svg style={S.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                style={S.input(!!errors.password, true)}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
              />
              <button type="button" style={S.inputToggle} onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span style={S.fieldError}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {errors.password}
              </span>
            )}
          </div>

          {/* Remember me */}
          <label style={S.checkRow}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "#4f46e5", cursor: "pointer", flexShrink: 0 }}
            />
            <span style={S.checkLabel}>Remember me for 30 days</span>
          </label>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...S.btn(isLoading),
              transform: btnHover && !isLoading ? "translateY(-1px)" : "translateY(0)",
              boxShadow: btnHover && !isLoading
                ? "0 8px 24px rgba(79,70,229,0.55)"
                : "0 4px 14px rgba(79,70,229,0.4)",
            }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
          >
            {isLoading ? (
              <>
                <span style={{
                  width: "18px", height: "18px",
                  border: "2.5px solid rgba(255,255,255,0.35)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.65s linear infinite",
                }} />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ ...S.divider, marginTop: "1.5rem" }}>
          <div style={S.dividerLine} />
          <span>or continue with</span>
          <div style={S.dividerLine} />
        </div>

        {/* Google SSO placeholder */}
        <button
          type="button"
          style={{
            width: "100%",
            marginTop: "0.875rem",
            padding: "0.75rem",
            borderRadius: "0.625rem",
            border: "1.5px solid #e2e8f0",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.625rem",
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "#0f172a",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "border-color 0.15s ease, background 0.15s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#94a3b8"; (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer link */}
        <p style={S.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={S.footerLink}>Create account</Link>
        </p>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}