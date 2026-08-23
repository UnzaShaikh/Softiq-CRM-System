import { apiRequest } from "@/lib/api";

// ─────────────────────────────────────────────
// Backend types
// ─────────────────────────────────────────────

export type ApiTaskStatus =
  | "todo"
  | "in_progress"
  | "completed"
  | "on_hold"
  | "cancelled";

export type ApiTaskPriority =
  | "low"
  | "medium"
  | "high";

export interface ApiTask {
  id: number;
  title: string;
  description: string | null;

  assignee: number | null;
  assignee_details: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  } | null;

  priority: ApiTaskPriority;
  status: ApiTaskStatus;

  due_date: string | null;
  created_at: string;
  updated_at: string;
  is_overdue: boolean;

  reminder: string | null;

  related_content_type: number | null;
  related_object_id: number | null;
  related_object_details: {
    id: number;
    str: string;
    model: string | null;
  } | null;

  tags: {
    id: number;
    name: string;
  }[];

  checklist_items: {
    id: number;
    task: number;
    text: string;
    is_completed: boolean;
    created_at: string;
  }[];

  attachments: {
    id: number;
    task: number;
    file: string;
    uploaded_at: string;
    uploaded_by: number | null;
    uploaded_by_name: string | null;
  }[];

  estimated_time: number | null;
  time_tracked: number;
  tracking_enabled: boolean;

  repeat_config: Record<string, unknown> | null;

  created_by: number | null;
  updated_by: number | null;
}

// ─────────────────────────────────────────────
// Request types
// ─────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assignee?: number | null;
  priority?: ApiTaskPriority;
  status?: ApiTaskStatus;
  due_date?: string | null;
  reminder?: string | null;

  related_content_type?: number | null;
  related_object_id?: number | null;

  tags?: string[];

  checklist_items?: {
    text: string;
    is_completed?: boolean;
  }[];

  estimated_time?: number | null;
  tracking_enabled?: boolean;

  repeat_config?: Record<string, unknown> | null;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────

export interface ApiTaskList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiTask[];
}

// ─────────────────────────────────────────────
// Task List
// ─────────────────────────────────────────────

export async function listTasks(
  params: Record<string, string | number | undefined> = {}
): Promise<ApiTaskList> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();

  return apiRequest<ApiTaskList>(
    `/api/tasks/${queryString ? `?${queryString}` : ""}`
  );
}

// ─────────────────────────────────────────────
// Get single task
// ─────────────────────────────────────────────

export async function getTask(id: number | string): Promise<ApiTask> {
  return apiRequest<ApiTask>(`/api/tasks/${id}/`);
}

// ─────────────────────────────────────────────
// Create task
// ─────────────────────────────────────────────

export async function createTask(
  payload: CreateTaskPayload
): Promise<ApiTask> {
  return apiRequest<ApiTask>("/api/tasks/", {
    method: "POST",
    body: payload,
  });
}

// ─────────────────────────────────────────────
// Update task
// ─────────────────────────────────────────────

export async function updateTask(
  id: number | string,
  payload: UpdateTaskPayload
): Promise<ApiTask> {
  return apiRequest<ApiTask>(`/api/tasks/${id}/`, {
    method: "PATCH",
    body: payload,
  });
}

// ─────────────────────────────────────────────
// Delete task
// ─────────────────────────────────────────────

export async function deleteTask(
  id: number | string
): Promise<void> {
  return apiRequest<void>(`/api/tasks/${id}/`, {
    method: "DELETE",
  });
}

// ─────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────

export interface TaskSummary {
  total: number;
  status_counts: Record<ApiTaskStatus, number>;
}

export async function getTaskSummary(): Promise<TaskSummary> {
  return apiRequest<TaskSummary>("/api/tasks/summary/");
}

// ─────────────────────────────────────────────
// Kanban
// ─────────────────────────────────────────────

export interface KanbanTasks {
  todo: ApiTask[];
  in_progress: ApiTask[];
  completed: ApiTask[];
  on_hold: ApiTask[];
  cancelled: ApiTask[];
}

export async function getKanbanTasks(): Promise<KanbanTasks> {
  return apiRequest<KanbanTasks>("/api/tasks/kanban/");
}

// ─────────────────────────────────────────────
// Update status
// ─────────────────────────────────────────────

export async function updateTaskStatus(
  id: number | string,
  status: ApiTaskStatus
): Promise<ApiTask> {
  return apiRequest<ApiTask>(`/api/tasks/${id}/status/`, {
    method: "PATCH",
    body: { status },
  });
}

// ─────────────────────────────────────────────
// Checklist
// ─────────────────────────────────────────────

export async function createChecklistItem(
  taskId: number | string,
  text: string
) {
  return apiRequest(`/api/checklist-items/`, {
    method: "POST",
    body: {
      task: Number(taskId),
      text,
    },
  });
}

export async function updateChecklistItem(
  id: number | string,
  payload: {
    text?: string;
    is_completed?: boolean;
  }
) {
  return apiRequest(`/api/checklist-items/${id}/`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteChecklistItem(
  id: number | string
): Promise<void> {
  return apiRequest<void>(`/api/checklist-items/${id}/`, {
    method: "DELETE",
  });
}

export async function toggleChecklistItem(
  id: number | string
) {
  return apiRequest(`/api/checklist-items/${id}/toggle/`, {
    method: "PATCH",
  });
}