"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Pagination from "@/components/customers/Pagination";

import {
  Users,
  UserCheck,
  PauseCircle,
  Zap,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";

import { CONTACTS } from "@/components/contacts/data";

const CONTACTS_PER_PAGE = 5;

type FilterStatus = "All" | "Active" | "Inactive" | "Lead";

export default function ContactsPage() {
  const [contacts, setContacts] = useState(CONTACTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<FilterStatus>("All");

  const [currentPage, setCurrentPage] = useState(1);

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const [toastMsg, setToastMsg] =
    useState<string | null>(null);

  /* =========================================
     FILTER CONTACTS
  ========================================== */

  const filteredContacts = contacts.filter((contact) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      contact.fullName.toLowerCase().includes(searchValue) ||
      contact.company.toLowerCase().includes(searchValue) ||
      contact.email.toLowerCase().includes(searchValue) ||
      contact.phone.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" ||
      contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* =========================================
     PAGINATION
  ========================================== */

  const totalPages =
    Math.ceil(
      filteredContacts.length / CONTACTS_PER_PAGE
    ) || 1;

  const indexOfLastContact =
    currentPage * CONTACTS_PER_PAGE;

  const indexOfFirstContact =
    indexOfLastContact - CONTACTS_PER_PAGE;

  const currentContacts = filteredContacts.slice(
    indexOfFirstContact,
    indexOfLastContact
  );

  /* =========================================
     SEARCH
  ========================================== */

  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  /* =========================================
     STATUS FILTER
  ========================================== */

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

  const contactToDelete =
    contacts.find(
      (contact) => contact.id === deleteId
    ) ?? null;

  function handleDeleteConfirmed() {
    if (!contactToDelete) return;

    setContacts(
      contacts.filter(
        (contact) =>
          contact.id !== contactToDelete.id
      )
    );

    showToast(
      `"${contactToDelete.fullName}" has been deleted.`
    );

    setDeleteId(null);

    const newTotalPages =
      Math.ceil(
        (filteredContacts.length - 1) /
          CONTACTS_PER_PAGE
      ) || 1;

    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }

  /* =========================================
     STATS
  ========================================== */

  const stats = {
    total: contacts.length,

    active: contacts.filter(
      (contact) =>
        contact.status === "Active"
    ).length,

    inactive: contacts.filter(
      (contact) =>
        contact.status === "Inactive"
    ).length,

    lead: contacts.filter(
      (contact) =>
        contact.status === "Lead"
    ).length,
  };

  const STAT_CARDS = [
    {
      label: "Total Contacts",
      value: stats.total,
      icon: <Users size={22} strokeWidth={2} />,
      color: "#4f46e5",
      bg: "#eef2ff",
    },
    {
      label: "Active",
      value: stats.active,
      icon: <UserCheck size={22} strokeWidth={2} />,
      color: "#16a34a",
      bg: "#dcfce7",
    },
    {
      label: "Inactive",
      value: stats.inactive,
      icon: <PauseCircle size={22} strokeWidth={2} />,
      color: "#64748b",
      bg: "#f1f5f9",
    },
    {
      label: "Leads",
      value: stats.lead,
      icon: <Zap size={22} strokeWidth={2} />,
      color: "#b45309",
      bg: "#fef3c7",
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
            <h1 className="contacts-page-title">
              Contacts
            </h1>

            <p className="contacts-page-subtitle">
              Manage your customer contacts.
            </p>
          </div>

          {/* Customer-style Add Button */}
          <Link
            href="/contacts/add"
            className="contacts-add-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 20px",
              minHeight: "46px",
              borderRadius: "10px",
              background: "#6d3df5",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 600,
              lineHeight: 1,
              textDecoration: "none",
              boxShadow: "0 6px 16px rgba(109, 61, 245, 0.22)",
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Contact</span>
          </Link>

        </div>

        {/* =========================================
            CONTACT STAT CARDS
            Customer-style compact cards
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
                  width: "58px",
                  height: "58px",
                  minWidth: "58px",
                  borderRadius: "14px",
                  backgroundColor: card.bg,
                  color: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {card.icon}
              </div>

              <div className="contacts-stat-content">

                <div
                  className="contacts-stat-value"
                  style={{
                    color: card.color,
                    fontSize: "30px",
                    lineHeight: 1,
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  {card.value}
                </div>

                <div
                  className="contacts-stat-label"
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#64748b",
                    lineHeight: 1.3,
                  }}
                >
                  {card.label}
                </div>

              </div>

            </div>
          ))}

        </div>

        {/* =========================================
            CONTACT TABLE CARD
        ========================================== */}

        <div className="contacts-table-card">

          {/* =========================================
              TABLE TOOLBAR
          ========================================== */}

          <div className="contacts-table-toolbar">

            <div className="contacts-search-wrap">

              <Search
                size={19}
                className="contacts-search-icon"
              />

              <input
                type="text"
                className="contacts-search-input"
                placeholder="Search contacts by name, email, or company..."
                value={search}
                onChange={(e) =>
                  handleSearch(e.target.value)
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

          {/* =========================================
              TABLE
          ========================================== */}

          {filteredContacts.length === 0 ? (

            <div className="contacts-empty-state">

              <div className="contacts-empty-icon">
                <Users size={26} />
              </div>

              <h3>
                No contacts found
              </h3>

              <p>
                Try adjusting your search or filter.
              </p>

            </div>

          ) : (

            <div className="contacts-table-wrapper">

              <table className="contacts-table">

                <thead>

                  <tr>

                    <th>
                      <div className="contacts-th-content">
                        NAME
                        <ChevronUp
                          size={13}
                          className="contacts-sort-active"
                        />
                      </div>
                    </th>

                    <th>
                      <div className="contacts-th-content">
                        COMPANY
                        <ChevronsUpDown size={12} />
                      </div>
                    </th>

                    <th>
                      EMAIL
                    </th>

                    <th>
                      PHONE
                    </th>

                    <th>
                      <div className="contacts-th-content">
                        STATUS
                        <ChevronsUpDown size={12} />
                      </div>
                    </th>

                    <th>
                      ACTIONS
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {currentContacts.map((contact) => (

                    <tr key={contact.id}>

                      {/* NAME */}

                      <td>

                        <div className="contacts-name-cell">

                          <div className="contacts-avatar">
                            {contact.fullName
                              .split(" ")
                              .map(
                                (name) =>
                                  name[0]
                              )
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div>

                            <div className="contacts-name">
                              {contact.fullName}
                            </div>

                            <div className="contacts-job-title">
                              {contact.jobTitle}
                            </div>

                          </div>

                        </div>

                      </td>

                      {/* COMPANY */}

                      <td>

                        <div className="contacts-company">
                          {contact.company}
                        </div>

                      </td>

                      {/* EMAIL */}

                      <td>

                        <div className="contacts-email">
                          {contact.email}
                        </div>

                      </td>

                      {/* PHONE */}

                      <td>

                        <div className="contacts-phone">
                          {contact.phone}
                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`contacts-status contacts-status-${contact.status.toLowerCase()}`}
                        >
                          <span className="contacts-status-dot" />
                          {contact.status}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="contacts-actions">

                          <Link
                            href={`/contacts/${contact.id}`}
                            className="contacts-action-btn contacts-action-view"
                            title="View Contact"
                            style={{
                              width: "38px",
                              height: "38px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "8px",
                            }}
                          >
                            <Eye size={16} />
                          </Link>

                          <Link
                            href={`/contacts/edit?id=${contact.id}`}
                            className="contacts-action-btn contacts-action-edit"
                            title="Edit Contact"
                            style={{
                              width: "38px",
                              height: "38px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "8px",
                            }}
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            type="button"
                            className="contacts-action-btn contacts-action-delete"
                            title="Delete Contact"
                            onClick={() =>
                              confirmDelete(contact.id)
                            }
                            style={{
                              width: "38px",
                              height: "38px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "8px",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

          {/* =========================================
              PAGINATION
          ========================================== */}

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
            DELETE MODAL
        ========================================== */}

        {contactToDelete && (

          <div
            className="contacts-modal-overlay"
            onClick={(e) => {
              if (
                e.target === e.currentTarget
              ) {
                setDeleteId(null);
              }
            }}
          >

            <div className="contacts-modal">

              <div className="contacts-modal-icon">
                <Trash2 size={22} />
              </div>

              <h2 className="contacts-modal-title">
                Delete Contact
              </h2>

              <p className="contacts-modal-text">
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
                  onClick={() =>
                    setDeleteId(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="contacts-modal-delete"
                  onClick={
                    handleDeleteConfirmed
                  }
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

            <span className="contacts-toast-icon">
              ✓
            </span>

            {toastMsg}

          </div>

        )}

      </div>
    </DashboardLayout>
  );
}