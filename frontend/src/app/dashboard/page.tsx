import Navbar from "@/components/Navbar";

const stats = [
  { label: "Total Customers", value: "2,491", change: "+12%", up: true, icon: "👥" },
  { label: "Active Deals",    value: "148",    change: "+5%",  up: true, icon: "🤝" },
  { label: "Revenue (MTD)",   value: "$84,200", change: "+8.3%", up: true, icon: "💰" },
  { label: "Open Tickets",    value: "23",     change: "-4%",  up: false, icon: "🎫" },
];

export default function DashboardPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    }}>
      <Navbar />

      <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Page title */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
          <p style={{ marginTop: "0.25rem", color: "#64748b", fontSize: "0.9375rem" }}>
            Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* Stats grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: "#ffffff",
              borderRadius: "1rem",
              padding: "1.5rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0, fontWeight: 500 }}>{s.label}</p>
                  <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", margin: "0.375rem 0 0", letterSpacing: "-0.02em" }}>{s.value}</p>
                </div>
                <span style={{ fontSize: "1.75rem" }}>{s.icon}</span>
              </div>
              <p style={{ marginTop: "0.75rem", fontSize: "0.8125rem", fontWeight: 600, color: s.up ? "#16a34a" : "#dc2626" }}>
                {s.change} <span style={{ color: "#94a3b8", fontWeight: 400 }}>vs last month</span>
              </p>
            </div>
          ))}
        </div>

        {/* Placeholder notice */}
        <div style={{
          background: "#eef2ff",
          border: "1px solid #c7d2fe",
          borderRadius: "1rem",
          padding: "2rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚀</div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#3730a3", margin: "0 0 0.5rem" }}>
            Dashboard Under Construction
          </h2>
          <p style={{ color: "#4f46e5", fontSize: "0.9375rem", margin: 0 }}>
            Connect the Django backend to bring this to life.
          </p>
        </div>
      </main>
    </div>
  );
}
