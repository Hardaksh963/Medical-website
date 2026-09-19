"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser, CurrentUser } from "@/lib/api";

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load account:", error);
        localStorage.removeItem("access_token");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading account...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            Login Required
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Please login to view your account.
          </p>

          <Link
            href="/login"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-10">

        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Store
        </Link>

        {/* Account Header */}
        <div className="mt-6 rounded-2xl border bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Account
              </h1>

              <p className="mt-1 text-gray-600">
                Welcome, {user.name}
              </p>
            </div>

          </div>

          {/* Account Information */}
          <div className="mt-8 grid gap-6 border-t pt-6 sm:grid-cols-3">

            <div>
              <p className="text-sm text-gray-500">
                Name
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {user.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="mt-1 break-all font-medium text-gray-900">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Account Type
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {user.role}
              </p>
            </div>

          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">
            My Account
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <Link
              href="/orders"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow"
            >
              <div className="text-2xl">📦</div>

              <h3 className="mt-3 font-semibold text-gray-900">
                My Orders
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                View your orders and order status.
              </p>
            </Link>

            <Link
              href="/wishlist"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow"
            >
              <div className="text-2xl">❤️</div>

              <h3 className="mt-3 font-semibold text-gray-900">
                Wishlist
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                View your saved products.
              </p>
            </Link>

            <Link
              href="/complaints"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow"
            >
              <div className="text-2xl">💬</div>

              <h3 className="mt-3 font-semibold text-gray-900">
                Complaints
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Submit and track complaints.
              </p>
            </Link>

            <Link
              href="/notifications"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow"
            >
              <div className="text-2xl">🔔</div>

              <h3 className="mt-3 font-semibold text-gray-900">
                Notifications
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                View your latest notifications.
              </p>
            </Link>

            <Link
              href="/cart"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow"
            >
              <div className="text-2xl">🛒</div>

              <h3 className="mt-3 font-semibold text-gray-900">
                My Cart
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                View and manage your cart.
              </p>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-red-300 hover:shadow"
            >
              <div className="text-2xl">🚪</div>

              <h3 className="mt-3 font-semibold text-gray-900">
                Logout
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Sign out of your account.
              </p>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

