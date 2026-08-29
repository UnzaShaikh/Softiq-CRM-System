"use client";

import type { Task } from "@/data/tasks";

const TASK_PREFIX = "crm:task:";
const TASK_LIST_PREFIX = "crm:tasks:list:";

interface CachedTaskList {
  tasks: Task[];
  totalCount: number;
  savedAt: number;
}

function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);

    return raw
      ? (JSON.parse(raw) as T)
      : null;
  } catch {
    return null;
  }
}

function writeStorage<T>(
  key: string,
  value: T
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch {
    // Cache is only an optimization.
  }
}

// ─────────────────────────────────────────────
// Single task
// ─────────────────────────────────────────────

export function cacheTask(task: Task): void {
  writeStorage(
    `${TASK_PREFIX}${task.id}`,
    task
  );
}

export function getCachedTask(
  id: string | number
): Task | null {
  return readStorage<Task>(
    `${TASK_PREFIX}${id}`
  );
}

export function removeCachedTask(
  id: string | number
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(
      `${TASK_PREFIX}${id}`
    );
  } catch {
    // Ignore cache cleanup errors.
  }
}

// ─────────────────────────────────────────────
// Task list
// ─────────────────────────────────────────────

export function cacheTaskList(
  key: string,
  tasks: Task[],
  totalCount: number
): void {
  const payload: CachedTaskList = {
    tasks,
    totalCount,
    savedAt: Date.now(),
  };

  writeStorage(
    `${TASK_LIST_PREFIX}${key}`,
    payload
  );

  tasks.forEach(cacheTask);
}

export function getCachedTaskList(
  key: string
): {
  tasks: Task[];
  totalCount: number;
} | null {
  const cached = readStorage<CachedTaskList>(
    `${TASK_LIST_PREFIX}${key}`
  );

  if (!cached) {
    return null;
  }

  return {
    tasks: cached.tasks,
    totalCount: cached.totalCount,
  };
}

export function removeTaskFromCachedLists(
  id: string | number
): void {
  if (typeof window === "undefined") {
    return;
  }

  const prefix = TASK_LIST_PREFIX;

  try {
    const keysToRemove: string[] = [];

    for (let index = 0; index < window.sessionStorage.length; index++) {
      const key =
        window.sessionStorage.key(index);

      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      const cached =
        readStorage<CachedTaskList>(key);

      if (!cached) continue;

      const nextTasks =
        cached.tasks.filter(
          (task) =>
            String(task.id) !== String(id)
        );

      writeStorage(key, {
        ...cached,
        tasks: nextTasks,
        totalCount: Math.max(
          0,
          cached.totalCount -
            (nextTasks.length !== cached.tasks.length
              ? 1
              : 0)
        ),
      });
    }
  } catch {
    // Ignore cache cleanup errors.
  }
}