import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CONTACTS } from "@/components/contacts/data";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;

  const contact = CONTACTS.find(
    (item) => item.id === Number(id)
  );

  if (!contact) {
    return (
      <DashboardLayout>
        <div
          style={{
            padding: "32px",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#111827",
            }}
          >
            Contact Not Found
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "12px",
            }}
          >
            The requested contact does not exist.
          </p>

          <Link
            href="/contacts"
            style={{
              display: "inline-block",
              marginTop: "20px",
              background: "#4f46e5",
              color: "#ffffff",
              padding: "10px 18px",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Back to Contacts
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Header */}

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Contact Details
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            View contact information
          </p>
        </div>

        {/* Card */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "30px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 15px rgba(0,0,0,.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "#4f46e5",
                color: "#ffffff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              {contact.fullName.charAt(0)}
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                {contact.fullName}
              </h2>

              <p
                style={{
                  marginTop: "6px",
                  color: "#64748b",
                }}
              >
                {contact.jobTitle}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: "24px",
            }}
          >
            <Info title="Company" value={contact.company} />
            <Info title="Email" value={contact.email} />
            <Info title="Phone" value={contact.phone} />
            <Info title="Job Title" value={contact.jobTitle} />
            <Info title="Last Interaction" value={contact.lastInteraction} />
            <Info title="Status" value={contact.status} />
          </div>
        </div>

        <Link
          href="/contacts"
          style={{
            width: "fit-content",
            background: "#4f46e5",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Back to Contacts
        </Link>
      </div>
    </DashboardLayout>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <p
        style={{
          margin: "0 0 8px",
          color: "#64748b",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        {title}
      </p>

      <p
        style={{
          margin: 0,
          color: "#111827",
          fontSize: "15px",
          fontWeight: 500,
        }}
      >
        {value}
      </p>
    </div>
  );
}