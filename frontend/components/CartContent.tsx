"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Cart,
  CartItem,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/lib/api";

export default function CartContent() {
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error("Failed to load cart:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Unable to load cart.";

      if (message === "Please login to continue.") {
        router.push("/login?redirect=/cart");
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleQuantityChange(
    item: CartItem,
    newQuantity: number
  ) {
    if (newQuantity < 1) {
      return;
    }

    try {
      setUpdatingItem(item.item_id);
      setError("");

      await updateCartItem(item.item_id, newQuantity);
      await loadCart();
    } catch (err) {
      console.error("Failed to update cart item:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update cart."
      );
    } finally {
      setUpdatingItem(null);
    }
  }

  async function handleRemove(item: CartItem) {
    try {
      setUpdatingItem(item.item_id);
      setError("");

      await removeCartItem(item.item_id);
      await loadCart();
    } catch (err) {
      console.error("Failed to remove cart item:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove item."
      );
    } finally {
      setUpdatingItem(null);
    }
  }

  async function handleClearCart() {
    try {
      setClearing(true);
      setError("");

      await clearCart();
      await loadCart();
    } catch (err) {
      console.error("Failed to clear cart:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to clear cart."
      );
    } finally {
      setClearing(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <p className="text-gray-500">Loading cart...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Continue Shopping
          </Link>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Shopping Cart
              </h1>

              <p className="mt-2 text-gray-500">
                {cart?.total_items ?? 0}{" "}
                {cart?.total_items === 1 ? "item" : "items"} in
                your cart
              </p>
            </div>

            {cart && cart.items.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                disabled={clearing}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {clearing ? "Clearing..." : "Clear Cart"}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <div className="text-6xl">🛒</div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              Your cart is empty
            </h2>

            <p className="mt-2 text-gray-500">
              Add some medical products to your cart to continue.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              {cart.items.map((item) => (
                <div
                  key={item.item_id}
                  className="rounded-xl border bg-white p-5"
                >
                  <div className="flex gap-5">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-4xl">
                      🩺
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={`/products/${item.product_id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {item.product_name}
                      </Link>

                      <p className="mt-2 text-sm text-gray-500">
                        Unit Price: ₹
                        {Number(item.unit_price).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                        {/* Quantity */}
                        <div className="flex items-center rounded-lg border">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              item.quantity <= 1 ||
                              updatingItem === item.item_id
                            }
                            className="px-3 py-1.5 text-lg text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                          >
                            −
                          </button>

                          <span className="min-w-10 text-center text-sm font-medium text-gray-900">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              updatingItem === item.item_id
                            }
                            className="px-3 py-1.5 text-lg text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <p className="font-bold text-gray-900">
                          ₹
                          {Number(item.subtotal).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          disabled={
                            updatingItem === item.item_id
                          }
                          className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="h-fit rounded-xl border bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items</span>
                  <span>{cart.total_items}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>
                    ₹
                    {Number(cart.total_amount).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>
                      ₹
                      {Number(cart.total_amount).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/products"
                className="mt-3 block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}