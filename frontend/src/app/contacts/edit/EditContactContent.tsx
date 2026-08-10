"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ContactForm from "@/components/contacts/ContactForm";
import { ApiContact, Contact, toContact } from "@/data/contact";
import { apiRequest, getAccessToken } from "@/lib/api";
import ThemeLoader from "@/components/ui/ThemeLoader";

export default function EditContactContent() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const id = Number(searchParams.get("id"));

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const run = async () => {
      try {
        const data = await apiRequest<ApiContact>(`/api/contacts/${id}/`);
        if (cancelled) return;
        setContact(toContact(data));
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

  if (loading && id) {
    return (
      <DashboardLayout>
        <ThemeLoader label="Loading contact..." />
      </DashboardLayout>
    );
  }


  if (!id || notFound || !contact) {
    return (
      <DashboardLayout>
        <div
          style={{
            background:"#ffffff",
            padding:"24px",
            borderRadius:"16px",
            border:"1px solid #e2e8f0",
          }}
        >
          <h1
            style={{
              color:"#111827",
              margin:0,
            }}
          >
            Contact Not Found
          </h1>

          <p
            style={{
              marginTop:"12px",
              color:"#64748b",
            }}
          >
            Please select a valid contact.
          </p>

        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>

      <div
        style={{
          display:"flex",
          flexDirection:"column",
          gap:"24px",
        }}
      >

        <div>

          <h1
            style={{
              margin:0,
              fontSize:"32px",
              fontWeight:700,
              color:"#111827",
            }}
          >
            Edit Contact
          </h1>


          <p
            style={{
              marginTop:"8px",
              color:"#64748b",
            }}
          >
            Update contact information.
          </p>

        </div>


        <ContactForm
          mode="edit"
          contact={contact}
        />

      </div>

    </DashboardLayout>
  );
}
