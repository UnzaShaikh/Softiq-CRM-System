"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatusBadge from "@/components/customers/StatusBadge";
import { ApiCustomer, toCustomer } from "@/data/customers";
import { apiRequest, getAccessToken } from "@/lib/api";

const AVATAR_COLORS: [string, string][] = [
  ["#4f46e5", "#7c3aed"],
  ["#0891b2", "#0e7490"],
  ["#059669", "#047857"],
  ["#d97706", "#b45309"],
  ["#dc2626", "#b91c1c"],
  ["#7c3aed", "#6d28d9"],
];

function getAvatarColor(name: string): [string, string] {
  const idx =
    ((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [customer, setCustomer] = useState<ApiCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const data = await apiRequest<ApiCustomer>(`/api/customers/${id}/`);
        if (cancelled) return;
        setCustomer(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        if (!getAccessToken()) router.push("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (id) void run();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  async function handleDelete() {
    if (!customer) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/customers/${customer.id}/`, { method: "DELETE" });
      router.push("/customers");
    } catch (err) {
      setError((err as Error).message);
      setDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b", fontSize: "0.875rem" }}>
          Loading customer…
        </div>
      </DashboardLayout>
    );
  }

  if (error || !customer) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ color: "#ef4444", fontSize: "0.9375rem", fontWeight: 600, margin: "0 0 8px" }}>
            {error ?? "Customer not found."}
          </p>
          <Link
            href="/customers"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#4f46e5",
              textDecoration: "none",
            }}
          >
            Back to Customers
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const view = toCustomer(customer);
  const [c1, c2] = getAvatarColor(view.name);

  const detailRow = (label: string, value: string) => (
    <div style={{ padding: "14px 0", borderBottom: "1px solid #f1f5f9" }}>
      <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: "0.9375rem", color: "#0f172a", fontWeight: 500 }}>
        {value || "—"}
      </p>
    </div>
  );

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <Link
              href="/customers"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#64748b",
                textDecoration: "none",
                marginBottom: "10px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Customers
            </Link>
            <h1 style={{ margin: 0, fontSize: "1.625rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Customer Details
            </h1>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href={`/customers/${customer.id}/edit`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "9px 18px",
                borderRadius: "9px",
                border: "1.5px solid #e2e8f0",
                background: "#fff",
                color: "#0891b2",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </Link>
            <button
              onClick={() => setDeleteModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "9px 18px",
                borderRadius: "9px",
                border: "1.5px solid #fca5a5",
                background: "#fff",
                color: "#ef4444",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Profile card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "28px", display: "flex", alignItems: "center", gap: "18px", borderBottom: "1px solid #f1f5f9" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.25rem",
                flexShrink: 0,
                userSelect: "none",
              }}
            >
              {view.avatar}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: "1.375rem", fontWeight: 700, color: "#0f172a" }}>
                {view.name}
              </h2>
              <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <StatusBadge status={view.status} />
                <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>ID #{customer.id}</span>
              </div>
            </div>
          </div>

          <div style={{ padding: "8px 28px 24px" }}>
            {detailRow("Email", view.email)}
            {detailRow("Phone", view.phone)}
            {detailRow("Company", view.company)}
            {detailRow("Joined", formatDate(customer.created_at))}
            {detailRow("Last updated", formatDate(customer.updated_at))}
          </div>
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
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteModal(false);
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
            }}
          >
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", textAlign: "center" }}>
              Delete Customer
            </h2>
            <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: "0.9rem", textAlign: "center", lineHeight: 1.6 }}>
              Are you sure you want to delete{" "}
              <strong style={{ color: "#0f172a" }}>{view.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setDeleteModal(false)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: deleting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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
                }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
