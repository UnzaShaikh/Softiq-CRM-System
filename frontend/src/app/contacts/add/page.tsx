"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ContactStatus, STATUS_TO_API } from "@/data/contact";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";

export default function AddContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    jobTitle: "",
    status: "Active",
  });
const [loading,setLoading] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();


  if (
    !form.fullName ||
    !form.email ||
    !form.phone
  ) {
    alert("Please fill all required fields.");
    return;
  }


  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  if(!emailRegex.test(form.email)){
    alert("Please enter valid email.");
    return;
  }


  if(!form.status){
    alert("Please select status.");
    return;
  }


  try {

    setLoading(true);

    await apiRequest("/api/contacts/", {
      method: "POST",
      body: {
        full_name: form.fullName,
        company: form.company,
        email: form.email,
        phone: form.phone,
        job_title: form.jobTitle,
        status: STATUS_TO_API[form.status as ContactStatus],
      },
    });

    emitDataChanged();

    alert("Contact added successfully!");

    router.push("/contacts");

  } catch(error){

    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong!"
    );

    if (!getAccessToken()) router.push("/login");

  }
  finally{

    setLoading(false);

  }

};
  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Add Contact</h1>
            <p className="page-subtitle">Create a new contact for your CRM.</p>
          </div>
          <Link href="/contacts" className="btn-secondary" style={{ textDecoration: "none" }}>
            Cancel
          </Link>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="company-form-card">
          <div className="form-section">
            <div className="form-section-header">
              <h2>Contact Information</h2>
              <p>Enter the basic information for this contact.</p>
            </div>

            <div className="contact-form-grid">
              <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} />
              <Input label="Company" name="company" value={form.company} onChange={handleChange} />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
              <Input label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} />

              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="form-input" style={{ cursor: "pointer" }}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Lead</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Link href="/contacts" className="btn-secondary" style={{ textDecoration: "none" }}>Cancel</Link>
            <button type="submit" disabled={loading} className="btn-add"
              style={{ cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

function Input({ label, name, value, onChange, type = "text" }: InputProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} className="form-input" />
    </div>
  );
}