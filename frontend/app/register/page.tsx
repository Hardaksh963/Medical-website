"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await register({
        name,
        email,
        password,
      });

      localStorage.setItem("access_token", response.access_token);

      router.push("/");
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">

          {/* Logo */}
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white">
              +
            </div>

            <span className="text-2xl font-bold text-gray-900">
              MediStore
            </span>
          </Link>

          {/* Card */}
          <div className="rounded-2xl border bg-white p-8 shadow-sm">

            <div className="mb-7 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Create Account
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Create your MediStore customer account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Password must contain at least 8 characters.
                </p>
              </div>

              {/* Register button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Login */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Login
              </Link>
            </p>

          </div>

          {/* Back */}
          <div className="mt-5 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-blue-600"
            >
              ← Back to store
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}