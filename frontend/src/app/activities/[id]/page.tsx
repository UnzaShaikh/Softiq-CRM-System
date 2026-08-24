"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ActivityStatusBadge, ActivityTypeBadge, ActivityPriorityBadge } from "@/components/activities/ActivityStatusBadge";
import { ApiActivity, ActivityStatus, toActivity, STATUS_TO_API, apiErrorMessage } from "@/data/activity";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";
import { Calendar, Clock, MapPin, User, Tag, FileText } from "lucide-react";
import ThemeLoader from "@/components/ui/ThemeLoader";

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [activity, setActivity] = useState<ApiActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await apiRequest<ApiActivity>(`/api/activities/${id}/`);
        if (cancelled) return;
        setActivity(data);
      } catch (err) {
        if (cancelled) return;
        setError(apiErrorMessage(err));
        setNotFound(true);
        if (!getAccessToken()) router.push("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [id, router]);

  async function handleStatusChange(status: ActivityStatus) {
    if (!activity) return;
    setBusy(true);
    try {
      const updated = await apiRequest<ApiActivity>(`/api/activities/${activity.id}/status/`, {
        method: "PATCH",
        body: { status: STATUS_TO_API[status] },
      });
      emitDataChanged();
      setActivity(updated);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return (
    <DashboardLayout>
      <ThemeLoader label="Loading activity..." />
    </DashboardLayout>
  );

  if (notFound || !activity) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Activity Not Found</h2>
        <p>{error || `No activity found with ID: ${id}`}</p>
        <button className="btn-add" onClick={() => router.push("/activities")}>Back to Activities</button>
      </div>
    </DashboardLayout>
  );

  const model = toActivity(activity);
  const actionable = model.status === "Scheduled" || model.status === "Overdue";

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <button className="back-btn" onClick={() => router.push("/activities")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Activities
        </button>

        {error && !notFound && <div className="msg-error">{error}</div>}

        {/* Profile Card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "24px 28px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", border: "3px solid rgba(255,255,255,0.4)", flexShrink: 0 }}>
                {model.type === "Call" ? "📞" : model.type === "Meeting" ? "🤝" : model.type === "Email" ? "✉️" : model.type === "Task" ? "✅" : "🔄"}
              </div>
              <div>
                <h1 style={{ margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 700, color: "#ffffff" }}>{model.title}</h1>
                <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)" }}>{model.relatedTo} · {model.relatedType}</p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <ActivityTypeBadge type={model.type} />
                  <ActivityStatusBadge status={model.status} />
                  <ActivityPriorityBadge priority={model.priority} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {actionable && (
                <>
                  <button className="btn-add" onClick={() => handleStatusChange("Completed")} disabled={busy}
                    style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.4)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Mark Completed
                  </button>
                  <button className="btn-secondary" onClick={() => handleStatusChange("Cancelled")} disabled={busy}
                    style={{ color: "#dc2626", borderColor: "#fca5a5", background: "rgba(255,255,255,0.15)" }}>
                    Cancel Activity
                  </button>
                </>
              )}
              <button className="btn-secondary" onClick={() => router.push(`/activities/${id}/edit`)}
                style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Edit Activity
              </button>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>Schedule Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Date", value: new Date(`${model.date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }), icon: <Calendar size={15} color="#4f46e5" /> },
                { label: "Time", value: `${model.time} · ${model.duration} minutes`, icon: <Clock size={15} color="#4f46e5" /> },
                { label: "Location", value: model.location || "—", icon: <MapPin size={15} color="#4f46e5" /> },
                { label: "Assigned To", value: model.assignedTo || "—", icon: <User size={15} color="#4f46e5" /> },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#0f172a", fontWeight: 600 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>Related Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Related To", value: model.relatedTo || "—", icon: <User size={15} color="#4f46e5" /> },
                { label: "Related Type", value: model.relatedType || "—", icon: <Tag size={15} color="#4f46e5" /> },
                { label: "Activity ID", value: String(model.id), icon: <Tag size={15} color="#4f46e5" /> },
                { label: "Created", value: model.createdDate ? new Date(`${model.createdDate}T00:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—", icon: <Calendar size={15} color="#4f46e5" /> },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#0f172a", fontWeight: 600 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {model.description && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 28, height: 28, borderRadius: "7px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={14} color="#4f46e5" />
              </div>
              Description
            </h3>
            <p style={{ margin: 0, color: "#475569", fontSize: "0.875rem", lineHeight: 1.7 }}>{model.description}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
