import { OpportunityStage, OpportunityStatus } from "@/data/opportunities";

interface StageBadgeProps { stage: OpportunityStage; }
interface StatusBadgeProps { status: OpportunityStatus; }

const STAGE_STYLES: Record<OpportunityStage, { bg: string; color: string; border: string; dot: string }> = {
  "Prospecting":   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
  "Qualification": { bg: "#fef3c7", color: "#b45309", border: "#fde68a", dot: "#f59e0b" },
  "Proposal":      { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff", dot: "#a855f7" },
  "Negotiation":   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", dot: "#f97316" },
  "Closed Won":    { bg: "#dcfce7", color: "#15803d", border: "#86efac", dot: "#22c55e" },
  "Closed Lost":   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#ef4444" },
};

const STATUS_STYLES: Record<OpportunityStatus, { bg: string; color: string; border: string; dot: string }> = {
  "Active":     { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  "On Hold":    { bg: "#fef3c7", color: "#b45309", border: "#fde68a", dot: "#f59e0b" },
  "Inactive":   { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
  "Closed Won": { bg: "#dcfce7", color: "#15803d", border: "#86efac", dot: "#22c55e" },
  "Closed Lost":{ bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#ef4444" },
};

export function OpportunityStageBadge({ stage }: StageBadgeProps) {
  const s = STAGE_STYLES[stage];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {stage}
    </span>
  );
}

export function OpportunityStatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_STYLES[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}
