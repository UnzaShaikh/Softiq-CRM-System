export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Closed Won" | "Closed Lost";
export type LeadSource = "Website" | "Referral" | "Social Media" | "Cold Call" | "Email Campaign" | "Other";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  source: LeadSource;
  value: number;
  location: string;
  assignedTo: string;
  createdDate: string;
  avatar: string;
}

export const leads: Lead[] = [
  { id: "L001", name: "Ali Raza", email: "ali.raza@example.com", phone: "+92 300 1112233", company: "Skyline Tech", status: "New", source: "Website", value: 15000, location: "Karachi", assignedTo: "Khaanzadi", createdDate: "2024-06-01", avatar: "AR" },
  { id: "L002", name: "Maria Hassan", email: "maria.h@example.com", phone: "+92 321 4445566", company: "BrightPath", status: "Contacted", source: "Referral", value: 28000, location: "Lahore", assignedTo: "Junaid", createdDate: "2024-06-05", avatar: "MH" },
  { id: "L003", name: "Omar Sheikh", email: "omar.s@example.com", phone: "+92 333 7778899", company: "DataSync", status: "Qualified", source: "Cold Call", value: 42000, location: "Islamabad", assignedTo: "Khaanzadi", createdDate: "2024-06-08", avatar: "OS" },
  { id: "L004", name: "Zara Malik", email: "zara.malik@example.com", phone: "+92 345 0011223", company: "Nexus Pro", status: "Proposal", source: "Email Campaign", value: 67000, location: "Peshawar", assignedTo: "Junaid", createdDate: "2024-06-10", avatar: "ZM" },
  { id: "L005", name: "Hamza Tariq", email: "hamza.t@example.com", phone: "+92 312 3344556", company: "CloudPeak", status: "Closed Won", source: "Social Media", value: 95000, location: "Karachi", assignedTo: "Khaanzadi", createdDate: "2024-05-20", avatar: "HT" },
  { id: "L006", name: "Sana Iqbal", email: "sana.iqbal@example.com", phone: "+92 322 6677889", company: "WebRise", status: "Closed Lost", source: "Website", value: 12000, location: "Lahore", assignedTo: "Junaid", createdDate: "2024-05-15", avatar: "SI" },
  { id: "L007", name: "Kamran Baig", email: "kamran.b@example.com", phone: "+92 311 9900112", company: "Pixel Hub", status: "New", source: "Referral", value: 23000, location: "Multan", assignedTo: "Khaanzadi", createdDate: "2024-06-12", avatar: "KB" },
  { id: "L008", name: "Noor Fatima", email: "noor.f@example.com", phone: "+92 336 2233445", company: "TechBridge", status: "Contacted", source: "Cold Call", value: 35000, location: "Faisalabad", assignedTo: "Junaid", createdDate: "2024-06-14", avatar: "NF" },
  { id: "L009", name: "Asim Khan", email: "asim.khan@example.com", phone: "+92 301 5566778", company: "Orbit Systems", status: "Qualified", source: "Email Campaign", value: 58000, location: "Islamabad", assignedTo: "Khaanzadi", createdDate: "2024-06-15", avatar: "AK" },
  { id: "L010", name: "Rabia Shah", email: "rabia.shah@example.com", phone: "+92 340 8899001", company: "SwiftNet", status: "Proposal", source: "Social Media", value: 81000, location: "Karachi", assignedTo: "Junaid", createdDate: "2024-06-16", avatar: "RS" },
  { id: "L011", name: "Faisal Javed", email: "faisal.j@example.com", phone: "+92 315 1122334", company: "AlphaTech", status: "Closed Won", source: "Website", value: 110000, location: "Lahore", assignedTo: "Khaanzadi", createdDate: "2024-05-25", avatar: "FJ" },
  { id: "L012", name: "Huma Anwar", email: "huma.anwar@example.com", phone: "+92 324 4455667", company: "BetaSoft", status: "New", source: "Referral", value: 18000, location: "Quetta", assignedTo: "Junaid", createdDate: "2024-06-18", avatar: "HA" },
  { id: "L013", name: "Tariq Mehmood", email: "tariq.m@example.com", phone: "+92 302 7788990", company: "GammaSys", status: "Contacted", source: "Cold Call", value: 29000, location: "Rawalpindi", assignedTo: "Khaanzadi", createdDate: "2024-06-19", avatar: "TM" },
  { id: "L014", name: "Aisha Nawaz", email: "aisha.n@example.com", phone: "+92 318 0011223", company: "DeltaCore", status: "Closed Lost", source: "Email Campaign", value: 7500, location: "Sialkot", assignedTo: "Junaid", createdDate: "2024-05-10", avatar: "AN" },
  { id: "L015", name: "Bilal Azhar", email: "bilal.azhar@example.com", phone: "+92 344 3344556", company: "EpsilonHub", status: "Qualified", source: "Social Media", value: 47000, location: "Hyderabad", assignedTo: "Khaanzadi", createdDate: "2024-06-20", avatar: "BA" },
];

export default leads;
