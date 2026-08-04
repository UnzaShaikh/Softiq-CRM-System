"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomerForm from "@/components/customers/CustomerForm";

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

export default function AddCustomerPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (data: CustomerFormData) => {
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      // Get JWT Access Token
      const token = localStorage.getItem("access_token");

      const response = await fetch("http://127.0.0.1:8000/api/customers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to add customer");
      }

      setSuccess("Customer added successfully!");

      setTimeout(() => {
        router.push("/customer");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while adding the customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add Customer</h1>

      {success && (
        <div className="mb-4 rounded bg-green-100 p-3 text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <CustomerForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}