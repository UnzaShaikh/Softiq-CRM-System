export type FollowupType =
  | "Call"
  | "Email"
  | "Meeting"
  | "Task"
  | "Follow-up";

export type FollowupStatus =
  | "Upcoming"
  | "Completed"
  | "Overdue"
  | "Cancelled";

export type FollowupPriority =
  | "High"
  | "Medium"
  | "Low";

export interface Followup {
  /**
   * Database primary key.
   */
  id: string;

  /**
   * Human-readable backend ID.
   * Example: FU001
   */
  code?: string;

  subject: string;

  relatedTo: string;

  company: string;

  type: FollowupType;

  dueDate: string;

  dueTime: string;

  priority: FollowupPriority;

  status: FollowupStatus;

  assignedTo: string;

  assignedInitials: string;

  notes: string;

  createdDate: string;

  /**
   * Internal cache/form information.
   *
   * These values are NOT displayed directly.
   * They allow Edit page to open immediately
   * without waiting for the API.
   */
  relatedKey?: string;

  companyId?: string;
}

/**
 * IMPORTANT:
 *
 * There is intentionally NO dummy followups array here.
 *
 * Follow-ups are loaded from the backend API.
 */

/* -------------------------------------------------
 * Type colors
 * ------------------------------------------------- */

export const TYPE_COLORS: Record<
  FollowupType,
  {
    bg: string;
    color: string;
  }
> = {
  Call: {
    bg: "#eef2ff",
    color: "#4f46e5",
  },

  Email: {
    bg: "#ecfeff",
    color: "#0891b2",
  },

  Meeting: {
    bg: "#faf5ff",
    color: "#7c3aed",
  },

  Task: {
    bg: "#fef3c7",
    color: "#b45309",
  },

  "Follow-up": {
    bg: "#f0fdf4",
    color: "#16a34a",
  },
};

/* -------------------------------------------------
 * Status colors
 * ------------------------------------------------- */

export const STATUS_COLORS: Record<
  FollowupStatus,
  {
    bg: string;
    color: string;
    border: string;
    dot: string;
  }
> = {
  Upcoming: {
    bg: "#eff6ff",
    color: "#1d4ed8",
    border: "#bfdbfe",
    dot: "#3b82f6",
  },

  Completed: {
    bg: "#dcfce7",
    color: "#15803d",
    border: "#86efac",
    dot: "#22c55e",
  },

  Overdue: {
    bg: "#fef2f2",
    color: "#dc2626",
    border: "#fca5a5",
    dot: "#ef4444",
  },

  Cancelled: {
    bg: "#f1f5f9",
    color: "#64748b",
    border: "#e2e8f0",
    dot: "#94a3b8",
  },
};

/* -------------------------------------------------
 * Priority colors
 * ------------------------------------------------- */

export const PRIORITY_COLORS: Record<
  FollowupPriority,
  {
    bg: string;
    color: string;
    border: string;
  }
> = {
  High: {
    bg: "#fef2f2",
    color: "#dc2626",
    border: "#fca5a5",
  },

  Medium: {
    bg: "#fef3c7",
    color: "#b45309",
    border: "#fde68a",
  },

  Low: {
    bg: "#f0fdf4",
    color: "#16a34a",
    border: "#bbf7d0",
  },
};