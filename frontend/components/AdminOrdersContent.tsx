"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAuthToken,
  getAdminOrders,
  updateAdminOrderStatus,
} from "@/lib/api";

import type { AdminOrder } from "@/lib/api";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export default function AdminOrdersContent() {
  const router = useRouter();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login?redirect=/admin/orders");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getAdminOrders();

      setOrders(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load orders";

      if (
        message.toLowerCase().includes("admin access required") ||
        message.includes("403")
      ) {
        router.push("/");
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    orderId: string,
    newStatus: string
  ) {
    try {
      setUpdatingOrderId(orderId);
      setError("");
      setSuccess("");

      const updatedOrder = await updateAdminOrderStatus(
        orderId,
        newStatus
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id
            ? {
                ...order,
                status: updatedOrder.status,
              }
            : order
        )
      );

      setSuccess(
        `Order ${updatedOrder.order_number} status updated to ${updatedOrder.status}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update order status"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !searchValue ||
        order.order_number
          .toLowerCase()
          .includes(searchValue) ||
        order.user_id
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const orderCounts = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(
        (order) => order.status === "PENDING"
      ).length,
      processing: orders.filter(
        (order) => order.status === "PROCESSING"
      ).length,
      shipped: orders.filter(
        (order) => order.status === "SHIPPED"
      ).length,
      delivered: orders.filter(
        (order) => order.status === "DELIVERED"
      ).length,
      cancelled: orders.filter(
        (order) => order.status === "CANCELLED"
      ).length,
    };
  }, [orders]);

  function statusClass(status: string) {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";

      case "PROCESSING":
        return "bg-purple-100 text-purple-800";

      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800";

      case "DELIVERED":
        return "bg-green-100 text-green-800";

      case "CANCELLED":
        return "bg-red-100 text-red-800";

      case "RETURNED":
        return "bg-gray-200 text-gray-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <p className="text-black">Loading orders...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            Order Management
          </h1>

          <p className="mt-2 text-gray-700">
            Manage customer orders and update their status.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {/* Summary cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-600">
              Total
            </p>
            <p className="mt-2 text-2xl font-bold text-black">
              {orderCounts.total}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-600">
              Pending
            </p>
            <p className="mt-2 text-2xl font-bold text-black">
              {orderCounts.pending}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-600">
              Processing
            </p>
            <p className="mt-2 text-2xl font-bold text-black">
              {orderCounts.processing}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-600">
              Shipped
            </p>
            <p className="mt-2 text-2xl font-bold text-black">
              {orderCounts.shipped}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-600">
              Delivered
            </p>
            <p className="mt-2 text-2xl font-bold text-black">
              {orderCounts.delivered}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-600">
              Cancelled
            </p>
            <p className="mt-2 text-2xl font-bold text-black">
              {orderCounts.cancelled}
            </p>
          </div>

        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-black">
                Search
              </label>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order number or customer ID"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-black">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black"
              >
                <option value="ALL">
                  All Statuses
                </option>

                {ORDER_STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Orders */}
        <section className="rounded-xl bg-white shadow">

          <div className="border-b p-6">
            <h2 className="text-xl font-bold text-black">
              Orders
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Showing {filteredOrders.length} of{" "}
              {orders.length} orders
            </p>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                No orders found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">

                <thead>
                  <tr className="border-b text-left">
                    <th className="p-4 text-sm text-gray-600">
                      Order
                    </th>

                    <th className="p-4 text-sm text-gray-600">
                      Customer
                    </th>

                    <th className="p-4 text-sm text-gray-600">
                      Date
                    </th>

                    <th className="p-4 text-sm text-gray-600">
                      Items
                    </th>

                    <th className="p-4 text-sm text-gray-600">
                      Total
                    </th>

                    <th className="p-4 text-sm text-gray-600">
                      Status
                    </th>

                    <th className="p-4 text-sm text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0"
                    >
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin/orders/${order.id}`
                            )
                          }
                          className="font-semibold text-black hover:underline"
                        >
                          {order.order_number}
                        </button>
                      </td>
                          
                      <td className="p-4">
                        <span className="text-sm text-black">
                          {order.user_id}
                        </span>
                      </td>

                      <td className="p-4 text-sm text-black">
                        {new Date(
                          order.created_at
                        ).toLocaleString()}
                      </td>

                      <div>
                        <p className="font-medium text-gray-900">
                            {item.product_name || "Product no longer available"}
                        </p>
                        </div>

                      <td className="p-4 font-semibold text-black">
                        ₹{Number(order.total_amount).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <select
                          value={order.status}
                          disabled={
                            updatingOrderId === order.id
                          }
                          onChange={(e) =>
                            handleStatusChange(
                              order.id,
                              e.target.value
                            )
                          }
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black"
                        >
                          {ORDER_STATUSES.map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}