"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ContactForm from "@/components/contacts/ContactForm";
import { CONTACTS } from "@/components/contacts/data";
import { useSearchParams } from "next/navigation";

export default function EditContactContent() {

  const searchParams = useSearchParams();

  const id = Number(searchParams.get("id"));

  const contact = CONTACTS.find((item) => item.id === id);


  if (!contact) {
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