"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import { NoteCategory, NotePriority, ALL_CATEGORIES, CATEGORY_COLORS } from "@/data/notes";
import {
  getNote,
  updateNote,
  listCategories,
  mapApiNoteToUi,
  PRIORITY_TO_API,
  ApiNoteCategory,
} from "@/lib/notesApi";
import { X } from "lucide-react";

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

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<FormValues>({ title: "", category: "", priority: "", tags: [], content: "", relatedTo: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [apiCategories, setApiCategories] = useState<ApiNoteCategory[]>([]);

  useEffect(() => {
    async function fetchNote() {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const cats = await listCategories();
        setApiCategories(cats);
        const apiNote = await getNote(id);
        const uiNote = mapApiNoteToUi(apiNote, cats);
        setForm({
          title: uiNote.title,
          category: uiNote.category,
          priority: uiNote.priority,
          tags: uiNote.tags.map(t => t.label),
          content: uiNote.content,
          relatedTo: uiNote.relatedTo || "",
        });
      } catch (err) {
        console.error("Error fetching note for edit:", err);
        setNotFound(true);
        setApiError(err instanceof Error ? err.message : "Failed to load note.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchNote();
  }, [id]);

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
    setApiError(null);
    try {
      const matchedCategory = apiCategories.find(c => c.name === form.category);

      await updateNote(id, {
        title: form.title,
        content: form.content,
        category: matchedCategory ? matchedCategory.id : null,
        priority: PRIORITY_TO_API[form.priority as NotePriority],
        tags: form.tags,
      });

      setSaving(false);
      setSuccess(true);
      setTimeout(() => router.push(`/notes/${id}`), 1500);
    } catch (err) {
      setSaving(false);
      setApiError(err instanceof Error ? err.message : "Failed to save note.");
    }
  }

  if (loading) return (
    <DashboardLayout>
      <ThemeLoader label="Loading note..." />
    </DashboardLayout>
  );

  if (notFound) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>📝</p>
        <h2>Note Not Found</h2>
        {apiError && <p style={{ color: "#ef4444", fontSize: "0.8rem" }}>{apiError}</p>}
        <button className="btn-add" onClick={() => router.push("/notes")}>Back to Notes</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Page Header */}
        <div>
          <button className="back-btn" onClick={() => router.push(`/notes/${id}`)} style={{ marginBottom: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Notes
          </button>
          <h1 className="page-title">Edit Note</h1>
          <p className="page-subtitle">Update the note details below.</p>
        </div>

        {success && (
          <div className="msg-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Note updated successfully! Redirecting...
          </div>
        )}
        {apiError && <div className="msg-error">{apiError}</div>}

        {/* Form Card */}
        <form onSubmit={handleSubmit} noValidate className="company-form-card">
          <div className="form-section">
            <div className="form-section-header">
              <h2>Note Details</h2>
              <p>Update all the required fields below.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <div style={{ position: "relative" }}>
                    <select name="category" value={form.category} onChange={handleChange}
                      className={`form-input${errors.category ? " error" : ""}`}
                      style={{ cursor: "pointer" }}>
                      <option value="">Select category</option>
                      {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {form.category && (
                      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", padding: "2px 8px", borderRadius: "5px", fontSize: "0.72rem", fontWeight: 600, background: CATEGORY_COLORS[form.category as NoteCategory]?.bg, color: CATEGORY_COLORS[form.category as NoteCategory]?.color, pointerEvents: "none" }}>
                        {form.category}
                      </span>
                    )}
                  </div>
                  {errors.category && <p className="form-error">{errors.category}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select name="priority" value={form.priority} onChange={handleChange}
                    className={`form-input${errors.priority ? " error" : ""}`}
                    style={{ cursor: "pointer" }}>
                    <option value="">Select priority</option>
                    <option value="High Priority">High Priority</option>
                    <option value="Medium Priority">Medium Priority</option>
                    <option value="Low Priority">Low Priority</option>
                  </select>
                  {errors.priority && <p className="form-error">{errors.priority}</p>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags</label>
                <div style={{ border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "8px 12px", display: "flex", flexWrap: "wrap", gap: "6px", background: "#fff", minHeight: "44px" }}
                  onClick={() => document.getElementById("tag-input")?.focus()}>
                  {form.tags.map(tag => (
                    <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 500, background: "#eef2ff", color: "#4f46e5" }}>
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "#4f46e5", display: "flex", alignItems: "center" }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input id="tag-input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                    placeholder={form.tags.length === 0 ? "Add a tag..." : ""}
                    style={{ border: "none", outline: "none", fontSize: "0.875rem", flex: 1, minWidth: "100px", fontFamily: "inherit", background: "transparent" }} />
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>Press Enter to add a tag</p>
              </div>

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
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => router.push(`/notes/${id}`)}>Cancel</button>
            <button type="submit" className="btn-add" disabled={saving || success}>
              {saving ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>) : success ? "Saved!" : "Save Note"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}