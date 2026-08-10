"use client";


import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  ChevronsUpDown,
  ChevronUp,
} from "lucide-react";
    import { Contact } from "@/data/contact";



interface Props {
  contacts: Contact[];
  onDelete: (id: number) => void;
}

/* =========================================
   CONTACT STATUS
========================================= */

function statusBadgeClass(status: Contact["status"]) {
  switch (status) {
    case "Active":
      return "contacts-table-status contacts-status-active";

    case "Lead":
      return "contacts-table-status contacts-status-lead";

    case "Inactive":
    default:
      return "contacts-table-status contacts-status-inactive";
  }
}

/* =========================================
   CONTACT TABLE
========================================= */

export default function ContactTable({
  contacts,
  onDelete,
}: Props) {
  return (
    <div className="contacts-data-table-wrapper">
      <table className="contacts-data-table">
        {/* =========================================
            TABLE HEADER
        ========================================== */}

        <thead>
          <tr>
            <th>
              <div className="contacts-th-content">
                <span>NAME</span>
                <ChevronUp
                  size={14}
                  className="contacts-sort-active"
                />
              </div>
            </th>

            <th>
              <div className="contacts-th-content">
                <span>COMPANY</span>
                <ChevronsUpDown size={13} />
              </div>
            </th>

            <th>
              <span>EMAIL</span>
            </th>

            <th>
              <span>PHONE</span>
            </th>

            <th>
              <div className="contacts-th-content">
                <span>STATUS</span>
                <ChevronsUpDown size={13} />
              </div>
            </th>

            <th className="contacts-actions-header">
              <span>ACTIONS</span>
            </th>
          </tr>
        </thead>

        {/* =========================================
            TABLE BODY
        ========================================== */}

        <tbody>
          {contacts.map((contact) => {
            const initials = contact.fullName
              .split(" ")
              .filter(Boolean)
              .map((name) => name[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <tr key={contact.id}>
                {/* =================================
                    NAME
                ================================= */}

                <td>
                  <div className="contacts-name-cell">
                    <div className="contacts-avatar">
                      {initials}
                    </div>

                    <div className="contacts-name-content">
                      <p className="contacts-cell-name">
                        {contact.fullName}
                      </p>

                      <p className="contacts-job-title">
                        {contact.jobTitle}
                      </p>
                    </div>
                  </div>
                </td>

                {/* =================================
                    COMPANY
                ================================= */}

                <td>
                  <span className="contacts-cell-primary">
                    {contact.company}
                  </span>
                </td>

                {/* =================================
                    EMAIL
                ================================= */}

                <td>
                  <span className="contacts-cell-primary">
                    {contact.email}
                  </span>
                </td>

                {/* =================================
                    PHONE
                ================================= */}

                <td>
                  <span className="contacts-cell-primary">
                    {contact.phone}
                  </span>
                </td>

                {/* =================================
                    STATUS
                ================================= */}

                <td>
                  <span
                    className={statusBadgeClass(
                      contact.status
                    )}
                  >
                    <span className="contacts-status-dot" />
                    {contact.status}
                  </span>
                </td>

                {/* =================================
                    ACTIONS
                ================================= */}

                <td>
                  <div className="contacts-action-buttons">
                    {/* VIEW */}

                    <Link
                      href={`/contacts/${contact.id}`}
                      className="contacts-action-button contacts-action-view"
                      title="View Contact"
                      aria-label="View Contact"
                    >
                      <Eye
                        size={16}
                        strokeWidth={2}
                      />
                    </Link>

                    {/* EDIT */}

                    <Link
                      href={`/contacts/edit?id=${contact.id}`}
                      className="contacts-action-button contacts-action-edit"
                      title="Edit Contact"
                      aria-label="Edit Contact"
                    >
                      <Pencil
                        size={16}
                        strokeWidth={2}
                      />
                    </Link>

                    {/* DELETE */}

                    <button
                      type="button"
                      className="contacts-action-button contacts-action-delete"
                      title="Delete Contact"
                      aria-label="Delete Contact"
                      onClick={() =>
                        onDelete(contact.id)
                      }
                    >
                      <Trash2
                        size={16}
                        strokeWidth={2}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}