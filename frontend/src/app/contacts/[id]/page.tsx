"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ApiContact, Contact, toContact } from "@/data/contact";
import { apiRequest, getAccessToken } from "@/lib/api";
import ThemeLoader from "@/components/ui/ThemeLoader";
import { Mail, Phone, Briefcase, Building2, Clock, ArrowLeft, Pencil } from "lucide-react";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function statusColor(status: string) {
  switch (status) {
    case "Active":   return { bg: "#dcfce7", color: "#16a34a", dot: "#16a34a" };
    case "Inactive": return { bg: "#f1f5f9", color: "#64748b", dot: "#64748b" };
    case "Lead":     return { bg: "#fef3c7", color: "#b45309", dot: "#b45309" };
    default:         return { bg: "#f1f5f9", color: "#64748b", dot: "#64748b" };
  }
}

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await apiRequest<ApiContact>(`/api/contacts/${id}/`);
        if (cancelled) return;
        setContact(toContact(data));
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
    return () => { cancelled = true; };
  }, [id, router]);

  if (loading) return (
    <DashboardLayout><ThemeLoader label="Loading contact..." /></DashboardLayout>
  );

  if (notFound || !contact) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Contact Not Found</h2>
        <p>{error || "The requested contact does not exist."}</p>
        <button className="btn-add" onClick={() => router.push("/contacts")}>Back to Contacts</button>
      </div>
    </DashboardLayout>
  );

  const s = statusColor(contact.status);
  const initials = getInitials(contact.fullName);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Back + header */}
        <div className="page-header">
          <div>
            <button className="back-btn" onClick={() => router.push("/contacts")} style={{ marginBottom: "6px" }}>
              <ArrowLeft size={15} /> Back to Contacts
            </button>
            <h1 className="page-title">Contact Details</h1>
            <p className="page-subtitle">View and manage contact information.</p>
          </div>
          <Link
            href={`/contacts/edit?id=${id}`}
            className="btn-add"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Pencil size={14} /> Edit Contact
          </Link>
        </div>

        {/* Profile card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

          {/* Banner */}
          <div style={{ height: "80px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }} />

          {/* Avatar + name row */}
          <div style={{ padding: "0 24px 20px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "-28px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "16px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.4rem", border: "3px solid #fff", flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ paddingBottom: "4px" }}>
                <h2 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>{contact.fullName}</h2>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>{contact.jobTitle}</p>
              </div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "9999px", background: s.bg, color: s.color, fontSize: "0.78rem", fontWeight: 600, marginBottom: "4px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} />
              {contact.status}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

          {/* Contact Info */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Contact Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { icon: <Mail size={15} color="#4f46e5" />,     label: "Email",   value: contact.email },
                { icon: <Phone size={15} color="#4f46e5" />,    label: "Phone",   value: contact.phone },
                { icon: <Briefcase size={15} color="#4f46e5" />,label: "Job Title",value: contact.jobTitle },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 1px", fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#0f172a", fontWeight: 500 }}>{item.value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company & Activity */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Company & Activity</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { icon: <Building2 size={15} color="#4f46e5" />, label: "Company",          value: contact.company },
                { icon: <Clock size={15} color="#4f46e5" />,     label: "Last Interaction", value: contact.lastInteraction || "—" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 1px", fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#0f172a", fontWeight: 500 }}>{item.value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
