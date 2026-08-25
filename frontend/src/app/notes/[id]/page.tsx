"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import { Note, CATEGORY_COLORS, PRIORITY_COLORS } from "@/data/notes";
import { getNote, deleteNote, mapApiNoteToUi, listCategories } from "@/lib/notesApi";
import { ArrowLeft, Edit, Star, FileText, Tag, Calendar, Clock, Building2, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";

export default function ViewNotePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    async function fetchNote() {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setNotFound(false);
      setError(null);
      try {
        console.log("Fetching note with ID:", id);
        const cats = await listCategories();
        const apiNote = await getNote(id);
        console.log("API response:", apiNote);
        setNote(mapApiNoteToUi(apiNote, cats));
      } catch (err) {
        console.error("Error fetching note:", err);
        setNotFound(true);
        setError(err instanceof Error ? err.message : "Failed to load note.");
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [id]);

  async function handleDelete() {
    if (!note) return;
    try {
      await deleteNote(note.id);
      setDeleteModal(false);
      setDeleteSuccess(true);
      setTimeout(() => router.push("/notes"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note.");
      setDeleteModal(false);
    }
  }

  if (loading) return (
    <DashboardLayout>
      <ThemeLoader label="Loading note..." />
    </DashboardLayout>
  );

  if (notFound || !note) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>📝</p>
        <h2>Note Not Found</h2>
        <p>No note found with ID: {id}</p>
        {error && <p style={{ color: "#ef4444", fontSize: "0.8rem" }}>{error}</p>}
        <button className="btn-add" onClick={() => router.push("/notes")}>Back to Notes</button>
      </div>
    </DashboardLayout>
  );

  const catStyle = CATEGORY_COLORS[note.category];
  const priStyle = PRIORITY_COLORS[note.priority];

  function formatDate(str: string) {
    return new Date(str).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <button className="back-btn" onClick={() => router.push("/notes")}>
            <ArrowLeft size={16} />
            Back to Notes
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => router.push(`/notes/${id}/edit`)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 16px" }}>
              <Edit size={14} /> Edit
            </button>
            <button style={{ width: 34, height: 34, border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: note.isStarred ? "#f59e0b" : "#94a3b8" }}>
              <Star size={14} fill={note.isStarred ? "#f59e0b" : "none"} />
            </button>
            <button onClick={() => setDeleteModal(true)} style={{ width: 34, height: 34, border: "1.5px solid #fca5a5", borderRadius: "8px", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                <span style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, background: catStyle.bg, color: catStyle.color }}>{note.category}</span>
                <span style={{ padding: "4px 12px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 600, background: priStyle.bg, color: priStyle.color, border: `1px solid ${priStyle.border}` }}>{note.priority}</span>
              </div>

              <h1 style={{ margin: "0 0 16px", fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>{note.title}</h1>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.75rem" }}>
                  {note.authorInitials}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: "#0f172a" }}>{note.author}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>
                    Created {formatDate(note.createdAt)} · Updated {formatDate(note.updatedAt)}
                  </p>
                </div>
              </div>

              {note.tags.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
                  {note.tags.map(tag => (
                    <span key={tag.id} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500, background: "#f1f5f9", color: "#475569" }}>
                      <Tag size={11} />{tag.label}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ height: 1, background: "#f1f5f9", marginBottom: "20px" }} />

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <FileText size={16} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Note Content</h3>
                <button onClick={() => router.push(`/notes/${id}/edit`)} style={{ marginLeft: "auto", padding: "4px 12px", border: "1.5px solid #e2e8f0", borderRadius: "6px", background: "#fff", color: "#475569", fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer", fontWeight: 500 }}>Edit</button>
              </div>

              <div style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {note.content}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>Was this note helpful?</span>
                <button style={{ width: 30, height: 30, border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}><ThumbsUp size={14} /></button>
                <button style={{ width: 30, height: 30, border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}><ThumbsDown size={14} /></button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                <FileText size={15} color="#4f46e5" /> Note Details
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Category", value: <span style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "0.8rem", fontWeight: 600, background: catStyle.bg, color: catStyle.color }}>{note.category}</span> },
                  { label: "Tags", value: <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>{note.tags.map(t => <span key={t.id} style={{ padding: "2px 8px", borderRadius: "9999px", fontSize: "0.72rem", background: "#eef2ff", color: "#4f46e5", fontWeight: 500 }}>{t.label}</span>)}</div> },
                  ...(note.relatedTo ? [{ label: "Related To", value: <span style={{ color: "#4f46e5", fontSize: "0.875rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}><Building2 size={13} />{note.relatedTo}</span> }] : []),
                  { label: "Created", value: <span style={{ fontSize: "0.8125rem", color: "#374151" }}>{formatDate(note.createdAt)}</span> },
                  { label: "Last Updated", value: <span style={{ fontSize: "0.8125rem", color: "#374151" }}>{formatDate(note.updatedAt)}</span> },
                ].map(row => (
                  <div key={row.label}>
                    <p style={{ margin: "0 0 4px", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</p>
                    <div>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={15} color="#4f46e5" /> Activity
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { action: "Note updated", time: formatDate(note.updatedAt), by: note.author },
                  { action: "Note created", time: formatDate(note.createdAt), by: note.author },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e2e8f0", flexShrink: 0, marginTop: "5px" }} />
                    <div>
                      <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }}>{item.action}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>by {item.by}</p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {deleteModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteModal(false); }}>
          <div className="modal-box">
            <div className="modal-icon"><Trash2 size={24} color="#ef4444" /></div>
            <h2 className="modal-title">Delete Note</h2>
            <p className="modal-text">Are you sure you want to delete <strong style={{ color: "var(--foreground)" }}>{note.title}</strong>? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteSuccess && (
        <div className="toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
          Note deleted successfully.
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}