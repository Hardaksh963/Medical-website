"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAuthToken,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  Notification,
} from "@/lib/api";

export default function NotificationsContent() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    loadNotifications();
  }, [router]);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      const updated = await markNotificationAsRead(notificationId);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === updated.id ? updated : notification
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read"
      );
    }
  }

  async function handleMarkAllAsRead() {
    try {
      setMarkingAll(true);
      setError("");

      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notifications as read"
      );
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-black">Loading notifications...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }`
                : "You have no unread notifications"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markingAll ? "Marking..." : "Mark All as Read"}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mb-3 text-4xl">🔔</div>

            <h2 className="text-lg font-semibold text-black">
              No notifications
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              You&apos;re all caught up.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl border p-5 shadow-sm ${
                  notification.is_read
                    ? "border-gray-200 bg-white"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-black">
                        {notification.title}
                      </h2>

                      {!notification.is_read && (
                        <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      {notification.message}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </span>

                      <span>
                        Type: {notification.notification_type}
                      </span>
                    </div>
                  </div>

                  {!notification.is_read && (
                    <button
                      onClick={() =>
                        handleMarkAsRead(notification.id)
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-100"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}