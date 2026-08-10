"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  PauseCircle,
  Zap,
  Search,
  Plus,
  Trash2,
  Check,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ContactTable from "@/components/contacts/ContactTable";
import Pagination from "@/components/customers/Pagination";
import { CONTACTS } from "@/components/contacts/data";

const CONTACTS_PER_PAGE = 5;

type FilterStatus = "All" | "Active" | "Inactive" | "Lead";

export default function ContactsPage() {
  const [contacts, setContacts] = useState(CONTACTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<FilterStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filteredContacts = contacts.filter((contact) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      contact.fullName.toLowerCase().includes(searchValue) ||
      contact.company.toLowerCase().includes(searchValue) ||
      contact.email.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" ||
      contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages =
    Math.ceil(filteredContacts.length / CONTACTS_PER_PAGE) || 1;

  const indexOfLastContact =
    currentPage * CONTACTS_PER_PAGE;

  const indexOfFirstContact =
    indexOfLastContact - CONTACTS_PER_PAGE;

  const currentContacts = filteredContacts.slice(
    indexOfFirstContact,
    indexOfLastContact
  );

  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleStatusFilter(value: FilterStatus) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  function showToast(message: string) {
    setToastMsg(message);

    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  }

  function confirmDelete(id: number) {
    setDeleteId(id);
  }

  const contactToDelete =
    contacts.find((contact) => contact.id === deleteId) ?? null;

  function handleDeleteConfirmed() {
    if (!contactToDelete) return;

    setContacts((previousContacts) =>
      previousContacts.filter(
        (contact) => contact.id !== contactToDelete.id
      )
    );

    showToast(
      `"${contactToDelete.fullName}" has been deleted.`
    );

    setDeleteId(null);
  }

  const stats = {
    total: contacts.length,
    active: contacts.filter(
      (contact) => contact.status === "Active"
    ).length,
    inactive: contacts.filter(
      (contact) => contact.status === "Inactive"
    ).length,
    lead: contacts.filter(
      (contact) => contact.status === "Lead"
    ).length,
  };

  const STAT_CARDS = [
    {
      label: "Total Contacts",
      value: stats.total,
      icon: <Users size={28} strokeWidth={2} />,
      color: "#4f46e5",
      bg: "#eef2ff",
    },
    {
      label: "Active",
      value: stats.active,
      icon: <UserCheck size={28} strokeWidth={2} />,
      color: "#16a34a",
      bg: "#dcfce7",
    },
    {
      label: "Inactive",
      value: stats.inactive,
      icon: <PauseCircle size={28} strokeWidth={2} />,
      color: "#64748b",
      bg: "#f1f5f9",
    },
    {
      label: "Leads",
      value: stats.lead,
      icon: <Zap size={28} strokeWidth={2} />,
      color: "#b45309",
      bg: "#fef3c7",
    },
  ];

  return (
    <DashboardLayout>
      <div className="contacts-page">

        {/* =========================================
            CONTACTS PAGE HEADER
        ========================================== */}
        <div className="contacts-page-header">
          <div>
            <h1 className="contacts-page-title">
              Contacts
            </h1>

            <p className="contacts-page-subtitle">
              Manage your customer contacts.
            </p>
          </div>

          <Link
            href="/contacts/add"
            className="contacts-add-button"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Contact</span>
          </Link>
        </div>

        {/* =========================================
            CONTACTS STATS CARDS
            Compact UI - similar to Customers page
        ========================================== */}
        <div className="contacts-stats-grid">
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className="contacts-stat-card"
            >
              <div
                className="contacts-stat-icon"
                style={{
                  backgroundColor: card.bg,
                  color: card.color,
                }}
              >
                {card.icon}
              </div>

              <div className="contacts-stat-content">
                <p
                  className="contacts-stat-value"
                  style={{ color: card.color }}
                >
                  {card.value}
                </p>

                <p className="contacts-stat-label">
                  {card.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* =========================================
            CONTACTS TABLE CARD
        ========================================== */}
        <div className="contacts-table-card">

          {/* Table Toolbar */}
          <div className="contacts-table-toolbar">

            <div className="contacts-search-box">
              <Search
                size={18}
                strokeWidth={2}
                className="contacts-search-icon"
              />

              <input
                type="text"
                placeholder="Search contacts by name, email, or company..."
                value={search}
                onChange={(event) =>
                  handleSearch(event.target.value)
                }
              />
            </div>

            <div className="contacts-toolbar-right">

              <span className="contacts-results-count">
                {filteredContacts.length}{" "}
                {filteredContacts.length === 1
                  ? "result"
                  : "results"}
              </span>

              <div className="contacts-filter-tabs">
                {(
                  [
                    "All",
                    "Active",
                    "Inactive",
                    "Lead",
                  ] as FilterStatus[]
                ).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`contacts-filter-tab ${
                      statusFilter === tab
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleStatusFilter(tab)
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Table */}
          {filteredContacts.length === 0 ? (
            <div className="contacts-empty-state">
              <div className="contacts-empty-icon">
                <Users size={26} />
              </div>

              <h3>No contacts found</h3>

              <p>
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <div className="contacts-table-wrapper">
              <ContactTable
                contacts={currentContacts}
                onDelete={(id) => confirmDelete(id)}
              />
            </div>
          )}

          {/* Pagination */}
          {filteredContacts.length > 0 && (
            <div className="contacts-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredContacts.length}
                itemsPerPage={CONTACTS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* =========================================
            DELETE CONFIRMATION MODAL
        ========================================== */}
        {contactToDelete && (
          <div
            className="contacts-modal-overlay"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setDeleteId(null);
              }
            }}
          >
            <div className="contacts-modal-box">

              <div className="contacts-modal-icon">
                <Trash2 size={24} />
              </div>

              <h2>Delete Contact</h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {contactToDelete.fullName}
                </strong>
                ? This action cannot be undone.
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
            SUCCESS TOAST
        ========================================== */}
        {toastMsg && (
          <div className="contacts-toast">
            <Check
              size={17}
              strokeWidth={2.5}
            />

            <span>{toastMsg}</span>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}