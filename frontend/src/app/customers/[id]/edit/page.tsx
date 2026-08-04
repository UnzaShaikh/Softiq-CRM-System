"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CustomerForm from "@/components/customers/CustomerForm";
import { ApiCustomer, toFormValues } from "@/data/customers";
import { apiRequest, getAccessToken } from "@/lib/api";

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [customer, setCustomer] = useState<ApiCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Header */}
        <div>
          <Link
            href={id ? `/customers/${id}` : "/customers"}
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
            Back to Customer
          </Link>
          <h1
            style={{
              margin: 0,
              fontSize: "1.625rem",
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            Edit Customer
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.9375rem" }}>
            Update this customer&apos;s details.
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            padding: "28px",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "30px 20px", color: "#64748b", fontSize: "0.875rem" }}>
              Loading customer…
            </div>
          ) : error || !customer ? (
            <div style={{ textAlign: "center", padding: "30px 20px" }}>
              <p style={{ color: "#ef4444", fontSize: "0.9375rem", fontWeight: 600, margin: "0 0 8px" }}>
                {error ?? "Customer not found."}
              </p>
              <Link
                href="/customers"
                style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4f46e5", textDecoration: "none" }}
              >
                Back to Customers
              </Link>
            </div>
          ) : (
            <CustomerForm
              customerId={id}
              initial={toFormValues(customer)}
              submitLabel="Save Changes"
              onSuccess={() => router.push(`/customers/${customer.id}`)}
              onCancel={() => router.push(`/customers/${customer.id}`)}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
