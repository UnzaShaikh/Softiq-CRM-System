import type { Followup } from "@/data/followups";

const LIST_KEY = "followups:list";
const RECORD_PREFIX = "followups:record:";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function read<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) {
    return;
  }

  try {
    sessionStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch {
    // Storage failure must never break the application.
  }
}

function remove(key: string): void {
  if (!isBrowser()) {
    return;
  }

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failure.
  }
}

/* -------------------------------------------------
 * List cache
 * ------------------------------------------------- */

export function getCachedFollowupsList(): Followup[] | null {
  return read<Followup[]>(LIST_KEY);
}

export function setCachedFollowupsList(
  followups: Followup[]
): void {
  write(LIST_KEY, followups);

  followups.forEach(followup => {
    write(
      `${RECORD_PREFIX}${String(followup.id)}`,
      followup
    );
  });
}

/* -------------------------------------------------
 * Individual record cache
 * ------------------------------------------------- */

export function getCachedFollowup(
  id: string | number
): Followup | null {
  return read<Followup>(
    `${RECORD_PREFIX}${String(id)}`
  );
}

export function setCachedFollowup(
  followup: Followup
): void {
  write(
    `${RECORD_PREFIX}${String(followup.id)}`,
    followup
  );
}

/* -------------------------------------------------
 * Update cached record
 * ------------------------------------------------- */

export function updateCachedFollowup(
  followup: Followup
): void {
  setCachedFollowup(followup);

  const cachedList =
    getCachedFollowupsList();

  if (!cachedList) {
    return;
  }

  const exists = cachedList.some(
    item =>
      String(item.id) ===
      String(followup.id)
  );

  const updatedList = exists
    ? cachedList.map(item =>
        String(item.id) ===
        String(followup.id)
          ? followup
          : item
      )
    : [
        followup,
        ...cachedList,
      ];

  write(
    LIST_KEY,
    updatedList
  );
}

/* -------------------------------------------------
 * Add newly created record
 * ------------------------------------------------- */

export function addCachedFollowup(
  followup: Followup
): void {
  setCachedFollowup(followup);

  const cachedList =
    getCachedFollowupsList();

  if (!cachedList) {
    write(
      LIST_KEY,
      [followup]
    );

    return;
  }

  const exists = cachedList.some(
    item =>
      String(item.id) ===
      String(followup.id)
  );

  if (exists) {
    write(
      LIST_KEY,
      cachedList.map(item =>
        String(item.id) ===
        String(followup.id)
          ? followup
          : item
      )
    );

    return;
  }

  write(
    LIST_KEY,
    [
      followup,
      ...cachedList,
    ]
  );
}

/* -------------------------------------------------
 * Remove individual record
 * ------------------------------------------------- */

export function removeCachedFollowup(
  id: string | number
): void {
  remove(
    `${RECORD_PREFIX}${String(id)}`
  );

  const cachedList =
    getCachedFollowupsList();

  if (!cachedList) {
    return;
  }

  write(
    LIST_KEY,
    cachedList.filter(
      item =>
        String(item.id) !==
        String(id)
    )
  );
}

/* -------------------------------------------------
 * Clear complete cache
 * ------------------------------------------------- */

export function clearFollowupCache(): void {
  remove(LIST_KEY);

  if (!isBrowser()) {
    return;
  }

  try {
    const keys: string[] = [];

    for (
      let index = 0;
      index < sessionStorage.length;
      index++
    ) {
      const key =
        sessionStorage.key(index);

      if (
        key &&
        key.startsWith(RECORD_PREFIX)
      ) {
        keys.push(key);
      }
    }

    keys.forEach(key => remove(key));
  } catch {
    // Ignore storage failure.
  }
}