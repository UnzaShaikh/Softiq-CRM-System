"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function AddContactPage() {
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


    // API call ki jagah abhi testing delay
    await new Promise(
      (resolve)=>setTimeout(resolve,1000)
    );


    alert("Contact added successfully!");

    console.log(form);


  } catch(error){

    alert("Something went wrong!");

  }
  finally{

    setLoading(false);

  }

};
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
            Add Contact
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            Create a new contact for your CRM.
          </p>
        </div>

        {/* Form Card */}

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 15px rgba(0,0,0,.06)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: "20px",
            }}
          >
            <Input
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
            />

            <Input
              label="Company"
              name="company"
              value={form.company}
              onChange={handleChange}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <Input
              label="Job Title"
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
            />

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={inputStyle}
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Lead</option>
              </select>
            </div>
          </div>

          {/* Buttons */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "30px",
            }}
          >
            <Link
              href="/contacts"
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                background: "#e5e7eb",
                color: "#111827",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Cancel
            </Link>

           <button
  type="submit"
  disabled={loading}
  style={{
    padding:"12px 20px",
    borderRadius:"8px",
    border:"none",
    background: loading ? "#a5b4fc" : "#4f46e5",
    color:"#ffffff",
    fontWeight:600,
    cursor: loading ? "not-allowed" : "pointer",
  }}
>
{
 loading 
 ? 
 "Saving..."
 :
 "Save Contact"
}
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
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  type?: string;
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
}: InputProps) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: 600,
          color: "#374151",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        style={inputStyle}
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  color: "#111827",
  background: "#ffffff",
  outline: "none",
  boxSizing: "border-box",
};