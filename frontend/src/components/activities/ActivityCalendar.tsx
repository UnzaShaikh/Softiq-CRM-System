"use client";

import { Activity, ActivityType } from "@/data/activity";

interface ActivityCalendarProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
  year: number;
  month: number; // 0-based
  onMonthChange: (year: number, month: number) => void;
}

const TYPE_COLORS: Record<ActivityType, string> = {
  "Call":      "#4f46e5",
  "Meeting":   "#7c3aed",
  "Email":     "#0891b2",
  "Task":      "#d97706",
  "Follow-up": "#16a34a",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function ActivityCalendar({ activities, onActivityClick, year: currentYear, month: currentMonth, onMonthChange }: ActivityCalendarProps) {
  const today = new Date();

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  function prevMonth() {
    if (currentMonth === 0) onMonthChange(currentYear - 1, 11);
    else onMonthChange(currentYear, currentMonth - 1);
  }

  function nextMonth() {
    if (currentMonth === 11) onMonthChange(currentYear + 1, 0);
    else onMonthChange(currentYear, currentMonth + 1);
  }

  function getActivitiesForDay(day: number): Activity[] {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return activities.filter(a => a.date === dateStr);
  }

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  // Build calendar cells
  const cells: { day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, current: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, current: true });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, current: false });

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
        <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", transition: "all 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#4f46e5"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", transition: "all 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#4f46e5"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #f1f5f9" }}>
        {DAYS.map(d => (
          <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {cells.map((cell, idx) => {
          const dayActivities = cell.current ? getActivitiesForDay(cell.day) : [];
          const isT = cell.current && isToday(cell.day);
          const isLastRow = idx >= 35;
          return (
            <div key={idx} style={{ minHeight: "80px", padding: "6px", borderRight: (idx + 1) % 7 === 0 ? "none" : "1px solid #f1f5f9", borderBottom: isLastRow ? "none" : "1px solid #f1f5f9", background: cell.current ? "#fff" : "#fafafa", transition: "background 0.1s" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: isT ? 700 : 500, color: isT ? "#fff" : cell.current ? "#374151" : "#cbd5e1", background: isT ? "#4f46e5" : "transparent" }}>
                  {cell.day}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {dayActivities.slice(0, 3).map(act => (
                  <button key={act.id} onClick={() => onActivityClick(act)}
                    style={{ width: "100%", padding: "2px 5px", borderRadius: "4px", border: "none", background: TYPE_COLORS[act.type] + "20", color: TYPE_COLORS[act.type], fontSize: "0.68rem", fontWeight: 600, cursor: "pointer", textAlign: "left", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", transition: "opacity 0.1s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.75")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                    title={act.title}
                  >
                    {act.time} {act.title}
                  </button>
                ))}
                {dayActivities.length > 3 && (
                  <span style={{ fontSize: "0.68rem", color: "#94a3b8", padding: "0 5px" }}>+{dayActivities.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
