"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [customer, setCustomer] = useState<CustomerFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:8000/api/customers/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customer");
      }

      const data = await response.json();
      setCustomer(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load customer.");
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (data: CustomerFormData) => {
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:8000/api/customers/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to update customer");
      }

      setSuccess("Customer updated successfully!");

      setTimeout(() => {
        router.push(`/customer/${id}`);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update customer.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="p-6">
        <h2>Loading customer...</h2>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <h2>Customer not found.</h2>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Edit Customer
      </h1>

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
        initialValues={customer}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}