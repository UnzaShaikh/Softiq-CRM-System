"use client";

import DealCard from "./DealCard";

interface Deal {
  id: number;
  customer: string;
  company: string;
  value: string;
  stage: string;
  closeDate: string;
}

interface PipelineStageProps {
  title: string;
  deals: Deal[];
}

export default function PipelineStage({
  title,
  deals,
}: PipelineStageProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "16px",
        minWidth: "280px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Stage Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          {title}
        </h3>

        <span
          style={{
            background: "#eef2ff",
            color: "#4f46e5",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {deals.length}
        </span>
      </div>

      {/* Deals */}
      {deals.length > 0 ? (
        deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))
      ) : (
        <div
          style={{
            padding: "30px 0",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          No Deals
        </div>
      )}
    </div>
  );
}