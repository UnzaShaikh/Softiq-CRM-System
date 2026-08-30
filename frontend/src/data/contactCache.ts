import type { Contact } from "@/data/contact";

export const CONTACT_CACHE_KEY = "__crm_contacts_cache__";

export type ContactCacheState = {
  contacts: Contact[];
  totalCount: number;
  search: string;
  statusFilter: "All" | "Active" | "Inactive" | "Lead";
  currentPage: number;
  savedAt?: number;
};

type StoredContactCache = ContactCacheState;

function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T): void {
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
    // Storage failures must never break the Contacts module.
  }
}

function removeStorage(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore cache cleanup failures.
  }
}

/**
 * Get the cached Contacts list.
 *
 * This function is safe to call from client effects.
 * It returns null during SSR and never accesses browser storage
 * while the server is rendering.
 */
export function getCachedContactsList(): ContactCacheState | null {
  return readStorage<StoredContactCache>(
    CONTACT_CACHE_KEY
  );
}

/**
 * Save the Contacts list in sessionStorage.
 *
 * This matches the Customers cache strategy:
 * - survives normal client-side navigation
 * - survives browser refresh during the current session
 * - stores the list and its current filters/page
 */
export function setCachedContactsList(
  value: ContactCacheState
): void {
  writeStorage(CONTACT_CACHE_KEY, {
    ...value,
    savedAt: Date.now(),
  });

  // Also cache every contact individually so View/Edit pages
  // can render the selected contact immediately.
  for (const contact of value.contacts) {
    setCachedContact(contact);
  }
}

/**
 * Get one cached contact by ID.
 */
export function getCachedContact(
  id: number | string
): Contact | null {
  return readStorage<Contact>(
    `${CONTACT_CACHE_KEY}:contact:${id}`
  );
}

/**
 * Save/update one contact in the cache.
 */
export function setCachedContact(
  contact: Contact
): void {
  writeStorage(
    `${CONTACT_CACHE_KEY}:contact:${contact.id}`,
    contact
  );

  const list = getCachedContactsList();

  if (!list) {
    return;
  }

  const exists = list.contacts.some(
    (item) => String(item.id) === String(contact.id)
  );

  if (!exists) {
    return;
  }

  writeStorage(CONTACT_CACHE_KEY, {
    ...list,
    contacts: list.contacts.map((item) =>
      String(item.id) === String(contact.id)
        ? contact
        : item
    ),
    savedAt: Date.now(),
  });
}

/**
 * Remove a contact from both the individual cache and
 * the cached Contacts list after deletion.
 */
export function removeCachedContact(
  id: number | string
): void {
  removeStorage(
    `${CONTACT_CACHE_KEY}:contact:${id}`
  );

  const list = getCachedContactsList();

  if (!list) {
    return;
  }

  const filteredContacts = list.contacts.filter(
    (contact) =>
      String(contact.id) !== String(id)
  );

  if (filteredContacts.length === list.contacts.length) {
    return;
  }

  writeStorage(CONTACT_CACHE_KEY, {
    ...list,
    contacts: filteredContacts,
    totalCount: Math.max(
      0,
      list.totalCount - 1
    ),
    savedAt: Date.now(),
  });
}

/**
 * Clear the Contacts cache.
 *
 * This clears the list and all individually cached contacts.
 */
export function clearContactsCache(): void {
  const list = getCachedContactsList();

  if (list) {
    for (const contact of list.contacts) {
      removeStorage(
        `${CONTACT_CACHE_KEY}:contact:${contact.id}`
      );
    }
  }

  removeStorage(CONTACT_CACHE_KEY);
}
