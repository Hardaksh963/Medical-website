"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminOrder,
  getAuthToken,
  updateAdminOrderStatus,
  type AdminOrder,
} from "@/lib/api";

interface Props {
  orderId: string;
}

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

function getStatusClass(status: string) {
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
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AdminOrderDetailsContent({ orderId }: Props) {
  const router = useRouter();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  async function loadOrder() {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getAdminOrder(orderId);
      setOrder(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load order";

      if (message.toLowerCase().includes("admin access")) {
        router.push("/");
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function handleStatusChange(newStatus: string) {
    if (!order || newStatus === order.status) {
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const updatedOrder = await updateAdminOrderStatus(
        order.id,
        newStatus
      );

      setOrder(updatedOrder);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update order status"
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-black">Loading order...</p>
        </div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => router.push("/admin/orders")}
            className="mb-6 text-sm font-medium text-black hover:underline"
          >
            ← Back to Orders
          </button>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-700">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <button
          onClick={() => router.push("/admin/orders")}
          className="mb-6 text-sm font-medium text-black hover:underline"
        >
          ← Back to Orders
        </button>

        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Order Details
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              {order.order_number}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
                order.status
              )}`}
            >
              {order.status}
            </span>

            <select
              value={order.status}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Order Information */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-black">
              Order Information
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Order Number</span>
                <span className="font-medium text-black">
                  {order.order_number}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Order ID</span>
                <span className="break-all text-right font-mono text-xs text-black">
                  {order.id}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Customer ID</span>
                <span className="break-all text-right font-mono text-xs text-black">
                  {order.user_id}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Created At</span>
                <span className="text-black">
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {/* Payment / Summary */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-black">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-black">
                  ₹{Number(order.subtotal).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-black">
                  ₹{Number(order.shipping_cost).toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Total</span>
                  <span className="text-lg font-bold text-black">
                    ₹{Number(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Products */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-black">
              Ordered Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {order.items?.length ?? 0} item(s)
            </p>
          </div>

          {order.items && order.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-sm">
                    <th className="px-6 py-4 font-semibold text-black">
                      Product ID
                    </th>

                    <th className="px-6 py-4 font-semibold text-black">
                      Quantity
                    </th>

                    <th className="px-6 py-4 font-semibold text-black">
                      Unit Price
                    </th>

                    <th className="px-6 py-4 text-right font-semibold text-black">
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {order.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <span className="break-all font-mono text-xs text-black">
                          {item.product_id}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-black">
                        {item.quantity}
                      </td>

                      <td className="px-6 py-4 text-black">
                        ₹{Number(item.unit_price).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-right font-medium text-black">
                        ₹{Number(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-sm text-gray-500">
                No products found for this order.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}