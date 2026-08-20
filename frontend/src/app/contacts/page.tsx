"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ContactTable from "@/components/contacts/ContactTable";
import ThemeLoader from "@/components/ui/ThemeLoader";
import Pagination from "@/components/customers/Pagination";
import StatCard from "@/components/dashboard/StatCard";

import {
  Users,
  UserCheck,
  PauseCircle,
  Zap,
  Search,
  Plus,
  Trash2,
} from "lucide-react";

import { Contact, ApiContactList, toContact } from "@/data/contact";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";

const CONTACTS_PER_PAGE = 10;

type FilterStatus = "All" | "Active" | "Inactive" | "Lead";

export default function ContactsPage() {
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / CONTACTS_PER_PAGE) || 1;

  /* =========================================
     FETCH CONTACTS (server-side search/filter/pagination)
  ========================================== */

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter !== "All") params.set("status", statusFilter.toLowerCase());
    params.set("page", String(currentPage));

    const run = async () => {
      setLoading(true);
      try {
        const data = await apiRequest<ApiContactList>(`/api/contacts/?${params.toString()}`);
        if (cancelled) return;
        setContacts(data.results.map(toContact));
        setTotalCount(data.count);
        setError(null);
        const maxPage = Math.max(1, Math.ceil(data.count / CONTACTS_PER_PAGE));
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

  /* =========================================
     SEARCH / FILTER
  ========================================== */

  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleStatusFilter(value: FilterStatus) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  /* =========================================
     TOAST
  ========================================== */

  function showToast(message: string) {
    setToastMsg(message);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  }

  /* =========================================
     DELETE
  ========================================== */

  function confirmDelete(id: number) {
    setDeleteId(id);
  }

  const contactToDelete = contacts.find((contact) => contact.id === deleteId) ?? null;

  async function handleDeleteConfirmed() {
    if (!contactToDelete) return;

    try {
      await apiRequest(`/api/contacts/${contactToDelete.id}/`, { method: "DELETE" });
      emitDataChanged();
      showToast(`"${contactToDelete.fullName}" has been deleted.`);
      setDeleteId(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError((err as Error).message);
      setDeleteId(null);
    }
  }

  /* =========================================
     STATS
     NOTE: "total" uses the accurate API count. The per-status
     breakdowns (active/inactive/lead) are best-effort, based only
     on the contacts currently loaded on this page, since the API
     paginates results. For fully accurate breakdowns, add a
     backend summary endpoint (like /api/pipeline/summary/).
  ========================================== */

  const stats = {
    total: totalCount,
    active: contacts.filter((contact) => contact.status === "Active").length,
    inactive: contacts.filter((contact) => contact.status === "Inactive").length,
    lead: contacts.filter((contact) => contact.status === "Lead").length,
  };

  const STAT_CARDS = [
    {
      label: "Total Contacts",
      value: String(stats.total),
      change: "+12%",
      up: true,
      icon: <Users size={18} strokeWidth={2} />,
      color: "#4f46e5",
    },
    {
      label: "Active",
      value: String(stats.active),
      change: "+8%",
      up: true,
      icon: <UserCheck size={18} strokeWidth={2} />,
      color: "#16a34a",
    },
    {
      label: "Inactive",
      value: String(stats.inactive),
      change: "-2%",
      up: false,
      icon: <PauseCircle size={18} strokeWidth={2} />,
      color: "#64748b",
    },
    {
      label: "Leads",
      value: String(stats.lead),
      change: "+5%",
      up: true,
      icon: <Zap size={18} strokeWidth={2} />,
      color: "#b45309",
    },
  ];

  return (
    <DashboardLayout>
      <div className="contacts-page">

        {/* =========================================
            CONTACT PAGE HEADER
        ========================================== */}

        <div className="contacts-page-header">
          <div>
            <h1 className="page-title">Contacts</h1>
            <p className="page-subtitle">Manage your customer contacts.</p>
          </div>

          <Link
            href="/contacts/add"
            className="btn-add"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Contact</span>
          </Link>
        </div>

        {/* =========================================
            CONTACT STAT CARDS
        ========================================== */}

        <div className="dashboard-stats-grid" style={{ marginBottom: "24px" }}>
          {STAT_CARDS.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* =========================================
            CONTACT TABLE CARD
        ========================================== */}

        <div className="contacts-table-card">

          {/* TOOLBAR */}
          <div className="contacts-table-toolbar">
            <div className="contacts-search-wrap">
              <Search size={19} className="contacts-search-icon" />
              <input
                type="text"
                className="contacts-search-input"
                placeholder="Search contacts by name, email, or company..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="contacts-toolbar-right">
              <span className="contacts-results-count">
                {totalCount} {totalCount === 1 ? "result" : "results"}
              </span>

              <div className="contacts-filter-tabs">
                {(["All", "Active", "Inactive", "Lead"] as FilterStatus[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`contacts-filter-tab ${statusFilter === tab ? "active" : ""}`}
                    onClick={() => handleStatusFilter(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* TABLE / STATES */}
          {loading ? (
            <ThemeLoader label="Loading contacts..." minHeight={220} />
          ) : error ? (
            <div className="contacts-empty-state">
              <h3 style={{ color: "#dc2626" }}>{error}</h3>
            </div>
          ) : contacts.length === 0 ? (
            <div className="contacts-empty-state">
              <div className="contacts-empty-icon">
                <Users size={26} />
              </div>
              <h3>No contacts found</h3>
              <p>Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="contacts-table-wrapper">
              <ContactTable contacts={contacts} onDelete={confirmDelete} />
            </div>
          )}

          {/* PAGINATION */}
          {!loading && !error && contacts.length > 0 && (
            <div className="contacts-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={CONTACTS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* =========================================
            DELETE MODAL
        ========================================== */}

        {contactToDelete && (
          <div
            className="contacts-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setDeleteId(null);
              }
            }}
          >
            <div className="contacts-modal">
              <div className="contacts-modal-icon">
                <Trash2 size={22} />
              </div>

              <h2 className="contacts-modal-title">Delete Contact</h2>

              <p className="contacts-modal-text">
                Are you sure you want to delete <strong>{contactToDelete.fullName}</strong>? This
                action cannot be undone.
              </p>

              <div className="contacts-modal-actions">
                <button
                  type="button"
                  className="contacts-modal-cancel"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
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

        {/* =========================================
            TOAST
        ========================================== */}

        {toastMsg && (
          <div className="contacts-toast">
            <span className="contacts-toast-icon">✓</span>
            {toastMsg}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
