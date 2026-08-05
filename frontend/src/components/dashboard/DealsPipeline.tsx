"use client";

const STAGES = [
  { id: "lead",       label: "Lead",        color: "#6366f1", bg: "#eef2ff", count: 24, value: "$48k" },
  { id: "qualified",  label: "Qualified",   color: "#0891b2", bg: "#ecfeff", count: 18, value: "$92k" },
  { id: "proposal",   label: "Proposal",    color: "#d97706", bg: "#fffbeb", count: 11, value: "$135k" },
  { id: "negotiation",label: "Negotiation", color: "#7c3aed", bg: "#f5f3ff", count: 7,  value: "$178k" },
  { id: "closed",     label: "Closed Won",  color: "#16a34a", bg: "#f0fdf4", count: 5,  value: "$214k" },
];

interface Deal {
  name: string;
  company: string;
  value: string;
  stage: string;
  avatar: string;
  daysLeft: number;
}

const DEALS: Deal[] = [
  { name: "Sarah Chen",      company: "Acme Corp",       value: "$24,000", stage: "negotiation", avatar: "SC", daysLeft: 3  },
  { name: "Marcus Rivera",   company: "TechFlow Inc",    value: "$18,500", stage: "proposal",    avatar: "MR", daysLeft: 7  },
  { name: "Priya Nair",      company: "CloudBase Ltd",   value: "$41,000", stage: "qualified",   avatar: "PN", daysLeft: 14 },
  { name: "James O'Brien",   company: "Retail Plus",     value: "$9,200",  stage: "lead",        avatar: "JO", daysLeft: 21 },
  { name: "Elena Vasquez",   company: "HealthSync",      value: "$67,000", stage: "closed",      avatar: "EV", daysLeft: 0  },
  { name: "Kwame Asante",    company: "LogiCore",        value: "$33,400", stage: "proposal",    avatar: "KA", daysLeft: 5  },
];

const avatarPalette: Record<string, [string, string]> = {
  SC: ["#4f46e5", "#7c3aed"],
  MR: ["#0891b2", "#0e7490"],
  PN: ["#059669", "#047857"],
  JO: ["#d97706", "#b45309"],
  EV: ["#dc2626", "#b91c1c"],
  KA: ["#7c3aed", "#6d28d9"],
};

export default function DealsPipeline() {
  // Total pipeline value
  const totalDeals = DEALS.reduce((sum, d) => sum + parseFloat(d.value.replace(/[$,]/g, "")), 0);

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "1rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Deals Pipeline</h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "#64748b" }}>
            {DEALS.length} active deals · ${(totalDeals / 1000).toFixed(1)}k total value
          </p>
        </div>
        <button style={{
          padding: "6px 14px", borderRadius: 7, fontSize: "0.8125rem",
          fontWeight: 600, color: "#4f46e5", background: "#eef2ff",
          border: "none", cursor: "pointer", fontFamily: "inherit",
          transition: "background 0.15s",
        }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#e0e7ff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#eef2ff")}
        >
          View All
        </button>
      </div>

      {/* Stage progress bar */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", gap: 3, height: 8, borderRadius: 99, overflow: "hidden" }}>
          {STAGES.map((s) => (
            <div
              key={s.id}
              title={`${s.label}: ${s.count} deals`}
              style={{
                flex: s.count,
                background: s.color,
                opacity: 0.85,
                transition: "flex 0.3s",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, gap: 4, flexWrap: "wrap" }}>
          {STAGES.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                {s.label} <span style={{ fontWeight: 700, color: "#0f172a" }}>{s.count}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deal rows */}
      <div style={{ padding: "0.5rem 0" }}>
        {DEALS.map((deal, i) => {
          const stage = STAGES.find((s) => s.id === deal.stage)!;
          const [c1, c2] = avatarPalette[deal.avatar] ?? ["#4f46e5", "#7c3aed"];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 1.5rem",
                transition: "background 0.12s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#f8fafc")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
            >
              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "0.75rem", userSelect: "none",
              }}>
                {deal.avatar}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {deal.name}
                </p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {deal.company}
                </p>
              </div>

              {/* Stage badge */}
              <span style={{
                padding: "3px 9px",
                borderRadius: 9999,
                fontSize: "0.7rem",
                fontWeight: 700,
                color: stage.color,
                background: stage.bg,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}>
                {stage.label}
              </span>

              {/* Days left */}
              {deal.daysLeft > 0 && (
                <span style={{
                  fontSize: "0.7rem", color: deal.daysLeft <= 5 ? "#dc2626" : "#64748b",
                  fontWeight: 600, flexShrink: 0, minWidth: 48, textAlign: "right",
                }}>
                  {deal.daysLeft}d left
                </span>
              )}
              {deal.daysLeft === 0 && (
                <span style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 700, flexShrink: 0, minWidth: 48, textAlign: "right" }}>
                  ✓ Won
                </span>
              )}

              {/* Value */}
              <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", flexShrink: 0, minWidth: 60, textAlign: "right" }}>
                {deal.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
