import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getProductDetails } from "@/lib/api";

interface ProductDetailsPageProps {
  params: Promise<{
    product_id: string;
  }>;
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { product_id } = await params;

  let product;

  try {
    product = await getProductDetails(product_id);
  } catch (error) {
    console.error("Failed to load product:", error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  const primaryImage =
    product.images?.find((image) => image.is_primary) ??
    product.images?.[0];

  const discount =
    product.mrp && product.mrp > product.selling_price
      ? Math.round(
          ((product.mrp - product.selling_price) /
            product.mrp) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">

          {/* Breadcrumb */}
          <div className="mb-6 text-sm">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700"
            >
              Home
            </Link>

            <span className="mx-2 text-gray-400">
              /
            </span>

            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-700"
            >
              Products
            </Link>

            <span className="mx-2 text-gray-400">
              /
            </span>

            <span className="text-gray-500">
              {product.name}
            </span>
          </div>

          {/* Product */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="grid gap-10 lg:grid-cols-2">

              {/* Images */}
              <div>
                <div className="flex h-[450px] items-center justify-center rounded-xl bg-gray-50">

                  {primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain p-8"
                    />
                  ) : (
                    <div className="text-8xl text-gray-300">
                      🩺
                    </div>
                  )}

                </div>

                {/* Image thumbnails */}
                {product.images &&
                  product.images.length > 1 && (
                    <div className="mt-4 flex gap-3">
                      {product.images.map((image) => (
                        <div
                          key={image.id}
                          className="flex h-20 w-20 items-center justify-center rounded-lg border bg-gray-50"
                        >
                          <img
                            src={image.image_url}
                            alt={product.name}
                            className="h-full w-full object-contain p-2"
                          />
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Information */}
              <div>

                {product.category && (
                  <p className="text-sm font-medium text-blue-600">
                    {product.category.name}
                  </p>
                )}

                <h1 className="mt-2 text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  SKU: {product.sku}
                </p>

                {/* Rating */}
                <div className="mt-5 flex items-center gap-3">

                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">
                      ★
                    </span>

                    <span className="font-semibold text-gray-900">
                      {product.rating.average.toFixed(1)}
                    </span>
                  </div>

                  <span className="text-sm text-gray-500">
                    ({product.rating.count} reviews)
                  </span>

                </div>

                {/* Description */}
                {product.short_description && (
                  <p className="mt-6 text-gray-600">
                    {product.short_description}
                  </p>
                )}

                {/* Price */}
                <div className="mt-7">

                  <div className="flex items-center gap-3">

                    <span className="text-3xl font-bold text-gray-900">
                      ₹
                      {Number(
                        product.selling_price
                      ).toLocaleString("en-IN")}
                    </span>

                    {product.mrp &&
                      product.mrp >
                        product.selling_price && (
                        <>
                          <span className="text-lg text-gray-400 line-through">
                            ₹
                            {Number(
                              product.mrp
                            ).toLocaleString("en-IN")}
                          </span>

                          <span className="rounded-md bg-green-100 px-2 py-1 text-sm font-semibold text-green-700">
                            {discount}% OFF
                          </span>
                        </>
                      )}

                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Inclusive of applicable taxes
                  </p>

                </div>

                {/* Stock */}
                <div className="mt-6">

                  {product.inventory.available ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                      In Stock
                      <span className="font-normal text-gray-500">
                        ({product.inventory.quantity} available)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      Out of Stock
                    </div>
                  )}

                </div>

                {/* Quantity */}
                {product.inventory.available && (
                  <div className="mt-7">

                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Quantity
                    </label>

                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={product.inventory.quantity}
                      defaultValue="1"
                      className="mt-2 w-24 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                  </div>
                )}

                {/* Actions */}
                <div className="mt-7 flex gap-3">

                  <button
                    type="button"
                    disabled={!product.inventory.available}
                    className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 px-5 py-3 text-gray-700 transition hover:bg-gray-50"
                  >
                    ♡
                  </button>

                </div>

                {/* Login notice */}
                <p className="mt-4 text-center text-xs text-gray-500">
                  You need to be logged in to purchase products.
                </p>

              </div>

            </div>

          </div>

          {/* Full description */}
          {product.description && (
            <section className="mt-8 rounded-2xl border bg-white p-6">

              <h2 className="text-xl font-bold text-gray-900">
                Product Description
              </h2>

              <div className="mt-4 whitespace-pre-line text-gray-600">
                {product.description}
              </div>

            </section>
          )}

        </main>
      </div>
    </div>
  );
}