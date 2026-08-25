"use client";

import { useState } from "react";
import { CompanyFormValues } from "@/data/company";

interface CompanyFormProps {
  initialData?: CompanyFormValues;
  onSubmit: (data: CompanyFormValues) => void | Promise<void>;
  submitText?: string;
  loading?: boolean;
  error?: string;
  success?: string;
}

interface FormErrors {
  name?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  size?: string;
  status?: string;
  description?: string;
}

const emptyForm: CompanyFormValues = {
  name: "",
  industry: "",
  website: "",
  phone: "",
  email: "",
  address: "",
  size: "",
  status: "Active",
  description: "",
};

export default function CompanyForm({
  initialData,
  onSubmit,
  submitText = "Save Company",
  loading = false,
  error,
  success,
}: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormValues>(
    initialData ?? emptyForm
  );

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: undefined,
    }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    /* =====================================================
       COMPANY NAME
       ===================================================== */

    if (!formData.name.trim()) {
      newErrors.name = "Company name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name =
        "Company name must be at least 2 characters.";
    }

    /* =====================================================
       INDUSTRY
       ===================================================== */

    if (!formData.industry.trim()) {
      newErrors.industry = "Industry is required.";
    }

    /* =====================================================
       WEBSITE
       ===================================================== */

    if (!formData.website.trim()) {
      newErrors.website = "Website is required.";
    } else {
      try {
        const website = formData.website.trim();

        // URL must contain protocol
        new URL(website);
      } catch {
        newErrors.website =
          "Please enter a valid website URL.";
      }
    }

    /* =====================================================
       PHONE
       ===================================================== */

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else {
      const phoneRegex = /^[+0-9\s()-]{7,20}$/;

      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone =
          "Please enter a valid phone number.";
      }
    }

    /* =====================================================
       EMAIL
       ===================================================== */

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email =
          "Please enter a valid email address.";
      }
    }

    /* =====================================================
       ADDRESS
       ===================================================== */

    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Stop submission if validation fails
    if (!validate()) {
      return;
    }

    await onSubmit({
      name: formData.name.trim(),
      industry: formData.industry.trim(),
      website: formData.website.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      size: formData.size.trim(),
      status: formData.status,
      description: formData.description.trim(),
    });
  };

  return (
  <>
    {/* Error Message */}
    {error && (
      <div className="msg-error" role="alert">
        ❌ {error}
      </div>
    )}

    {/* Success Message */}
    {success && (
      <div className="msg-success" role="status">
        ✅ {success}
      </div>
    )}

    <form onSubmit={handleSubmit} noValidate className="company-form-card">
      <div className="form-section">
        <div className="form-section-header">
          <h2>Company Information</h2>
          <p>Fill in all the required fields below.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Company Name + Industry */}
          <div className="form-row-2">
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="name"
              >
                Company Name <span style={{ color: "var(--error)" }}>*</span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. SoftiqTech"
                className={`form-input ${
                  errors.name ? "error" : ""
                }`}
                disabled={loading}
                required
              />

              {errors.name && (
                <span className="form-error">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="industry"
              >
                Industry <span style={{ color: "var(--error)" }}>*</span>
              </label>

              <input
                id="industry"
                name="industry"
                type="text"
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g. Software"
                className={`form-input ${
                  errors.industry ? "error" : ""
                }`}
                disabled={loading}
                required
              />

              {errors.industry && (
                <span className="form-error">
                  {errors.industry}
                </span>
              )}
            </div>
          </div>

          {/* Website + Phone */}
          <div className="form-row-2">
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="website"
              >
                Website <span style={{ color: "var(--error)" }}>*</span>
              </label>

              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="e.g. https://example.com"
                className={`form-input ${
                  errors.website ? "error" : ""
                }`}
                disabled={loading}
                required
              />

              {errors.website && (
                <span className="form-error">
                  {errors.website}
                </span>
              )}
            </div>

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="phone"
              >
                Phone <span style={{ color: "var(--error)" }}>*</span>
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +92 300 1234567"
                className={`form-input ${
                  errors.phone ? "error" : ""
                }`}
                disabled={loading}
                required
              />

              {errors.phone && (
                <span className="form-error">
                  {errors.phone}
                </span>
              )}
            </div>
          </div>

          {/* Email + Company Size */}
          <div className="form-row-2">
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="email"
              >
                Email <span style={{ color: "var(--error)" }}>*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. company@email.com"
                className={`form-input ${
                  errors.email ? "error" : ""
                }`}
                disabled={loading}
                required
              />

              {errors.email && (
                <span className="form-error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="size"
              >
                Company Size
              </label>

              <input
                id="size"
                name="size"
                type="text"
                value={formData.size}
                onChange={handleChange}
                placeholder="e.g. 51 - 200 Employees"
                className={`form-input ${
                  errors.size ? "error" : ""
                }`}
                disabled={loading}
              />

              {errors.size && (
                <span className="form-error">
                  {errors.size}
                </span>
              )}
            </div>
          </div>

          {/* Address + Status */}
          <div className="form-row-2">
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="address"
              >
                Address <span style={{ color: "var(--error)" }}>*</span>
              </label>

              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Karachi, Pakistan"
                className={`form-input ${
                  errors.address ? "error" : ""
                }`}
                disabled={loading}
                required
              />

              {errors.address && (
                <span className="form-error">
                  {errors.address}
                </span>
              )}
            </div>

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="status"
              >
                Status <span style={{ color: "var(--error)" }}>*</span>
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`form-input ${
                  errors.status ? "error" : ""
                }`}
                disabled={loading}
                required
              >
                <option value="Active">
                  Active
                </option>
                <option value="Inactive">
                  Inactive
                </option>
              </select>

              {errors.status && (
                <span className="form-error">
                  {errors.status}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label
              className="form-label"
              htmlFor="description"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the company"
              className={`form-input ${
                errors.description ? "error" : ""
              }`}
              disabled={loading}
              rows={4}
            />

            {errors.description && (
              <span className="form-error">
                {errors.description}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              window.history.back()
            }
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-add"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    animation:
                      "spin 0.8s linear infinite",
                  }}
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>

                {submitText.includes("Update")
                  ? "Updating..."
                  : "Saving..."}
              </>
            ) : (
              submitText
            )}
          </button>
        </div>
      </div>
    </form>

    <style>{`
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </>
);
}
