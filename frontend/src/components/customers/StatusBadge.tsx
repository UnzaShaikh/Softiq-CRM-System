import { CustomerStatus } from "@/data/customers";

interface StatusBadgeProps {
  status: CustomerStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<CustomerStatus, { bg: string; color: string; border: string; dot: string }> = {
    Active: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
    Inactive: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
    Lead: { bg: "#fef3c7", color: "#b45309", border: "#fde68a", dot: "#f59e0b" },
  };

  const style = styles[status];

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
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {/* Dot indicator */}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: style.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}
