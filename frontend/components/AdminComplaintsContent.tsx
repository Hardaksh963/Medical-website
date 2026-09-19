"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminComplaints,
  getAuthToken,
  type Complaint,
} from "@/lib/api";

const COMPLAINT_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

function getStatusClass(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-red-100 text-red-800";
    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-800";
    case "RESOLVED":
      return "bg-green-100 text-green-800";
    case "CLOSED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AdminComplaintsContent() {
  const router = useRouter();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadComplaints() {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getAdminComplaints();
      setComplaints(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load complaints";

      if (message.toLowerCase().includes("admin access")) {
        router.push("/");
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return complaints.filter((complaint) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        complaint.status === statusFilter;

      const matchesSearch =
        !searchText ||
        complaint.subject.toLowerCase().includes(searchText) ||
        complaint.description.toLowerCase().includes(searchText) ||
        complaint.id.toLowerCase().includes(searchText) ||
        complaint.order_id.toLowerCase().includes(searchText) ||
        complaint.user_id.toLowerCase().includes(searchText);

      return matchesStatus && matchesSearch;
    });
  }, [complaints, search, statusFilter]);

  const summary = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === "OPEN").length,
    inProgress: complaints.filter(
      (c) => c.status === "IN_PROGRESS"
    ).length,
    resolved: complaints.filter(
      (c) => c.status === "RESOLVED"
    ).length,
    closed: complaints.filter((c) => c.status === "CLOSED").length,
  };

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-black">Loading complaints...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Customer Complaints
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Manage and respond to customer complaints.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>

            <button
              onClick={loadComplaints}
              className="mt-2 text-sm font-medium text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-black">
              {summary.total}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Open</p>
            <p className="mt-1 text-2xl font-bold text-black">
              {summary.open}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="mt-1 text-2xl font-bold text-black">
              {summary.inProgress}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="mt-1 text-2xl font-bold text-black">
              {summary.resolved}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Closed</p>
            <p className="mt-1 text-2xl font-bold text-black">
              {summary.closed}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject, complaint ID, order ID..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-black outline-none focus:border-black"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-black outline-none focus:border-black"
            >
              <option value="ALL">All Statuses</option>

              {COMPLAINT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-6 py-4 text-sm font-semibold text-black">
                    Complaint
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-black">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-black">
                    Order
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-black">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-black">
                    Date
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-black">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="max-w-xs px-6 py-4">
                      <p className="font-medium text-black">
                        {complaint.subject}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {complaint.description}
                      </p>

                      <p className="mt-1 font-mono text-xs text-gray-400">
                        {complaint.id}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-black">
                        {complaint.user_id}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-black">
                        {complaint.order_id}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-black">
                      {new Date(
                        complaint.created_at
                      ).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/complaints/${complaint.id}`
                          )
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-black hover:bg-gray-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredComplaints.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-gray-500">
                No complaints found.
              </p>
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="space-y-4 md:hidden">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-black">
                    {complaint.subject}
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(
                      complaint.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    complaint.status
                  )}`}
                >
                  {complaint.status}
                </span>
              </div>

              <p className="mb-4 text-sm text-gray-600">
                {complaint.description}
              </p>

              <div className="space-y-2 border-t border-gray-100 pt-3 text-xs">
                <div>
                  <span className="text-gray-500">
                    Customer:{" "}
                  </span>

                  <span className="break-all font-mono text-black">
                    {complaint.user_id}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">
                    Order:{" "}
                  </span>

                  <span className="break-all font-mono text-black">
                    {complaint.order_id}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  router.push(
                    `/admin/complaints/${complaint.id}`
                  )
                }
                className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-black hover:bg-gray-50"
              >
                View Complaint
              </button>
            </div>
          ))}

          {filteredComplaints.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-gray-500">
                No complaints found.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}