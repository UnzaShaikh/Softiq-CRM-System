"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { getProfile, updateProfile, ApiProfile } from "@/lib/profileApi";
import {
  HiUser, HiLockClosed, HiCog, HiBell, HiClipboardList,
  HiPencil, HiCamera, HiChevronRight,
} from "react-icons/hi";

// ── Profile Nav ─────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "profile",   label: "Profile Information", icon: <HiUser size={16} />,         href: "/settings" },
  { key: "password",  label: "Change Password",     icon: <HiLockClosed size={16} />,   href: "/settings/change-password" },
  { key: "prefs",     label: "Preferences",         icon: <HiCog size={16} />,           href: "/settings/preferences" },
  { key: "notifs",    label: "Notifications",       icon: <HiBell size={16} />,          href: "/settings/notifications" },
  { key: "activity",  label: "Activity Log",        icon: <HiClipboardList size={16} />, href: "/settings/activity-log" },
  { key: "project",   label: "Project Settings",    icon: <HiCog size={16} />,           href: "/settings/project" },
];

export function ProfileNav({ active }: { active: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
        <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Settings</p>
      </div>
      <nav style={{ padding: "6px" }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.key;
          return (
            <Link key={item.key} href={item.href}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", textDecoration: "none", color: isActive ? "#4f46e5" : "#475569", background: isActive ? "#eef2ff" : "transparent", fontWeight: isActive ? 600 : 500, fontSize: "0.875rem", transition: "all 0.15s", marginBottom: "2px" }}>
              <span style={{ color: isActive ? "#4f46e5" : "#94a3b8" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// ── My Profile Page ─────────────────────────────────────────
export default function MyProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}`.trim() : "Test User",
    email: user?.email ?? "testuser2@gmail.com",
    phone: "+1 (555) 123-4567",
    role: "Administrator",
    department: "Sales",
    location: "New York, USA",
    timezone: "(UTC-05:00) Eastern Time (US & Canada)",
    language: "English (US)",
    dateFormat: "MM/DD/YYYY",
    about: "CRM Administrator with access to all modules and system settings.",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load the real profile from the backend on mount. We always overwrite
  // the placeholder defaults above with whatever the backend returns —
  // even empty strings — so the UI reflects the true saved state rather
  // than silently keeping fake data when a field hasn't been filled in yet.
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const p: ApiProfile = await getProfile();
      setForm({
        fullName: `${p.first_name} ${p.last_name}`.trim(),
        email: p.email,
        phone: p.phone_number,
        role: p.role,
        department: p.department,
        location: p.location,
        // These three feed <select> dropdowns with a fixed set of options,
        // so an empty/unmatched backend value falls back to the first
        // sensible option instead of rendering blank.
        timezone: p.timezone || "(UTC-05:00) Eastern Time (US & Canada)",
        language: p.language || "English (US)",
        dateFormat: p.date_format || "MM/DD/YYYY",
        about: p.about,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      const [first_name, ...rest] = form.fullName.trim().split(/\s+/);
      const updated = await updateProfile({
        first_name: first_name || "",
        last_name: rest.join(" "),
        email: form.email,
        phone_number: form.phone,
        role: form.role,
        department: form.department,
        location: form.location,
        timezone: form.timezone,
        language: form.language,
        date_format: form.dateFormat,
        about: form.about,
      });
      setForm(prev => ({
        ...prev,
        fullName: `${updated.first_name} ${updated.last_name}`.trim(),
        email: updated.email,
        phone: updated.phone_number,
        role: updated.role,
        department: updated.department,
        location: updated.location,
        timezone: updated.timezone || prev.timezone,
        language: updated.language || prev.language,
        dateFormat: updated.date_format || prev.dateFormat,
        about: updated.about,
      }));
      setSuccess("Profile updated successfully.");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  const initials = form.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%", padding: "10px 14px", border: `1.5px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`,
    borderRadius: "8px", background: isEditing ? "#fff" : "#f8fafc", color: "#0f172a",
    fontSize: "0.875rem", fontFamily: "inherit", outline: "none",
    pointerEvents: isEditing ? "auto" : "none",
  });

  const selectStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
    borderRadius: "8px", background: isEditing ? "#fff" : "#f8fafc", color: "#0f172a",
    fontSize: "0.875rem", fontFamily: "inherit", outline: "none", cursor: isEditing ? "pointer" : "default",
    pointerEvents: isEditing ? "auto" : "none",
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information and preferences</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px", alignItems: "start" }}>

          {/* Left — Nav + Account Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <ProfileNav active="profile" />

            {/* Account Summary */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Account Summary</h3>
              {[
                { label: "Role", value: <span style={{ padding: "2px 8px", borderRadius: "9999px", background: "#eef2ff", color: "#4f46e5", fontSize: "0.78rem", fontWeight: 600 }}>{form.role}</span> },
                { label: "Member Since", value: "May 20, 2024" },
                { label: "Last Login", value: <span style={{ color: "#4f46e5", fontSize: "0.8125rem" }}>May 30, 2024, 11:45 AM</span> },
                { label: "Status", value: <span style={{ padding: "2px 8px", borderRadius: "9999px", background: "#dcfce7", color: "#16a34a", fontSize: "0.78rem", fontWeight: 600 }}>Active</span> },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>{row.label}</span>
                  <div style={{ fontSize: "0.8125rem", color: "#374151" }}>{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Profile Info */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

            {/* Card header */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 34, height: 34, borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HiUser size={17} color="#4f46e5" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Profile Information</h2>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>View and update your personal information</p>
                </div>
              </div>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn-add" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 16px", fontSize: "0.875rem" }}>
                  <HiPencil size={14} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => { setIsEditing(false); fetchProfile(); }} disabled={saving} className="btn-secondary" style={{ padding: "7px 16px", fontSize: "0.875rem" }}>Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-add" style={{ padding: "7px 16px", fontSize: "0.875rem" }}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            <div style={{ padding: "24px" }}>
              {success && <div className="msg-success" style={{ marginBottom: "16px" }}>✅ {success}</div>}
              {error && <div className="msg-error" style={{ marginBottom: "16px" }}>{error}</div>}
              {loading && <div className="loading-state" style={{ marginBottom: "16px" }}>Loading profile...</div>}

              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.5rem" }}>
                    {initials}
                  </div>
                  {isEditing && (
                    <button style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#4f46e5", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <HiCamera size={12} color="#fff" />
                    </button>
                  )}
                </div>
                <div>
                  <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>{form.fullName}</p>
                  <span style={{ padding: "2px 8px", borderRadius: "9999px", background: "#eef2ff", color: "#4f46e5", fontSize: "0.75rem", fontWeight: 600 }}>{form.role}</span>
                  <p style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: "#94a3b8" }}>{form.email}</p>
                </div>
              </div>

              {/* Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {[
                  { label: "Full Name", name: "fullName", type: "text" },
                  { label: "Email Address", name: "email", type: "email" },
                  { label: "Phone Number", name: "phone", type: "tel" },
                ].map(f => (
                  <div key={f.name} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input name={f.name} type={f.type} value={form[f.name as keyof typeof form]} onChange={handleChange}
                      style={inputStyle(!!errors[f.name])} readOnly={!isEditing} />
                    {errors[f.name] && <p className="form-error">{errors[f.name]}</p>}
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {[
                  { label: "Role", name: "role" },
                  { label: "Department", name: "department" },
                  { label: "Location", name: "location" },
                ].map(f => (
                  <div key={f.name} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input name={f.name} value={form[f.name as keyof typeof form]} onChange={handleChange}
                      style={inputStyle()} readOnly={!isEditing} />
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Time Zone</label>
                  <select name="timezone" value={form.timezone} onChange={handleChange} style={selectStyle}>
                    <option>(UTC-05:00) Eastern Time (US &amp; Canada)</option>
                    <option>(UTC+00:00) UTC</option>
                    <option>(UTC+05:00) Pakistan Standard Time</option>
                    <option>(UTC+05:30) India Standard Time</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select name="language" value={form.language} onChange={handleChange} style={selectStyle}>
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Urdu</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date Format</label>
                  <select name="dateFormat" value={form.dateFormat} onChange={handleChange} style={selectStyle}>
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">About</label>
                <textarea name="about" value={form.about} onChange={handleChange} rows={3}
                  style={{ ...inputStyle(), resize: "vertical" }} readOnly={!isEditing} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}