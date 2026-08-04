"use client";

import { useState } from "react";

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  country: string;
  status: string;
}

interface CustomerFormProps {
  initialValues?: CustomerFormData;
  onSubmit: (data: CustomerFormData) => void;
  loading: boolean;
}

export default function CustomerForm({
  initialValues,
  onSubmit,
  loading,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>(
    initialValues || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      country: "",
      status: "",
    }
  );

  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  const validate = () => {
    const newErrors: Partial<CustomerFormData> = {};

    // Required Fields
    if (!formData.firstName.trim())
      newErrors.firstName = "First Name is required";

    if (!formData.lastName.trim())
      newErrors.lastName = "Last Name is required";

    if (!formData.email.trim())
      newErrors.email = "Email is required";

    if (!formData.phone.trim())
      newErrors.phone = "Phone Number is required";

    if (!formData.company.trim())
      newErrors.company = "Company is required";

    if (!formData.address.trim())
      newErrors.address = "Address is required";

    if (!formData.city.trim())
      newErrors.city = "City is required";

    if (!formData.country.trim())
      newErrors.country = "Country is required";

    if (!formData.status.trim())
      newErrors.status = "Status is required";

    // Email Validation
    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
    }

    // Phone Validation
    if (
      formData.phone &&
      !/^[0-9]{10,15}$/.test(formData.phone)
    ) {
      newErrors.phone = "Phone number must be 10-15 digits";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm">{errors.firstName}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {errors.lastName && (
          <p className="text-red-500 text-sm">{errors.lastName}</p>
        )}
      </div>

      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm">{errors.phone}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {errors.company && (
          <p className="text-red-500 text-sm">{errors.company}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {errors.address && (
          <p className="text-red-500 text-sm">{errors.address}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {errors.city && (
          <p className="text-red-500 text-sm">{errors.city}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {errors.country && (
          <p className="text-red-500 text-sm">{errors.country}</p>
        )}
      </div>

      <div>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {errors.status && (
          <p className="text-red-500 text-sm">{errors.status}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? "Saving..." : "Save Customer"}
      </button>
    </form>
  );
}