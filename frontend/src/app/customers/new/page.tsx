"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CustomerForm from "@/components/customers/CustomerForm";

export default function NewCustomerPage() {
  const router = useRouter();

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
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Customers
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
            Add Customer
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.9375rem" }}>
            Add a new customer to your CRM.
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
          <CustomerForm
            submitLabel="Create Customer"
            onSuccess={() => router.push("/customers")}
            onCancel={() => router.push("/customers")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
