import Link from "next/link";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductReviews from "@/components/ProductReviews";
import { getProductDetails } from "@/lib/api";
import ProductGallery from "@/components/ProductGallery";

interface ProductDetailPageProps {
  params: Promise<{
    product_id: string;
  }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { product_id } = await params;

  let product;

  try {
    product = await getProductDetails(product_id);
  } catch (error) {
    console.error("Failed to load product:", error);

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex">
          <Sidebar />

          <main className="flex-1 p-8">
            <Link
              href="/products"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Products
            </Link>

            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              Unable to load product. Please try again.
            </div>
          </main>
        </div>
      </div>
    );
  }

  const primaryImage =
    product.images?.find((image) => image.is_primary)?.image_url ??
    product.images?.[0]?.image_url ??
    null;

  const discount =
    product.mrp > product.selling_price
      ? Math.round(
          ((product.mrp - product.selling_price) / product.mrp) * 100
        )
      : 0;

  const available = product.inventory?.available ?? false;
  const stockQuantity = product.inventory?.quantity ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="mx-auto max-w-6xl">
            <Link
              href="/products"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Products
            </Link>

            <div className="mt-6 grid gap-10 rounded-2xl border bg-white p-8 md:grid-cols-2">
              {/* Product Image */}
              <div className="flex min-h-[450px] items-center justify-center rounded-xl bg-gray-50">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="max-h-[420px] w-full object-contain p-8"
                  />
                ) : (
                  <div className="text-8xl text-gray-300">
                    🩺
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="flex flex-col">
                {product.category && (
                  <p className="text-sm font-medium text-blue-600">
                    {product.category.name}
                  </p>
                )}

                <h1 className="mt-2 text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>

                {product.short_description && (
                  <p className="mt-4 text-gray-600">
                    {product.short_description}
                  </p>
                )}

                {/* Price */}
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹
                    {Number(product.selling_price).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  {discount > 0 && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹
                        {Number(product.mrp).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      <span className="rounded bg-green-100 px-2 py-1 text-sm font-semibold text-green-700">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Rating */}
                {product.rating && (
                  <div className="mt-4 text-sm text-gray-600">
                    ⭐ {Number(product.rating.average).toFixed(1)}
                    {" "}
                    ({product.rating.count} reviews)
                  </div>
                )}

                {/* Stock */}
                <div className="mt-5">
                  {available ? (
                    <p className="font-medium text-green-600">
                      ✓ In Stock
                      {stockQuantity > 0 &&
                        ` (${stockQuantity} available)`}
                    </p>
                  ) : (
                    <p className="font-medium text-red-600">
                      Out of Stock
                    </p>
                  )}
                </div>

                {/* Interactive Cart Actions */}
                <ProductDetailActions
                  productId={product.id}
                  available={available}
                  stockQuantity={stockQuantity}
                />

                {/* Description */}
                {product.description && (
                  <div className="mt-8 border-t pt-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Product Description
                    </h2>

                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* SKU */}
                <div className="mt-6 border-t pt-5 text-sm text-gray-500">
                  SKU: {product.sku}
                </div>
              </div>
            </div>

            {/* Customer Reviews */}
            <ProductReviews productId={product.id} />
          </div>
        </main>
      </div>
    </div>
  );
}