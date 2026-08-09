"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatusBadge from "@/components/customers/StatusBadge";
import { ApiCustomer, Customer, toCustomer } from "@/data/customers";
import { apiRequest, getAccessToken } from "@/lib/api";
import { Mail, Phone, MapPin, Building2, Tag, Calendar } from "lucide-react";
import ThemeLoader from "@/components/ui/ThemeLoader";

const AVATAR_COLORS: [string, string][] = [
  ["#4f46e5", "#7c3aed"], ["#0891b2", "#0e7490"], ["#059669", "#047857"],
  ["#d97706", "#b45309"], ["#dc2626", "#b91c1c"], ["#7c3aed", "#6d28d9"],
];
function getAvatarColor(name: string): [string, string] {
  return AVATAR_COLORS[((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) % AVATAR_COLORS.length];
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await apiRequest<ApiCustomer>(`/api/customers/${id}/`);
        if (cancelled) return;
        setCustomer(toCustomer(data));
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setNotFound(true);
        if (!getAccessToken()) router.push("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (loading) return (
    <DashboardLayout>
      <ThemeLoader label="Loading customer..." />
    </DashboardLayout>
  );

  if (notFound) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Customer Not Found</h2>
        <p>{error || `No customer found with ID: ${id}`}</p>
        <button className="btn-add" onClick={() => router.push("/customers")}>Back to Customers</button>
      </div>
    </DashboardLayout>
  );

  const [c1, c2] = getAvatarColor(customer!.name);

  return (
    <DashboardLayout>
      <div className="detail-wrapper">
        <button className="back-btn" onClick={() => router.push("/customers")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Customers
        </button>

        {/* Profile Card */}
        <div className="detail-profile-card">
          <div className="detail-profile-banner" />
          <div className="detail-profile-body">
            <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem" }}>
              <div className="detail-avatar" style={{ background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)` }}>
                {customer!.avatar}
              </div>
              <div style={{ paddingBottom: "4px" }}>
                <h1 className="detail-name">{customer!.name}</h1>
                <p className="detail-meta">{customer!.company}</p>
                <div className="detail-badges">
                  <StatusBadge status={customer!.status} />
                </div>
              </div>
            </div>
            <button className="btn-add" onClick={() => router.push(`/customers/${id}/edit`)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              Edit Customer
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="detail-grid">
          <div className="detail-info-card">
            <h3 className="detail-info-title">Contact Information</h3>
            {[
              { label: "Email",    value: customer!.email,    icon: <Mail size={15} color="#64748b" /> },
              { label: "Phone",    value: customer!.phone,    icon: <Phone size={15} color="#64748b" /> },
              { label: "Location", value: customer!.location, icon: <MapPin size={15} color="#64748b" /> },
            ].map((item) => (
              <div key={item.label} className="detail-info-row">
                <span className="detail-info-icon">{item.icon}</span>
                <div>
                  <p className="detail-info-label">{item.label}</p>
                  <p className="detail-info-value">{item.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="detail-info-card">
            <h3 className="detail-info-title">Business Details</h3>
            {[
              { label: "Company",      value: customer!.company, icon: <Building2 size={15} color="#64748b" /> },
              { label: "Customer ID",  value: customer!.id,      icon: <Tag size={15} color="#64748b" /> },
              { label: "Joined Date",  value: new Date(customer!.joinedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), icon: <Calendar size={15} color="#64748b" /> },
            ].map((item) => (
              <div key={item.label} className="detail-info-row">
                <span className="detail-info-icon">{item.icon}</span>
                <div>
                  <p className="detail-info-label">{item.label}</p>
                  <p className="detail-info-value">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {[
            { label: "Total Deals",   value: customer!.totalDeals, color: "#4f46e5", bg: "#eef2ff" },
            { label: "Total Revenue", value: customer!.totalRevenue > 0 ? `$${customer!.totalRevenue.toLocaleString()}` : "—", color: "#059669", bg: "#dcfce7" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card" style={{ justifyContent: "center", flexDirection: "column", textAlign: "center", background: stat.bg }}>
              <p className="stat-card-value" style={{ color: stat.color }}>{stat.value}</p>
              <p className="stat-card-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
