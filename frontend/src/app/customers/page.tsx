"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CustomerTable from "@/components/customers/CustomerTable";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";
import { Customer, CustomerStatus, ApiCustomerList, toCustomer } from "@/data/customers";
import { apiRequest, getAccessToken } from "@/lib/api";

const PAGE_SIZE = 10;

type FilterStatus = "All" | CustomerStatus;

const STATUS_QUERY: Record<FilterStatus, string | undefined> = {
  All: undefined,
  Active: "active",
  Inactive: "inactive",
  Lead: "lead",
};

export default function CustomersPage() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, lead: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Data fetching ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    const statusQ = STATUS_QUERY[statusFilter];
    if (statusQ) params.set("status", statusQ);
    params.set("page", String(currentPage));

    const run = async () => {
      try {
        const data = await apiRequest<ApiCustomerList>(`/api/customers/?${params.toString()}`);
        if (cancelled) return;
        setCustomers(data.results.map(toCustomer));
        setTotalCount(data.count);
        setError(null);
        const maxPage = Math.max(1, Math.ceil(data.count / PAGE_SIZE));
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
  }, [search, statusFilter, currentPage, refreshKey, router]);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      const [all, active, inactive, lead] = await Promise.all([
        apiRequest<ApiCustomerList>("/api/customers/"),
        apiRequest<ApiCustomerList>("/api/customers/?status=active"),
        apiRequest<ApiCustomerList>("/api/customers/?status=inactive"),
        apiRequest<ApiCustomerList>("/api/customers/?status=lead"),
      ]);
      if (cancelled) return;
      setStats({
        total: all.count,
        active: active.count,
        inactive: inactive.count,
        lead: lead.count,
      });
    };
    fetchStats().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Reset to page 1 when filter/search changes
  function handleSearch(val: string) {
    setSearch(val);
    setCurrentPage(1);
  }

  function handleStatusFilter(val: FilterStatus) {
    setStatusFilter(val);
    setCurrentPage(1);
  }

  // ── Toast helper ───────────────────────────────────────
  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  // ── Action handlers ────────────────────────────────────
  function handleView(customer: Customer) {
    router.push(`/customers/${customer.id}`);
  }

  function handleEdit(customer: Customer) {
    router.push(`/customers/${customer.id}/edit`);
  }

  function confirmDelete(customer: Customer) {
    setDeleteModal(customer);
  }

  async function handleDeleteConfirmed() {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/customers/${deleteModal.id}/`, { method: "DELETE" });
      showToast(`"${deleteModal.name}" has been deleted.`);
      setDeleteModal(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showToast(`Failed to delete: ${(err as Error).message}`);
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* ── Page Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.875rem",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Customers
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.9375rem" }}>
              Manage and track all your customers in one place.
            </p>
          </div>

          {/* Add Customer button */}
          <button
            onClick={() => router.push("/customers/new")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "9px",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 14px rgba(79,70,229,0.4)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 6px 20px rgba(79,70,229,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 14px rgba(79,70,229,0.4)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Customer
          </button>
        </div>

        {/* ── Summary Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {[
            {
              label: "Total Customers",
              value: stats.total,
              icon: "👥",
              color: "#4f46e5",
              bg: "#eef2ff",
            },
            {
              label: "Active",
              value: stats.active,
              icon: "✅",
              color: "#16a34a",
              bg: "#dcfce7",
            },
            {
              label: "Inactive",
              value: stats.inactive,
              icon: "⏸️",
              color: "#64748b",
              bg: "#f1f5f9",
            },
            {
              label: "Leads",
              value: stats.lead,
              icon: "⚡",
              color: "#b45309",
              bg: "#fef3c7",
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  background: card.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: card.color,
                    lineHeight: 1.2,
                  }}
                >
                  {card.value}
                </p>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
                  {card.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table Card ── */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          {/* Card Header — Search + Filters */}
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {/* Search */}
            <div style={{ flex: 1, minWidth: "260px" }}>
              <SearchBar
                value={search}
                onChange={handleSearch}
                resultCount={totalCount}
              />
            </div>

            {/* Status filter tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: "#f1f5f9",
                borderRadius: "8px",
                padding: "3px",
              }}
            >
              {(["All", "Active", "Inactive", "Lead"] as FilterStatus[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleStatusFilter(tab)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "6px",
                    border: "none",
                    background: statusFilter === tab ? "#fff" : "transparent",
                    color: statusFilter === tab ? "#0f172a" : "#64748b",
                    fontWeight: statusFilter === tab ? 600 : 500,
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow:
                      statusFilter === tab
                        ? "0 1px 3px rgba(0,0,0,0.1)"
                        : "none",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ padding: "0" }}>
            {loading ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "0.875rem",
                }}
              >
                Loading customers…
              </div>
            ) : error ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#ef4444",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            ) : customers.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "0.875rem",
                }}
              >
                No customers found.
              </div>
            ) : (
              <CustomerTable
                customers={customers}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={confirmDelete}
              />
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && totalCount > 0 && (
            <div style={{ padding: "4px 20px 16px" }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            animation: "fadeIn 0.15s ease",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteModal(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              animation: "slideUp 0.2s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "#0f172a",
                textAlign: "center",
              }}
            >
              Delete Customer
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                color: "#64748b",
                fontSize: "0.9rem",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              Are you sure you want to delete{" "}
              <strong style={{ color: "#0f172a" }}>{deleteModal.name}</strong>?
              This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setDeleteModal(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = "#fff")
                }
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: deleting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.4)",
                  opacity: deleting ? 0.7 : 1,
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
                }
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            background: "#0f172a",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            fontSize: "0.875rem",
            fontWeight: 500,
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "slideUp 0.2s cubic-bezier(0.16,1,0.3,1)",
            maxWidth: "320px",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMsg}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}
