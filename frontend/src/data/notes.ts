export type NotePriority = "High Priority" | "Medium Priority" | "Low Priority";
export type NoteCategory = "Work" | "Clients" | "Development" | "Training" | "Research" | "Marketing" | "Product" | "Personal";

export interface NoteTag {
  id: string;
  label: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  priority: NotePriority;
  tags: NoteTag[];
  author: string;
  authorInitials: string;
  relatedTo: string;
  relatedType: "Customer" | "Lead" | "Opportunity" | "Deal" | null;
  isPinned: boolean;
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export const notes: Note[] = [
  {
    id: "N001",
    title: "Project Kickoff Meeting Notes",
    content: "Today we had the kickoff meeting for the new CRM implementation project with Alpha Dynamics.\n\nKey points discussed:\n- Project timeline: 12 weeks\n- Team members and responsibilities\n- Budget allocation and resources\n- Key deliverables and milestones\n- Risk assessment and mitigation strategies\n\nNext steps:\n1. Share project timeline with all stakeholders\n2. Set up development environment\n3. Schedule weekly progress meetings",
    category: "Work",
    priority: "High Priority",
    tags: [{ id: "t1", label: "Project" }, { id: "t2", label: "Kickoff" }, { id: "t3", label: "Meeting" }],
    author: "Khaanzadi",
    authorInitials: "KH",
    relatedTo: "Alpha Dynamics",
    relatedType: "Customer",
    isPinned: true,
    isStarred: false,
    isArchived: false,
    createdAt: "2024-05-30T10:30:00",
    updatedAt: "2024-05-30T11:15:00",
  },
  {
    id: "N002",
    title: "Client Requirements - Alpha Dynamics",
    content: "Key requirements gathered during initial client meeting.\n\n- CRM integration with existing ERP\n- Custom reporting dashboard\n- Mobile-first design\n- Multi-user access control",
    category: "Clients",
    priority: "High Priority",
    tags: [{ id: "t4", label: "Requirements" }, { id: "t5", label: "Client" }],
    author: "Khaanzadi",
    authorInitials: "KH",
    relatedTo: "Alpha Dynamics",
    relatedType: "Customer",
    isPinned: false,
    isStarred: true,
    isArchived: false,
    createdAt: "2024-05-29T09:00:00",
    updatedAt: "2024-05-29T09:45:00",
  },
  {
    id: "N003",
    title: "Q2 Marketing Campaign Ideas",
    content: "Brainstorming ideas for the upcoming quarter marketing campaign.\n\n- Social media push on LinkedIn\n- Email newsletter redesign\n- Webinar series on CRM best practices",
    category: "Marketing",
    priority: "Medium Priority",
    tags: [{ id: "t6", label: "Marketing" }, { id: "t7", label: "Q2" }],
    author: "Khaanzadi",
    authorInitials: "KH",
    relatedTo: "",
    relatedType: null,
    isPinned: false,
    isStarred: false,
    isArchived: false,
    createdAt: "2024-05-28T14:00:00",
    updatedAt: "2024-05-28T14:00:00",
  },
  {
    id: "N004",
    title: "Bug Fixes - Dashboard Issues",
    content: "List of dashboard issues found during testing and their status.\n\n- Charts not loading on mobile\n- Stats cards showing wrong data\n- Pagination breaking on filter",
    category: "Development",
    priority: "High Priority",
    tags: [{ id: "t8", label: "Bugs" }, { id: "t9", label: "Dashboard" }],
    author: "Khaanzadi",
    authorInitials: "KH",
    relatedTo: "",
    relatedType: null,
    isPinned: false,
    isStarred: false,
    isArchived: false,
    createdAt: "2024-05-26T11:00:00",
    updatedAt: "2024-05-26T11:00:00",
  },
  {
    id: "N005",
    title: "Sales Team Training Notes",
    content: "Notes from the sales team training session.\n\n- CRM usage best practices\n- Lead qualification criteria\n- Follow-up cadence guidelines",
    category: "Training",
    priority: "Medium Priority",
    tags: [{ id: "t10", label: "Training" }, { id: "t11", label: "Sales" }],
    author: "Khaanzadi",
    authorInitials: "KH",
    relatedTo: "",
    relatedType: null,
    isPinned: false,
    isStarred: false,
    isArchived: false,
    createdAt: "2024-05-24T10:00:00",
    updatedAt: "2024-05-24T10:00:00",
  },
  {
    id: "N006",
    title: "Competitor Analysis - 2024",
    content: "Detailed analysis of our key competitors and market position.\n\n- Salesforce: Strong enterprise features\n- HubSpot: Better SMB pricing\n- Our advantage: Customization + Support",
    category: "Research",
    priority: "Medium Priority",
    tags: [{ id: "t12", label: "Research" }, { id: "t13", label: "Competitors" }],
    author: "Khaanzadi",
    authorInitials: "KH",
    relatedTo: "",
    relatedType: null,
    isPinned: false,
    isStarred: true,
    isArchived: false,
    createdAt: "2024-05-24T09:00:00",
    updatedAt: "2024-05-24T09:00:00",
  },
  {
    id: "N007",
    title: "Product Roadmap Discussion",
    content: "Discussion on product roadmap and future releases.\n\n- Q3: Mobile app launch\n- Q4: AI-powered insights\n- 2025: Enterprise tier",
    category: "Product",
    priority: "High Priority",
    tags: [{ id: "t14", label: "Roadmap" }, { id: "t15", label: "Product" }],
    author: "Khaanzadi",
    authorInitials: "KH",
    relatedTo: "",
    relatedType: null,
    isPinned: false,
    isStarred: false,
    isArchived: false,
    createdAt: "2024-05-18T13:00:00",
    updatedAt: "2024-05-18T13:00:00",
  },
  {
    id: "N008",
    title: "Customer Feedback Summary",
    content: "Summary of customer feedback collected in Q1.\n\n- 87% satisfaction rate\n- Top request: Better reporting\n- Common complaint: Slow load times",
    category: "Clients",
    priority: "Medium Priority",
    tags: [{ id: "t16", label: "Feedback" }, { id: "t17", label: "Q1" }],
    author: "Khaanzadi",
    authorInitials: "KH",
    relatedTo: "",
    relatedType: null,
    isPinned: false,
    isStarred: false,
    isArchived: false,
    createdAt: "2024-05-15T10:00:00",
    updatedAt: "2024-05-15T10:00:00",
  },
  {
    id: "N009",
    title: "Weekly Team Sync Notes",
    content: "Notes from weekly team synchronization meeting.\n\n- Sprint progress review\n- Blockers discussed\n- Next sprint planning",
    category: "Work",
    priority: "Low Priority",
    tags: [{ id: "t18", label: "Team" }, { id: "t19", label: "Sync" }],
    author: "Khaanzadi",
    authorInitials: "KH",
    relatedTo: "",
    relatedType: null,
    isPinned: false,
    isStarred: false,
    isArchived: false,
    createdAt: "2024-05-12T09:00:00",
    updatedAt: "2024-05-12T09:00:00",
  },
];

export const ALL_CATEGORIES: NoteCategory[] = ["Work", "Clients", "Development", "Training", "Research", "Marketing", "Product", "Personal"];

export const CATEGORY_COLORS: Record<NoteCategory, { bg: string; color: string }> = {
  "Work":        { bg: "#eef2ff", color: "#4f46e5" },
  "Clients":     { bg: "#faf5ff", color: "#7c3aed" },
  "Development": { bg: "#fef3c7", color: "#b45309" },
  "Training":    { bg: "#dcfce7", color: "#16a34a" },
  "Research":    { bg: "#ecfeff", color: "#0891b2" },
  "Marketing":   { bg: "#f0fdf4", color: "#15803d" },
  "Product":     { bg: "#fff7ed", color: "#c2410c" },
  "Personal":    { bg: "#fdf2f8", color: "#9d174d" },
};

export const PRIORITY_COLORS: Record<NotePriority, { bg: string; color: string; border: string }> = {
  "High Priority":   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
  "Medium Priority": { bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
  "Low Priority":    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
};

export default notes;
