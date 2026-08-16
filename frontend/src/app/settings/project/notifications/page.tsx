"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsNav from "@/components/project-settings/SettingsNav";
import Link from "next/link";
import { HiChevronRight, HiBell, HiSave, HiMail, HiDeviceMobile, HiChat } from "react-icons/hi";

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      style={{ width: 44, height: 24, borderRadius: "9999px", border: "none", background: value ? "#4f46e5" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </button>
  );
}

interface NotifState {
  // Channels
  emailEnabled:  boolean;
  pushEnabled:   boolean;
  smsEnabled:    boolean;
  slackEnabled:  boolean;
  // CRM Events
  newLead:       boolean;
  leadAssigned:  boolean;
  dealCreated:   boolean;
  dealWon:       boolean;
  dealLost:      boolean;
  taskDue:       boolean;
  taskAssigned:  boolean;
  followupDue:   boolean;
  customerAdded: boolean;
  // System
  loginAlert:    boolean;
  backupDone:    boolean;
  systemErrors:  boolean;
  weeklyReport:  boolean;
  monthlyReport: boolean;
  // Digest
  digestEnabled:  boolean;
  digestFreq:     string;
  quietStart:     string;
  quietEnd:       string;
}

export default function ProjectNotificationsPage() {
  const [notifs, setNotifs] = useState<NotifState>({
    emailEnabled: true,  pushEnabled: true,   smsEnabled: false, slackEnabled: false,
    newLead: true,  leadAssigned: true,  dealCreated: true,  dealWon: true,  dealLost: false,
    taskDue: true,  taskAssigned: true,  followupDue: true,  customerAdded: false,
    loginAlert: true,   backupDone: true,  systemErrors: true, weeklyReport: true, monthlyReport: false,
    digestEnabled: false, digestFreq: "Daily", quietStart: "22:00", quietEnd: "08:00",
  });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");

  function set<K extends keyof NotifState>(key: K, val: NotifState[K]) {
    setNotifs(p => ({ ...p, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setSuccess("Notification settings saved.");
    setTimeout(() => setSuccess(""), 3500);
  }

  const CHANNELS = [
    { key: "emailEnabled", label: "Email Notifications",  sub: "Receive notifications via email",           icon: <HiMail size={16} color="#4f46e5" />,         bg: "#eef2ff" },
    { key: "pushEnabled",  label: "Push Notifications",   sub: "Browser and in-app push notifications",     icon: <HiBell size={16} color="#d97706" />,         bg: "#fef3c7" },
    { key: "smsEnabled",   label: "SMS Notifications",    sub: "Receive alerts via SMS",                    icon: <HiDeviceMobile size={16} color="#0891b2" />, bg: "#ecfeff" },
    { key: "slackEnabled", label: "Slack Notifications",  sub: "Send alerts to your Slack workspace",       icon: <HiChat size={16} color="#4a154b" />,         bg: "#f3e8ff" },
  ];

  const EVENT_GROUPS = [
    {
      title: "CRM Events",
      items: [
        { key: "newLead",       label: "New Lead Created",       sub: "When a new lead is added to the CRM"         },
        { key: "leadAssigned",  label: "Lead Assigned",          sub: "When a lead is assigned to a team member"    },
        { key: "dealCreated",   label: "Deal Created",           sub: "When a new deal is created"                  },
        { key: "dealWon",       label: "Deal Won",               sub: "When a deal is marked as won"                },
        { key: "dealLost",      label: "Deal Lost",              sub: "When a deal is marked as lost"               },
        { key: "taskDue",       label: "Task Due Reminder",      sub: "Reminder when a task is approaching due date"},
        { key: "taskAssigned",  label: "Task Assigned",          sub: "When a task is assigned to you"              },
        { key: "followupDue",   label: "Follow-up Due",          sub: "Reminder for upcoming follow-ups"            },
        { key: "customerAdded", label: "New Customer Added",     sub: "When a new customer record is created"       },
      ],
    },
    {
      title: "System Notifications",
      items: [
        { key: "loginAlert",    label: "Login Alerts",           sub: "When a new login is detected"                },
        { key: "backupDone",    label: "Backup Completed",       sub: "When an automated backup finishes"           },
        { key: "systemErrors",  label: "System Errors",          sub: "Critical system error notifications"         },
        { key: "weeklyReport",  label: "Weekly Summary",         sub: "Weekly CRM activity summary"                 },
        { key: "monthlyReport", label: "Monthly Report",         sub: "Monthly performance and analytics report"    },
      ],
    },
  ];

  const selectStyle: React.CSSProperties = {
    padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8,
    background: "#fff", color: "#0f172a", fontSize: "0.875rem",
    fontFamily: "inherit", outline: "none", cursor: "pointer",
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: "0.8125rem", color: "#94a3b8" }}>
          <Link href="/settings/project" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>Project Settings</Link>
          <HiChevronRight size={14} />
          <span style={{ color: "#374151" }}>Notifications</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Notification Settings</h1>
            <p className="page-subtitle">Configure how and when your team receives CRM notifications.</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-add"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {saving ? "Saving…" : <><HiSave size={15} /> Save Changes</>}
          </button>
        </div>

        {success && <div className="msg-success" style={{ marginBottom: 16 }}>✅ {success}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 20, alignItems: "start" }}>
          <SettingsNav />

          {/* Center */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Notification Channels */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HiBell size={17} color="#4f46e5" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Notification Channels</h2>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Choose how notifications are delivered</p>
                </div>
              </div>
              <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {CHANNELS.map(ch => (
                  <div key={ch.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", border: `1.5px solid ${notifs[ch.key as keyof NotifState] ? "#c7d2fe" : "#e2e8f0"}`, borderRadius: 10, background: notifs[ch.key as keyof NotifState] ? "#fafbff" : "#fff", transition: "all 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: ch.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{ch.icon}</div>
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{ch.label}</p>
                        <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{ch.sub}</p>
                      </div>
                    </div>
                    <Toggle value={notifs[ch.key as keyof NotifState] as boolean} onChange={() => set(ch.key as keyof NotifState, !notifs[ch.key as keyof NotifState] as boolean)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Event groups */}
            {EVENT_GROUPS.map(group => (
              <div key={group.title} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                  <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>{group.title}</h2>
                </div>
                <div style={{ padding: "12px 24px" }}>
                  {group.items.map((item, idx) => (
                    <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: idx < group.items.length - 1 ? "1px solid #f8fafc" : "none" }}>
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>{item.label}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{item.sub}</p>
                      </div>
                      <Toggle value={notifs[item.key as keyof NotifState] as boolean} onChange={() => set(item.key as keyof NotifState, !notifs[item.key as keyof NotifState] as boolean)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Notification Digest */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Notification Digest</h3>
              <p style={{ margin: "0 0 14px", fontSize: "0.75rem", color: "#94a3b8" }}>Bundle notifications into a single summary.</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Enable Digest</p>
                <Toggle value={notifs.digestEnabled} onChange={() => set("digestEnabled", !notifs.digestEnabled)} />
              </div>
              {notifs.digestEnabled && (
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select value={notifs.digestFreq} onChange={e => set("digestFreq", e.target.value)} style={{ ...selectStyle, width: "100%" }}>
                    {["Daily","Weekly","Every 4 hours"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Quiet Hours */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Quiet Hours</h3>
              <p style={{ margin: "0 0 14px", fontSize: "0.75rem", color: "#94a3b8" }}>Pause notifications during specific hours.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="time" value={notifs.quietStart} onChange={e => set("quietStart", e.target.value)}
                    style={{ ...selectStyle, cursor: "text" }} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="time" value={notifs.quietEnd} onChange={e => set("quietEnd", e.target.value)}
                    style={{ ...selectStyle, cursor: "text" }} />
                </div>
              </div>
            </div>

            <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#4338ca", lineHeight: 1.6 }}>
                ℹ️ These settings apply system-wide. Individual users can override their personal preferences from My Profile → Notifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
