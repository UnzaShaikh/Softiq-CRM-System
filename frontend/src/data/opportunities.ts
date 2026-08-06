export type OpportunityStage =
  | "Prospecting"
  | "Qualification"
  | "Proposal"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";

export type OpportunityStatus = "Active" | "On Hold" | "Inactive";

export interface Opportunity {
  id: string;
  name: string;
  customerName: string;
  company: string;
  dealValue: number;
  stage: OpportunityStage;
  probability: number; // 0-100
  expectedCloseDate: string; // ISO date
  status: OpportunityStatus;
  assignedTo: string;
  createdDate: string;
  notes: string;
  avatar: string;
}

export const opportunities: Opportunity[] = [
  { id: "OP001", name: "Enterprise CRM License", customerName: "Ahmed Ali", company: "TechVision Pvt Ltd", dealValue: 120000, stage: "Negotiation", probability: 75, expectedCloseDate: "2024-08-15", status: "Active", assignedTo: "Khaanzadi", createdDate: "2024-06-01", notes: "Client interested in full suite.", avatar: "AA" },
  { id: "OP002", name: "Cloud Migration Package", customerName: "Sara Khan", company: "Digital Minds", dealValue: 85000, stage: "Proposal", probability: 55, expectedCloseDate: "2024-09-01", status: "Active", assignedTo: "Junaid", createdDate: "2024-06-05", notes: "Proposal sent, awaiting feedback.", avatar: "SK" },
  { id: "OP003", name: "Security Audit Contract", customerName: "Bilal Hussain", company: "CloudSoft Solutions", dealValue: 45000, stage: "Qualification", probability: 40, expectedCloseDate: "2024-09-20", status: "On Hold", assignedTo: "Khaanzadi", createdDate: "2024-06-08", notes: "Budget approval pending.", avatar: "BH" },
  { id: "OP004", name: "Data Analytics Suite", customerName: "Fatima Noor", company: "Nexus Corp", dealValue: 200000, stage: "Closed Won", probability: 100, expectedCloseDate: "2024-07-10", status: "Inactive", assignedTo: "Junaid", createdDate: "2024-05-15", notes: "Deal closed successfully.", avatar: "FN" },
  { id: "OP005", name: "Mobile App Development", customerName: "Usman Malik", company: "Innovative Tech", dealValue: 65000, stage: "Prospecting", probability: 20, expectedCloseDate: "2024-10-05", status: "Active", assignedTo: "Khaanzadi", createdDate: "2024-06-10", notes: "Initial discovery call done.", avatar: "UM" },
  { id: "OP006", name: "ERP Integration", customerName: "Ayesha Siddiqui", company: "BrightEdge Systems", dealValue: 150000, stage: "Negotiation", probability: 80, expectedCloseDate: "2024-08-25", status: "Active", assignedTo: "Junaid", createdDate: "2024-06-12", notes: "Final terms under discussion.", avatar: "AS" },
  { id: "OP007", name: "IT Support Annual Plan", customerName: "Zain Raza", company: "Alpha Dynamics", dealValue: 30000, stage: "Closed Lost", probability: 0, expectedCloseDate: "2024-07-01", status: "Inactive", assignedTo: "Khaanzadi", createdDate: "2024-05-20", notes: "Client went with competitor.", avatar: "ZR" },
  { id: "OP008", name: "Website Redesign Project", customerName: "Hina Baig", company: "Pixel Works", dealValue: 25000, stage: "Proposal", probability: 60, expectedCloseDate: "2024-09-10", status: "Active", assignedTo: "Junaid", createdDate: "2024-06-14", notes: "Design mockups shared.", avatar: "HB" },
  { id: "OP009", name: "DevOps Consulting", customerName: "Nadia Qureshi", company: "SkyNet Analytics", dealValue: 95000, stage: "Qualification", probability: 35, expectedCloseDate: "2024-10-15", status: "Active", assignedTo: "Khaanzadi", createdDate: "2024-06-16", notes: "Technical assessment scheduled.", avatar: "NQ" },
  { id: "OP010", name: "AI Chatbot Solution", customerName: "Kamran Sheikh", company: "WebForce Studio", dealValue: 175000, stage: "Negotiation", probability: 85, expectedCloseDate: "2024-08-30", status: "Active", assignedTo: "Junaid", createdDate: "2024-06-18", notes: "POC completed successfully.", avatar: "KS" },
  { id: "OP011", name: "Network Infrastructure", customerName: "Hamid Farooq", company: "TechNova Inc", dealValue: 55000, stage: "Prospecting", probability: 15, expectedCloseDate: "2024-11-01", status: "On Hold", assignedTo: "Khaanzadi", createdDate: "2024-06-20", notes: "Waiting for RFP document.", avatar: "HF" },
  { id: "OP012", name: "Training & Certification", customerName: "Amna Riaz", company: "Apex Solutions", dealValue: 18000, stage: "Closed Won", probability: 100, expectedCloseDate: "2024-07-15", status: "Inactive", assignedTo: "Junaid", createdDate: "2024-05-25", notes: "Training program delivered.", avatar: "AR" },
  { id: "OP013", name: "SaaS Platform License", customerName: "Tariq Jameel", company: "Data Sphere", dealValue: 72000, stage: "Proposal", probability: 50, expectedCloseDate: "2024-09-25", status: "Active", assignedTo: "Khaanzadi", createdDate: "2024-06-22", notes: "Awaiting legal review.", avatar: "TJ" },
  { id: "OP014", name: "Cybersecurity Package", customerName: "Sobia Amin", company: "FutureMark Ltd", dealValue: 88000, stage: "Qualification", probability: 45, expectedCloseDate: "2024-10-20", status: "Active", assignedTo: "Junaid", createdDate: "2024-06-24", notes: "Risk assessment in progress.", avatar: "SA" },
  { id: "OP015", name: "Digital Transformation", customerName: "Fahad Mir", company: "ByteLogic", dealValue: 250000, stage: "Negotiation", probability: 70, expectedCloseDate: "2024-09-05", status: "Active", assignedTo: "Khaanzadi", createdDate: "2024-06-25", notes: "Executive sponsor engaged.", avatar: "FM" },
];

export default opportunities;
