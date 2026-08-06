"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OpportunityTable from "@/components/opportunities/OpportunityTable";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";
import opportunitiesData, { Opportunity, OpportunityStage, OpportunityStatus } from "@/data/opportunities";

const ITEMS_PER_PAGE = 8;
type FilterStage = "All" | OpportunityStage;
type FilterStatus = "All" | OpportunityStatus;

const ALL_STAGES: OpportunityStage[] = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const ALL_STATUSES: OpportunityStatus[] = ["Active", "On Hold", "Inactive"];

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>(opportunitiesData);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<FilterStage>("All");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<Opportunity | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return opportunities.filter((o) => {
      const matchSearch = !q || o.name.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.company.toLowerCase().includes(q);
      const matchStage = stageFilter === "All" || o.stage === stageFilter;
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      return matchSearch && matchStage && matchStatus;
    });
  }, [opportunities, search, stageFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);

  function handleSearch(val: string) { setSearch(val); setCurrentPage(1); }
  function handleStageFilter(val: FilterStage) { setStageFilter(val); setCurrentPage(1); }
  function handleStatusFilter(val: FilterStatus) { setStatusFilter(val); setCurrentPage(1); }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function handleDeleteConfirmed() {
    if (!deleteModal) return;
    setOpportunities((prev) => prev.filter((o) => o.id !== deleteModal.id));
    showToast(`"${deleteModal.name}" has been deleted.`);
    setDeleteModal(null);
  }

  // Stats
  const totalValue = opportunities.reduce((s, o) => s + o.dealValue, 0);
  const activeCount = opportunities.filter((o) => o.status === "Active").length;
  const closedWon = opportunities.filter((o) => o.stage === "Closed Won").length;
  const avgProbability = opportunities.length > 0 ? Math.round(opportunities.reduce((s, o) => s + o.probability, 0) / opportunities.length) : 0;

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.875rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>Opportunities</h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.9375rem" }}>Track and manage all your sales opportunities.</p>
          </div>
          <button onClick={() => router.push("/opportunities/new")}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "9px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", fontWeight: 600, fontSize: "0.9rem", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(79,70,229,0.4)", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(79,70,229,0.5)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(79,70,229,0.4)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Opportunity
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {[
            { label: "Total Opportunities", value: opportunities.length, icon: "🎯", color: "#4f46e5", bg: "#eef2ff" },
            { label: "Active", value: activeCount, icon: "✅", color: "#16a34a", bg: "#dcfce7" },
            { label: "Closed Won", value: closedWon, icon: "🏆", color: "#d97706", bg: "#fef3c7" },
            { label: "Total Pipeline", value: `$${totalValue.toLocaleString()}`, icon: "💰", color: "#0891b2", bg: "#ecfeff" },
            { label: "Avg Probability", value: `${avgProbability}%`, icon: "📊", color: "#7c3aed", bg: "#faf5ff" },
          ].map((card) => (
            <div key={card.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "10px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>{card.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: card.color, lineHeight: 1.2 }}>{card.value}</p>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>

          {/* Toolbar */}
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: "260px" }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Search by name, customer, or company…" resultCount={filtered.length} />
              </div>
              {/* Status filter */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f1f5f9", borderRadius: "8px", padding: "3px" }}>
                {(["All", ...ALL_STATUSES] as FilterStatus[]).map((tab) => (
                  <button key={tab} onClick={() => handleStatusFilter(tab)}
                    style={{ padding: "5px 12px", borderRadius: "6px", border: "none", background: statusFilter === tab ? "#fff" : "transparent", color: statusFilter === tab ? "#0f172a" : "#64748b", fontWeight: statusFilter === tab ? 600 : 500, fontSize: "0.775rem", cursor: "pointer", fontFamily: "inherit", boxShadow: statusFilter === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none", whiteSpace: "nowrap" }}
                  >{tab}</button>
                ))}
              </div>
            </div>

            {/* Stage filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Stage:</span>
              {(["All", ...ALL_STAGES] as FilterStage[]).map((tab) => (
                <button key={tab} onClick={() => handleStageFilter(tab)}
                  style={{ padding: "4px 12px", borderRadius: "6px", border: `1.5px solid ${stageFilter === tab ? "#4f46e5" : "#e2e8f0"}`, background: stageFilter === tab ? "#eef2ff" : "#fff", color: stageFilter === tab ? "#4f46e5" : "#64748b", fontWeight: stageFilter === tab ? 600 : 500, fontSize: "0.775rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.15s ease" }}
                >{tab}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <OpportunityTable
            opportunities={paginated}
            onView={(o) => router.push(`/opportunities/${o.id}`)}
            onEdit={(o) => router.push(`/opportunities/${o.id}/edit`)}
            onDelete={setDeleteModal}
          />

          {/* Pagination */}
          {filtered.length > 0 && (
            <div style={{ padding: "4px 20px 16px" }}>
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteModal(null); }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", textAlign: "center" }}>Delete Opportunity</h2>
            <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: "0.9rem", textAlign: "center", lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: "#0f172a" }}>{deleteModal.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#fff")}
              >Cancel</button>
              <button onClick={handleDeleteConfirmed} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(239,68,68,0.4)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", bottom: "28px", right: "28px", background: "#0f172a", color: "#fff", padding: "12px 20px", borderRadius: "10px", fontSize: "0.875rem", fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,0.2)", zIndex: 2000, display: "flex", alignItems: "center", gap: "8px", maxWidth: "320px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
          {toastMsg}
        </div>
      )}
    </DashboardLayout>
  );
}
