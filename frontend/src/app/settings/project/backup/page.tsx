"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsNav from "@/components/project-settings/SettingsNav";
import Link from "next/link";
import {
  HiChevronRight, HiArchive, HiDownload, HiRefresh,
  HiCheckCircle, HiClock, HiDatabase,
} from "react-icons/hi";

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      style={{ width: 44, height: 24, borderRadius: "9999px", border: "none", background: value ? "#4f46e5" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </button>
  );
}

const BACKUP_HISTORY = [
  { id: 1, name: "Full Backup",         date: "Aug 14, 2026",  time: "02:00 AM", size: "24.5 MB", status: "Success", type: "Auto"   },
  { id: 2, name: "Full Backup",         date: "Aug 13, 2026",  time: "02:00 AM", size: "24.1 MB", status: "Success", type: "Auto"   },
  { id: 3, name: "Manual Backup",       date: "Aug 12, 2026",  time: "10:30 AM", size: "23.8 MB", status: "Success", type: "Manual" },
  { id: 4, name: "Full Backup",         date: "Aug 11, 2026",  time: "02:00 AM", size: "23.2 MB", status: "Failed",  type: "Auto"   },
  { id: 5, name: "Full Backup",         date: "Aug 10, 2026",  time: "02:00 AM", size: "22.9 MB", status: "Success", type: "Auto"   },
];

const EXPORT_MODULES = ["Customers", "Contacts", "Leads", "Deals", "Activities", "Notes", "Follow-ups", "Tasks"];

export default function BackupExportPage() {
  const [autoBackup,       setAutoBackup]       = useState(true);
  const [backupFrequency,  setBackupFrequency]  = useState("Daily");
  const [backupTime,       setBackupTime]       = useState("02:00");
  const [retentionDays,    setRetentionDays]    = useState("30");
  const [exportFormat,     setExportFormat]     = useState("CSV");
  const [selectedModules,  setSelectedModules]  = useState<string[]>(["Customers", "Leads", "Deals"]);
  const [backingUp,        setBackingUp]        = useState(false);
  const [exporting,        setExporting]        = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [toast,            setToast]            = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3500); }

  async function handleManualBackup() {
    setBackingUp(true);
    await new Promise(r => setTimeout(r, 1500));
    setBackingUp(false);
    showToast("Backup completed successfully.");
  }

  async function handleExport() {
    if (!selectedModules.length) { showToast("Please select at least one module."); return; }
    setExporting(true);
    await new Promise(r => setTimeout(r, 1500));
    setExporting(false);
    showToast(`Data exported as ${exportFormat} successfully.`);
  }

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    showToast("Backup settings saved successfully.");
  }

  function toggleModule(mod: string) {
    setSelectedModules(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);
  }

  const selectStyle: React.CSSProperties = {
    padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8,
    background: "#fff", color: "#0f172a", fontSize: "0.875rem",
    fontFamily: "inherit", outline: "none", cursor: "pointer", width: "100%",
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: "0.8125rem", color: "#94a3b8" }}>
          <Link href="/settings/project" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>Project Settings</Link>
          <HiChevronRight size={14} />
          <span style={{ color: "#374151" }}>Backup & Export</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Backup & Export</h1>
            <p className="page-subtitle">Manage automated backups and export your CRM data in multiple formats.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleManualBackup} disabled={backingUp} className="btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <HiRefresh size={15} style={{ animation: backingUp ? "spin 0.8s linear infinite" : "none" }} />
              {backingUp ? "Backing up…" : "Backup Now"}
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-add"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 20, alignItems: "start" }}>
          <SettingsNav />

          {/* Center */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Auto Backup Settings */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HiArchive size={17} color="#4f46e5" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Automatic Backup</h2>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Configure scheduled backup settings</p>
                </div>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>Enable Automatic Backup</p>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>Automatically backup your data on a schedule</p>
                  </div>
                  <Toggle value={autoBackup} onChange={() => setAutoBackup(p => !p)} />
                </div>

                {autoBackup && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Frequency</label>
                      <select value={backupFrequency} onChange={e => setBackupFrequency(e.target.value)} style={selectStyle}>
                        {["Daily","Weekly","Monthly"].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Backup Time</label>
                      <input type="time" value={backupTime} onChange={e => setBackupTime(e.target.value)}
                        style={{ ...selectStyle, cursor: "text" }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Retention (days)</label>
                      <select value={retentionDays} onChange={e => setRetentionDays(e.target.value)} style={selectStyle}>
                        {["7","14","30","60","90"].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Data Export */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HiDownload size={17} color="#4f46e5" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Export Data</h2>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Download your CRM data in CSV, Excel or JSON format</p>
                </div>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group" style={{ maxWidth: 200 }}>
                  <label className="form-label">Export Format</label>
                  <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={selectStyle}>
                    {["CSV","Excel (.xlsx)","JSON"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ display: "block", marginBottom: 10 }}>Select Modules to Export</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {EXPORT_MODULES.map(mod => {
                      const selected = selectedModules.includes(mod);
                      return (
                        <button key={mod} type="button" onClick={() => toggleModule(mod)}
                          style={{ padding: "8px 10px", border: `1.5px solid ${selected ? "#4f46e5" : "#e2e8f0"}`, borderRadius: 8, background: selected ? "#eef2ff" : "#fff", color: selected ? "#4f46e5" : "#374151", fontFamily: "inherit", fontSize: "0.8rem", fontWeight: selected ? 600 : 400, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
                          {selected && <HiCheckCircle size={12} />}
                          {mod}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={handleExport} disabled={exporting} className="btn-add"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
                  <HiDownload size={15} />
                  {exporting ? "Exporting…" : `Export as ${exportFormat}`}
                </button>
              </div>
            </div>

            {/* Backup History */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Backup History</h2>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Name","Date & Time","Size","Type","Status",""].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BACKUP_HISTORY.map((b, idx) => (
                    <tr key={b.id}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                      style={{ transition: "background 0.1s", borderBottom: idx === BACKUP_HISTORY.length - 1 ? "none" : "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>{b.name}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ margin: 0, fontSize: "0.8125rem", color: "#374151" }}>{b.date}</p>
                        <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{b.time}</p>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "#64748b" }}>{b.size}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: b.type === "Auto" ? "#4f46e5" : "#b45309", background: b.type === "Auto" ? "#eef2ff" : "#fef3c7", padding: "2px 8px", borderRadius: 999 }}>{b.type}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: b.status === "Success" ? "#15803d" : "#dc2626", background: b.status === "Success" ? "#dcfce7" : "#fef2f2", padding: "2px 8px", borderRadius: 999 }}>{b.status}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {b.status === "Success" && (
                          <button style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "#4f46e5", fontSize: "0.78rem", fontWeight: 600, fontFamily: "inherit" }}>
                            <HiDownload size={12} /> Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <HiDatabase size={16} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Storage Usage</h3>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Used</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#4f46e5" }}>124.5 MB / 500 MB</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                  <div style={{ width: "24.9%", height: "100%", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", borderRadius: 999 }} />
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>24.9% of storage used</p>
              </div>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Last Backup",    value: "Aug 14, 2026 02:00 AM", icon: <HiClock size={13} /> },
                  { label: "Total Backups",  value: "5 backups",              icon: <HiArchive size={13} /> },
                  { label: "Success Rate",   value: "80% (4/5)",              icon: <HiCheckCircle size={13} /> },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: "0.78rem" }}>{r.icon} {r.label}</div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#4338ca", lineHeight: 1.6 }}>
                ℹ️ Regular backups protect your data. We recommend enabling daily automatic backups with at least 30 days retention.
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
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
