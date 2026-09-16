"use client";

import Link from "next/link";

const categories = [
  "Surgical & Disposable",
  "Surgical Instruments",
  "Diagnostic Devices",
  "Home Healthcare",
  "Mobility & Support",
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r bg-white p-5">

      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Categories
      </h2>

      <div className="space-y-1">

        {categories.map((category) => (
          <Link
            key={category}
            href={`/products?category=${encodeURIComponent(category)}`}
            className="block rounded-lg px-3 py-3 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
          >
            {category}
          </Link>
        ))}

      </div>

      <div className="my-6 border-t" />

      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Quick Links
      </h2>

      <div className="space-y-1">

        <Link
          href="/products"
          className="block rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-100"
        >
          All Products
        </Link>

        <Link
          href="/orders"
          className="block rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-100"
        >
          My Orders
        </Link>

        <Link
          href="/wishlist"
          className="block rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-100"
        >
          Wishlist
        </Link>

        <Link
          href="/complaints"
          className="block rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-100"
        >
          Complaints
        </Link>

      </div>

    </aside>
  );
}