"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminComplaint,
  updateAdminComplaint,
  getAuthToken,
  type Complaint,
} from "@/lib/api";

interface Props {
  complaintId: string;
}

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

export default function AdminComplaintDetailsContent({
  complaintId,
}: Props) {
  const router = useRouter();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [status, setStatus] = useState("");
  const [adminResponse, setAdminResponse] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadComplaint() {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      if (!token) {
        router.push("/login");
        return;
      }

      // IMPORTANT:
      // getAdminComplaint() returns ONE complaint.
      const data = await getAdminComplaint(complaintId);

      setComplaint(data);
      setStatus(data.status);
      setAdminResponse(data.admin_response ?? "");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load complaint";

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
    loadComplaint();
  }, [complaintId]);

  async function handleSave() {
    if (!complaint) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updated = await updateAdminComplaint(
        complaint.id,
        status,
        adminResponse
      );

      setComplaint(updated);
      setStatus(updated.status);
      setAdminResponse(updated.admin_response ?? "");

      setSuccess("Complaint updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update complaint"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-black">Loading complaint...</p>
        </div>
      </main>
    );
  }

  if (error && !complaint) {
    return (
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => router.push("/admin/complaints")}
            className="mb-6 text-sm font-medium text-black hover:underline"
          >
            ← Back to Complaints
          </button>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!complaint) {
    return null;
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <button
          onClick={() => router.push("/admin/complaints")}
          className="mb-6 text-sm font-medium text-black hover:underline"
        >
          ← Back to Complaints
        </button>

        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Complaint Details
            </h1>

            <p className="mt-1 break-all font-mono text-xs text-gray-500">
              {complaint.id}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
              complaint.status
            )}`}
          >
            {complaint.status}
          </span>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Complaint information */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-black">
            Complaint Information
          </h2>

          <div className="space-y-5">
            <div>
              <p className="mb-1 text-sm text-gray-500">
                Subject
              </p>

              <p className="font-medium text-black">
                {complaint.subject}
              </p>
            </div>

            <div>
              <p className="mb-1 text-sm text-gray-500">
                Description
              </p>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-black">
                  {complaint.description}
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="mb-1 text-sm text-gray-500">
                  Customer ID
                </p>

                <p className="break-all font-mono text-xs text-black">
                  {complaint.user_id}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500">
                  Order ID
                </p>

                <p className="break-all font-mono text-xs text-black">
                  {complaint.order_id}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500">
                  Created
                </p>

                <p className="text-sm text-black">
                  {new Date(
                    complaint.created_at
                  ).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500">
                  Last Updated
                </p>

                <p className="text-sm text-black">
                  {complaint.updated_at
                    ? new Date(
                        complaint.updated_at
                      ).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Admin response */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-black">
            Admin Response
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Complaint Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-black md:w-80"
              >
                {COMPLAINT_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Response
              </label>

              <textarea
                value={adminResponse}
                onChange={(e) =>
                  setAdminResponse(e.target.value)
                }
                rows={6}
                placeholder="Write a response to the customer..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}