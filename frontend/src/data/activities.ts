export type ActivityType = "Call" | "Meeting" | "Email" | "Task" | "Follow-up";
export type ActivityStatus = "Scheduled" | "Completed" | "Cancelled" | "Overdue";
export type ActivityPriority = "High" | "Medium" | "Low";

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  priority: ActivityPriority;
  date: string; // ISO date YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  assignedTo: string;
  relatedTo: string; // customer/lead name
  relatedType: "Customer" | "Lead" | "Opportunity";
  description: string;
  location: string;
  createdDate: string;
}

export const activities: Activity[] = [
  { id: "ACT001", title: "Discovery Call with Ahmed Ali", type: "Call", status: "Scheduled", priority: "High", date: "2024-08-10", time: "10:00", duration: 30, assignedTo: "Khaanzadi", relatedTo: "Ahmed Ali", relatedType: "Customer", description: "Initial discovery call to understand requirements.", location: "Phone", createdDate: "2024-08-01" },
  { id: "ACT002", title: "Product Demo - Digital Minds", type: "Meeting", status: "Completed", priority: "High", date: "2024-08-08", time: "14:00", duration: 60, assignedTo: "Junaid", relatedTo: "Sara Khan", relatedType: "Customer", description: "Live product demo for the team.", location: "Zoom", createdDate: "2024-08-02" },
  { id: "ACT003", title: "Send Proposal to CloudSoft", type: "Email", status: "Completed", priority: "Medium", date: "2024-08-07", time: "09:00", duration: 15, assignedTo: "Khaanzadi", relatedTo: "Bilal Hussain", relatedType: "Customer", description: "Send detailed proposal with pricing.", location: "Email", createdDate: "2024-08-03" },
  { id: "ACT004", title: "Follow-up - Nexus Corp Deal", type: "Follow-up", status: "Overdue", priority: "High", date: "2024-08-05", time: "11:00", duration: 20, assignedTo: "Junaid", relatedTo: "Fatima Noor", relatedType: "Opportunity", description: "Follow up on proposal sent last week.", location: "Phone", createdDate: "2024-08-04" },
  { id: "ACT005", title: "Contract Review Meeting", type: "Meeting", status: "Scheduled", priority: "High", date: "2024-08-12", time: "15:00", duration: 90, assignedTo: "Khaanzadi", relatedTo: "Usman Malik", relatedType: "Customer", description: "Review final contract terms.", location: "Office", createdDate: "2024-08-05" },
  { id: "ACT006", title: "Cold Call - BrightEdge", type: "Call", status: "Cancelled", priority: "Low", date: "2024-08-06", time: "13:00", duration: 15, assignedTo: "Junaid", relatedTo: "Ayesha Siddiqui", relatedType: "Lead", description: "Initial cold call to introduce services.", location: "Phone", createdDate: "2024-08-05" },
  { id: "ACT007", title: "Technical Demo - Alpha Dynamics", type: "Meeting", status: "Scheduled", priority: "Medium", date: "2024-08-14", time: "10:30", duration: 60, assignedTo: "Khaanzadi", relatedTo: "Zain Raza", relatedType: "Customer", description: "Technical deep-dive demo.", location: "Teams", createdDate: "2024-08-06" },
  { id: "ACT008", title: "Send Case Studies", type: "Email", status: "Completed", priority: "Low", date: "2024-08-07", time: "16:00", duration: 10, assignedTo: "Junaid", relatedTo: "Hina Baig", relatedType: "Lead", description: "Send relevant case studies.", location: "Email", createdDate: "2024-08-06" },
  { id: "ACT009", title: "Quarterly Review - SkyNet", type: "Meeting", status: "Scheduled", priority: "High", date: "2024-08-15", time: "11:00", duration: 120, assignedTo: "Khaanzadi", relatedTo: "Nadia Qureshi", relatedType: "Customer", description: "Q3 business review meeting.", location: "Office", createdDate: "2024-08-07" },
  { id: "ACT010", title: "Negotiation Call - WebForce", type: "Call", status: "Scheduled", priority: "High", date: "2024-08-13", time: "09:30", duration: 45, assignedTo: "Junaid", relatedTo: "Kamran Sheikh", relatedType: "Opportunity", description: "Final price negotiation.", location: "Phone", createdDate: "2024-08-07" },
  { id: "ACT011", title: "Onboarding Session - TechNova", type: "Meeting", status: "Completed", priority: "Medium", date: "2024-08-09", time: "14:00", duration: 60, assignedTo: "Khaanzadi", relatedTo: "Hamid Farooq", relatedType: "Customer", description: "New customer onboarding.", location: "Zoom", createdDate: "2024-08-08" },
  { id: "ACT012", title: "Follow-up Email - Apex Solutions", type: "Follow-up", status: "Scheduled", priority: "Medium", date: "2024-08-11", time: "10:00", duration: 10, assignedTo: "Junaid", relatedTo: "Amna Riaz", relatedType: "Lead", description: "Follow up after initial meeting.", location: "Email", createdDate: "2024-08-08" },
  { id: "ACT013", title: "Support Call - ByteLogic", type: "Call", status: "Overdue", priority: "High", date: "2024-08-04", time: "15:00", duration: 30, assignedTo: "Khaanzadi", relatedTo: "Fahad Mir", relatedType: "Customer", description: "Urgent support call.", location: "Phone", createdDate: "2024-08-03" },
  { id: "ACT014", title: "Partnership Discussion", type: "Meeting", status: "Scheduled", priority: "Medium", date: "2024-08-16", time: "13:00", duration: 60, assignedTo: "Junaid", relatedTo: "Omar Sheikh", relatedType: "Lead", description: "Explore partnership opportunities.", location: "Office", createdDate: "2024-08-09" },
  { id: "ACT015", title: "Demo Follow-up Task", type: "Task", status: "Scheduled", priority: "Low", date: "2024-08-17", time: "09:00", duration: 20, assignedTo: "Khaanzadi", relatedTo: "Zara Malik", relatedType: "Opportunity", description: "Prepare follow-up materials after demo.", location: "N/A", createdDate: "2024-08-09" },
];

export default activities;
