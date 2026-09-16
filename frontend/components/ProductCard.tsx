import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  selling_price: number;
  mrp?: number;
  short_description?: string | null;
  image_url?: string | null;
}

export default function ProductCard({
  id,
  name,
  selling_price,
  mrp,
  short_description,
  image_url,
}: ProductCardProps) {
  const discount =
    mrp && mrp > selling_price
      ? Math.round(((mrp - selling_price) / mrp) * 100)
      : 0;

  return (
    <div className="overflow-hidden rounded-xl border bg-white transition hover:-translate-y-1 hover:shadow-lg">

      {/* Product Image */}
      <Link href={`/products/${id}`}>
        <div className="flex h-52 items-center justify-center bg-gray-50">

          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="h-full w-full object-contain p-4"
            />
          ) : (
            <div className="text-6xl text-gray-300">
              🩺
            </div>
          )}

        </div>
      </Link>

      {/* Product Information */}
      <div className="p-4">

        <Link href={`/products/${id}`}>
          <h3 className="line-clamp-2 min-h-12 font-semibold text-gray-900 hover:text-blue-600">
            {name}
          </h3>
        </Link>

        {short_description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">
            {short_description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">

          <span className="text-lg font-bold text-gray-900">
            ₹{selling_price.toLocaleString("en-IN")}
          </span>

          {mrp && mrp > selling_price && (
            <>
              <span className="text-sm text-gray-400 line-through">
                ₹{mrp.toLocaleString("en-IN")}
              </span>

              <span className="text-xs font-semibold text-green-600">
                {discount}% OFF
              </span>
            </>
          )}

        </div>

        <Link
          href={`/products/${id}`}
          className="mt-4 block rounded-lg bg-blue-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700"
        >
          View Product
        </Link>

      </div>
    </div>
  );
}