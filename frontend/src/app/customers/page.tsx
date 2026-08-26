"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CustomerTable from "@/components/customers/CustomerTable";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";
import { Customer, CustomerStatus, ApiCustomerList, toCustomer } from "@/data/customers";
import { apiRequest, getAccessToken, emitDataChanged } from "@/lib/api";
import { usePermission } from "@/hooks/usePermissions";
import { Users, UserCheck, PauseCircle, Zap } from "lucide-react";
import ThemeLoader from "@/components/ui/ThemeLoader";

const PAGE_SIZE = 10;
type FilterStatus = "All" | CustomerStatus;
const STATUS_QUERY: Record<FilterStatus, string | undefined> = {
  All: undefined, Active: "active", Inactive: "inactive", Lead: "lead",
};

export default function CustomersPage() {
  const router = useRouter();
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
  const canCreate = usePermission("customers", "create");
  const canDelete = usePermission("customers", "delete");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
    return () => { cancelled = true; };
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
      setStats({ total: all.count, active: active.count, inactive: inactive.count, lead: lead.count });
    };
    fetchStats().catch(() => {});
    return () => { cancelled = true; };
  }, [refreshKey]);

  function handleSearch(val: string) { setSearch(val); setCurrentPage(1); }
  function handleStatusFilter(val: FilterStatus) { setStatusFilter(val); setCurrentPage(1); }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function handleView(customer: Customer) { router.push(`/customers/${customer.id}`); }
  function handleEdit(customer: Customer) { router.push(`/customers/${customer.id}/edit`); }
  function confirmDelete(customer: Customer) { setDeleteModal(customer); }

  async function handleDeleteConfirmed() {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/customers/${deleteModal.id}/`, { method: "DELETE" });
      emitDataChanged();
      showToast(`"${deleteModal.name}" has been deleted.`);
      setDeleteModal(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showToast(`Failed to delete: ${(err as Error).message}`);
    } finally {
      setDeleting(false);
    }
  }

  const STAT_CARDS = [
    { label: "Total Customers", value: stats.total,    icon: <Users size={20} />,       color: "#4f46e5", bg: "#eef2ff" },
    { label: "Active",          value: stats.active,   icon: <UserCheck size={20} />,   color: "#16a34a", bg: "#dcfce7" },
    { label: "Inactive",        value: stats.inactive, icon: <PauseCircle size={20} />, color: "#64748b", bg: "#f1f5f9" },
    { label: "Leads",           value: stats.lead,     icon: <Zap size={20} />,         color: "#b45309", bg: "#fef3c7" },
  ];

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Customers</h1>
            <p className="page-subtitle">Manage and track all your customers in one place.</p>
          </div>
          {canCreate && (
          <button className="btn-add" onClick={() => router.push("/customers/new")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Customer
          </button>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="stat-card">
              <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <div>
                <p className="stat-card-value" style={{ color: card.color }}>{card.value}</p>
                <p className="stat-card-label">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-search-wrap">
              <SearchBar value={search} onChange={handleSearch} resultCount={totalCount} />
            </div>
            <div className="filter-tabs">
              {(["All", "Active", "Inactive", "Lead"] as FilterStatus[]).map((tab) => (
                <button key={tab} className={`filter-tab${statusFilter === tab ? " active" : ""}`} onClick={() => handleStatusFilter(tab)}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <ThemeLoader label="Loading customers..." minHeight={220} />
          ) : error ? (
            <div className="empty-state">
              <p className="empty-state-title" style={{ color: "var(--error)" }}>{error}</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No customers found.</p>
              <p className="empty-state-sub">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <CustomerTable customers={customers} onView={handleView} onEdit={handleEdit} onDelete={confirmDelete} />
          )}

          {!loading && !error && totalCount > 0 && (
            <div className="pagination-wrap">
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalCount} itemsPerPage={PAGE_SIZE} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteModal(null); }}>
          <div className="modal-box">
            <div className="modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h2 className="modal-title">Delete Customer</h2>
            <p className="modal-text">
              Are you sure you want to delete <strong style={{ color: "var(--foreground)" }}>{deleteModal.name}</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteConfirmed} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMsg}
        </div>
      )}
    </DashboardLayout>
  );
}
