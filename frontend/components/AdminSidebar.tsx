"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: "📊",
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: "📦",
  },
  {
    name: "Inventory",
    href: "/admin/inventory",
    icon: "🏷️",
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: "🛒",
  },
  {
    name: "Complaints",
    href: "/admin/complaints",
    icon: "⚠️",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("access_token");
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside className="flex min-h-[calc(100vh-64px)] w-64 flex-col border-r border-gray-200 bg-white">
      {/* Admin Header */}
      <div className="border-b border-gray-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Administration
        </p>

        <h2 className="mt-1 text-lg font-bold text-black">
          Medical Store
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-black"
                }`}
              >
                <span className="text-base">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Store */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black"
          >
            <span className="text-base">🌐</span>

            <span>View Store</span>
          </Link>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <span className="text-base">🚪</span>

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}