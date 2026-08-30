"use client";

import type {
  Activity,
  ApiActivity,
  ApiActivitySummary,
  ActivityDropdowns,
} from "@/data/activity";

export type ActivityListCacheState = {
  activities: Activity[];
  apiActivities: ApiActivity[];
  totalCount: number;
  search: string;
  statusFilter: string;
  typeFilter: string;
  priorityFilter: string;
  assignedToFilter: string;
  dateFrom: string;
  dateTo: string;
  currentPage: number;
  sortKey: string;
  sortDir: "asc" | "desc";
};

type CalendarCacheState = {
  key: string;
  activities: Activity[];
};

type Store = {
  list: ActivityListCacheState | null;
  byId: Record<string, ApiActivity>;
  summary: ApiActivitySummary | null;
  dropdowns: ActivityDropdowns | null;
  calendar: CalendarCacheState | null;
};

const store: Store = {
  list: null,
  byId: {},
  summary: null,
  dropdowns: null,
  calendar: null,
};

export function getCachedActivitiesList(): ActivityListCacheState | null {
  return store.list;
}

export function setCachedActivitiesList(value: ActivityListCacheState): void {
  store.list = value;
  for (const activity of value.apiActivities) {
    store.byId[String(activity.id)] = activity;
  }
}

export function getCachedActivity(id: number | string): ApiActivity | null {
  return store.byId[String(id)] ?? null;
}

export function setCachedActivity(activity: ApiActivity): void {
  const key = String(activity.id);
  store.byId[key] = activity;

  if (!store.list) return;

  store.list = {
    ...store.list,
    apiActivities: store.list.apiActivities.map((item) =>
      String(item.id) === key ? activity : item
    ),
    activities: store.list.activities.map((item) =>
      String(item.id) === key ? mapActivity(activity) : item
    ),
  };
}

export function removeCachedActivity(id: number | string): void {
  const key = String(id);
  delete store.byId[key];

  if (!store.list) return;

  store.list = {
    ...store.list,
    apiActivities: store.list.apiActivities.filter(
      (item) => String(item.id) !== key
    ),
    activities: store.list.activities.filter(
      (item) => String(item.id) !== key
    ),
    totalCount: Math.max(0, store.list.totalCount - 1),
  };
}

export function getCachedActivitySummary(): ApiActivitySummary | null {
  return store.summary;
}

export function setCachedActivitySummary(summary: ApiActivitySummary): void {
  store.summary = summary;
}

export function getCachedActivityDropdowns(): ActivityDropdowns | null {
  return store.dropdowns;
}

export function setCachedActivityDropdowns(dropdowns: ActivityDropdowns): void {
  store.dropdowns = dropdowns;
}

export function getCachedActivityCalendar(key: string): Activity[] | null {
  if (!store.calendar || store.calendar.key !== key) return null;
  return store.calendar.activities;
}

export function setCachedActivityCalendar(key: string, activities: Activity[]): void {
  store.calendar = { key, activities };
}

function mapActivity(api: ApiActivity): Activity {
  const typeMap: Record<ApiActivity["type"], Activity["type"]> = {
    call: "Call",
    meeting: "Meeting",
    email: "Email",
    task: "Task",
    follow_up: "Follow-up",
  };

  const statusMap: Record<ApiActivity["status"], Activity["status"]> = {
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
    overdue: "Overdue",
  };

  const priorityMap: Record<ApiActivity["priority"], Activity["priority"]> = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  return {
    id: api.id,
    title: api.title,
    type: typeMap[api.type],
    status: statusMap[api.status],
    priority: priorityMap[api.priority],
    date: api.date,
    time: api.time ? api.time.slice(0, 5) : "",
    duration: api.duration,
    assignedTo: api.assigned_to_name || "—",
    assignedToId: api.assigned_to,
    relatedTo: api.related_to || "—",
    relatedType: api.related_type || "—",
    customer: api.customer,
    lead: api.lead,
    deal: api.deal,
    description: api.description || "",
    location: api.location || "",
    createdDate: api.created_at ? api.created_at.slice(0, 10) : "",
    createdByName: api.created_by_name,
  };
}
