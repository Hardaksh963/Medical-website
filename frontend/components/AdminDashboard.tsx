"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAdminDashboard,
  AdminDashboardResponse,
} from "@/lib/api";

export default function AdminDashboard() {
  const [dashboard, setDashboard] =
    useState<AdminDashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          window.location.href = "/login?redirect=/admin";
          return;
        }

        const response = await getAdminDashboard();

        setDashboard(response);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load admin dashboard.";

        if (
          message.toLowerCase().includes("admin access required") ||
          message.includes("403")
        ) {
          window.location.href = "/";
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex-1 p-8 text-black">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-black">
              Loading admin dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="flex-1 p-8 text-black">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-semibold text-red-700">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-red-700">
              {error || "Unable to load dashboard."}
            </p>

            <Link
              href="/"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { customers, products, orders, revenue, complaints, inventory } =
    dashboard;

  return (
    <main className="flex-1 p-8 text-black">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Admin Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-black">
            Dashboard
          </h1>

          <p className="mt-2 text-black">
            Overview of your medical store.
          </p>
        </div>

        {/* Main statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Customers */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Customers
              </p>
              <span className="text-2xl">👥</span>
            </div>

            <p className="mt-4 text-3xl font-bold text-black">
              {customers.total}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Registered customers
            </p>
          </div>

          {/* Products */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Products
              </p>
              <span className="text-2xl">📦</span>
            </div>

            <p className="mt-4 text-3xl font-bold text-black">
              {products.total}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {products.active} active · {products.inactive} inactive
            </p>
          </div>

          {/* Orders */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Orders
              </p>
              <span className="text-2xl">🛒</span>
            </div>

            <p className="mt-4 text-3xl font-bold text-black">
              {orders.total}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {orders.pending} pending
            </p>
          </div>

          {/* Revenue */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Revenue
              </p>
              <span className="text-2xl">₹</span>
            </div>

            <p className="mt-4 text-3xl font-bold text-black">
              ₹{Number(revenue.total).toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Total revenue
            </p>
          </div>
        </div>

        {/* Second row */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Orders overview */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">
                Orders Overview
              </h2>

              <Link
                href="/admin/orders"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Manage Orders →
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">

              <StatItem
                label="Pending"
                value={orders.pending}
              />

              <StatItem
                label="Confirmed"
                value={orders.confirmed}
              />

              <StatItem
                label="Processing"
                value={orders.processing}
              />

              <StatItem
                label="Shipped"
                value={orders.shipped}
              />

              <StatItem
                label="Delivered"
                value={orders.delivered}
              />

              <StatItem
                label="Cancelled"
                value={orders.cancelled}
              />

            </div>
          </section>

          {/* Inventory overview */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">
                Inventory Overview
              </h2>

              <Link
                href="/admin/inventory"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Manage Inventory →
              </Link>
            </div>

            <div className="mt-6 space-y-4">

              <InventoryItem
                label="Total Units"
                value={inventory.total_units}
              />

              <InventoryItem
                label="Low Stock Products"
                value={inventory.low_stock_products}
              />

              <InventoryItem
                label="Out of Stock"
                value={inventory.out_of_stock_products}
              />

              <InventoryItem
                label="Expiring Within 30 Days"
                value={inventory.expiring_batches_30_days}
              />

            </div>
          </section>
        </div>

        {/* Revenue + complaints */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Revenue overview */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-semibold text-black">
              Revenue Overview
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-4">

              <RevenueItem
                label="Today"
                value={revenue.today}
              />

              <RevenueItem
                label="This Month"
                value={revenue.this_month}
              />

              <RevenueItem
                label="Previous Month"
                value={revenue.previous_month}
              />

              <RevenueItem
                label="Total"
                value={revenue.total}
              />

            </div>
          </section>

          {/* Complaints */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">
                Complaints
              </h2>

              <Link
                href="/admin/complaints"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Manage Complaints →
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">

              <StatItem
                label="Total"
                value={complaints.total}
              />

              <StatItem
                label="Open"
                value={complaints.open}
              />

              <StatItem
                label="In Progress"
                value={complaints.in_progress}
              />

              <StatItem
                label="Resolved"
                value={complaints.resolved}
              />

            </div>
          </section>
        </div>

        {/* Quick actions */}
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-black">
            Quick Actions
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">

            <Link
              href="/admin/products"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Manage Products
            </Link>

            <Link
              href="/admin/inventory"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-black hover:bg-gray-50"
            >
              Manage Inventory
            </Link>

            <Link
              href="/admin/orders"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-black hover:bg-gray-50"
            >
              View Orders
            </Link>

            <Link
              href="/admin/complaints"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-black hover:bg-gray-50"
            >
              View Complaints
            </Link>

          </div>
        </section>

      </div>
    </main>
  );
}

function StatItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-black">
        {value}
      </p>
    </div>
  );
}

function InventoryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
      <span className="text-sm font-medium text-black">
        {label}
      </span>

      <span className="text-xl font-bold text-black">
        {value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function RevenueItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-black">
        ₹{Number(value).toLocaleString("en-IN")}
      </p>
    </div>
  );
}