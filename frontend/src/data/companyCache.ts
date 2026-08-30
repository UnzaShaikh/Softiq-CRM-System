import type {
  ApiCompany,
  ApiCompanyStats,
  ApiFilterOptions,
  Company,
} from "@/data/company";

export type CompanyListCacheState = {
  companies: Company[];
  totalCount: number;
  search: string;
  statusFilter: string;
  industryFilter: string;
  sizeFilter: string;
  currentPage: number;
  sortBy: "name" | "created_at";
  sortDir: "asc" | "desc";
};

const companyById: Record<string, Company> = {};
const companyLists: Record<string, CompanyListCacheState> = {};

let cachedStats: ApiCompanyStats | null = null;
let cachedFilterOptions: ApiFilterOptions | null = null;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeCompanyCache(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getCachedCompany(id: number | string): Company | null {
  return companyById[String(id)] ?? null;
}

export function setCachedCompany(company: Company): void {
  companyById[String(company.id)] = company;

  Object.keys(companyLists).forEach((key) => {
    const list = companyLists[key];

    const exists = list.companies.some(
      (item) => item.id === company.id
    );

    if (exists) {
      companyLists[key] = {
        ...list,
        companies: list.companies.map((item) =>
          item.id === company.id ? company : item
        ),
      };
    }
  });

  notify();
}

export function removeCachedCompany(id: number | string): void {
  const numericId = Number(id);

  delete companyById[String(id)];

  Object.keys(companyLists).forEach((key) => {
    const list = companyLists[key];

    const exists = list.companies.some(
      (item) => item.id === numericId
    );

    if (exists) {
      companyLists[key] = {
        ...list,
        companies: list.companies.filter(
          (item) => item.id !== numericId
        ),
        totalCount: Math.max(0, list.totalCount - 1),
      };
    }
  });

  notify();
}

export function getCachedCompaniesList(
  key: string
): CompanyListCacheState | null {
  return companyLists[key] ?? null;
}

export function setCachedCompaniesList(
  key: string,
  value: CompanyListCacheState
): void {
  companyLists[key] = value;

  for (const company of value.companies) {
    companyById[String(company.id)] = company;
  }

  notify();
}

export function getCachedCompanyStats(): ApiCompanyStats | null {
  return cachedStats;
}

export function setCachedCompanyStats(
  value: ApiCompanyStats
): void {
  cachedStats = value;
  notify();
}

export function getCachedCompanyFilterOptions():
  | ApiFilterOptions
  | null {
  return cachedFilterOptions;
}

export function setCachedCompanyFilterOptions(
  value: ApiFilterOptions
): void {
  cachedFilterOptions = value;
  notify();
}

export function buildCompanyListCacheKey(options: {
  search: string;
  statusFilter: string;
  industryFilter: string;
  sizeFilter: string;
  currentPage: number;
  sortBy: "name" | "created_at";
  sortDir: "asc" | "desc";
}): string {
  return [
    "companies",
    options.search.trim(),
    options.statusFilter,
    options.industryFilter,
    options.sizeFilter,
    String(options.currentPage),
    options.sortBy,
    options.sortDir,
  ].join("|");
}