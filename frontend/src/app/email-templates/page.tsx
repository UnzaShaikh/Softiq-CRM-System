"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Pagination from "@/components/customers/Pagination";
import emailTemplatesData, { EmailTemplate, TemplateCategory, ALL_CATEGORIES, CATEGORY_COLORS } from "@/data/emailTemplates";
import { Plus, Search, Eye, Pencil, Trash2, Mail, ChevronDown } from "lucide-react";
import { HiPlus, HiSearch, HiEye, HiPencil, HiTrash, HiMail, HiChevronDown } from "react-icons/hi";

const ITEMS_PER_PAGE = 5;

function TemplateIcon({ category }: { category: TemplateCategory }) {
  const style = CATEGORY_COLORS[category];
  return (
    <div style={{ width: 38, height: 38, borderRadius: "10px", background: style.bg, display: "flex", alignItems: "center", justifyContent: "center", color: style.color, flexShrink: 0 }}>
      <Mail size={18} />
    </div>
  );
}

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>(emailTemplatesData);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All Categories" | TemplateCategory>("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<EmailTemplate | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return templates.filter(t => {
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
      const matchCat = categoryFilter === "All Categories" || t.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [templates, search, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); }

  function confirmDelete() {
    if (!deleteModal) return;
    setTemplates(prev => prev.filter(t => t.id !== deleteModal.id));
    showToast(`"${deleteModal.name}" deleted successfully.`);
    setDeleteModal(null);
  }

  function formatDate(str: string) {
    return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + "\n" +
      new Date(str).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Email Templates</h1>
            <p className="page-subtitle">Create and manage email templates for consistent communication.</p>
          </div>
          <button className="btn-add" onClick={() => router.push("/email-templates/new")}>
            <HiPlus size={16} /> Add Template
          </button>
        </div>

        {/* Table Card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

          {/* Search + Filter toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
              <HiSearch size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search templates by name or subject..."
                style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", color: "#0f172a", fontSize: "0.875rem", fontFamily: "inherit", outline: "none" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.background = "#fff"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
              />
            </div>

            {/* Result count */}
            <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}>{filtered.length} results</span>

            {/* Category filter */}
            <div style={{ position: "relative" }}>
              <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value as "All Categories" | TemplateCategory); setCurrentPage(1); }}
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
                <option value="All Categories">All Categories</option>
                {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <HiChevronDown size={14} style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="empty-state">
            <HiMail size={40} color="#cbd5e1" style={{ margin: "0 auto 12px", display: "block" }} />
              <p className="empty-state-title">No templates found</p>
              <p className="empty-state-sub">Try adjusting your search or create a new template.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "inherit" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    { label: "TEMPLATE NAME", width: "35%" },
                    { label: "SUBJECT", width: "30%" },
                    { label: "LAST UPDATED", width: "20%" },
                    { label: "ACTIONS", width: "15%" },
                  ].map(col => (
                    <th key={col.label} style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", borderBottom: "1px solid #e2e8f0", width: col.width }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((template, idx) => {
                  const isLast = idx === paginated.length - 1;
                  return (
                    <tr key={template.id}
                      style={{ transition: "background 0.1s", borderBottom: isLast ? "none" : "1px solid #f1f5f9" }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                    >
                      {/* Template Name */}
                      <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <TemplateIcon category={template.category} />
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{template.name}</p>
                            <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "9999px", background: CATEGORY_COLORS[template.category].bg, color: CATEGORY_COLORS[template.category].color, fontWeight: 500 }}>
                              {template.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                        <span style={{ fontSize: "0.875rem", color: "#475569" }}>{template.subject}</span>
                      </td>

                      {/* Last Updated */}
                      <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                        <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>
                          {new Date(template.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>
                          {new Date(template.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                          <button onClick={() => router.push(`/email-templates/${template.id}`)} title="View"
                            style={{ width: 30, height: 30, borderWidth: "1.5px", borderStyle: "solid", borderColor: "#e2e8f0", borderRadius: "7px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5", padding: 0, transition: "all 0.12s ease" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#eef2ff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#a5b4fc"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}
                          ><HiEye size={14} /></button>

                          <button onClick={() => router.push(`/email-templates/${template.id}/edit`)} title="Edit"
                            style={{ width: 30, height: 30, borderWidth: "1.5px", borderStyle: "solid", borderColor: "#e2e8f0", borderRadius: "7px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#0891b2", padding: 0, transition: "all 0.12s ease" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ecfeff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#a5f3fc"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}
                          ><HiPencil size={13} /></button>

                          <button onClick={() => setDeleteModal(template)} title="Delete"
                            style={{ width: 30, height: 30, borderWidth: "1.5px", borderStyle: "solid", borderColor: "#e2e8f0", borderRadius: "7px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", padding: 0, transition: "all 0.12s ease" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#fca5a5"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}
                          ><HiTrash size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                Showing <strong>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}</strong> to{" "}
                <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of{" "}
                <strong>{filtered.length}</strong> templates
              </p>
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal — reference design exact match */}
      {deleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteModal(null); }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px 28px", maxWidth: "420px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center", position: "relative" }}>
            {/* Close */}
            <button onClick={() => setDeleteModal(null)} style={{ position: "absolute", top: "16px", right: "16px", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1.25rem", display: "flex", alignItems: "center" }}>✕</button>

            {/* Icon */}
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <HiTrash size={26} color="#ef4444" />
            </div>

            <h2 style={{ margin: "0 0 10px", fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>Delete Email Template?</h2>
            <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Are you sure you want to delete{" "}
              <strong style={{ color: "#4f46e5" }}>&ldquo;{deleteModal.name}&rdquo;</strong>?{" "}
              This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={() => setDeleteModal(null)}
                style={{ flex: 1, padding: "11px 20px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#fff"}
              >Cancel</button>
              <button onClick={confirmDelete}
                style={{ flex: 1, padding: "11px 20px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "opacity 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}
              ><Trash2 size={15} /> Delete Template</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
          {toastMsg}
        </div>
      )}
    </DashboardLayout>
  );
}
