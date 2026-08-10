"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ContactTable from "@/components/contacts/ContactTable";
import ThemeLoader from "@/components/ui/ThemeLoader";
import { Contact, ApiContactList, toContact } from "@/data/contact";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";


export default function ContactsPage() {

  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);

const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const [currentPage, setCurrentPage] = useState(1);
const [totalCount, setTotalCount] = useState(0);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [refreshKey, setRefreshKey] = useState(0);


  const contactsPerPage = 10;

  const totalPages = Math.ceil(totalCount / contactsPerPage);

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
        const maxPage = Math.max(1, Math.ceil(data.count / contactsPerPage));
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

  const handleDelete = async (id: number) => {
    try {
      await apiRequest(`/api/contacts/${id}/`, { method: "DELETE" });
      emitDataChanged();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError((err as Error).message);
    }
  };



  return (

    <DashboardLayout>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          color: "#0f172a",
        }}
      >


        {/* Header */}

        <div>

          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Contacts
          </h1>


          <p
            style={{
              color:"#64748b",
              marginTop:"8px",
            }}
          >
            Manage your customer contacts
          </p>


        </div>

 {/* Action */}

<div
  className="contacts-actions"
  style={{
    background: "#ffffff",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  }}
>
  {/* Search + Filter */}
<div
  className="contacts-filters"
>
  <input
  className="contacts-search"
  type="text"
  placeholder="Search contacts..."
  value={search}
  onChange={(e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  }}
  style={{
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  outline: "none",
  color: "#0f172a",
  background: "#ffffff",
  fontSize: "14px",
}}
/><select
  className="contacts-filter"
  value={statusFilter}
  onChange={(e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  }}
  style={{
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
    background: "#ffffff",
    cursor: "pointer",
  }}
>
      <option value="All">All Status</option>
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
      <option value="Lead">Lead</option>
    </select>
  </div>

  {/* Add Contact Button */}
<Link
  href="/contacts/add"
  className="contacts-add-btn"
  style={{
    background: "#4f46e5",
    color: "#ffffff",
    padding: "12px 22px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "14px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  + Add Contact
</Link>
</div>





        {/* Table */}

        {loading ? (
          <ThemeLoader label="Loading contacts..." minHeight={220} />
        ) : error ? (
          <div className="empty-state">
            <p className="empty-state-title" style={{ color: "#dc2626" }}>{error}</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No contacts found.</p>
            <p className="empty-state-sub">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <ContactTable
  contacts={contacts}
  onDelete={handleDelete}
/>
        )}






       {/* Pagination */}

{totalPages > 1 && (
 <div
  className="contacts-pagination"
  style={{
    background: "#ffffff",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  }}
>
    {/* Previous */}

    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      style={{
        padding: "10px 16px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        background: currentPage === 1 ? "#f8fafc" : "#ffffff",
        color: "#0f172a",
        cursor: currentPage === 1 ? "not-allowed" : "pointer",
      }}
    >
      Previous
    </button>

    {/* Page Numbers */}

    <div
  className="contacts-page-numbers"
  style={{
    display: "flex",
    gap: "8px",
  }}
>
      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;

        return (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background:
                currentPage === page
                  ? "#4f46e5"
                  : "#ffffff",
              color:
                currentPage === page
                  ? "#ffffff"
                  : "#0f172a",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {page}
          </button>
        );
      })}
    </div>

    {/* Next */}

    <button
      disabled={currentPage === totalPages}
      onClick={() =>
        setCurrentPage((prev) =>
          Math.min(prev + 1, totalPages)
        )
      }
      style={{
        padding: "10px 16px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        background:
          currentPage === totalPages
            ? "#f8fafc"
            : "#ffffff",
        color: "#0f172a",
        cursor:
          currentPage === totalPages
            ? "not-allowed"
            : "pointer",
      }}
    >
      Next
    </button>
  </div>
)}
 </div>

    </DashboardLayout>

  );

}