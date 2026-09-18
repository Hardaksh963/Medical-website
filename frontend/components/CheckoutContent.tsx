"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Cart, getCart, checkout } from "@/lib/api";

export default function CheckoutContent() {
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true);
        setError("");

        const data = await getCart();

        if (!data.items || data.items.length === 0) {
          router.push("/cart");
          return;
        }

        setCart(data);
      } catch (err) {
        console.error("Failed to load checkout:", err);

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load checkout.";

        if (message === "Please login to continue.") {
          router.push("/login?redirect=/checkout");
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [router]);

  async function handlePlaceOrder() {
    try {
      setPlacingOrder(true);
      setError("");

      const order = await checkout();

      router.push(
        `/orders/${order.order_id}?success=true&order_number=${encodeURIComponent(
          order.order_number
        )}`
      );
    } catch (err) {
      console.error("Failed to place order:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <p className="text-gray-500">Loading checkout...</p>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>

          <Link
            href="/cart"
            className="mt-5 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Cart
          </Link>
        </div>
      </main>
    );
  }

  if (!cart) {
    return null;
  }

  return (
    <main className="flex-1 p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Cart
        </Link>

        <h1 className="mt-5 text-3xl font-bold text-gray-900">
          Checkout
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Delivery Information */}
            <div className="rounded-xl border bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Delivery Information
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Enter the details required for delivery.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Address
                  </label>

                  <textarea
                    rows={3}
                    placeholder="Enter delivery address"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    City
                  </label>

                  <input
                    type="text"
                    placeholder="Enter city"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    PIN Code
                  </label>

                  <input
                    type="text"
                    placeholder="Enter PIN code"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-xl border bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Method
              </h2>

              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="font-medium text-blue-900">
                  Online Payment
                </p>

                <p className="mt-1 text-sm text-blue-700">
                  Razorpay payment integration will be enabled later.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.item_id}
                  className="flex justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.product_name}
                    </p>

                    <p className="mt-1 text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="font-medium text-gray-900">
                    ₹
                    {Number(item.subtotal).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-5 border-t" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items</span>
                <span>{cart.total_items}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>
                  ₹
                  {Number(cart.total_amount).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Calculated at order</span>
              </div>
            </div>

            <div className="my-5 border-t" />

            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span>

              <span>
                ₹
                {Number(cart.total_amount).toLocaleString("en-IN")}
              </span>
            </div>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {placingOrder
                ? "Placing Order..."
                : "Place Order"}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Your order will be created using the current items in
              your cart.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}