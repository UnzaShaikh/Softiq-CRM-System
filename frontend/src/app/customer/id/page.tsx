"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Customer {
  id: number;
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

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
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
        throw new Error("Failed to fetch customer.");
      }

      const data = await response.json();
      setCustomer(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:8000/api/customers/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete customer.");
      }

      alert("Customer deleted successfully.");

      router.push("/customer");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2>Loading customer...</h2>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6 text-red-600">
        <h2>{error || "Customer not found."}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Customer Details
      </h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">

        <div>
          <strong>Name:</strong>{" "}
          {customer.firstName} {customer.lastName}
        </div>

        <div>
          <strong>Email:</strong> {customer.email}
        </div>

        <div>
          <strong>Phone:</strong> {customer.phone}
        </div>

        <div>
          <strong>Company:</strong> {customer.company}
        </div>

        <div>
          <strong>Address:</strong> {customer.address}
        </div>

        <div>
          <strong>City:</strong> {customer.city}
        </div>

        <div>
          <strong>Country:</strong> {customer.country}
        </div>

        <div>
          <strong>Status:</strong> {customer.status}
        </div>

      </div>

      <div className="flex gap-4 mt-6">

        <button
          onClick={() => router.push(`/customer/${id}/edit`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded"
        >
          Delete
        </button>

        <button
          onClick={() => router.push("/customer")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded"
        >
          Back
        </button>

      </div>

    </div>
  );
}