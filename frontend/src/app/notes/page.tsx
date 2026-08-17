"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";
import notesData, { Note, NoteCategory, ALL_CATEGORIES, CATEGORY_COLORS, PRIORITY_COLORS } from "@/data/notes";
import { FileText, Pin, Archive, Star, MoreHorizontal, Edit, Eye, Trash2, Plus, Tag } from "lucide-react";

const ITEMS_PER_PAGE = 9;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function NoteCard({ note, onView, onEdit, onDelete }: { note: Note; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const catStyle = CATEGORY_COLORS[note.category];
  const priStyle = PRIORITY_COLORS[note.priority];

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "box-shadow 0.15s ease, transform 0.15s ease", cursor: "pointer", position: "relative" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
      onClick={onView}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "8px", background: catStyle.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileText size={16} color={catStyle.color} />
          </div>
          {note.isPinned && <Pin size={14} color="#4f46e5" />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={e => e.stopPropagation()}>
          <button style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", color: note.isStarred ? "#f59e0b" : "#94a3b8" }}
            title="Star">
            <Star size={14} fill={note.isStarred ? "#f59e0b" : "none"} />
          </button>
          <div style={{ position: "relative" }}>
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
              style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", color: "#94a3b8" }}>
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "4px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, minWidth: "140px", overflow: "hidden" }}>
                {[
                  { label: "View", icon: <Eye size={14} />, action: onView, color: "#374151" },
                  { label: "Edit", icon: <Edit size={14} />, action: onEdit, color: "#374151" },
                  { label: "Delete", icon: <Trash2 size={14} />, action: onDelete, color: "#ef4444" },
                ].map(item => (
                  <button key={item.label} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); item.action(); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", border: "none", background: "transparent", cursor: "pointer", fontSize: "0.875rem", fontFamily: "inherit", color: item.color, transition: "background 0.1s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                  >{item.icon}{item.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 style={{ margin: "0 0 6px", fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>{note.title}</h3>
        <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {note.content.split("\n")[0]}
        </p>
      </div>

      {/* Category + Priority */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 600, background: catStyle.bg, color: catStyle.color }}>
          {note.category}
        </span>
        <span style={{ padding: "3px 10px", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 600, background: priStyle.bg, color: priStyle.color, border: `1px solid ${priStyle.border}` }}>
          {note.priority}
        </span>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
          {note.tags.slice(0, 3).map(tag => (
            <span key={tag.id} style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 8px", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 500, background: "#f1f5f9", color: "#475569" }}>
              <Tag size={10} />
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #f1f5f9", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: "#fff" }}>
            {note.authorInitials}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{timeAgo(note.updatedAt)}</span>
        </div>
        {note.relatedTo && (
          <span style={{ fontSize: "0.72rem", color: "#4f46e5", fontWeight: 500 }}>{note.relatedTo}</span>
        )}
      </div>
    </div>
  );
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(notesData);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | NoteCategory>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<Note | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return notes.filter(n => {
      const matchSearch = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.label.toLowerCase().includes(q));
      const matchCat = categoryFilter === "All" || n.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [notes, search, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);

  const pinned = notes.filter(n => n.isPinned).length;
  const archived = notes.filter(n => n.isArchived).length;
  const categories = new Set(notes.map(n => n.category)).size;

  function handleDelete(note: Note) {
    setDeleteModal(note);
  }

  function confirmDelete() {
    if (!deleteModal) return;
    setNotes(prev => prev.filter(n => n.id !== deleteModal.id));
    setDeleteModal(null);
    setDeleteSuccess(true);
    setTimeout(() => setDeleteSuccess(false), 3000);
  }

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Notes</h1>
            <p className="page-subtitle">Capture, organize and find your important notes</p>
          </div>
          <button className="btn-add" onClick={() => router.push("/notes/new")}>
            <Plus size={16} />
            New Note
          </button>
        </div>

        {/* Stats row */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { label: "All Notes", value: notes.length, icon: <FileText size={20} />, color: "#4f46e5", bg: "#eef2ff" },
            { label: "Categories", value: categories, icon: <Tag size={20} />, color: "#7c3aed", bg: "#faf5ff" },
            { label: "Pinned", value: pinned, icon: <Pin size={20} />, color: "#0891b2", bg: "#ecfeff" },
            { label: "Archived", value: archived, icon: <Archive size={20} />, color: "#64748b", bg: "#f1f5f9" },
          ].map(card => (
            <div key={card.label} className="stat-card">
              <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
              <div>
                <p className="stat-card-value" style={{ color: card.color }}>{card.value}</p>
                <p className="stat-card-label">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My Notes section */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

          {/* Toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>My Notes</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, maxWidth: "500px", justifyContent: "flex-end" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <SearchBar value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Search notes..." resultCount={filtered.length} />
              </div>
              {/* Category dropdown */}
              {/* Category dropdown */}
              <div style={{ position: "relative" }}>
                <select
                  value={categoryFilter}
                  onChange={e => { setCategoryFilter(e.target.value as "All" | NoteCategory); setCurrentPage(1); }}
                  style={{
                    padding: "8px 36px 8px 14px",
                    borderWidth: "1.5px",
                    borderStyle: "solid",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#374151",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                    WebkitAppearance: "none",
                    fontWeight: 500,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)"; }}
                >
                  <option value="All">All Categories</option>
                  {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg
                  style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Notes grid */}
          <div style={{ padding: "20px" }}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} color="#cbd5e1" style={{ margin: "0 auto 12px", display: "block" }} />
                <p className="empty-state-title">No notes found</p>
                <p className="empty-state-sub">Try adjusting your search or create a new note.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {paginated.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onView={() => router.push(`/notes/${note.id}`)}
                    onEdit={() => router.push(`/notes/${note.id}/edit`)}
                    onDelete={() => handleDelete(note)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div style={{ padding: "4px 20px 16px", borderTop: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                  Showing <strong>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}</strong> to{" "}
                  <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of{" "}
                  <strong>{filtered.length}</strong> notes
                </p>
                <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteModal(null); }}>
          <div className="modal-box">
            <div className="modal-icon">
              <Trash2 size={24} color="#ef4444" />
            </div>
            <h2 className="modal-title">Delete Note</h2>
            <p className="modal-text">
              Are you sure you want to delete <strong style={{ color: "var(--foreground)" }}>{deleteModal.title}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Toast */}
      {deleteSuccess && (
        <div className="toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Note deleted successfully.
        </div>
      )}
    </DashboardLayout>
  );
}