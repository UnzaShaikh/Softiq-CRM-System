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
      <div className="loading-state">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        Loading opportunity...
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </DashboardLayout>
  );

  if (notFound) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Opportunity Not Found</h2>
        <p>No opportunity found with ID: {id}</p>
        <button className="btn-add" onClick={() => router.push("/opportunities")}>Back to Opportunities</button>
      </div>
    </DashboardLayout>
  );

  const [c1, c2] = getAvatarColor(opp!.name);

  return (
    <DashboardLayout>
      <div className="detail-wrapper">
        <button className="back-btn" onClick={() => router.push("/opportunities")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Opportunities
        </button>

        {/* Profile Card */}
        <div className="detail-profile-card">
          <div className="detail-profile-banner" />
          <div className="detail-profile-body">
            <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem" }}>
              <div className="detail-avatar" style={{ background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)` }}>{opp!.avatar}</div>
              <div style={{ paddingBottom: "4px" }}>
                <h1 className="detail-name">{opp!.name}</h1>
                <p className="detail-meta">{opp!.customerName} — {opp!.company}</p>
                <div className="detail-badges">
                  <OpportunityStageBadge stage={opp!.stage} />
                  <OpportunityStatusBadge status={opp!.status} />
                </div>
              </div>
            </div>
            <button className="btn-add" onClick={() => router.push(`/opportunities/${id}/edit`)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              Edit Opportunity
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="detail-grid">
          <div className="detail-info-card">
            <h3 className="detail-info-title">Deal Information</h3>
            {[
              { label: "Deal Value",     value: `$${opp!.dealValue.toLocaleString()}`, icon: "💰" },
              { label: "Probability",    value: `${opp!.probability}%`,                icon: "📊" },
              { label: "Expected Close", value: new Date(opp!.expectedCloseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), icon: "📅" },
              { label: "Assigned To",    value: opp!.assignedTo || "—",               icon: "👤" },
            ].map((item) => (
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
            <h3 className="detail-info-title">Customer & Company</h3>
            {[
              { label: "Customer",        value: opp!.customerName, icon: "👤" },
              { label: "Company",         value: opp!.company,      icon: "🏢" },
              { label: "Opportunity ID",  value: opp!.id,           icon: "🔖" },
              { label: "Created Date",    value: new Date(opp!.createdDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), icon: "📅" },
            ].map((item) => (
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

        {/* Probability Bar */}
        <div className="detail-info-card" style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.625rem" }}>
            <h3 className="detail-info-title" style={{ margin: 0 }}>Win Probability</h3>
            <span style={{ fontWeight: 700, color: opp!.probability >= 70 ? "#16a34a" : opp!.probability >= 40 ? "#b45309" : "#1d4ed8" }}>{opp!.probability}%</span>
          </div>
          <div style={{ height: "10px", borderRadius: "9999px", background: "var(--border)", overflow: "hidden" }}>
            <div style={{ width: `${opp!.probability}%`, height: "100%", background: opp!.probability >= 70 ? "#22c55e" : opp!.probability >= 40 ? "#f59e0b" : "#3b82f6", borderRadius: "9999px", transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Notes */}
        {opp!.notes && (
          <div className="detail-info-card" style={{ marginTop: "1rem" }}>
            <h3 className="detail-info-title">📝 Notes</h3>
            <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem", lineHeight: 1.7 }}>{opp!.notes}</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
