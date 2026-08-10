"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Contact, ContactStatus, toApiPayload } from "@/data/contact";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";

interface ContactFormProps {
  mode: "add" | "edit";
  contact?: Contact;
}

interface FormState {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: string;
}

interface FormErrors {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: string;
}

interface InputProps {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}

const initialForm: FormState = {
  fullName: "",
  company: "",
  email: "",
  phone: "",
  jobTitle: "",
  status: "Active",
};

const initialErrors: FormErrors = {
  fullName: "",
  company: "",
  email: "",
  phone: "",
  jobTitle: "",
  status: "",
};

export default function ContactForm({ mode, contact }: ContactFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>(initialErrors);
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
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSuccess("");
    setSubmitError("");
  };

  const validate = () => {
    const newErrors: FormErrors = { ...initialErrors };
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setSuccess("");
    setSubmitError("");

    try {
      const payload = toApiPayload({
        ...form,
        status: form.status as ContactStatus,
      });

      if (mode === "add") {
        await apiRequest("/api/contacts/", {
          method: "POST",
          body: payload,
        });
        setSuccess("Contact added successfully!");
      } else {
        await apiRequest(`/api/contacts/${contact!.id}/`, {
          method: "PATCH",
          body: payload,
        });
        setSuccess("Contact updated successfully!");
      }

      emitDataChanged();

      setTimeout(() => {
        router.push(mode === "edit" ? `/contacts/${contact!.id}` : "/contacts");
      }, 1500);
    } catch (err) {
      setSubmitError((err as Error).message || "Something went wrong.");
      if (!getAccessToken()) router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-page">
      {/* Form Header */}
      <div className="form-page-header">
        <div>
          <Link href="/contacts" className="back-link">
            <ArrowLeft size={17} />
            Back to Contacts
          </Link>

          <h1 className="page-title">
            {mode === "add" ? "Add Contact" : "Edit Contact"}
          </h1>

          <p className="page-subtitle">
            {mode === "add"
              ? "Create a new contact and add them to your contacts."
              : "Update the contact information below."}
          </p>
        </div>
      </div>

      {/* Form */}
      <form className="contact-form-card" onSubmit={handleSubmit}>
        {/* Success Message */}
        {success && (
          <div className="form-alert form-alert-success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="form-alert form-alert-error">
            <AlertCircle size={18} />
            <span>{submitError}</span>
          </div>
        )}

        <div className="form-section">
          <div className="form-section-header">
            <h2>Contact Information</h2>
            <p>Enter the basic information for this contact.</p>
          </div>

          <div className="contact-form-grid">
            <Input
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              error={errors.fullName}
            />

            <Input
              label="Company"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Enter company name"
              error={errors.company}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email address"
              error={errors.email}
            />

            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              error={errors.phone}
            />

            <Input
              label="Job Title"
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              placeholder="Enter job title"
              error={errors.jobTitle}
            />

            <div className="form-field">
              <label htmlFor="status" className="form-label">
                Status
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className={`form-input ${
                  errors.status ? "form-input-error" : ""
                }`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Lead">Lead</option>
              </select>

              {errors.status && <p className="form-error">{errors.status}</p>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <Link href="/contacts" className="form-cancel-btn">
            Cancel
          </Link>

          <button type="submit" className="form-submit-btn" disabled={loading}>
            {loading ? "Saving..." : mode === "add" ? "Save Contact" : "Update Contact"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
}: InputProps) {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input ${error ? "form-input-error" : ""}`}
      />

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
