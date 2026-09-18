"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getCurrentUser, CurrentUser } from "@/lib/api";

export default function AccountPage() {
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
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

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
      <div className="mx-auto max-w-4xl px-6 py-10">

        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Store
        </Link>

        <div className="mt-6 rounded-2xl border bg-white p-8 shadow-sm">

          <h1 className="text-2xl font-bold text-gray-900">
            My Account
          </h1>

          <div className="mt-8 space-y-5">

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

              <p className="mt-1 font-medium text-gray-900">
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

          <div className="mt-8 flex gap-3">

            <Link
              href="/orders"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              My Orders
            </Link>

            <Link
              href="/cart"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              My Cart
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}