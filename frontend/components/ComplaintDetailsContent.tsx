"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getComplaint, Complaint } from "@/lib/api";

interface Props {
  complaintId: string;
}

export default function ComplaintDetailsContent({
  complaintId,
}: Props) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadComplaint() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          window.location.href = `/login?redirect=/complaints/${complaintId}`;
          return;
        }

        const data = await getComplaint(complaintId);

        setComplaint(data);
      } catch (err) {
        console.error("Failed to load complaint:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load complaint."
        );
      } finally {
        setLoading(false);
      }
    }

    loadComplaint();
  }, [complaintId]);

  function getStatusClasses(status: string) {
    switch (status.toUpperCase()) {
      case "RESOLVED":
        return "bg-green-100 text-green-700";

      case "CLOSED":
        return "bg-gray-100 text-gray-700";

      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-8 text-black">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-black">
              Loading complaint...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !complaint) {
    return (
      <main className="flex-1 p-8 text-black">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-semibold text-red-700">
              Unable to load complaint
            </h1>

            <p className="mt-2 text-red-700">
              {error || "Complaint not found."}
            </p>

            <Link
              href="/complaints"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              Back to Complaints
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 text-black">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/complaints"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Complaints
          </Link>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">
                Complaint Details
              </h1>

              <p className="mt-2 text-sm text-black">
                Complaint ID: {complaint.id}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
                complaint.status
              )}`}
            >
              {complaint.status.replaceAll("_", " ")}
            </span>
          </div>
        </div>

        {/* Complaint information */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-black">
            Complaint Information
          </h2>

          <div className="mt-6 space-y-6">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Subject
              </p>

              <p className="mt-1 text-lg font-semibold text-black">
                {complaint.subject}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Order ID
              </p>

              <p className="mt-1 break-all text-black">
                {complaint.order_id}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Description
              </p>

              <div className="mt-2 rounded-lg bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-black">
                  {complaint.description}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Admin response */}
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-black">
            Admin Response
          </h2>

          {complaint.admin_response ? (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-5">
              <p className="whitespace-pre-wrap text-black">
                {complaint.admin_response}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-gray-50 p-5">
              <p className="text-black">
                No response from the admin yet.
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Your complaint is being reviewed.
              </p>
            </div>
          )}

        </section>

        {/* Dates */}
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-black">
            Timeline
          </h2>

          <div className="mt-5 space-y-4">

            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <span className="font-medium text-black">
                Submitted
              </span>

              <span className="text-black">
                {new Date(
                  complaint.created_at
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <span className="font-medium text-black">
                Last Updated
              </span>

              <span className="text-black">
                {new Date(
                  complaint.updated_at
                ).toLocaleString("en-IN")}
              </span>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}