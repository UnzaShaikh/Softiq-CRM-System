"use client";

import { Deal, STAGES } from "./data";

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const currentStage = STAGES.find(
    (stage) => stage.id === deal.stage
  );

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Customer Name */}
      <h4
        style={{
          margin: 0,
          color: "#0f172a",
          fontSize: "16px",
        }}
      >
        {deal.customer}
      </h4>

      {/* Company */}
      <p
        style={{
          margin: "6px 0",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        {deal.company}
      </p>

      {/* Deal Value */}
      <p
        style={{
          margin: "6px 0",
          fontWeight: "bold",
          color: "#2563eb",
        }}
      >
        {deal.value}
      </p>

      {/* Current Stage */}
      <span
        style={{
          display: "inline-block",
          background: "#eef2ff",
          color: "#4f46e5",
          padding: "4px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        {currentStage?.label}
      </span>

      {/* Closing Date */}
      <p
        style={{
          marginTop: "10px",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        Expected Close: {deal.closeDate}
      </p>
    </div>
  );
}