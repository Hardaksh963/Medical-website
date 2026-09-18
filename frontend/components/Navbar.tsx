"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { getCurrentUser, CurrentUser } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function checkAuthentication() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoadingUser(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch (error) {
        console.error("Authentication check failed:", error);

        localStorage.removeItem("access_token");
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }

    checkAuthentication();
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      router.push("/products");
      return;
    }

    router.push(`/products?search=${encodeURIComponent(query)}`);
  }

  function handleLogout() {
    localStorage.removeItem("access_token");

    setUser(null);

    router.push("/");
  }

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
        <form
          onSubmit={handleSearch}
          className="mx-auto flex w-full max-w-2xl"
        >
          <input
            type="text"
            placeholder="Search medicines, medical devices, surgical products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-l-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="rounded-r-lg bg-blue-600 px-5 text-white transition hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        {/* Navigation */}
        <nav className="flex min-w-fit items-center gap-5 text-sm">

          {!loadingUser && user ? (
            <>
              <Link
                href="/account"
                className="font-medium text-gray-700 hover:text-blue-600"
              >
                Account
              </Link>

              <Link
                href="/orders"
                className="font-medium text-gray-700 hover:text-blue-600"
              >
                Orders
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

              <button
                type="button"
                onClick={handleLogout}
                className="font-medium text-gray-700 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : !loadingUser ? (
            <>
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
            </>
          ) : null}

        </nav>
      </div>
    </header>
  );
}