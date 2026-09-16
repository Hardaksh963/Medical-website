"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-16 items-center gap-6 px-6">

        {/* Logo */}
        <Link
          href="/"
          className="flex min-w-fit items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white">
            +
          </div>

          <span className="text-xl font-bold text-gray-900">
            MediStore
          </span>
        </Link>

        {/* Search */}
        <div className="mx-auto flex w-full max-w-2xl">
          <input
            type="text"
            placeholder="Search medicines, medical devices, surgical products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-l-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <button
            type="button"
            className="rounded-r-lg bg-blue-600 px-5 text-white transition hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex min-w-fit items-center gap-5 text-sm">

          <Link
            href="/login"
            className="font-medium text-gray-700 hover:text-blue-600"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="font-medium text-gray-700 hover:text-blue-600"
          >
            Register
          </Link>

          <Link
            href="/cart"
            className="relative rounded-lg px-2 py-2 text-gray-700 hover:bg-gray-100"
          >
            🛒
            <span className="ml-1 font-medium">
              Cart
            </span>
          </Link>

        </nav>
      </div>
    </header>
  );
}