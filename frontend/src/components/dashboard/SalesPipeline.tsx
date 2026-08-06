"use client";

import { useEffect, useState } from "react";
import PipelineStage from "./PipelineStage";
import { STAGES, DEALS } from "./data";

export default function SalesPipeline() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second loading

    return () => clearTimeout(timer);
  }, []);

  // Loading State
  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          fontSize: "18px",
          color: "#64748b",
        }}
      >
        Loading Sales Pipeline...
      </div>
    );
  }

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
      {DEALS.length === 0 ? (
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
          {STAGES.map((stage) => (
            <PipelineStage
              key={stage.id}
              title={stage.label}
              deals={DEALS.filter((deal) => deal.stage === stage.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}