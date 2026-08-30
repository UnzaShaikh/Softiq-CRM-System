export type NotePriority =
  | "High Priority"
  | "Medium Priority"
  | "Low Priority";

export type NoteCategory =
  | "Work"
  | "Clients"
  | "Development"
  | "Training"
  | "Research"
  | "Marketing"
  | "Product"
  | "Personal";

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
  relatedType:
    | "Customer"
    | "Lead"
    | "Opportunity"
    | "Deal"
    | null;
  isPinned: boolean;
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ALL_CATEGORIES: NoteCategory[] = [
  "Work",
  "Clients",
  "Development",
  "Training",
  "Research",
  "Marketing",
  "Product",
  "Personal",
];

export const CATEGORY_COLORS: Record<
  NoteCategory,
  {
    bg: string;
    color: string;
  }
> = {
  Work: {
    bg: "#eef2ff",
    color: "#4f46e5",
  },

  Clients: {
    bg: "#faf5ff",
    color: "#7c3aed",
  },

  Development: {
    bg: "#fef3c7",
    color: "#b45309",
  },

  Training: {
    bg: "#dcfce7",
    color: "#16a34a",
  },

  Research: {
    bg: "#ecfeff",
    color: "#0891b2",
  },

  Marketing: {
    bg: "#f0fdf4",
    color: "#15803d",
  },

  Product: {
    bg: "#fff7ed",
    color: "#c2410c",
  },

  Personal: {
    bg: "#fdf2f8",
    color: "#9d174d",
  },
};

export const PRIORITY_COLORS: Record<
  NotePriority,
  {
    bg: string;
    color: string;
    border: string;
  }
> = {
  "High Priority": {
    bg: "#fef2f2",
    color: "#dc2626",
    border: "#fca5a5",
  },

  "Medium Priority": {
    bg: "#fef3c7",
    color: "#b45309",
    border: "#fde68a",
  },

  "Low Priority": {
    bg: "#f0fdf4",
    color: "#16a34a",
    border: "#bbf7d0",
  },
};