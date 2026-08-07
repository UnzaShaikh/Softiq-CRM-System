"use client";

import PipelineStage from "./PipelineStage";
import type { BoardDeal } from "@/lib/dashboard";

interface Stage {
  id: string;
  label: string;
}

interface SalesPipelineProps {
  stages: Stage[];
  deals: BoardDeal[];
}

export default function SalesPipeline({ stages, deals }: SalesPipelineProps) {
  return (
    <div
      style={{
        padding: "20px",
      }}
    >
      {/* Heading */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "bold",
            color: "#0f172a",
          }}
        >
          Sales Pipeline
        </h2>

        <p
          style={{
            marginTop: "6px",
            color: "#64748b",
          }}
        >
          Track all sales opportunities by stage.
        </p>
      </div>

      {/* Empty State */}
      {deals.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "#94a3b8",
            fontSize: "18px",
          }}
        >
          No deals found.
        </div>
      ) : (
        /* Pipeline */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {stages.map((stage) => (
            <PipelineStage
              key={stage.id}
              title={stage.label}
              deals={deals.filter((deal) => deal.stage === stage.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
