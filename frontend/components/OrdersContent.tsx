"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getOrders, Order } from "@/lib/api";

export default function OrdersContent() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load orders.";

        if (message === "Please login to continue.") {
          router.push("/login?redirect=/orders");
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [router]);

  function getStatusClass(status: string) {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";

      case "PROCESSING":
        return "bg-yellow-100 text-yellow-700";

      case "SHIPPED":
        return "bg-purple-100 text-purple-700";

      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      case "RETURNED":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <p className="text-gray-500">Loading orders...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="mt-2 text-gray-500">
            View and track your orders.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <div className="text-6xl">📦</div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-500">
              Your orders will appear here after you make a
              purchase.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border bg-white p-6 transition hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order Number
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-gray-900">
                      {order.order_number}
                    </h2>

                    {order.items && order.items.length > 0 && (
                    <div className="mt-3 space-y-1">
                        {order.items.map((item) => (
                        <p
                            key={item.id}
                            className="text-sm text-black"
                        >
                            • {item.product_name || "Product"} × {item.quantity}
                        </p>
                        ))}
                    </div>
                    )}
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order Date
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Total
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      ₹
                      {Number(
                        order.total_amount
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex items-end sm:justify-end">
                    <Link
                      href={`/orders/${order.id}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}