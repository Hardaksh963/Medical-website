import Link from "next/link";

import { getCategories } from "@/lib/api";
import { Category } from "@/lib/types";

export default async function Sidebar() {
  let categories: Category[] = [];

  try {
    categories = await getCategories();
  } catch (error) {
    console.error("Failed to load categories:", error);
  }

  return (
    <aside className="w-64 shrink-0 border-r bg-white p-5">
      {/* Categories */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Categories
      </h2>

      <div className="space-y-1">
        <Link
          href="/products"
          className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
        >
          All Products
        </Link>

        {categories.length > 0 ? (
          categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category_id=${encodeURIComponent(
                category.id
              )}`}
              className="block rounded-lg px-3 py-3 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
            >
              {category.name}
            </Link>
          ))
        ) : (
          <p className="px-3 py-2 text-sm text-gray-400">
            Categories unavailable
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="my-6 border-t" />

      {/* Quick Links */}
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Quick Links
      </h2>

      <div className="space-y-1">
        <Link
          href="/products"
          className="block rounded-lg px-3 py-3 text-sm text-gray-700 transition hover:bg-gray-100"
        >
          All Products
        </Link>

        <Link
          href="/orders"
          className="block rounded-lg px-3 py-3 text-sm text-gray-700 transition hover:bg-gray-100"
        >
          My Orders
        </Link>

        <Link
          href="/wishlist"
          className="block rounded-lg px-3 py-3 text-sm text-gray-700 transition hover:bg-gray-100"
        >
          Wishlist
        </Link>

        <Link
          href="/complaints"
          className="block rounded-lg px-3 py-3 text-sm text-gray-700 transition hover:bg-gray-100"
        >
          Complaints
        </Link>
      </div>
    </aside>
  );
}