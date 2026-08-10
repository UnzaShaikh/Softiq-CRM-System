"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import emailTemplatesData, { ALL_CATEGORIES, AVAILABLE_VARIABLES, TemplateCategory, TemplateType, TemplateStatus } from "@/data/emailTemplates";
import { ChevronDown, Save, X } from "lucide-react";

interface FormValues {
  name: string; subject: string; content: string;
  category: TemplateCategory | ""; type: TemplateType;
  status: TemplateStatus; description: string;
}
interface FormErrors { name?: string; subject?: string; content?: string; category?: string; }

export default function EditEmailTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<FormValues>({ name: "", subject: "", content: "", category: "", type: "Public", status: "Active", description: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const t = emailTemplatesData.find(t => t.id === id);
    if (!t) { setNotFound(true); setLoading(false); return; }
    setForm({ name: t.name, subject: t.subject, content: t.content, category: t.category, type: t.type, status: t.status, description: t.description });
    setLoading(false);
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function insertVariable(variable: string) {
    setForm(prev => ({ ...prev, content: prev.content + variable }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Template name is required.";
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.content.trim()) e.content = "Email content is required.";
    if (!form.category) e.category = "Please select a category.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSuccess("Template updated successfully.");
    setTimeout(() => router.push(`/email-templates/${id}`), 1500);
  }

  const wordCount = form.content.split(/\s+/).filter(Boolean).length;

  if (loading) return (
    <DashboardLayout>
      <div className="loading-state">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        Loading...
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </DashboardLayout>
  );

  if (notFound) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>📧</p>
        <h2>Template Not Found</h2>
        <button className="save-company-btn" onClick={() => router.push("/email-templates")}>Back to Templates</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>Edit Email Template</h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Update your email template details.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={() => router.push(`/email-templates/${id}`)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 20px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#475569", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}>
              <X size={14} /> Cancel
            </button>
            <button type="submit" form="edit-template-form" disabled={saving}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 20px", border: "none", borderRadius: "8px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", fontWeight: 600, fontSize: "0.9rem", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: saving ? 0.75 : 1 }}>
              {saving ? "Saving..." : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        </div>

        {success && <div className="msg-success" style={{ marginBottom: "20px" }}>✅ {success}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>

          {/* Main Form */}
          <form id="edit-template-form" onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Template Information</h2>
              </div>
              <div style={{ padding: "20px" }}>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Template Name <span style={{ color: "var(--error)" }}>*</span></label>
                    <input name="name" value={form.name} onChange={handleChange}
                      className={`form-input${errors.name ? " error" : ""}`} />
                    {errors.name && <p className="form-error">{errors.name}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject <span style={{ color: "var(--error)" }}>*</span></label>
                    <input name="subject" value={form.subject} onChange={handleChange}
                      className={`form-input${errors.subject ? " error" : ""}`} />
                    {errors.subject && <p className="form-error">{errors.subject}</p>}
                  </div>
                </div>

                {/* Email Content */}
                <div className="form-group">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <label className="form-label">Email Content <span style={{ color: "var(--error)" }}>*</span></label>
                    <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", border: "1.5px solid #e2e8f0", borderRadius: "6px", background: "#fff", color: "#4f46e5", fontSize: "0.75rem", fontFamily: "inherit", cursor: "pointer" }}>
                      Insert Variable <ChevronDown size={12} />
                    </button>
                  </div>

                  {/* Toolbar */}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px 8px 0 0", padding: "8px 12px", background: "#f8fafc", display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                    <select style={{ padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "0.78rem", fontFamily: "inherit", background: "#fff", color: "#374151" }}>
                      <option>Paragraph</option><option>Heading 1</option><option>Heading 2</option>
                    </select>
                    <div style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 4px" }} />
                    {["B","I","U","S"].map(b => (
                      <button key={b} type="button" style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", borderRadius: "4px", color: "#374151", fontSize: "0.85rem", fontWeight: b === "B" ? 700 : 400, fontStyle: b === "I" ? "italic" : "normal", textDecoration: b === "U" ? "underline" : b === "S" ? "line-through" : "none" }}>{b}</button>
                    ))}
                    <div style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 4px" }} />
                    {["≡","•","1.","«","»","🔗","📷","</>"].map((icon, i) => (
                      <button key={i} type="button" style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", borderRadius: "4px", color: "#374151", fontSize: "0.9rem" }}>{icon}</button>
                    ))}
                  </div>
                  <textarea name="content" value={form.content} onChange={handleChange} rows={10}
                    className={`form-input${errors.content ? " error" : ""}`}
                    style={{ borderRadius: "0 0 8px 8px", resize: "vertical", minHeight: "200px" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    {errors.content && <p className="form-error">{errors.content}</p>}
                    <p style={{ margin: "0 0 0 auto", fontSize: "0.75rem", color: "#94a3b8" }}>{wordCount} words</p>
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input name="description" value={form.description} onChange={handleChange}
                    className="form-input" placeholder="Brief description of this template" />
                </div>
              </div>
            </div>

            {/* Variables Guide */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 18px" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Variables Guide</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {AVAILABLE_VARIABLES.map(v => (
                  <button key={v} type="button" onClick={() => insertVariable(v)}
                    style={{ padding: "4px 12px", border: "1.5px solid #e2e8f0", borderRadius: "6px", background: "#f8fafc", color: "#4f46e5", fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer", fontWeight: 500 }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Right — Settings + Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>⚙️ Template Settings</h3>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">Category</label>
                <div style={{ position: "relative" }}>
                  <select name="category" value={form.category} onChange={handleChange}
                    style={{ width: "100%", padding: "10px 32px 10px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", appearance: "none", cursor: "pointer" }}>
                    <option value="">Select category</option>
                    {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "block", marginBottom: "8px" }}>Template Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {(["Public", "Private"] as TemplateType[]).map(type => (
                    <button key={type} type="button" onClick={() => setForm(prev => ({ ...prev, type }))}
                      style={{ padding: "10px 8px", border: `2px solid ${form.type === type ? "#4f46e5" : "#e2e8f0"}`, borderRadius: "8px", background: form.type === type ? "#eef2ff" : "#fff", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                      <p style={{ margin: "0 0 2px", fontSize: "0.8rem", fontWeight: 700, color: form.type === type ? "#4f46e5" : "#374151" }}>{type === "Public" ? "👥" : "🔒"} {type}</p>
                      <p style={{ margin: 0, fontSize: "0.68rem", color: "#94a3b8" }}>{type === "Public" ? "Available to all users" : "Only visible to you"}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ display: "block", marginBottom: "8px" }}>Status</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, status: prev.status === "Active" ? "Inactive" : "Active" }))}
                    style={{ width: 44, height: 24, borderRadius: "9999px", border: "none", background: form.status === "Active" ? "#4f46e5" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                    <span style={{ position: "absolute", top: "2px", left: form.status === "Active" ? "22px" : "2px", width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
                  </button>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: form.status === "Active" ? "#16a34a" : "#64748b" }}>{form.status}</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>👁️ Preview</h3>
              {form.content ? (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", background: "#fafafa", fontSize: "0.78rem", color: "#374151", lineHeight: 1.8, maxHeight: "180px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                  {form.content.split(/({{[^}]+}})/).map((part, i) =>
                    part.startsWith("{{") && part.endsWith("}}") ? (
                      <span key={i} style={{ background: "#fef3c7", color: "#b45309", padding: "1px 4px", borderRadius: "3px", fontStyle: "italic" }}>[{part.replace(/[{}]/g, "")}]</span>
                    ) : part
                  )}
                </div>
              ) : (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", background: "#fafafa", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>📧<br />Preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
