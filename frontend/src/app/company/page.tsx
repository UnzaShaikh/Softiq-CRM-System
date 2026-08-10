"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users2,
  TrendingUp,
  UserRoundPlus,
  Plus,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyTable from "@/components/company/CompanyTable";
import SearchBar from "@/components/customers/SearchBar";
import { companies as initialCompanies, Company } from "@/data/company";

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [sizeFilter, setSizeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const companiesPerPage = 10;

  const industries = useMemo(
    () =>
      Array.from(
        new Set(companies.map((company) => company.industry))
      ),
    [companies]
  );

  const companySizes = useMemo(
    () =>
      Array.from(
        new Set(companies.map((company) => company.size))
      ),
    [companies]
  );

  const filteredCompanies = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return companies.filter((company) => {
      const matchesSearch =
        searchValue === "" ||
        company.name.toLowerCase().includes(searchValue) ||
        company.industry.toLowerCase().includes(searchValue) ||
        company.email.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || company.status === statusFilter;

      const matchesIndustry =
        industryFilter === "All" ||
        company.industry === industryFilter;

      const matchesSize =
        sizeFilter === "All" || company.size === sizeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesIndustry &&
        matchesSize
      );
    });
  }, [
    companies,
    search,
    statusFilter,
    industryFilter,
    sizeFilter,
  ]);

  const totalCompanies = companies.length;

  const activeCompanies = companies.filter(
    (company) => company.status === "Active"
  ).length;

  const newCompaniesThisMonth = companies.filter((company) => {
    const companyDate = new Date(company.createdOn);
    const currentDate = new Date();

    return (
      companyDate.getMonth() === currentDate.getMonth() &&
      companyDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  const totalContacts = companies.reduce(
    (total, company) => total + company.contacts,
    0
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / companiesPerPage)
  );

  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * companiesPerPage,
    currentPage * companiesPerPage
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

  const handleDelete = (company: Company) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${company.name}?`
    );

    if (!confirmed) return;

    setCompanies((previousCompanies) =>
      previousCompanies.filter((item) => item.id !== company.id)
    );

    setCurrentPage(1);
  };

  const statusTabs = ["All", "Active", "Inactive"];

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

        <div className="stats-grid company-stats-grid">
          <div className="stat-card company-stat-card">
            <div
              className="stat-card-icon"
              style={{
                background: "#f0edff",
                color: "#6c5dd3",
              }}
            >
              <Building2 size={20} />
            </div>

            <div>
              <p
                className="stat-card-value"
                style={{ color: "#6c5dd3" }}
              >
                {totalCompanies}
              </p>

              <p className="stat-card-label">
                Total Companies
              </p>
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
              </p>

              <p className="stat-card-label">
                Active Companies
              </p>
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
              </p>

              <p className="stat-card-label">
                New This Month
              </p>
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

        <div className="table-card company-table-card">
          <div className="contacts-table-toolbar">
            <div className="contacts-search-wrap">
              <SearchBar
                value={search}
                onChange={handleSearchChange}
                placeholder="Search companies by name, industry, or email…"
              />
            </div>

            <div className="contacts-toolbar-right">
              <span className="contacts-results-count">
                {filteredCompanies.length} results
              </span>

              <div className="contacts-filter-tabs">
                {statusTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`contacts-filter-tab${
                      statusFilter === tab ? " active" : ""
                    }`}
                    onClick={() => handleStatusChange(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-group company-filter-group">
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

          <div className="company-result-info">
            Showing{" "}
            {filteredCompanies.length === 0
              ? 0
              : (currentPage - 1) * companiesPerPage + 1}{" "}
            to{" "}
            {Math.min(
              currentPage * companiesPerPage,
              filteredCompanies.length
            )}{" "}
            of {filteredCompanies.length} companies
          </div>

          {paginatedCompanies.length > 0 ? (
            <CompanyTable
              companies={paginatedCompanies}
              onDelete={handleDelete}
            />
          ) : (
            <div className="empty-state company-empty-state">
              <p className="empty-state-title">
                No companies found.
              </p>

              <p className="empty-state-sub">
                Try changing your search or filters.
              </p>
            </div>
          )}

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
    </DashboardLayout>
  );
}