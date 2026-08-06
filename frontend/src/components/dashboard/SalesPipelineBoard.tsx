"use client";

import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { STAGES, DEALS, type Deal } from "./data";


const LOST_STAGE_ID = "closed_lost";

// TODO: replace DEALS (imported from ./data) with a fetch to your deals API,
// and wire handleDrop below to a PATCH/PUT call that persists the stage change.    
export default function SalesPipelineBoard() {
  const [deals, setDeals] = useState<Deal[]>(DEALS);
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<number | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (d) =>
        d.customer.toLowerCase().includes(q) ||
        d.company.toLowerCase().includes(q)
    );
  }, [deals, query]);

  const columnDeals = (stageId: string) => filtered.filter((d) => d.stage === stageId);

  function handleDrop(stageId: string) {
    if (dragId == null) return;
    setDeals((prev) =>
      prev.map((d) => (d.id === dragId ? { ...d, stage: stageId } : d))
    );
    // TODO: await fetch(`/api/deals/${dragId}`, { method: "PATCH", body: JSON.stringify({ stage: stageId }) })
    setDragId(null);
    setOverStage(null);
  }

  return (
    <div>
      <style>{`
        .sp-card { transition: box-shadow .15s ease, transform .15s ease, border-color .15s ease; }
        .sp-card:hover { box-shadow: 0 4px 14px rgba(15,23,42,0.06); transform: translateY(-1px); border-color: #d8dbe3; }
        .sp-card.dragging { opacity: 0.4; }
        .sp-col.over { background: #f7f8fc; }
        .sp-scroll::-webkit-scrollbar { height: 8px; }
        .sp-scroll::-webkit-scrollbar-thumb { background: #e2e4ea; border-radius: 8px; }
      `}</style>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deals, companies..."
            style={{
              width: "100%",
              height: 40,
              paddingLeft: 36,
              paddingRight: 12,
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#f8fafc",
              fontSize: 13.5,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 40,
            padding: "0 16px",
            borderRadius: 10,
            border: "none",
            background: "#4f46e5",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
            marginLeft: "auto",
          }}
        >
          <Plus size={15} /> New Deal
        </button>
      </div>

      {/* Board */}
      <div className="sp-scroll" style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 10, alignItems: "flex-start" }}>
        {STAGES.map((stage) => {
          const cards = columnDeals(stage.id);
          const isLost = stage.id === LOST_STAGE_ID;
          return (
            <div
              key={stage.id}
              className={`sp-col${overStage === stage.id ? " over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOverStage(stage.id);
              }}
              onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
              onDrop={() => handleDrop(stage.id)}
              style={{
                flex: "0 0 300px",
                background: "#ffffff",
                border: "1px solid #ececf1",
                borderRadius: 20,
                padding: 22,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>{stage.label}</span>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: isLost ? "#fde8e8" : "#eef0fc",
                    color: isLost ? "#dc2626" : "#4f46e5",
                    fontSize: 12.5,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cards.length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {cards.map((d) => (
                  <div
                    key={d.id}
                    className={`sp-card${dragId === d.id ? " dragging" : ""}`}
                    draggable
                    onDragStart={() => setDragId(d.id)}
                    onDragEnd={() => setDragId(null)}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      padding: "18px 20px",
                      cursor: "grab",
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{d.customer}</div>
                    <div style={{ fontSize: 13.5, color: "#64748b", marginBottom: 12 }}>{d.company}</div>

                    <div style={{ fontSize: 20, fontWeight: 700, color: isLost ? "#dc2626" : "#4f46e5", marginBottom: 12 }}>
                      {d.value}
                    </div>

                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: isLost ? "#dc2626" : "#4f46e5",
                        background: isLost ? "#fde8e8" : "#eef0fc",
                        padding: "3px 12px",
                        borderRadius: 20,
                        marginBottom: 14,
                      }}
                    >
                      {stage.label}
                    </span>

                    <div style={{ fontSize: 13, color: "#64748b" }}>Expected Close: {d.closeDate}</div>
                  </div>
                ))}

                {cards.length === 0 && (
                  <div style={{ fontSize: 12.5, color: "#cbd5e1", textAlign: "center", padding: "20px 4px" }}>
                    No deals here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
