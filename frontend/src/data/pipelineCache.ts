/**
 * Sales Pipeline cache
 *
 * Cache-first / stale-while-revalidate storage for the Sales Pipeline page.
 * The cache is intentionally browser-only and guarded for SSR.
 */

const CACHE_PREFIX = "softiq:sales-pipeline:";
const CACHE_VERSION = 1;
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEnvelope<T> {
  version: number;
  cachedAt: number;
  data: T;
}

function storage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function keyFor(cacheKey: string): string {
  return `${CACHE_PREFIX}${cacheKey}`;
}

export function getSalesPipelineCache<T>(cacheKey: string): T | null {
  const store = storage();

  if (!store) {
    return null;
  }

  try {
    const raw = store.getItem(keyFor(cacheKey));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CacheEnvelope<T>;

    if (
      parsed.version !== CACHE_VERSION ||
      !parsed.cachedAt ||
      Date.now() - parsed.cachedAt > CACHE_TTL_MS
    ) {
      store.removeItem(keyFor(cacheKey));
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

export function setSalesPipelineCache<T>(
  cacheKey: string,
  data: T
): void {
  const store = storage();

  if (!store) {
    return;
  }

  try {
    const envelope: CacheEnvelope<T> = {
      version: CACHE_VERSION,
      cachedAt: Date.now(),
      data,
    };

    store.setItem(keyFor(cacheKey), JSON.stringify(envelope));
  } catch {
    // Storage can fail because of quota/private browsing.
    // The page should continue to work normally without cache.
  }
}

export function removeSalesPipelineCache(
  cacheKey?: string
): void {
  const store = storage();

  if (!store) {
    return;
  }

  try {
    if (cacheKey) {
      store.removeItem(keyFor(cacheKey));
      return;
    }

    for (let i = store.length - 1; i >= 0; i -= 1) {
      const key = store.key(i);

      if (key?.startsWith(CACHE_PREFIX)) {
        store.removeItem(key);
      }
    }
  } catch {
    // Ignore cache cleanup failures.
  }
}
