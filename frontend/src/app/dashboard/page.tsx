"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import DealsPipeline from "@/components/dashboard/DealsPipeline";
import SalesPipeline from "@/components/dashboard/SalesPipeline";
import LeadsDonutChart from "@/components/dashboard/LeadsDonutChart";
import RecentCustomers from "@/components/dashboard/RecentCustomers";
import RecentLeads from "@/components/dashboard/RecentLeads";
import TopPerformers from "@/components/dashboard/TopPerformers";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

interface DashboardData {
  total_customers: number;
  total_leads: number;
  opportunities: number;
  revenue: number;
  tasks_due: number;
}

const stats = [
  {
    label: "Total Customers",
    value: "2,491",
    change: "+12%",
    up: true,
    color: "#4f46e5",
    icon: "👥",
  },
  {
    label: "Active Deals",
    value: "148",
    change: "+5%",
    up: true,
    color: "#0891b2",
    icon: "🤝",
  },
  {
    label: "Revenue (MTD)",
    value: "$84,200",
    change: "+8.3%",
    up: true,
    color: "#16a34a",
    icon: "💰",
  },
  {
    label: "Open Tickets",
    value: "23",
    change: "-4%",
    up: false,
    color: "#d97706",
    icon: "🎫",
  },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Helper to read a cookie by name
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const token = getCookie("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/dashboard-summary/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          // Token expired or invalid → clear cookies and redirect
          document.cookie = "access_token=; path=/; max-age=0";
          document.cookie = "refresh_token=; path=/; max-age=0";
          router.replace("/login");
          throw new Error("Unauthorized");
        }
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Logout function
  const handleLogout = () => {
    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "refresh_token=; path=/; max-age=0";
    router.push("/login");
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-8">No data available</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Customers</h2>
          <p className="text-2xl">{data.total_customers}</p>
        </div>
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Leads</h2>
          <p className="text-2xl">{data.total_leads}</p>
        </div>
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Opportunities</h2>
          <p className="text-2xl">{data.opportunities}</p>
        </div>
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Revenue</h2>
          <p className="text-2xl">${data.revenue}</p>
        </div>
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Tasks Due</h2>
          <p className="text-2xl">{data.tasks_due}</p>
        </div>

        {/* Recent Customers */}
        <RecentCustomers />

        {/* Recent Leads */}
        <RecentLeads />

        {/* Top Performers */}
        <TopPerformers />
<SalesPipeline />
      </div>
    </div>
  );
}
