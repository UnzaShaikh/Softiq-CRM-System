export interface Contact {
  id: number;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: "Active" | "Inactive" | "Lead";
  lastInteraction: string;
}