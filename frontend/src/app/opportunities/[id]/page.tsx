"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { OpportunityStageBadge, OpportunityStatusBadge } from "@/components/opportunities/OpportunityStageBadge";
import { opportunities as oppData, Opportunity } from "@/data/opportunities";

const AVATAR_COLORS: [string, string][] = [
  ["#4f46e5", "#7c3aed"], ["#0891b2", "#0e7490"], ["#059669", "#047857"],
  ["#d97706", "#b45309"], ["#dc2626", "#b91c1c"], ["#7c3aed", "#6d28d9"],
];
function getAvatarColor(name: string): [string, string] {
  return AVATAR_COLORS[((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) % AVATAR_COLORS.length];
}

export default function OpportunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const found = oppData.find((o) => o.id === id);
      if (!found) setNotFound(true);
      else setOpp(found);
      setLoading(false);
    }, 600);
  }, [id]);

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "12px", color: "#64748b" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        Loading opportunity...
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </DashboardLayout>
  );

  if (notFound) return (
    <DashboardLayout>
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2 style={{ margin: "0 0 8px", color: "#0f172a" }}>Opportunity Not Found</h2>
        <p style={{ color: "#64748b", margin: "0 0 20px" }}>No opportunity found with ID: {id}</p>
        <button onClick={() => router.push("/opportunities")} style={{ padding: "10px 20px", borderRadius: "8px", background: "#4f46e5", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Back to Opportunities</button>
      </div>
    </DashboardLayout>
  );

  const [c1, c2] = getAvatarColor(opp!.name);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>
        <button onClick={() => router.push("/opportunities")} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "0.875rem", fontFamily: "inherit", padding: "0 0 20px" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")} onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Opportunities
        </button>

        {/* Profile Card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden", marginBottom: "20px" }}>
          <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "28px 28px 60px" }} />
          <div style={{ padding: "0 28px 28px", marginTop: "-44px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "16px" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.5rem", border: "4px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", flexShrink: 0 }}>{opp!.avatar}</div>
              <div style={{ paddingBottom: "4px" }}>
                <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#0f172a" }}>{opp!.name}</h1>
                <p style={{ margin: "2px 0 4px", color: "#64748b", fontSize: "0.875rem" }}>{opp!.customerName} — {opp!.company}</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <OpportunityStageBadge stage={opp!.stage} />
                  <OpportunityStatusBadge status={opp!.status} />
                </div>
              </div>
            </div>
            <button onClick={() => router.push(`/opportunities/${id}/edit`)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "8px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,0.35)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              Edit Opportunity
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Deal Information</h3>
            {[
              { label: "Deal Value", value: `$${opp!.dealValue.toLocaleString()}`, icon: "💰" },
              { label: "Probability", value: `${opp!.probability}%`, icon: "📊" },
              { label: "Expected Close", value: new Date(opp!.expectedCloseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), icon: "📅" },
              { label: "Assigned To", value: opp!.assignedTo || "—", icon: "👤" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#0f172a", fontWeight: 600 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Customer & Company</h3>
            {[
              { label: "Customer", value: opp!.customerName, icon: "👤" },
              { label: "Company", value: opp!.company, icon: "🏢" },
              { label: "Opportunity ID", value: opp!.id, icon: "🔖" },
              { label: "Created Date", value: new Date(opp!.createdDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), icon: "📅" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#0f172a", fontWeight: 600 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Probability Bar */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Win Probability</h3>
            <span style={{ fontWeight: 700, color: opp!.probability >= 70 ? "#16a34a" : opp!.probability >= 40 ? "#b45309" : "#1d4ed8" }}>{opp!.probability}%</span>
          </div>
          <div style={{ height: "10px", borderRadius: "9999px", background: "#e2e8f0", overflow: "hidden" }}>
            <div style={{ width: `${opp!.probability}%`, height: "100%", background: opp!.probability >= 70 ? "#22c55e" : opp!.probability >= 40 ? "#f59e0b" : "#3b82f6", borderRadius: "9999px", transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Notes */}
        {opp!.notes && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>📝 Notes</h3>
            <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem", lineHeight: 1.7 }}>{opp!.notes}</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
