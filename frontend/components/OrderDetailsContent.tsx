"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  cancelOrder,
  getOrder,
  Order,
} from "@/lib/api";

interface OrderDetailsContentProps {
  orderId: string;
}

export default function OrderDetailsContent({
  orderId,
}: OrderDetailsContentProps) {
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        const data = await getOrder(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order:", err);

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load order.";

        if (message === "Please login to continue.") {
          router.push(
            `/login?redirect=/orders/${orderId}`
          );
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId, router]);

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

  async function handleCancelOrder() {
    const confirmed = window.confirm(
        "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
        return;
    }

    try {
        setCancelling(true);
        setError("");
        setSuccess("");

        const result = await cancelOrder(orderId);

        setSuccess(result.message);

        setOrder((currentOrder) =>
        currentOrder
            ? {
                ...currentOrder,
                status: result.status,
            }
            : currentOrder
        );
    } catch (err) {
        console.error("Failed to cancel order:", err);

        setError(
        err instanceof Error
            ? err.message
            : "Unable to cancel order."
        );
    } finally {
        setCancelling(false);
    }
    }

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <p className="text-gray-500">Loading order...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error || "Order not found."}
          </div>

          <Link
            href="/orders"
            className="mt-5 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/orders"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Orders
        </Link>

        {success && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
        </div>
        )}

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order Details
            </h1>

            <p className="mt-2 text-gray-500">
              {order.order_number}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>

        {/* Order Information */}
        <div className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Order Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">
                Order Number
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {order.order_number}
              </p>
            </div>

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
                Status
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {order.status}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Items
          </h2>

          <div className="mt-5 divide-y">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
              >
                <div>
                  <div>
                    <p className="font-medium text-gray-900">
                        {item.product_name || "Product no longer available"}
                    </p>

                    <Link
                        href={`/products/${item.product_id}`}
                        className="mt-1 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        View Product
                    </Link>

                    </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Unit Price: ₹
                    {Number(
                      item.unit_price
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <p className="font-semibold text-gray-900">
                  ₹
                  {Number(
                    item.subtotal
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Order Summary
          </h2>

          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>

              <span>
                ₹
                {Number(
                  order.subtotal
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>

              <span>
                ₹
                {Number(
                  order.shipping_cost
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>

                <span>
                  ₹
                  {Number(
                    order.total_amount
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
            <Link
                href="/orders"
                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
                All Orders
            </Link>

            {order.status === "PENDING" && (
                <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="rounded-lg border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
            )}

            <Link
                href="/products"
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
                Continue Shopping
            </Link>
            </div>
      </div>
    </main>
  );
}