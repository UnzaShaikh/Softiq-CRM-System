"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyTable from "@/components/company/CompanyTable";
import { companies as initialCompanies, Company } from "@/data/company";

export default function CompanyPage() {
  const [companies, setCompanies] =
    useState<Company[]>(initialCompanies);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [sizeFilter, setSizeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const companiesPerPage = 10;

  const industries = useMemo(() => {
    return Array.from(
      new Set(companies.map((company) => company.industry))
    );
  }, [companies]);

  const companySizes = useMemo(() => {
    return Array.from(
      new Set(companies.map((company) => company.size))
    );
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return companies.filter((company) => {
      const matchesSearch =
        searchValue === "" ||
        company.name.toLowerCase().includes(searchValue) ||
        company.industry.toLowerCase().includes(searchValue) ||
        company.email.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        company.status === statusFilter;

      const matchesIndustry =
        industryFilter === "All" ||
        company.industry === industryFilter;

      const matchesSize =
        sizeFilter === "All" ||
        company.size === sizeFilter;

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

    if (!confirmed) {
      return;
    }

    setCompanies((previousCompanies) =>
      previousCompanies.filter(
        (item) => item.id !== company.id
      )
    );

    setCurrentPage(1);
  };

  const statusTabs = ["All", "Active", "Inactive"];

  return (
    <DashboardLayout>
      <div className="company-page">
        {/* Header */}
        <div className="company-page-header">
          <div>
            <h1 className="company-page-title">
              Companies
            </h1>

            <p className="company-page-subtitle">
              Manage all companies in one place.
            </p>
          </div>

          <Link
            href="/company/new"
            className="add-company-btn"
          >
            + Add Company
          </Link>
        </div>

        {/* Summary Cards — icons ab color-coded hain */}
        <div className="company-stats-grid">
          <div className="company-stat-card">
            <div className="company-stat-icon stat-icon-purple">
              🏢
            </div>

            <div className="company-stat-content">
              <span className="company-stat-label">
                Total Companies
              </span>

              <strong className="company-stat-value">
                {totalCompanies}
              </strong>

              <span className="company-stat-change">
                ↑ 12.5% vs last month
              </span>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon stat-icon-teal">
              👥
            </div>

            <div className="company-stat-content">
              <span className="company-stat-label">
                Active Companies
              </span>

              <strong className="company-stat-value">
                {activeCompanies}
              </strong>

              <span className="company-stat-change">
                ↑ 8.7% vs last month
              </span>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon stat-icon-green">
              +
            </div>

            <div className="company-stat-content">
              <span className="company-stat-label">
                New This Month
              </span>

              <strong className="company-stat-value">
                {newCompaniesThisMonth}
              </strong>

              <span className="company-stat-change">
                ↑ 27.3% vs last month
              </span>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon stat-icon-orange">
              👤
            </div>

            <div className="company-stat-content">
              <span className="company-stat-label">
                Total Contacts
              </span>

              <strong className="company-stat-value">
                {totalContacts}
              </strong>

              <span className="company-stat-change">
                ↑ 15.6% vs last month
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="company-toolbar">
          {/* Row 1: Search + results pill + status tabs — reference jaisa */}
          <div className="search-box">
            <span className="search-icon" aria-hidden="true">🔍</span>

            <input
              type="text"
              placeholder="Search companies..."
              className="search-input"
              value={search}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              aria-label="Search companies"
            />
          </div>

          <span className="badge badge-new">
            {filteredCompanies.length} results
          </span>

          <div className="filter-tabs">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`filter-tab ${statusFilter === tab ? "active" : ""}`}
                onClick={() => handleStatusChange(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Industry + Size + Reset — extra filters jo Leads/Customers mein nahi the */}
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
            className="filter-btn"
            onClick={handleReset}
          >
            ↻ Reset
          </button>
        </div>

        {/* Result Information */}
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
          <div className="company-empty-state">
            <h3 className="empty-state-title">
              No companies found
            </h3>

            <p className="empty-state-sub">
              Try changing your search or filters.
            </p>
          </div>
        )}

        {filteredCompanies.length > 0 && (
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
    </DashboardLayout>
  );
}