"use client";

import { useState } from "react";

export interface CompanyFormData {
  name: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
}

interface CompanyFormProps {
  initialData?: CompanyFormData;
  onSubmit: (data: CompanyFormData) => void | Promise<void>;
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
}

const emptyForm: CompanyFormData = {
  name: "",
  industry: "",
  website: "",
  phone: "",
  email: "",
  address: "",
};

export default function CompanyForm({
  initialData,
  onSubmit,
  submitText = "Save Company",
  loading = false,
  error,
  success,
}: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>(
    initialData ?? emptyForm
  );

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

      <form onSubmit={handleSubmit} noValidate>
        {/* =================================================
            COMPANY NAME
            ================================================= */}

        <div className="form-group">
          <label
            className="form-label"
            htmlFor="name"
          >
            Company Name *
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

        {/* =================================================
            INDUSTRY
            ================================================= */}

        <div className="form-group">
          <label
            className="form-label"
            htmlFor="industry"
          >
            Industry *
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

        {/* =================================================
            WEBSITE + PHONE
            ================================================= */}

        <div className="form-row-2">
          {/* Website */}

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="website"
            >
              Website *
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

          {/* Phone */}

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="phone"
            >
              Phone *
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

        {/* =================================================
            EMAIL
            ================================================= */}

        <div className="form-group">
          <label
            className="form-label"
            htmlFor="email"
          >
            Email *
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

        {/* =================================================
            ADDRESS
            ================================================= */}

        <div className="form-group">
          <label
            className="form-label"
            htmlFor="address"
          >
            Address *
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

        {/* =================================================
            SUBMIT BUTTON
            ================================================= */}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="company-form-spinner"
                aria-hidden="true"
              />
              Updating...
            </>
          ) : (
            submitText
          )}
        </button>
      </form>
    </>
  );
}