"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LeadStatusBadge from "@/components/leads/LeadStatusBadge";
import { ApiLead, Lead, toLead } from "@/data/leads";
import { apiRequest, getAccessToken } from "@/lib/api";

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "12px", color: "#64748b" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Loading lead...
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
          <h2 style={{ margin: "0 0 8px", color: "#0f172a" }}>Lead Not Found</h2>
          <p style={{ color: "#64748b", margin: "0 0 20px" }}>No lead found with ID: {id}</p>
          <button
            onClick={() => router.push("/leads")}
            style={{ padding: "10px 20px", borderRadius: "8px", background: "#4f46e5", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Back to Leads
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const [c1, c2] = getAvatarColor(lead!.name);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Back button */}
        <button
          onClick={() => router.push("/leads")}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "0.875rem", fontFamily: "inherit", padding: "0 0 20px", transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Leads
        </button>

        {/* Profile Card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden", marginBottom: "20px" }}>
          <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "28px 28px 60px" }} />
          <div style={{ padding: "0 28px 28px", marginTop: "-44px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "16px" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.5rem", border: "4px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", flexShrink: 0 }}>
                {lead!.avatar}
              </div>
              <div style={{ paddingBottom: "4px" }}>
                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>{lead!.name}</h1>
                <p style={{ margin: "2px 0 6px", color: "#64748b", fontSize: "0.9rem" }}>{lead!.company}</p>
                <LeadStatusBadge status={lead!.status} />
              </div>
            </div>
            <button
              onClick={() => router.push(`/leads/${id}/edit`)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "8px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,0.35)" }}
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Contact Info */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Contact Information</h3>
            {[
              { label: "Email", value: lead!.email, icon: "✉️" },
              { label: "Phone", value: lead!.phone, icon: "📞" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#0f172a", fontWeight: 500 }}>{item.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Business Info */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Lead Details</h3>
            {[
              { label: "Company", value: lead!.company, icon: "🏢" },
              { label: "Source", value: lead!.source, icon: "🎯" },
              { label: "Lead ID", value: lead!.id, icon: "🔖" },
              { label: "Created", value: new Date(lead!.createdDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), icon: "📅" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#0f172a", fontWeight: 500 }}>{item.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
          {[
            { label: "Score", value: lead!.score, color: scoreColor(lead!.score), bg: scoreColor(lead!.score) + "1a" },
            { label: "Status", value: lead!.status, color: "#4f46e5", bg: "#eef2ff" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.bg}`, borderRadius: "12px", padding: "20px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: stat.color }}>{stat.value}</p>
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
