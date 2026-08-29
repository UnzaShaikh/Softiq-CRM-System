import { Customer } from "@/data/customers";

const CUSTOMER_PREFIX = "crm:customer:";
const CUSTOMER_LIST_PREFIX = "crm:customers:list:";
const CUSTOMER_STATS_KEY = "crm:customers:stats";

export type CustomerStats = {
  total: number;
  active: number;
  inactive: number;
  lead: number;
};

function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Cache is an optimization only; storage failures must never break the app.
  }
}

export function cacheCustomer(customer: Customer) {
  const key = `${CUSTOMER_PREFIX}${customer.id}`;
  writeStorage(key, customer);
}

export function getCachedCustomer(id: string | number): Customer | null {
  return readStorage<Customer>(`${CUSTOMER_PREFIX}${id}`);
}

export function removeCachedCustomer(id: string | number) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(`${CUSTOMER_PREFIX}${id}`);
  } catch {
    // Ignore cache cleanup failures.
  }
}

export function cacheCustomerList(
  key: string,
  customers: Customer[],
  totalCount: number
) {
  const payload = {
    customers,
    totalCount,
    savedAt: Date.now(),
  };

  writeStorage(`${CUSTOMER_LIST_PREFIX}${key}`, payload);

  // Also cache every customer individually so the detail page can render
  // immediately when the user clicks View.
  customers.forEach(cacheCustomer);
}

export function getCachedCustomerList(
  key: string
): { customers: Customer[]; totalCount: number } | null {
  const cached = readStorage<{
    customers: Customer[];
    totalCount: number;
    savedAt: number;
  }>(`${CUSTOMER_LIST_PREFIX}${key}`);

  if (!cached) return null;

  return {
    customers: cached.customers,
    totalCount: cached.totalCount,
  };
}

export function cacheCustomerStats(stats: CustomerStats) {
  writeStorage(CUSTOMER_STATS_KEY, stats);
}

export function getCachedCustomerStats(): CustomerStats | null {
  return readStorage<CustomerStats>(CUSTOMER_STATS_KEY);
}
