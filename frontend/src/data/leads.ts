export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";
export type LeadSource = "Website" | "Referral" | "Social Media" | "Email" | "Other";

export interface ApiLead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  source: "website" | "referral" | "social" | "email" | "other";
  status: "new" | "contacted" | "qualified" | "lost";
  score: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  source: LeadSource;
  score: number;
  createdDate: string;
  avatar: string;
}

export const STATUS_FROM_API: Record<ApiLead["status"], LeadStatus> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  lost: "Lost",
};

export const STATUS_TO_API: Record<LeadStatus, ApiLead["status"]> = {
  New: "new",
  Contacted: "contacted",
  Qualified: "qualified",
  Lost: "lost",
};

export const SOURCE_FROM_API: Record<ApiLead["source"], LeadSource> = {
  website: "Website",
  referral: "Referral",
  social: "Social Media",
  email: "Email",
  other: "Other",
};

export const SOURCE_TO_API: Record<LeadSource, ApiLead["source"]> = {
  Website: "website",
  Referral: "referral",
  "Social Media": "social",
  Email: "email",
  Other: "other",
};

export function toLead(api: ApiLead): Lead {
  const first = api.first_name || "Unnamed";
  const last = api.last_name || "";
  const initials = `${first.charAt(0)}${last.charAt(0) || ""}`.toUpperCase() || "?";

  return {
    id: String(api.id),
    name: `${first} ${last}`.trim(),
    email: api.email,
    phone: api.phone,
    company: api.company,
    status: STATUS_FROM_API[api.status],
    source: SOURCE_FROM_API[api.source],
    score: api.score,
    createdDate: api.created_at.slice(0, 10),
    avatar: initials,
  };
}

export interface LeadFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
}

export function toFormValues(api: ApiLead): LeadFormValues {
  return {
    first_name: api.first_name,
    last_name: api.last_name,
    email: api.email,
    phone: api.phone,
    company: api.company,
    source: SOURCE_FROM_API[api.source],
    status: STATUS_FROM_API[api.status],
    score: api.score,
  };
}

export interface ApiLeadList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiLead[];
}

export const leads: Lead[] = [
  { id: "L001", name: "Ali Raza",       email: "ali.raza@example.com",    phone: "+92 300 1112233", company: "Skyline Tech",   status: "New",       source: "Website",      score: 75, createdDate: "2024-06-01", avatar: "AR" },
  { id: "L002", name: "Maria Hassan",   email: "maria.h@example.com",     phone: "+92 321 4445566", company: "BrightPath",    status: "Contacted", source: "Referral",     score: 60, createdDate: "2024-06-05", avatar: "MH" },
  { id: "L003", name: "Omar Sheikh",    email: "omar.s@example.com",      phone: "+92 333 7778899", company: "DataSync",      status: "Qualified", source: "Website",      score: 90, createdDate: "2024-06-08", avatar: "OS" },
  { id: "L004", name: "Zara Malik",     email: "zara.malik@example.com",  phone: "+92 345 0011223", company: "Nexus Pro",     status: "Contacted", source: "Email",        score: 55, createdDate: "2024-06-10", avatar: "ZM" },
  { id: "L005", name: "Hamza Tariq",    email: "hamza.t@example.com",     phone: "+92 312 3344556", company: "CloudPeak",     status: "Qualified", source: "Social Media", score: 88, createdDate: "2024-05-20", avatar: "HT" },
  { id: "L006", name: "Sana Iqbal",     email: "sana.iqbal@example.com",  phone: "+92 322 6677889", company: "WebRise",       status: "Lost",      source: "Website",      score: 20, createdDate: "2024-05-15", avatar: "SI" },
  { id: "L007", name: "Kamran Baig",    email: "kamran.b@example.com",    phone: "+92 311 9900112", company: "Pixel Hub",     status: "New",       source: "Referral",     score: 70, createdDate: "2024-06-12", avatar: "KB" },
  { id: "L008", name: "Noor Fatima",    email: "noor.f@example.com",      phone: "+92 336 2233445", company: "TechBridge",    status: "Contacted", source: "Email",        score: 65, createdDate: "2024-06-14", avatar: "NF" },
  { id: "L009", name: "Asim Khan",      email: "asim.khan@example.com",   phone: "+92 301 5566778", company: "Orbit Systems", status: "Qualified", source: "Website",      score: 85, createdDate: "2024-06-15", avatar: "AK" },
  { id: "L010", name: "Rabia Shah",     email: "rabia.shah@example.com",  phone: "+92 340 8899001", company: "SwiftNet",      status: "New",       source: "Social Media", score: 72, createdDate: "2024-06-16", avatar: "RS" },
  { id: "L011", name: "Faisal Javed",   email: "faisal.j@example.com",    phone: "+92 315 1122334", company: "AlphaTech",     status: "Qualified", source: "Referral",     score: 95, createdDate: "2024-05-25", avatar: "FJ" },
  { id: "L012", name: "Huma Anwar",     email: "huma.anwar@example.com",  phone: "+92 324 4455667", company: "BetaSoft",      status: "New",       source: "Email",        score: 68, createdDate: "2024-06-18", avatar: "HA" },
  { id: "L013", name: "Tariq Mehmood",  email: "tariq.m@example.com",     phone: "+92 302 7788990", company: "GammaSys",      status: "Contacted", source: "Website",      score: 58, createdDate: "2024-06-19", avatar: "TM" },
  { id: "L014", name: "Aisha Nawaz",    email: "aisha.n@example.com",     phone: "+92 318 0011223", company: "DeltaCore",     status: "Lost",      source: "Social Media", score: 15, createdDate: "2024-05-10", avatar: "AN" },
  { id: "L015", name: "Bilal Azhar",    email: "bilal.azhar@example.com", phone: "+92 344 3344556", company: "EpsilonHub",    status: "Qualified", source: "Referral",     score: 80, createdDate: "2024-06-20", avatar: "BA" },
];
