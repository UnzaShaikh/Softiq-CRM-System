"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProfileNav } from "../page";
import ThemeLoader from "@/components/ui/ThemeLoader";
import { HiBell, HiSave } from "react-icons/hi";

// ---------- API imports ----------
import {
  getNotificationSettings,
  updateNotificationSettings,
  ApiNotificationSettings,
} from "@/lib/profileApi";

export default function NotificationsPage() {
  // ---------- State ----------
  const [prefs, setPrefs] = useState({
    emailNotifs: true,
    pushNotifs: true,
    smsNotifs: false,
    newLead: true,
    dealUpdates: true,
    taskReminders: true,
    weeklyReport: false,
    systemAlerts: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ---------- Load real settings on mount ----------
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getNotificationSettings();
      setPrefs({
        emailNotifs: data.email_notifications,
        pushNotifs: data.push_notifications,
        smsNotifs: data.sms_notifications,
        newLead: data.new_lead,
        dealUpdates: data.deal_updates,
        taskReminders: data.task_reminders,
        weeklyReport: data.weekly_report,
        systemAlerts: data.system_alerts,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load notification settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ---------- Save via API ----------
  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      email_notifications: prefs.emailNotifs,
      push_notifications: prefs.pushNotifs,
      sms_notifications: prefs.smsNotifs,
      new_lead: prefs.newLead,
      deal_updates: prefs.dealUpdates,
      task_reminders: prefs.taskReminders,
      weekly_report: prefs.weeklyReport,
      system_alerts: prefs.systemAlerts,
    };

    try {
      const updated = await updateNotificationSettings(payload);
      setPrefs({
        emailNotifs: updated.email_notifications,
        pushNotifs: updated.push_notifications,
        smsNotifs: updated.sms_notifications,
        newLead: updated.new_lead,
        dealUpdates: updated.deal_updates,
        taskReminders: updated.task_reminders,
        weeklyReport: updated.weekly_report,
        systemAlerts: updated.system_alerts,
      });
      setSuccess("Notification preferences saved.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save notification settings.");
    } finally {
      setSaving(false);
    }
  }

  // ---------- Toggle component ----------
  function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
    return (
      <button type="button" onClick={onChange}
        style={{ width: 44, height: 24, borderRadius: "9999px", border: "none", background: value ? "#4f46e5" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: "2px", left: value ? "22px" : "2px", width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
      </button>
    );
  }

  // ---------- UI groups ----------
  const GROUPS = [
    {
      title: "Notification Channels",
      items: [
        { key: "emailNotifs", label: "Email Notifications", sub: "Receive notifications via email" },
        { key: "pushNotifs", label: "Push Notifications", sub: "Receive push notifications in browser" },
        { key: "smsNotifs", label: "SMS Notifications", sub: "Receive notifications via SMS" },
      ],
    },
    {
      title: "Activity Notifications",
      items: [
        { key: "newLead", label: "New Lead", sub: "When a new lead is created" },
        { key: "dealUpdates", label: "Deal Updates", sub: "When a deal status changes" },
        { key: "taskReminders", label: "Task Reminders", sub: "Reminders for upcoming tasks" },
        { key: "weeklyReport", label: "Weekly Report", sub: "Weekly summary report" },
        { key: "systemAlerts", label: "System Alerts", sub: "Important system notifications" },
      ],
    },
  ];

  // ---------- Render ----------
  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Manage your notification preferences</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px", alignItems: "start" }}>
          <ProfileNav active="notifs" />

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HiBell size={17} color="#4f46e5" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Notification Settings</h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Choose how and when you want to be notified</p>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              {success && <div className="msg-success" style={{ marginBottom: "16px" }}>✅ {success}</div>}

              {error && !loading && (
                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "0.8125rem", color: "#b91c1c", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>⚠ {error}</span>
                  <button onClick={fetchSettings} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontFamily: "inherit", fontSize: "0.8125rem" }}>
                    Retry
                  </button>
                </div>
              )}

              {loading ? (
                <ThemeLoader label="Loading notification settings..." minHeight={300} />
              ) : (
                <>
                  {GROUPS.map((group, gi) => (
                    <div key={group.title} style={{ marginBottom: gi < GROUPS.length - 1 ? "24px" : 0 }}>
                      <h3 style={{ margin: "0 0 14px", fontSize: "0.875rem", fontWeight: 700, color: "#374151", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9" }}>
                        {group.title}
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {group.items.map((item) => (
                          <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
                            <div>
                              <p style={{ margin: "0 0 2px", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>{item.label}</p>
                              <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{item.sub}</p>
                            </div>
                            <Toggle
                              value={prefs[item.key as keyof typeof prefs] as boolean}
                              onChange={() => setPrefs((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                    <button onClick={handleSave} className="btn-add" disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      {saving ? "Saving..." : <><HiSave size={15} /> Save Changes</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}