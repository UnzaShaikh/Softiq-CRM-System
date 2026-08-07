"use client";

import type { FeedActivity } from "@/lib/dashboard";

const TYPE_META: Record<FeedActivity["type"], { icon: React.ReactNode; color: string; bg: string }> = {
  deal: {
    color: "#16a34a", bg: "#f0fdf4",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  customer: {
    color: "#4f46e5", bg: "#eef2ff",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  task: {
    color: "#d97706", bg: "#fffbeb",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  note: {
    color: "#0891b2", bg: "#ecfeff",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  call: {
    color: "#7c3aed", bg: "#f5f3ff",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
};

const AVATAR_COLORS: [string, string][] = [
  ["#dc2626", "#b91c1c"],
  ["#ec4899", "#db2777"],
  ["#0891b2", "#0e7490"],
  ["#059669", "#047857"],
  ["#d97706", "#b45309"],
  ["#7c3aed", "#6d28d9"],
  ["#0ea5e9", "#0284c7"],
  ["#4f46e5", "#7c3aed"],
];

interface ActivityFeedProps {
  activities: FeedActivity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "1rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Recent Activity</h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "#64748b" }}>Live team updates</p>
        </div>
        <button style={{
          padding: "5px 12px", borderRadius: 7, fontSize: "0.8rem",
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

      {/* Feed */}
      <div style={{ flex: 1, padding: "0.75rem 0", overflowY: "auto" }}>
        {activities.length === 0 ? (
          <div style={{ padding: "2rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
            No activity yet — updates will appear here.
          </div>
        ) : (
          activities.map((a, i) => {
            const meta = TYPE_META[a.type];
            const palette = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const [c1, c2] = palette;
            return (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "10px 1.5rem",
                  transition: "background 0.12s", cursor: "pointer",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#f8fafc")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                {/* Avatar with type badge */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "0.72rem", userSelect: "none",
                  }}>
                    {a.avatar}
                  </div>
                  <div style={{
                    position: "absolute", bottom: -2, right: -2,
                    width: 16, height: 16, borderRadius: "50%",
                    background: meta.bg, border: `1.5px solid #fff`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: meta.color,
                  }}>
                    {meta.icon}
                  </div>
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "0.8375rem", fontWeight: 600, color: "#0f172a", lineHeight: 1.35 }}>
                    {a.title}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {a.subtitle}
                  </p>
                </div>

                {/* Time */}
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500, flexShrink: 0, whiteSpace: "nowrap" }}>
                  {a.time}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer CTA */}
      <div style={{ padding: "12px 1.5rem", borderTop: "1px solid #f1f5f9" }}>
        <button style={{
          width: "100%", padding: "9px", borderRadius: 8,
          border: "1.5px dashed #e2e8f0", background: "transparent",
          fontSize: "0.8125rem", fontWeight: 600, color: "#64748b",
          cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "border-color 0.15s, color 0.15s, background 0.15s",
        }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#c7d2fe";
            (e.currentTarget as HTMLButtonElement).style.color = "#4f46e5";
            (e.currentTarget as HTMLButtonElement).style.background = "#eef2ff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
            (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Log an Activity
        </button>
      </div>
    </div>
  );
}
