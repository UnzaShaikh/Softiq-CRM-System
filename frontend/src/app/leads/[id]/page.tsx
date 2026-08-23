"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LeadStatusBadge from "@/components/leads/LeadStatusBadge";
import { ApiLead, Lead, toLead } from "@/data/leads";
import { apiRequest, getAccessToken } from "@/lib/api";
import ThemeLoader from "@/components/ui/ThemeLoader";

const AVATAR_COLORS: [string, string][] = [
  ["#4f46e5", "#7c3aed"], ["#0891b2", "#0e7490"],
  ["#059669", "#047857"], ["#d97706", "#b45309"],
  ["#dc2626", "#b91c1c"], ["#7c3aed", "#6d28d9"],
];

function getAvatarColor(name: string): [string, string] {
  const idx = ((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function scoreColor(score: number): string {
  if (score >= 85) return "#16a34a";
  if (score >= 65) return "#d97706";
  return "#dc2626";
}

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await apiRequest<ApiLead>(`/api/leads/${id}/`);
        if (cancelled) return;
        setLead(toLead(data));
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        if (!getAccessToken()) router.push("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <ThemeLoader label="Loading lead..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
      <div className="not-found-state">
          <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
          <h2>Lead Not Found</h2>
          <p>No lead found with ID: {id}</p>
          <button className="btn-add" onClick={() => router.push("/leads")}>Back to Leads</button>
        </div>
      </DashboardLayout>
    );
  }

  const [c1, c2] = getAvatarColor(lead!.name);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Back button */}
        <button className="back-btn" onClick={() => router.push("/leads")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Leads
        </button>

        {/* Profile Card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden", marginBottom: "20px" }}>
          {/* Banner with name inside */}
          <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "24px 28px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.4rem", border: "3px solid rgba(255,255,255,0.4)", flexShrink: 0 }}>
                {lead!.avatar}
              </div>
              <div>
                <h1 style={{ margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 700, color: "#ffffff" }}>{lead!.name}</h1>
                <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)" }}>{lead!.company}</p>
                <LeadStatusBadge status={lead!.status} />
              </div>
            </div>
            <button
              onClick={() => router.push(`/leads/${id}/edit`)}
              className="btn-add"
              style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.4)", backdropFilter: "blur(4px)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Lead
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {/* Contact Info */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>Contact Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Email", value: lead!.email, icon: "✉️" },
                { label: "Phone", value: lead!.phone, icon: "📞" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.875rem" }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#0f172a", fontWeight: 600 }}>{item.value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Details */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>Lead Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Company", value: lead!.company,  icon: "🏢" },
                { label: "Source",  value: lead!.source,   icon: "🎯" },
                { label: "Lead ID", value: String(lead!.id), icon: "🔖" },
                { label: "Created", value: new Date(lead!.createdDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), icon: "📅" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.875rem" }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#0f172a", fontWeight: 600 }}>{item.value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score & Status Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {[
            { label: "Score",  value: String(lead!.score),  color: scoreColor(lead!.score),  bg: scoreColor(lead!.score) + "1a" },
            { label: "Status", value: lead!.status, color: "#4f46e5", bg: "#eef2ff" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.color}22`, borderRadius: "14px", padding: "20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: stat.color }}>{stat.value}</p>
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
