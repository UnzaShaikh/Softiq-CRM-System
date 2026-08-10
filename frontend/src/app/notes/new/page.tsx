"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ALL_CATEGORIES, NoteCategory, NotePriority, CATEGORY_COLORS } from "@/data/notes";
import { ArrowLeft, FileText, X } from "lucide-react";

interface FormValues {
  title: string;
  category: NoteCategory | "";
  priority: NotePriority | "";
  tags: string[];
  content: string;
  relatedTo: string;
}

interface FormErrors {
  title?: string;
  category?: string;
  priority?: string;
  content?: string;
}

export default function NewNotePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>({ title: "", category: "", priority: "", tags: [], content: "", relatedTo: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.category) e.category = "Please select a category";
    if (!form.priority) e.priority = "Please select a priority";
    if (!form.content.trim()) e.content = "Content is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => router.push("/notes"), 1500);
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <button className="back-btn" onClick={() => router.push("/notes")}>
          <ArrowLeft size={16} /> Back to Notes
        </button>

        {success && (
          <div className="msg-success" style={{ marginBottom: "20px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Note created successfully! Redirecting...
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>

          {/* Main Form */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 34, height: 34, borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={16} color="#4f46e5" />
                </div>
                <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>New Note</h2>
              </div>
              <button onClick={() => router.push("/notes")} style={{ width: 32, height: 32, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", borderRadius: "6px" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Title */}
                <div className="form-group">
                  <label className="form-label">Title <span style={{ color: "var(--error)" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <input name="title" value={form.title} onChange={handleChange} maxLength={200}
                      className={`form-input${errors.title ? " error" : ""}`}
                      placeholder="Enter note title..." />
                    <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: "#94a3b8" }}>{form.title.length}/200</span>
                  </div>
                  {errors.title && <p className="form-error">{errors.title}</p>}
                </div>

                {/* Category + Priority */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Category <span style={{ color: "var(--error)" }}>*</span></label>
                    <select name="category" value={form.category} onChange={handleChange}
                      className={`form-input${errors.category ? " error" : ""}`} style={{ cursor: "pointer" }}>
                      <option value="">Select category</option>
                      {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="form-error">{errors.category}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority <span style={{ color: "var(--error)" }}>*</span></label>
                    <select name="priority" value={form.priority} onChange={handleChange}
                      className={`form-input${errors.priority ? " error" : ""}`} style={{ cursor: "pointer" }}>
                      <option value="">Select priority</option>
                      <option value="High Priority">High Priority</option>
                      <option value="Medium Priority">Medium Priority</option>
                      <option value="Low Priority">Low Priority</option>
                    </select>
                    {errors.priority && <p className="form-error">{errors.priority}</p>}
                  </div>
                </div>

                {/* Tags */}
                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <div style={{ border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "8px 12px", display: "flex", flexWrap: "wrap", gap: "6px", background: "#fff", minHeight: "44px", cursor: "text" }}
                    onClick={() => document.getElementById("new-tag-input")?.focus()}>
                    {form.tags.map(tag => (
                      <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 500, background: "#eef2ff", color: "#4f46e5" }}>
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "#4f46e5", display: "flex", alignItems: "center" }}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input id="new-tag-input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                      placeholder={form.tags.length === 0 ? "Add a tag..." : ""}
                      style={{ border: "none", outline: "none", fontSize: "0.875rem", flex: 1, minWidth: "100px", fontFamily: "inherit", background: "transparent" }} />
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>Press Enter to add a tag</p>
                </div>

                {/* Note Content */}
                <div className="form-group">
                  <label className="form-label">Note Content <span style={{ color: "var(--error)" }}>*</span></label>
                  <div style={{ border: "1.5px solid #e2e8f0", borderRadius: "8px 8px 0 0", padding: "8px 12px", background: "#f8fafc", display: "flex", alignItems: "center", gap: "4px", borderBottom: "none" }}>
                    {["B", "I", "U"].map(f => (
                      <button key={f} type="button" style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", borderRadius: "4px", fontWeight: f === "B" ? 700 : 400, fontStyle: f === "I" ? "italic" : "normal", textDecoration: f === "U" ? "underline" : "none", color: "#374151", fontSize: "0.8rem" }}>{f}</button>
                    ))}
                    <div style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 4px" }} />
                    {["≡", "•"].map(f => (
                      <button key={f} type="button" style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", borderRadius: "4px", color: "#374151", fontSize: "1rem" }}>{f}</button>
                    ))}
                  </div>
                  <textarea name="content" value={form.content} onChange={handleChange} rows={12}
                    className={`form-input${errors.content ? " error" : ""}`}
                    style={{ borderRadius: "0 0 8px 8px", resize: "vertical", minHeight: "240px" }}
                    placeholder="Write your note content here..." />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    {errors.content && <p className="form-error">{errors.content}</p>}
                    <p style={{ margin: "0 0 0 auto", fontSize: "0.75rem", color: "#94a3b8" }}>
                      {form.content.split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => router.push("/notes")}>Cancel</button>
                <button type="submit" className="btn-add" disabled={saving || success}>
                  {saving ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>
                  ) : success ? "✓ Saved!" : "+ New Note"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Tips */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", height: "fit-content" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>💡 Tips</h3>
            {[
              "Use tags to organize and find notes quickly.",
              "Set High Priority for urgent or important notes.",
              "Link notes to customers or deals for context.",
              "Use clear, descriptive titles for easy search.",
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f46e5", flexShrink: 0, marginTop: "6px" }} />
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.5 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
