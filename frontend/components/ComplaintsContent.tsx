"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  createComplaint,
  getComplaints,
  Complaint,
} from "@/lib/api";

export default function ComplaintsContent() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [orderId, setOrderId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadComplaints() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          window.location.href = "/login?redirect=/complaints";
          return;
        }

        const data = await getComplaints();
        setComplaints(data);
      } catch (err) {
        console.error("Failed to load complaints:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load complaints."
        );
      } finally {
        setLoading(false);
      }
    }

    loadComplaints();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe your complaint.");
      return;
    }

    if (!orderId.trim()) {
      setError("Please enter the order ID.");
      return;
    }

    try {
      setSubmitting(true);

      const complaint = await createComplaint({
        subject: subject.trim(),
        description: description.trim(),
        order_id: orderId.trim(),
      });

      setComplaints((current) => [complaint, ...current]);

      setSubject("");
      setDescription("");
      setOrderId("");

      setSuccess("Complaint submitted successfully.");
    } catch (err) {
      console.error("Failed to create complaint:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit complaint."
      );
    } finally {
      setSubmitting(false);
    }
  }

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

  return (
    <main className="flex-1 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Complaints
          </h1>

          <p className="mt-2 text-gray-600">
            Submit and track your complaints.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Submit a Complaint
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="orderId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Order ID
              </label>

              <input
                id="orderId"
                type="text"
                value={orderId}
                onChange={(event) =>
                  setOrderId(event.target.value)
                }
                placeholder="Enter your order ID"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                You can find the order ID on your order details page.
              </p>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Subject
              </label>

              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                placeholder="What is your complaint about?"
                maxLength={255}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe your issue in detail..."
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit Complaint"}
            </button>
          </form>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              My Complaints
            </h2>

            <span className="text-sm text-gray-500">
              {complaints.length}{" "}
              {complaints.length === 1
                ? "complaint"
                : "complaints"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-600">
                Loading complaints...
              </p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="mb-4 text-5xl">📩</div>

              <h3 className="text-lg font-semibold text-gray-900">
                No complaints yet
              </h3>

              <p className="mt-2 text-gray-600">
                Your submitted complaints will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {complaint.subject}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Order: {complaint.order_id}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        complaint.status
                      )}`}
                    >
                      {complaint.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-gray-700">
                    {complaint.description}
                  </p>

                  {complaint.admin_response && (
                    <div className="mt-5 rounded-lg bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-gray-800">
                        Admin Response
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                        {complaint.admin_response}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 text-sm text-gray-500 sm:flex-row sm:justify-between">
                    <span>
                      Submitted:{" "}
                      {new Date(
                        complaint.created_at
                      ).toLocaleString("en-IN")}
                    </span>

                    <Link
                      href={`/complaints/${complaint.id}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}