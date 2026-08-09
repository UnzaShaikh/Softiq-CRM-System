"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ActivityStatusBadge, ActivityTypeBadge, ActivityPriorityBadge } from "@/components/activities/ActivityStatusBadge";
import { activities as activitiesData, Activity } from "@/data/activities";
import { Calendar, Clock, MapPin, User, Tag, FileText } from "lucide-react";
import ThemeLoader from "@/components/ui/ThemeLoader";

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const found = activitiesData.find(a => a.id === id);
      if (!found) setNotFound(true);
      else setActivity(found);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return (
    <DashboardLayout>
      <ThemeLoader label="Loading activity..." />
    </DashboardLayout>
  );

  if (notFound) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Activity Not Found</h2>
        <p>No activity found with ID: {id}</p>
        <button className="btn-add" onClick={() => router.push("/activities")}>Back to Activities</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="detail-wrapper">
        <button className="back-btn" onClick={() => router.push("/activities")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Activities
        </button>

        {/* Profile Card */}
        <div className="detail-profile-card">
          <div className="detail-profile-banner" />
          <div className="detail-profile-body">
            <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem" }}>
              <div className="detail-avatar" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", fontSize: "1.25rem" }}>
                {activity!.type === "Call" ? "📞" : activity!.type === "Meeting" ? "🤝" : activity!.type === "Email" ? "✉️" : activity!.type === "Task" ? "✅" : "🔄"}
              </div>
              <div style={{ paddingBottom: "4px" }}>
                <h1 className="detail-name">{activity!.title}</h1>
                <p className="detail-meta">{activity!.relatedTo} · {activity!.relatedType}</p>
                <div className="detail-badges">
                  <ActivityTypeBadge type={activity!.type} />
                  <ActivityStatusBadge status={activity!.status} />
                  <ActivityPriorityBadge priority={activity!.priority} />
                </div>
              </div>
            </div>
            <button className="btn-add" onClick={() => router.push(`/activities/${id}/edit`)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              Edit Activity
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="detail-grid">
          <div className="detail-info-card">
            <h3 className="detail-info-title">Schedule Information</h3>
            {[
              { label: "Date", value: new Date(activity!.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }), icon: <Calendar size={15} color="#64748b" /> },
              { label: "Time", value: `${activity!.time} · ${activity!.duration} minutes`, icon: <Clock size={15} color="#64748b" /> },
              { label: "Location", value: activity!.location || "—", icon: <MapPin size={15} color="#64748b" /> },
              { label: "Assigned To", value: activity!.assignedTo || "—", icon: <User size={15} color="#64748b" /> },
            ].map(item => (
              <div key={item.label} className="detail-info-row">
                <span className="detail-info-icon">{item.icon}</span>
                <div>
                  <p className="detail-info-label">{item.label}</p>
                  <p className="detail-info-value">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="detail-info-card">
            <h3 className="detail-info-title">Related Information</h3>
            {[
              { label: "Related To", value: activity!.relatedTo, icon: <User size={15} color="#64748b" /> },
              { label: "Related Type", value: activity!.relatedType, icon: <Tag size={15} color="#64748b" /> },
              { label: "Activity ID", value: activity!.id, icon: <Tag size={15} color="#64748b" /> },
              { label: "Created", value: new Date(activity!.createdDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), icon: <Calendar size={15} color="#64748b" /> },
            ].map(item => (
              <div key={item.label} className="detail-info-row">
                <span className="detail-info-icon">{item.icon}</span>
                <div>
                  <p className="detail-info-label">{item.label}</p>
                  <p className="detail-info-value">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {activity!.description && (
          <div className="detail-info-card" style={{ marginTop: "1rem" }}>
            <h3 className="detail-info-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={16} color="#64748b" /> Description
            </h3>
            <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem", lineHeight: 1.7 }}>{activity!.description}</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
