"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { addToCart } from "@/lib/api";

interface ProductDetailActionsProps {
  productId: string;
  available: boolean;
  stockQuantity: number;
}

export default function ProductDetailActions({
  productId,
  available,
  stockQuantity,
}: ProductDetailActionsProps) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleAddToCart() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }

    try {
      setAdding(true);
      setMessage("");
      setError("");

      await addToCart(productId, quantity);

      setMessage("Product added to cart successfully.");
    } catch (err) {
      console.error("Failed to add product to cart:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to add product to cart."
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      {/* Quantity */}
      {available && (
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Quantity
          </label>

          <div className="flex w-fit items-center rounded-lg border">
            <button
              type="button"
              onClick={() =>
                setQuantity((value) => Math.max(1, value - 1))
              }
              className="px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
            >
              −
            </button>

            <span className="min-w-12 px-3 text-center text-gray-900">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                setQuantity((value) =>
                  Math.min(stockQuantity, value + 1)
                )
              }
              disabled={quantity >= stockQuantity}
              className="px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!available || adding}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          View Cart
        </button>
      </div>
    </>
  );
}