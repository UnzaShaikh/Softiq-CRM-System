"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsNav from "@/components/project-settings/SettingsNav";
import Link from "next/link";
import { HiChevronRight, HiLink, HiCheckCircle, HiPlusCircle } from "react-icons/hi";
import { FiSlack, FiGithub, FiMail } from "react-icons/fi";
import { SiGoogleanalytics, SiZapier, SiMailchimp } from "react-icons/si";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  connected: boolean;
  badge?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "slack",    name: "Slack",            description: "Send CRM notifications directly to Slack channels.",          icon: <FiSlack size={22} color="#4a154b" />,    iconBg: "#f3e8ff", connected: false, badge: "Popular" },
  { id: "google",   name: "Google Analytics", description: "Track CRM usage and user behaviour with Google Analytics.",   icon: <SiGoogleanalytics size={22} color="#e37400" />, iconBg: "#fef3c7", connected: true  },
  { id: "zapier",   name: "Zapier",           description: "Automate workflows by connecting CRM with 5,000+ apps.",     icon: <SiZapier size={22} color="#ff4a00" />,   iconBg: "#fff1ee", connected: false, badge: "Popular" },
  { id: "mailchimp",name: "Mailchimp",        description: "Sync contacts and run email marketing campaigns.",            icon: <SiMailchimp size={22} color="#ffe01b" />, iconBg: "#fefce8", connected: false },
  { id: "github",   name: "GitHub",           description: "Link issues, PRs and milestones directly to CRM records.",   icon: <FiGithub size={22} color="#24292e" />,   iconBg: "#f1f5f9", connected: false },
  { id: "smtp",     name: "Custom SMTP",      description: "Already configured via Email Settings.",                      icon: <FiMail size={22} color="#4f46e5" />,     iconBg: "#eef2ff", connected: true  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleToggle(id: string) {
    setConnectingId(id);
    await new Promise(r => setTimeout(r, 900));
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
    const item = integrations.find(i => i.id === id);
    showToast(item?.connected ? `${item.name} disconnected.` : `${item?.name} connected successfully.`);
    setConnectingId(null);
  }

  const connected = integrations.filter(i => i.connected).length;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: "0.8125rem", color: "#94a3b8" }}>
          <Link href="/settings/project" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>Project Settings</Link>
          <HiChevronRight size={14} />
          <span style={{ color: "#374151" }}>Integrations</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Integrations</h1>
            <p className="page-subtitle">Connect your CRM with third-party tools and services.</p>
          </div>
          <button className="btn-add" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <HiPlusCircle size={16} /> Request Integration
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 20, alignItems: "start" }}>
          <SettingsNav />

          {/* Center — Integration cards */}
          <div>
            {/* Stats strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Total Available", value: integrations.length, color: "#4f46e5", bg: "#eef2ff" },
                { label: "Connected",       value: connected,            color: "#15803d", bg: "#dcfce7" },
                { label: "Disconnected",    value: integrations.length - connected, color: "#94a3b8", bg: "#f1f5f9" },
              ].map(s => (
                <div key={s.label} className="stat-card-dashboard"
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; }}>
                  <div className="stat-card-dashboard-icon" style={{ background: s.bg, color: s.color }}>
                    <HiLink size={18} />
                  </div>
                  <div className="stat-card-dashboard-content">
                    <p className="stat-card-dashboard-label">{s.label}</p>
                    <p className="stat-card-dashboard-value">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cards grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {integrations.map(item => (
                <div key={item.id} style={{ background: "#fff", border: `1px solid ${item.connected ? "#bbf7d0" : "#e2e8f0"}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "box-shadow 0.15s ease" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: item.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{item.name}</p>
                          {item.badge && (
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "2px 7px", borderRadius: 999 }}>{item.badge}</span>
                          )}
                        </div>
                        {item.connected && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <HiCheckCircle size={12} color="#15803d" />
                            <span style={{ fontSize: "0.72rem", color: "#15803d", fontWeight: 600 }}>Connected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 14px", fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.5 }}>{item.description}</p>
                  <button
                    onClick={() => handleToggle(item.id)}
                    disabled={connectingId === item.id}
                    style={{
                      width: "100%", padding: "8px 16px", borderRadius: 8, fontFamily: "inherit",
                      fontSize: "0.8125rem", fontWeight: 600, cursor: connectingId === item.id ? "not-allowed" : "pointer",
                      border: item.connected ? "1.5px solid #fca5a5" : "1.5px solid #4f46e5",
                      background: item.connected ? "#fef2f2" : "#4f46e5",
                      color: item.connected ? "#ef4444" : "#fff",
                      opacity: connectingId === item.id ? 0.7 : 1,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {connectingId === item.id ? "Processing…" : item.connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Need a Custom Integration?</h3>
              <p style={{ margin: "0 0 14px", fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.6 }}>
                Don't see the tool you need? Use our REST API or Webhook system to build custom integrations.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["View API Docs", "Configure Webhooks"].map(btn => (
                  <button key={btn} style={{ padding: "8px 14px", border: "1.5px solid #4f46e5", borderRadius: 8, background: "#fff", color: "#4f46e5", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>
                    {btn} →
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#4338ca", lineHeight: 1.6 }}>
                ℹ️ Connected integrations have access to your CRM data. Only connect trusted services.
              </p>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}
