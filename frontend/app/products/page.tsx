import Link from "next/link";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { Product } from "@/lib/types";

export default async function ProductsPage() {
  let products: Product[] = [];
  let errorMessage = "";

  try {
    products = await getProducts({
      page: 1,
      limit: 100,
    });
  } catch (error) {
    console.error("Failed to load products:", error);
    errorMessage =
      "Unable to load products. Please make sure the backend is running.";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Home
            </Link>

            <div className="mt-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Medical Products
              </h1>

              <p className="mt-2 text-gray-500">
                Browse our range of medical and healthcare products.
              </p>
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
              <h2 className="font-semibold text-red-700">
                Unable to load products
              </h2>

              <p className="mt-1 text-sm text-red-600">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Product count */}
          {!errorMessage && (
            <div className="mb-5 text-sm text-gray-500">
              {products.length} products available
            </div>
          )}

          {/* Products */}
          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
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
            !errorMessage && (
              <div className="rounded-xl border bg-white p-12 text-center">
                <div className="text-5xl">📦</div>

                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  No products found
                </h2>

                <p className="mt-2 text-gray-500">
                  There are currently no products available.
                </p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}