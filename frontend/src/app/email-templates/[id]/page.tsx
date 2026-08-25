"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import { EmailTemplate, CATEGORY_COLORS } from "@/data/emailTemplates";
import {
  getEmailTemplate, mapEmailTemplateDetail,
  duplicateEmailTemplate,
  getEmailTemplateActivity, previewEmailTemplate,
  type TemplateActivityItem, type TemplatePreview,
} from "@/lib/emailTemplatesApi";
import { HiArrowLeft, HiPencil, HiDuplicate, HiMail, HiTag, HiUser, HiCalendar, HiClock, HiEye, HiDocumentText, HiCog, HiClipboardCopy } from "react-icons/hi";

type TabType = "overview" | "preview" | "details" | "activity";

export default function ViewEmailTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [copied, setCopied] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  // Preview tab: rendered via the backend preview endpoint.
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  // Activity tab: real audit entries from the backend.
  const [activity, setActivity] = useState<TemplateActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getEmailTemplate(id)
      .then(t => { if (!cancelled) setTemplate(mapEmailTemplateDetail(t)); })
      .catch(err => {
        if (cancelled) return;
        if (err instanceof Error && /not found|404/i.test(err.message)) setNotFound(true);
        else setLoadError(err instanceof Error ? err.message : "Failed to load template.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  // Lazily load the rendered preview when the tab is opened.
  useEffect(() => {
    if (activeTab !== "preview" || !id || preview || previewLoading) return;
    setPreviewLoading(true);
    setPreviewError("");
    previewEmailTemplate(id)
      .then(setPreview)
      .catch(err => setPreviewError(err instanceof Error ? err.message : "Failed to render preview."))
      .finally(() => setPreviewLoading(false));
  }, [activeTab, id, preview, previewLoading]);

  // Lazily load activity entries when the tab is opened.
  const loadActivity = useCallback(() => {
    if (!id || activityLoading) return;
    setActivityLoading(true);
    getEmailTemplateActivity(id)
      .then(setActivity)
      .catch(() => setActivity([]))
      .finally(() => setActivityLoading(false));
  }, [id, activityLoading]);

  useEffect(() => {
    if (activeTab === "activity") loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  function handleCopy() {
    if (!template) return;
    navigator.clipboard.writeText(template.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDuplicate() {
    if (duplicating) return;
    setDuplicating(true);
    try {
      const copy = await duplicateEmailTemplate(id);
      router.push(`/email-templates/${copy.id}`);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to duplicate template.");
      setDuplicating(false);
    }
  }

  if (loading) return (
    <DashboardLayout>
      <ThemeLoader label="Loading template..." />
    </DashboardLayout>
  );

  if (loadError && !template) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>⚠️</p>
        <h2>Something went wrong</h2>
        <p style={{ color: "#64748b" }}>{loadError}</p>
        <button className="save-company-btn" onClick={() => router.push("/email-templates")}>Back to Templates</button>
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

  const t = template!;
  const catStyle = CATEGORY_COLORS[t.category];

  const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <HiMail size={15} /> },
    { key: "preview", label: "Preview", icon: <HiEye size={15} /> },
    { key: "details", label: "Details", icon: <HiDocumentText size={15} /> },
    { key: "activity", label: "Activity", icon: <HiClock size={15} /> },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Back */}
        <button className="back-btn" onClick={() => router.push("/email-templates")}>
          <HiArrowLeft size={16} /> Back to Email Templates
        </button>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>{t.name}</h1>
              <span style={{ padding: "3px 10px", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 600, background: t.status === "Active" ? "#dcfce7" : "#f1f5f9", color: t.status === "Active" ? "#16a34a" : "#64748b", border: `1px solid ${t.status === "Active" ? "#86efac" : "#e2e8f0"}` }}>
                {t.status}
              </span>
            </div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>{t.description}</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => router.push(`/email-templates/${id}/edit`)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
              <HiPencil size={14} /> Edit Template
            </button>
            <button onClick={handleDuplicate} disabled={duplicating}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontWeight: 600, fontSize: "0.875rem", cursor: duplicating ? "wait" : "pointer", fontFamily: "inherit" }}>
              <HiDuplicate size={14} /> {duplicating ? "Duplicating..." : "Duplicate"}
            </button>
            <button style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "none", borderRadius: "8px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
              ••• More
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", borderBottom: "2px solid #e2e8f0", marginBottom: "20px" }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 20px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem", fontWeight: activeTab === tab.key ? 700 : 500, color: activeTab === tab.key ? "#4f46e5" : "#64748b", borderBottom: activeTab === tab.key ? "2px solid #4f46e5" : "2px solid transparent", marginBottom: "-2px", transition: "color 0.15s" }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>

          {/* Main content */}
          <div>
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Email Content */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <HiDocumentText size={16} color="#4f46e5" />
                      <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Email Content</h3>
                    </div>
                    <button onClick={handleCopy} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", border: "1.5px solid #e2e8f0", borderRadius: "6px", background: "#fff", color: "#475569", fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer" }}>
                      <HiClipboardCopy size={13} /> {copied ? "Copied!" : "Copy Content"}
                    </button>
                  </div>
                  <div style={{ padding: "20px", background: "#fafafa" }}>
                    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", fontSize: "0.9rem", lineHeight: 2, color: "#374151", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                      {t.content.split(/({{[^}]+}})/).map((part, i) =>
                        part.startsWith("{{") && part.endsWith("}}") ? (
                          <span key={i} style={{ background: "#eef2ff", color: "#4f46e5", padding: "1px 6px", borderRadius: "4px", fontWeight: 600, fontSize: "0.85rem" }}>{part}</span>
                        ) : part
                      )}
                    </div>
                  </div>
                </div>

                {/* Variables Used */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "0.65rem", color: "#4f46e5", fontWeight: 700 }}>i</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Variables Used</h3>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {t.variables.map(v => (
                      <span key={v} style={{ padding: "4px 12px", borderRadius: "6px", background: "#eef2ff", color: "#4f46e5", fontSize: "0.8rem", fontWeight: 600 }}>{v}</span>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <HiMail size={16} color="#4f46e5" />
                    <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Subject</h3>
                  </div>
                  <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem" }}>{t.subject}</p>
                </div>

                {/* Description */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <HiDocumentText size={16} color="#4f46e5" />
                    <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Description</h3>
                  </div>
                  <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem", lineHeight: 1.7 }}>{t.description}</p>
                </div>
              </div>
            )}

            {activeTab === "preview" && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Email Preview</h3>
                {previewLoading ? (
                  <ThemeLoader label="Rendering preview..." minHeight={160} size={36} />
                ) : previewError && !preview ? (
                  <div>
                    <div className="msg-error">{previewError}</div>
                    {/* Fallback: raw template with placeholders highlighted */}
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ background: "#f8fafc", padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "#94a3b8" }}>Subject: <strong style={{ color: "#374151" }}>{t.subject}</strong></p>
                      </div>
                      <div style={{ padding: "24px", fontSize: "0.9rem", lineHeight: 2, color: "#374151", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                        {t.content.split(/({{[^}]+}})/).map((part, i) =>
                          part.startsWith("{{") && part.endsWith("}}") ? (
                            <span key={i} style={{ background: "#fef3c7", color: "#b45309", padding: "1px 4px", borderRadius: "3px", fontStyle: "italic" }}>
                              [{part.replace(/[{}]/g, "")}]
                            </span>
                          ) : part
                        )}
                      </div>
                    </div>
                  </div>
                ) : preview ? (
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                    <div style={{ background: "#f8fafc", padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                      <p style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "#94a3b8" }}>Subject: <strong style={{ color: "#374151" }}>{preview.subject}</strong></p>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>Rendered with sample values</p>
                    </div>
                    <div style={{ padding: "24px", fontSize: "0.9rem", lineHeight: 2, color: "#374151", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                      {preview.rendered_content}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === "details" && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Template Details</h3>
                {[
                  { label: "Template ID", value: t.id },
                  { label: "Category", value: t.category },
                  { label: "Template Type", value: t.type },
                  { label: "Status", value: t.status },
                  { label: "Language", value: t.language },
                  { label: "Created By", value: t.createdBy },
                  { label: "Created At", value: new Date(t.createdAt).toLocaleString("en-US") },
                  { label: "Last Updated", value: new Date(t.updatedAt).toLocaleString("en-US") },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: "0.875rem", color: "#0f172a", fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "activity" && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Activity</h3>
                {activityLoading ? (
                  <ThemeLoader label="Loading activity..." minHeight={120} size={32} />
                ) : activity.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#94a3b8" }}>No activity recorded yet.</p>
                ) : (
                  activity.map(item => (
                    <div key={item.id} style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e2e8f0", flexShrink: 0, marginTop: "5px" }} />
                      <div>
                        <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>{item.action_display}</p>
                        {item.detail && <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>{item.detail}</p>}
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>by {item.user_name || "System"} · {new Date(item.timestamp).toLocaleString("en-US")}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Template Information */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <HiDocumentText size={15} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Template Information</h3>
              </div>
              {[
                { label: "Template ID", value: t.id },
                { label: "Category", value: <span style={{ padding: "2px 8px", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 600, background: catStyle.bg, color: catStyle.color }}>{t.category}</span> },
                { label: "Template Type", value: <span style={{ padding: "2px 8px", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 600, background: "#f1f5f9", color: "#475569" }}>{t.type}</span> },
                { label: "Status", value: <span style={{ padding: "2px 8px", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 600, background: t.status === "Active" ? "#dcfce7" : "#f1f5f9", color: t.status === "Active" ? "#16a34a" : "#64748b" }}>{t.status}</span> },
                { label: "Created By", value: t.createdBy },
                { label: "Created At", value: new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " + new Date(t.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
                { label: "Last Updated", value: new Date(t.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " + new Date(t.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: "12px" }}>
                  <p style={{ margin: "0 0 3px", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</p>
                  <div style={{ fontSize: "0.875rem", color: "#0f172a", fontWeight: 500 }}>{row.value}</div>
                </div>
              ))}
            </div>

            {/* Template Settings */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <HiCog size={15} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Template Settings</h3>
              </div>
              {[
                { label: "Subject", value: t.subject },
                { label: "Language", value: t.language },
                { label: "Status", value: t.status },
                { label: "Created By", value: t.createdBy },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: "12px" }}>
                  <p style={{ margin: "0 0 3px", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</p>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
