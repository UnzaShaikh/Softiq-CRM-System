"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Trash2,
  TrendingUp,
  UserRoundPlus,
  Users2,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyTable from "@/components/company/CompanyTable";
import SearchBar from "@/components/company/SearchBar";
import ThemeLoader from "@/components/ui/ThemeLoader";
import Pagination from "@/components/customers/Pagination";

import {
  ApiCompanyList,
  ApiCompanyStats,
  ApiFilterOptions,
  Company,
  toCompany,
} from "@/data/company";

import {
  buildCompanyListCacheKey,
  getCachedCompaniesList,
  getCachedCompanyFilterOptions,
  getCachedCompanyStats,
  removeCachedCompany,
  setCachedCompaniesList,
  setCachedCompanyFilterOptions,
  setCachedCompanyStats,
  subscribeCompanyCache,
} from "@/data/companyCache";

import {
  apiRequest,
  emitDataChanged,
  getAccessToken,
} from "@/lib/api";

import { usePermission } from "@/hooks/usePermissions";

const PAGE_SIZE = 10;

export default function CompanyPage() {
  const router = useRouter();

  const canCreate = usePermission("companies", "create");
  const canDelete = usePermission("companies", "delete");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [sizeFilter, setSizeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [sortBy, setSortBy] =
    useState<"name" | "created_at">("created_at");

  const [sortDir, setSortDir] =
    useState<"asc" | "desc">("desc");

  const cacheKey = buildCompanyListCacheKey({
    search,
    statusFilter,
    industryFilter,
    sizeFilter,
    currentPage,
    sortBy,
    sortDir,
  });

  const cachedList = useSyncExternalStore(
    subscribeCompanyCache,
    () => getCachedCompaniesList(cacheKey),
    () => null
  );

  const cachedStats = useSyncExternalStore(
    subscribeCompanyCache,
    getCachedCompanyStats,
    () => null
  );

  const cachedFilterOptions = useSyncExternalStore(
    subscribeCompanyCache,
    getCachedCompanyFilterOptions,
    () => null
  );

  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [stats, setStats] =
    useState<ApiCompanyStats | null>(null);

  const [filterOptions, setFilterOptions] =
    useState<ApiFilterOptions | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<Company | null>(null);

  const [deleting, setDeleting] = useState(false);

  const displayCompanies =
    cachedList?.companies ?? companies;

  const displayTotalCount =
    cachedList?.totalCount ?? totalCount;

  const displayStats = cachedStats ?? stats;

  const displayFilterOptions =
    cachedFilterOptions ?? filterOptions;

  useEffect(() => {
    if (cachedList) {
      setCompanies(cachedList.companies);
      setTotalCount(cachedList.totalCount);
      setLoading(false);
    }
  }, [cachedList]);

  useEffect(() => {
    if (cachedStats) {
      setStats(cachedStats);
    }
  }, [cachedStats]);

  useEffect(() => {
    if (cachedFilterOptions) {
      setFilterOptions(cachedFilterOptions);
    }
  }, [cachedFilterOptions]);

  /*
   * Company list request.
   *
   * If cached data exists:
   * - keep the existing table visible
   * - do not show the spinner
   * - refresh the data silently
   *
   * If no cache exists:
   * - show the normal loading spinner
   */
  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (statusFilter !== "All") {
      params.set(
        "status",
        statusFilter.toLowerCase()
      );
    }

    if (industryFilter !== "All") {
      params.set("industry", industryFilter);
    }

    if (sizeFilter !== "All") {
      params.set("size", sizeFilter);
    }

    params.set("page", String(currentPage));

    params.set(
      "ordering",
      sortDir === "asc"
        ? sortBy
        : `-${sortBy}`
    );

    const run = async () => {
      if (!cachedList) {
        setLoading(true);
      }

      try {
        const data =
          await apiRequest<ApiCompanyList>(
            `/api/companies/?${params.toString()}`
          );

        if (cancelled) return;

        const mapped =
          data.results.map(toCompany);

        setCompanies(mapped);
        setTotalCount(data.count);
        setError(null);

        setCachedCompaniesList(
          cacheKey,
          {
            companies: mapped,
            totalCount: data.count,
            search,
            statusFilter,
            industryFilter,
            sizeFilter,
            currentPage,
            sortBy,
            sortDir,
          }
        );

        const maxPage = Math.max(
          1,
          Math.ceil(data.count / PAGE_SIZE)
        );

        if (currentPage > maxPage) {
          setCurrentPage(maxPage);
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load companies."
        );

        if (!getAccessToken()) {
          router.push("/login");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    search,
    statusFilter,
    industryFilter,
    sizeFilter,
    currentPage,
    sortBy,
    sortDir,
    router,
    cacheKey,
    cachedList,
  ]);

  /*
   * Stats and filter options.
   * These are cached separately because they are independent
   * from the company table pagination/filter cache.
   */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const requests: [
          Promise<ApiCompanyStats>,
          Promise<ApiFilterOptions>
        ] = [
          apiRequest<ApiCompanyStats>(
            "/api/companies/stats/"
          ),
          apiRequest<ApiFilterOptions>(
            "/api/companies/filter-options/"
          ),
        ];

        const [statsData, optionsData] =
          await Promise.all(requests);

        if (cancelled) return;

        setStats(statsData);
        setFilterOptions(optionsData);

        setCachedCompanyStats(statsData);
        setCachedCompanyFilterOptions(
          optionsData
        );
      } catch {
        if (cancelled) return;

        if (!getAccessToken()) {
          router.push("/login");
        }
      }
    };

    /*
     * If both are already cached, still refresh them
     * silently in the background.
     */
    void run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const totalCompanies =
    displayStats?.total_companies ??
    displayTotalCount;

  const activeCompanies =
    displayStats?.active_companies ?? 0;

  const newCompaniesThisMonth =
    displayStats?.new_this_month ?? 0;

  const totalContacts =
    displayStats?.total_contacts ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil(
      displayTotalCount / PAGE_SIZE
    )
  );

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (
    value: string
  ) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleIndustryChange = (
    value: string
  ) => {
    setIndustryFilter(value);
    setCurrentPage(1);
  };

  const handleSizeChange = (
    value: string
  ) => {
    setSizeFilter(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("All");
    setIndustryFilter("All");
    setSizeFilter("All");
    setCurrentPage(1);
  };

  const handleSort = (
    field: "name" | "created_at"
  ) => {
    if (sortBy === field) {
      setSortDir((dir) =>
        dir === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(field);
      setSortDir("asc");
    }

    setCurrentPage(1);
  };

  const handleDelete = (
    company: Company
  ) => {
    setDeleteTarget(company);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await apiRequest(
        `/api/companies/${deleteTarget.id}/`,
        {
          method: "DELETE",
        }
      );

      /*
       * Immediately remove the company from
       * all in-memory cached views.
       */
      removeCachedCompany(
        deleteTarget.id
      );

      emitDataChanged();

      setError(null);
      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete company."
      );

      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const industries =
    displayFilterOptions?.industries ?? [];

  const companySizes =
    displayFilterOptions?.sizes ?? [];

  const statCards = [
    {
      label: "Total Companies",
      value: totalCompanies,
      color: "#6c5dd3",
      background: "#eef2ff",
      icon: <Building2 size={24} />,
    },
    {
      label: "Active Companies",
      value: activeCompanies,
      color: "#0891b2",
      background: "#e6fbfc",
      icon: <Users2 size={24} />,
    },
    {
      label: "New This Month",
      value: newCompaniesThisMonth,
      color: "#16a34a",
      background: "#f0fdf4",
      icon: <TrendingUp size={24} />,
    },
    {
      label: "Total Contacts",
      value: totalContacts,
      color: "#f59e0b",
      background: "#fef3c7",
      icon: <UserRoundPlus size={24} />,
    },
  ];

  /*
   * Important:
   *
   * Spinner is only rendered when there is NO cached
   * company list.
   *
   * When navigating back to Company, cached data stays
   * visible while the API refreshes in the background.
   */
  const showInitialLoader =
    loading &&
    !cachedList &&
    displayCompanies.length === 0;

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Companies
            </h1>

            <p className="page-subtitle">
              Manage all companies in one place.
            </p>
          </div>

          {canCreate && (
            <Link
              href="/company/new"
              className="btn-add add-company-btn"
            >
              <Plus size={16} />
              Add Company
            </Link>
          )}
        </div>

        {/* Summary Cards */}
        <div className="stats-grid">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="stat-card"
            >
              <div
                className="stat-card-icon"
                style={{
                  background:
                    card.background,
                  color: card.color,
                }}
              >
                {card.icon}
              </div>

              <div>
                <p
                  className="stat-card-value"
                  style={{
                    color: card.color,
                  }}
                >
                  {card.value}
                </p>

                <p className="stat-card-label">
                  {card.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Company Table */}
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-search-wrap">
              <SearchBar
                value={search}
                onChange={
                  handleSearchChange
                }
                placeholder="Search companies..."
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "#64748b",
                  whiteSpace: "nowrap",
                }}
              >
                {displayTotalCount} result
                {displayTotalCount === 1
                  ? ""
                  : "s"}
              </span>

              <div className="filter-tabs">
                {[
                  "All",
                  "Active",
                  "Inactive",
                ].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`filter-tab${
                      statusFilter === tab
                        ? " active"
                        : ""
                    }`}
                    onClick={() =>
                      handleStatusChange(
                        tab
                      )
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              borderTop:
                "1px solid #f1f5f9",
              background: "#fff",
              flexWrap: "wrap",
            }}
          >
            <select
              className="filter-select"
              value={industryFilter}
              onChange={(event) =>
                handleIndustryChange(
                  event.target.value
                )
              }
              aria-label="Filter by industry"
            >
              <option value="All">
                All Industries
              </option>

              {industries.map(
                (industry) => (
                  <option
                    key={industry}
                    value={industry}
                  >
                    {industry}
                  </option>
                )
              )}
            </select>

            <select
              className="filter-select"
              value={sizeFilter}
              onChange={(event) =>
                handleSizeChange(
                  event.target.value
                )
              }
              aria-label="Filter by company size"
            >
              <option value="All">
                All Sizes
              </option>

              {companySizes.map((size) => (
                <option
                  key={size}
                  value={size}
                >
                  {size}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
            >
              Reset Filters
            </button>
          </div>

          {error && (
            <div
              className="msg-error"
              role="alert"
            >
              ❌ {error}
            </div>
          )}

          {showInitialLoader ? (
            <ThemeLoader
              label="Loading companies..."
              minHeight={220}
            />
          ) : displayCompanies.length > 0 ? (
            <CompanyTable
              companies={displayCompanies}
              onDelete={handleDelete}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
            />
          ) : (
            <div className="company-empty-state">
              <h3 className="empty-state-title">
                No companies found
              </h3>

              <p className="empty-state-sub">
                Try changing your search or
                filters.
              </p>
            </div>
          )}

          {!showInitialLoader &&
            !error &&
            displayTotalCount > 0 && (
              <div className="pagination-wrap">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={
                    displayTotalCount
                  }
                  itemsPerPage={PAGE_SIZE}
                  onPageChange={
                    setCurrentPage
                  }
                />
              </div>
            )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div
          className="contacts-modal-overlay"
          onClick={() => {
            if (!deleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            className="contacts-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="contacts-modal-icon">
              <Trash2 size={22} />
            </div>

            <h3 className="contacts-modal-title">
              Delete Company
            </h3>

            <p className="contacts-modal-text">
              Are you sure you want to
              delete{" "}
              <strong>
                {deleteTarget.name}
              </strong>
              ? This action cannot be
              undone.
            </p>

            <div className="contacts-modal-actions">
              <button
                type="button"
                className="contacts-modal-cancel"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="contacts-modal-delete"
                onClick={
                  handleDeleteConfirmed
                }
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}