export type FollowupType = "Call" | "Email" | "Meeting" | "Task" | "Follow-up";
export type FollowupStatus = "Upcoming" | "Completed" | "Overdue" | "Cancelled";
export type FollowupPriority = "High" | "Medium" | "Low";

export interface Followup {
  id: string;
  /** Human-readable backend code, e.g. "FU001". */
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
}

export const followups: Followup[] = [
  { id: "FU001", subject: "Product Demo Follow-up", relatedTo: "Ahmed Khan", company: "SoftiqTech", type: "Call", dueDate: "2024-05-12", dueTime: "10:00 AM", priority: "High", status: "Upcoming", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Discuss product demo feedback", createdDate: "2024-05-01" },
  { id: "FU002", subject: "Proposal Discussion", relatedTo: "Sara Ali", company: "Tech Solutions", type: "Email", dueDate: "2024-05-13", dueTime: "02:30 PM", priority: "Medium", status: "Upcoming", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Follow-up on proposal", createdDate: "2024-05-02" },
  { id: "FU003", subject: "Contract Negotiation", relatedTo: "Usman Ahmed", company: "ABC Corp", type: "Meeting", dueDate: "2024-05-14", dueTime: "11:00 AM", priority: "High", status: "Overdue", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Discuss contract terms", createdDate: "2024-05-03" },
  { id: "FU004", subject: "Pricing Discussion", relatedTo: "Bilal Hassan", company: "Global Solutions", type: "Call", dueDate: "2024-05-15", dueTime: "03:00 PM", priority: "Medium", status: "Completed", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Follow-up on pricing", createdDate: "2024-05-04" },
  { id: "FU005", subject: "Implementation Plan", relatedTo: "Ayesha Khan", company: "Digital Systems", type: "Meeting", dueDate: "2024-05-16", dueTime: "10:30 AM", priority: "Low", status: "Upcoming", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Discuss implementation plan", createdDate: "2024-05-05" },
  { id: "FU006", subject: "Feedback Collection", relatedTo: "Omar Farooq", company: "NextGen Ltd", type: "Email", dueDate: "2024-05-16", dueTime: "01:00 PM", priority: "Low", status: "Completed", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Collect final feedback", createdDate: "2024-05-06" },
  { id: "FU007", subject: "Onboarding Session", relatedTo: "Fatima Noor", company: "TechVision", type: "Meeting", dueDate: "2024-05-17", dueTime: "09:00 AM", priority: "High", status: "Upcoming", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "New customer onboarding", createdDate: "2024-05-07" },
  { id: "FU008", subject: "Support Call", relatedTo: "Kamran Sheikh", company: "WebForce", type: "Call", dueDate: "2024-05-10", dueTime: "02:00 PM", priority: "High", status: "Overdue", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Urgent support call", createdDate: "2024-05-08" },
  { id: "FU009", subject: "Renewal Discussion", relatedTo: "Hina Baig", company: "Pixel Works", type: "Email", dueDate: "2024-05-18", dueTime: "11:30 AM", priority: "Medium", status: "Upcoming", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Annual renewal followup", createdDate: "2024-05-09" },
  { id: "FU010", subject: "Partnership Meeting", relatedTo: "Nadia Qureshi", company: "SkyNet", type: "Meeting", dueDate: "2024-05-09", dueTime: "03:30 PM", priority: "High", status: "Overdue", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Explore partnership", createdDate: "2024-05-10" },
  { id: "FU011", subject: "Training Session", relatedTo: "Zain Raza", company: "Alpha Dynamics", type: "Task", dueDate: "2024-05-19", dueTime: "10:00 AM", priority: "Medium", status: "Upcoming", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Product training", createdDate: "2024-05-11" },
  { id: "FU012", subject: "Quarterly Review", relatedTo: "Amna Riaz", company: "Apex Solutions", type: "Meeting", dueDate: "2024-05-20", dueTime: "02:00 PM", priority: "High", status: "Upcoming", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Q2 review meeting", createdDate: "2024-05-12" },
  { id: "FU013", subject: "Demo Request", relatedTo: "Tariq Jameel", company: "Data Sphere", type: "Call", dueDate: "2024-05-21", dueTime: "11:00 AM", priority: "Medium", status: "Upcoming", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Product demo request", createdDate: "2024-05-13" },
  { id: "FU014", subject: "Invoice Follow-up", relatedTo: "Sobia Amin", company: "FutureMark", type: "Email", dueDate: "2024-05-08", dueTime: "09:00 AM", priority: "High", status: "Overdue", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Pending invoice", createdDate: "2024-05-14" },
  { id: "FU015", subject: "Technical Support", relatedTo: "Fahad Mir", company: "ByteLogic", type: "Call", dueDate: "2024-05-22", dueTime: "04:00 PM", priority: "Low", status: "Upcoming", assignedTo: "Khaanzadi", assignedInitials: "KH", notes: "Technical issue resolution", createdDate: "2024-05-15" },
];

export const TYPE_COLORS: Record<FollowupType, { bg: string; color: string }> = {
  "Call":      { bg: "#eef2ff", color: "#4f46e5" },
  "Email":     { bg: "#ecfeff", color: "#0891b2" },
  "Meeting":   { bg: "#faf5ff", color: "#7c3aed" },
  "Task":      { bg: "#fef3c7", color: "#b45309" },
  "Follow-up": { bg: "#f0fdf4", color: "#16a34a" },
};

export const STATUS_COLORS: Record<FollowupStatus, { bg: string; color: string; border: string; dot: string }> = {
  "Upcoming":  { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
  "Completed": { bg: "#dcfce7", color: "#15803d", border: "#86efac", dot: "#22c55e" },
  "Overdue":   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#ef4444" },
  "Cancelled": { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
};

export const PRIORITY_COLORS: Record<FollowupPriority, { bg: string; color: string; border: string }> = {
  "High":   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
  "Medium": { bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
  "Low":    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
};

export default followups;
