"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getWishlist,
  removeFromWishlist,
  WishlistItem,
} from "@/lib/api";

export default function WishlistContent() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWishlist() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          window.location.href = "/login?redirect=/wishlist";
          return;
        }

        const data = await getWishlist();
        setWishlist(data);
      } catch (err) {
        console.error("Failed to load wishlist:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load wishlist."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWishlist();
  }, []);

  async function handleRemove(productId: string) {
    try {
        setRemovingId(productId);
        setError("");

        await removeFromWishlist(productId);

        const updatedWishlist = await getWishlist();
        setWishlist(updatedWishlist);
    } catch (err) {
        console.error("Failed to remove wishlist item:", err);

        setError(
        err instanceof Error
            ? err.message
            : "Unable to remove item."
        );
    } finally {
        setRemovingId(null);
    }
    }

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Wishlist
          </h1>

          <p className="mt-2 text-gray-600">
            Products you have saved for later.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-4 text-5xl">♡</div>

            <h2 className="text-xl font-semibold text-gray-900">
              Your wishlist is empty
            </h2>

            <p className="mt-2 text-gray-600">
              Save products you like and find them here later.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex h-44 items-center justify-center bg-gray-100">
                  <span className="text-6xl">🩺</span>
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {item.product.name}
                  </h2>

                  <p className="mt-3 text-xl font-bold text-blue-600">
                    ₹{Number(item.product.selling_price).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <div className="mt-5 flex gap-3">
                    <Link
                      href={`/products/${item.product_id}`}
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View Product
                    </Link>

                    <button
                      onClick={() =>
                        handleRemove(item.product_id)
                      }
                      disabled={removingId === item.product_id}
                      className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {removingId === item.product_id
                        ? "Removing..."
                        : "Remove"}
                    </button>
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