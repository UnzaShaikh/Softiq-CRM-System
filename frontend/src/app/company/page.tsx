"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyTable from "@/components/company/CompanyTable";
import ThemeLoader from "@/components/ui/ThemeLoader";
import {
  ApiCompanyList,
  ApiFilterOptions,
  ApiCompanyStats,
  Company,
  toCompany,
} from "@/data/company";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";

export default function CompanyPage() {
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [sizeFilter, setSizeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "created_at">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [stats, setStats] = useState<ApiCompanyStats | null>(null);
  const [filterOptions, setFilterOptions] =
    useState<ApiFilterOptions | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Company pending delete confirmation (drives the modal)
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  const companiesPerPage = 10;

  const statusTabs = ["All", "Active", "Inactive"];

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter !== "All") params.set("status", statusFilter.toLowerCase());
    if (industryFilter !== "All") params.set("industry", industryFilter);
    if (sizeFilter !== "All") params.set("size", sizeFilter);
    params.set("page", String(currentPage));
    params.set("ordering", sortDir === "asc" ? sortBy : `-${sortBy}`);

    const run = async () => {
      setLoading(true);
      try {
        const data = await apiRequest<ApiCompanyList>(
          `/api/companies/?${params.toString()}`
        );
        if (cancelled) return;
        setCompanies(data.results.map(toCompany));
        setTotalCount(data.count);
        setError(null);
        const maxPage = Math.max(
          1,
          Math.ceil(data.count / companiesPerPage)
        );
        if (currentPage > maxPage) setCurrentPage(maxPage);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        if (!getAccessToken()) router.push("/login");
      } finally {
        if (!cancelled) setLoading(false);
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
    refreshKey,
    router,
  ]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const [statsData, optionsData] = await Promise.all([
          apiRequest<ApiCompanyStats>("/api/companies/stats/"),
          apiRequest<ApiFilterOptions>("/api/companies/filter-options/"),
        ]);
        if (cancelled) return;
        setStats(statsData);
        setFilterOptions(optionsData);
      } catch {
        if (cancelled) return;
        if (!getAccessToken()) router.push("/login");
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, router]);

  const totalCompanies = stats?.total_companies ?? totalCount;
  const activeCompanies = stats?.active_companies ?? 0;
  const newCompaniesThisMonth = stats?.new_this_month ?? 0;
  const totalContacts = stats?.total_contacts ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / companiesPerPage)
  );

  const startIndex =
    totalCount === 0 ? 0 : (currentPage - 1) * companiesPerPage + 1;
  const endIndex = Math.min(
    currentPage * companiesPerPage,
    totalCount
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleIndustryChange = (value: string) => {
    setIndustryFilter(value);
    setCurrentPage(1);
  };

  const handleSizeChange = (value: string) => {
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

  const handleSort = (field: "name" | "created_at") => {
    if (sortBy === field) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const handleDelete = async (company: Company) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${company.name}?`
    );

  // Runs when the user confirms deletion inside the modal
  const handleDeleteConfirmed = () => {
    if (!deleteTarget) return;

    try {
      await apiRequest(`/api/companies/${company.id}/`, {
        method: "DELETE",
      });
      emitDataChanged();
      setError(null);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const industries = filterOptions?.industries ?? [];
  const companySizes = filterOptions?.sizes ?? [];

  return (
    <DashboardLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Companies</h1>
            <p>Manage all companies in one place.</p>
          </div>

          <Link
            href="/company/new"
            className="btn-add add-company-btn"
          >
            <Plus size={16} />
            Add Company
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="company-stats-grid">
          <div className="company-stat-card">
            <div className="company-stat-icon stat-icon-purple">
              🏢
            </div>

            <div>
              <p
                className="stat-card-value"
                style={{ color: "#6c5dd3" }}
              >
                {totalCompanies}
              </strong>
            </div>
          </div>

          <div className="stat-card company-stat-card">
            <div
              className="stat-card-icon"
              style={{
                background: "#e6fbfc",
                color: "#0891b2",
              }}
            >
              <Users2 size={20} />
            </div>

            <div>
              <p
                className="stat-card-value"
                style={{ color: "#0891b2" }}
              >
                {activeCompanies}
              </strong>
            </div>
          </div>

          <div className="stat-card company-stat-card">
            <div
              className="stat-card-icon"
              style={{
                background: "#f0fdf4",
                color: "#16a34a",
              }}
            >
              <TrendingUp size={20} />
            </div>

            <div>
              <p
                className="stat-card-value"
                style={{ color: "#16a34a" }}
              >
                {newCompaniesThisMonth}
              </strong>
            </div>
          </div>

          <div className="stat-card company-stat-card">
            <div
              className="stat-card-icon"
              style={{
                background: "#fef3c7",
                color: "#f59e0b",
              }}
            >
              <UserRoundPlus size={20} />
            </div>

            <div>
              <p
                className="stat-card-value"
                style={{ color: "#f59e0b" }}
              >
                {totalContacts}
              </p>

              <p className="stat-card-label">
                Total Contacts
              </p>
            </div>
          </div>
        </div>

              <strong className="company-stat-value">
                {totalContacts}
              </strong>
            </div>
          </div>

        {/* Search & Filters */}
        <div className="company-toolbar">
          <div className="search-box">
            <span className="search-icon" aria-hidden="true">🔍</span>

            <input
              type="text"
              placeholder="Search companies..."
              className="search-input"
              value={search}
              onChange={(event) =>
                handleIndustryChange(event.target.value)
              }
              aria-label="Filter by industry"
            >
              <option value="All">All Industry</option>

              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={sizeFilter}
              onChange={(event) =>
                handleSizeChange(event.target.value)
              }
              aria-label="Filter by company size"
            >
              <option value="All">All Size</option>

              {companySizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>

          <span className="badge badge-new">
            {totalCount} results
          </span>

          {filteredCompanies.length > 0 && (
            <div className="pagination-wrap company-pagination">
              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
                aria-label="Previous page"
              >
                ‹
              </button>

              <div className="pagination-pages">
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`pagination-page ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

        <div className="filter-group" style={{ marginTop: "-8px", marginBottom: "24px" }}>
          <select
            className="filter-select"
            value={industryFilter}
            onChange={(event) =>
              handleIndustryChange(event.target.value)
            }
            aria-label="Filter by industry"
          >
            <option value="All">All Industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sizeFilter}
            onChange={(event) =>
              handleSizeChange(event.target.value)
            }
          }}
        >
          <div className="contacts-modal">
            <div className="contacts-modal-icon">
              <Trash2 size={22} />
            </div>

        {/* Result Information */}
        <div className="company-result-info">
          Showing {startIndex} to {endIndex} of {totalCount} companies
        </div>

        {error && (
          <div className="msg-error" role="alert">
            ❌ {error}
          </div>
        )}

        {loading ? (
          <ThemeLoader label="Loading companies..." minHeight={220} />
        ) : companies.length > 0 ? (
          <CompanyTable
            companies={companies}
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
              Try changing your search or filters.
            </p>

        {totalPages > 1 && (
          <div className="company-pagination">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              aria-label="Previous page"
            >
              ‹
            </button>

              <button
                type="button"
                className="contacts-modal-delete"
                onClick={handleDeleteConfirmed}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
