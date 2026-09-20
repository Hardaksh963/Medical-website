"use client";

import { useState } from "react";

interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary?: boolean;
  display_order?: number;
}

interface ProductGalleryProps {
  productName: string;
  images?: ProductImage[];
}

export default function ProductGallery({
  productName,
  images = [],
}: ProductGalleryProps) {
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;

    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = sortedImages[selectedIndex];

  function previousImage() {
    setSelectedIndex((current) =>
      current === 0 ? sortedImages.length - 1 : current - 1
    );
  }

  function nextImage() {
    setSelectedIndex((current) =>
      current === sortedImages.length - 1 ? 0 : current + 1
    );
  }

  if (sortedImages.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border bg-gray-100">
        <div className="text-center">
          <div className="mb-3 text-6xl">🩺</div>
          <p className="text-sm text-gray-500">No product image available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Main Image */}
      <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-2xl border bg-white">
        <img
          src={selectedImage.image_url}
          alt={selectedImage.alt_text || productName}
          className="h-full w-full object-contain p-6"
        />

        {sortedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousImage}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl shadow-md transition hover:bg-gray-100"
              aria-label="Previous image"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={nextImage}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl shadow-md transition hover:bg-gray-100"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white transition ${
                selectedIndex === index
                  ? "border-blue-600"
                  : "border-gray-200 hover:border-gray-400"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || `${productName} ${index + 1}`}
                className="h-full w-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
