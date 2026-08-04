import { CustomerStatus } from "@/data/customers";

interface StatusBadgeProps {
  status: CustomerStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === "Active";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: isActive ? "#dcfce7" : "#f1f5f9",
        color: isActive ? "#15803d" : "#64748b",
        border: `1px solid ${isActive ? "#bbf7d0" : "#e2e8f0"}`,
        whiteSpace: "nowrap",
      }}
    >
      {/* Dot indicator */}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: isActive ? "#22c55e" : "#94a3b8",
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}
