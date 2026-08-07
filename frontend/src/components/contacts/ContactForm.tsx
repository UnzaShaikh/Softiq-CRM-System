"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Contact } from "./types";

interface ContactFormProps {
  mode: "add" | "edit";
  contact?: Contact;
}
interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  type?: string;
  error?: string;
}

export default function ContactForm({
  mode,
  contact,
}: ContactFormProps) {
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    jobTitle: "",
    status: "Active",
  });
  const [errors, setErrors] = useState({
  fullName: "",
  company: "",
  email: "",
  phone: "",
  jobTitle: "",
  status: "",
});
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState("");
const [submitError, setSubmitError] = useState("");
  useEffect(() => {
    if (mode === "edit" && contact) {
      setForm({
        fullName: contact.fullName,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        jobTitle: contact.jobTitle,
        status: contact.status,
      });
    }
  }, [mode, contact]);

 const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });

  setErrors((prev) => ({
    ...prev,
    [e.target.name]: "",
  }));

  // Clear previous messages when user starts typing
  setSuccess("");
  setSubmitError("");
};
const validate = () => {
  const newErrors = {
    fullName: "",
    company: "",
    email: "",
    phone: "",
    jobTitle: "",
    status: "",
  };

  let valid = true;

  if (!form.fullName.trim()) {
    newErrors.fullName = "Full Name is required";
    valid = false;
  }

  if (!form.company.trim()) {
    newErrors.company = "Company is required";
    valid = false;
  }

  if (!form.email.trim()) {
    newErrors.email = "Email is required";
    valid = false;
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  ) {
    newErrors.email = "Invalid email";
    valid = false;
  }

  if (!form.phone.trim()) {
    newErrors.phone = "Phone is required";
    valid = false;
  }

  if (!form.jobTitle.trim()) {
    newErrors.jobTitle = "Job Title is required";
    valid = false;
  }
if (!form.status) {
  newErrors.status = "Status is required";
  valid = false;
}

  setErrors(newErrors);

  return valid;
};
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validate()) {
    return;
  }

  setLoading(true);
  setSuccess("");
  setSubmitError("");

  try {
    // Fake API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (mode === "add") {
      setSuccess("Contact added successfully!");
    } else {
      setSuccess("Contact updated successfully!");
    }

    console.log(form);
  } catch {
    setSubmitError("Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  return (
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
       {success && (
  <div
    style={{
      marginBottom: "20px",
      padding: "12px",
      borderRadius: "8px",
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #86efac",
      fontWeight: 500,
    }}
  >
    {success}
  </div>
)}

{submitError && (
  <div
    style={{
      marginBottom: "20px",
      padding: "12px",
      borderRadius: "8px",
      background: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fca5a5",
      fontWeight: 500,
    }}
  >
    {submitError}
  </div>
)}
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
  error={errors.fullName}
/>

      <Input
  label="Company"
  name="company"
  value={form.company}
  onChange={handleChange}
  error={errors.company}
/>

        <Input
  label="Email"
  name="email"
  type="email"
  value={form.email}
  onChange={handleChange}
  error={errors.email}
/>

       <Input
  label="Phone"
  name="phone"
  value={form.phone}
  onChange={handleChange}
  error={errors.phone}
/>

        <Input
          label="Job Title"
          name="jobTitle"
          value={form.jobTitle}
          onChange={handleChange}
          error={errors.jobTitle}
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
  <option value="Active">Active</option>
  <option value="Inactive">Inactive</option>
  <option value="Lead">Lead</option>
</select>

{errors.status && (
  <p
    style={{
      color: "#dc2626",
      fontSize: "13px",
      marginTop: "6px",
    }}
  >
    {errors.status}
  </p>
)}
        </div>
      </div>

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
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    background: loading ? "#94a3b8" : "#4f46e5",
    color: "#ffffff",
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
  }}
>
  {loading
    ? "Saving..."
    : mode === "add"
    ? "Save Contact"
    : "Update Contact"}
</button>
      </div>
    </form>
  );
}



function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
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

      {error && (
        <p
          style={{
            color: "#dc2626",
            fontSize: "13px",
            marginTop: "6px",
          }}
        >
          {error}
        </p>
      )}
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