"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ContactForm from "@/components/contacts/ContactForm";
import { ApiContact, Contact, toContact } from "@/data/contact";
import { apiRequest, getAccessToken } from "@/lib/api";
import { getCachedContact, setCachedContact } from "@/data/contactCache";
import ThemeLoader from "@/components/ui/ThemeLoader";

export default function EditContactContent() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const id = Number(searchParams.get("id"));

  // Never read the client cache during render. The page is also
  // server-rendered, so reading it in the initial state can make
  // server HTML differ from the client HTML.
  const [contact, setContact] = useState<Contact | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setHydrated(true);
      setNotFound(true);
      return;
    }

    let cancelled = false;

    // Restore cached contact after hydration for instant client navigation.
    const cached = getCachedContact(id);
    if (cached) {
      setContact(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    setHydrated(true);

    const run = async () => {
      try {
        const data = await apiRequest<ApiContact>(`/api/contacts/${id}/`);
        if (cancelled) return;
        const nextContact = toContact(data);
        setCachedContact(nextContact);
        setContact(nextContact);
      } catch {
        if (cancelled) return;
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

  if (!hydrated) {
    return (
      <DashboardLayout>
        <div style={{ minHeight: "220px" }} aria-hidden="true" />
      </DashboardLayout>
    );
  }

  if (loading && !contact && id) {
    return (
      <DashboardLayout>
        <ThemeLoader label="Loading contact..." />
      </DashboardLayout>
    );
  }


  if (!id || notFound || !contact) {
    return (
      <DashboardLayout>
      <div style={{ background: "#fff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
          <h1 className="page-title">Contact Not Found</h1>
          <p className="page-subtitle">Please select a valid contact.</p>
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <ContactForm mode="edit" contact={contact} />
      </div>
    </DashboardLayout>
  );
}
