import Link from "next/link";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/api";
import { Category, Product } from "@/lib/types";

export default async function HomePage() {
  let products: Product[] = [];
  let categories: Category[] = [];
  let errorMessage = "";

  try {
    [products, categories] = await Promise.all([
      getProducts({
        page: 1,
        limit: 100,
      }),
      getCategories(),
    ]);
  } catch (error) {
    console.error("Failed to load home page data:", error);

    errorMessage =
      "Unable to load data. Please make sure the backend is running.";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-16 text-white">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-2xl">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-100">
                  Trusted Medical Store
                </p>

                <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                  Quality Healthcare Products
                </h1>

                <p className="mt-5 text-lg text-blue-100">
                  Shop surgical products, diagnostic devices, home healthcare
                  equipment and more.
                </p>

                <Link
                  href="/products"
                  className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 shadow-sm transition hover:bg-gray-100"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <div className="mx-auto max-w-7xl px-8 py-12">

            {/* Shop by Category */}
            <section>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Shop by Category
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Browse products by category
                  </p>
                </div>

                <Link
                  href="/products"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All →
                </Link>
              </div>

              {errorMessage ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                  <p className="font-medium text-red-700">
                    Unable to load categories
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {errorMessage}
                  </p>
                </div>
              ) : categories.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category_id=${encodeURIComponent(
                        category.id
                      )}`}
                      className="group rounded-xl border bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                        🏥
                      </div>

                      <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-blue-600">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        View products
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border bg-white p-8 text-center">
                  <p className="text-gray-500">
                    No categories available.
                  </p>
                </div>
              )}
            </section>

            {/* Featured Products */}
            <section className="mt-14">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Featured Products
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Popular healthcare products
                  </p>
                </div>

                <Link
                  href="/products"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All →
                </Link>
              </div>

              {products.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.slice(0, 8).map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      selling_price={Number(product.selling_price)}
                      mrp={Number(product.mrp)}
                      short_description={product.short_description}
                      image_url={
                        product.images?.find(
                          (image) => image.is_primary
                        )?.image_url ??
                        product.images?.[0]?.image_url ??
                        null
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border bg-white p-8 text-center">
                  <p className="text-gray-500">
                    No products available.
                  </p>
                </div>
              )}
            </section>

            {/* Features */}
            <section className="mt-14 grid gap-5 md:grid-cols-3">
              <div className="rounded-xl border bg-white p-6">
                <div className="text-3xl">✓</div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  Quality Products
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Reliable medical and healthcare products.
                </p>
              </div>

              <div className="rounded-xl border bg-white p-6">
                <div className="text-3xl">🚚</div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  Easy Ordering
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Simple and convenient online ordering.
                </p>
              </div>

              <div className="rounded-xl border bg-white p-6">
                <div className="text-3xl">🔒</div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  Secure Shopping
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Secure account and checkout experience.
                </p>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}