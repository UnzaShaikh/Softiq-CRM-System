import { apiRequest } from "@/lib/api";

export interface GlobalSearchResult {
  id: number;
  module: string;
  title: string;
  subtitle: string | null;
  status: string | null;
  url: string;
}

export interface GlobalSearchResponse {
  query: string;
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: GlobalSearchResult[];
}

export async function globalSearch(
  query: string,
  page: number = 1
): Promise<GlobalSearchResponse> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      query: "",
      count: 0,
      total_pages: 0,
      current_page: 1,
      page_size: 10,
      next: null,
      previous: null,
      results: [],
    };
  }

  return apiRequest<GlobalSearchResponse>(
    `/api/search/?q=${encodeURIComponent(trimmedQuery)}&page=${page}`
  );
}