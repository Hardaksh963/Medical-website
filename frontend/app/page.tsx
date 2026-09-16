import Link from "next/link";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const featuredCategories = [
  {
    title: "Surgical & Disposable",
    description: "Gloves, masks, syringes and other medical consumables",
    icon: "🧤",
  },
  {
    title: "Surgical Instruments",
    description: "Professional surgical and clinical instruments",
    icon: "✂️",
  },
  {
    title: "Diagnostic Devices",
    description: "Blood pressure monitors, thermometers and more",
    icon: "🩺",
  },
  {
    title: "Home Healthcare",
    description: "Healthcare products for everyday home use",
    icon: "🏠",
  },
  {
    title: "Mobility & Support",
    description: "Support products and mobility equipment",
    icon: "🦽",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <div className="flex">

        <Sidebar />

        <main className="flex-1 p-8">

          {/* Hero */}
          <section className="rounded-2xl bg-blue-600 px-8 py-12 text-white shadow-sm">

            <div className="max-w-3xl">

              <p className="mb-3 text-sm font-medium uppercase tracking-wider text-blue-100">
                Trusted Medical Products
              </p>

              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Quality healthcare products,
                <br />
                delivered to your doorstep.
              </h1>

              <p className="mt-5 max-w-2xl text-lg text-blue-100">
                Shop surgical products, diagnostic devices, home healthcare
                equipment and mobility support products.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Browse Products
              </Link>

            </div>

          </section>

          {/* Categories */}
          <section className="mt-10">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Shop by Category
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Find the medical products you need
                </p>
              </div>

              <Link
                href="/products"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all →
              </Link>

            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {featuredCategories.map((category) => (
                <Link
                  key={category.title}
                  href={`/products?category=${encodeURIComponent(
                    category.title
                  )}`}
                  className="group rounded-xl border bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >

                  <div className="mb-4 text-4xl">
                    {category.icon}
                  </div>

                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {category.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {category.description}
                  </p>

                </Link>
              ))}

            </div>

          </section>

          {/* Features */}
          <section className="mt-10 grid gap-5 md:grid-cols-3">

            <div className="rounded-xl border bg-white p-6">
              <div className="text-2xl">✓</div>
              <h3 className="mt-3 font-semibold text-gray-900">
                Quality Products
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Carefully managed medical products and inventory.
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <div className="text-2xl">📦</div>
              <h3 className="mt-3 font-semibold text-gray-900">
                Reliable Inventory
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Batch-based inventory management for better stock control.
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <div className="text-2xl">🔒</div>
              <h3 className="mt-3 font-semibold text-gray-900">
                Secure Shopping
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Secure customer accounts and protected orders.
              </p>
            </div>

          </section>

        </main>

      </div>

    </div>
  );
}