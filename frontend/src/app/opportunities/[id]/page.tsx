"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { OpportunityStageBadge, OpportunityStatusBadge } from "@/components/opportunities/OpportunityStageBadge";
import { ApiOpportunity, Opportunity, toOpportunity } from "@/data/opportunities";
import { apiRequest, getAccessToken } from "@/lib/api";
import { DollarSign, BarChart2, Calendar, User, Building2, Tag, FileText } from "lucide-react";
import ThemeLoader from "@/components/ui/ThemeLoader";

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
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await apiRequest<ApiOpportunity>(`/api/opportunities/${id}/`);
        if (cancelled) return;
        setOpp(toOpportunity(data));
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setNotFound(true);
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

  if (loading) return (
    <DashboardLayout>
      <ThemeLoader label="Loading opportunity..." />
    </DashboardLayout>
  );

  if (notFound) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Opportunity Not Found</h2>
        <p>{error || `No opportunity found with ID: ${id}`}</p>
        <button className="btn-add" onClick={() => router.push("/opportunities")}>Back to Opportunities</button>
      </div>
    </DashboardLayout>
  );

  const [c1, c2] = getAvatarColor(opp!.name);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Back button */}
        <button className="back-btn" onClick={() => router.push("/opportunities")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Opportunities
        </button>

        {/* Profile Card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          {/* Banner with name inside */}
          <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "24px 24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Avatar */}
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.4rem", border: "3px solid rgba(255,255,255,0.4)", flexShrink: 0 }}>
                {opp!.avatar}
              </div>
              <div>
                <h1 style={{ margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 700, color: "#ffffff" }}>{opp!.name}</h1>
                <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)" }}>{opp!.customerName} — {opp!.company}</p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <OpportunityStageBadge stage={opp!.stage} />
                  <OpportunityStatusBadge status={opp!.status} />
                </div>
              </div>
            </div>
            <button className="btn-add" onClick={() => router.push(`/opportunities/${id}/edit`)}
              style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.4)", backdropFilter: "blur(4px)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              Edit Opportunity
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>

          {/* Deal Information */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>Deal Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Deal Value",     value: `$${opp!.dealValue.toLocaleString()}`, icon: <DollarSign size={15} color="#4f46e5" /> },
                { label: "Probability",    value: `${opp!.probability}%`,                icon: <BarChart2 size={15} color="#4f46e5" /> },
                { label: "Expected Close", value: new Date(opp!.expectedCloseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), icon: <Calendar size={15} color="#4f46e5" /> },
                { label: "Assigned To",    value: opp!.assignedTo || "—",               icon: <User size={15} color="#4f46e5" /> },
              ].map((item) => (
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

          {/* Customer & Company */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>Customer & Company</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Customer",       value: opp!.customerName, icon: <User size={15} color="#4f46e5" /> },
                { label: "Company",        value: opp!.company,      icon: <Building2 size={15} color="#4f46e5" /> },
                { label: "Opportunity ID", value: String(opp!.id),   icon: <Tag size={15} color="#4f46e5" /> },
                { label: "Created Date",   value: new Date(opp!.createdDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), icon: <Calendar size={15} color="#4f46e5" /> },
              ].map((item) => (
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

        {/* Win Probability Bar */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <h3 style={{ margin: "0 0 2px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Win Probability</h3>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>Likelihood of closing this opportunity</p>
            </div>
            <span style={{
              fontSize: "1.25rem", fontWeight: 700,
              color: opp!.probability >= 70 ? "#16a34a" : opp!.probability >= 40 ? "#b45309" : "#3b82f6"
            }}>{opp!.probability}%</span>
          </div>
          <div style={{ height: "10px", borderRadius: "9999px", background: "#f1f5f9", overflow: "hidden" }}>
            <div style={{
              width: `${opp!.probability}%`, height: "100%", borderRadius: "9999px",
              background: opp!.probability >= 70 ? "linear-gradient(90deg,#22c55e,#16a34a)" : opp!.probability >= 40 ? "linear-gradient(90deg,#f59e0b,#d97706)" : "linear-gradient(90deg,#60a5fa,#3b82f6)",
              transition: "width 0.6s ease"
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
            <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>0%</span>
            <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>100%</span>
          </div>
        </div>

        {/* Notes */}
        {opp!.notes && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 28, height: 28, borderRadius: "7px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={14} color="#4f46e5" />
              </div>
              Notes
            </h3>
            <p style={{ margin: 0, color: "#475569", fontSize: "0.875rem", lineHeight: 1.7 }}>{opp!.notes}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
