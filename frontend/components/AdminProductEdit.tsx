"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAuthToken,
  getCategories,
  getAdminProduct,
  updateAdminProduct,
  updateProductStatus,
} from "@/lib/api";

import type { Product, Category } from "@/lib/types";

interface FormData {
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  brand_id: string;
  product_type: string;

  short_description: string;
  description: string;

  mrp: string;
  selling_price: string;

  manufacturer: string;
  country_of_origin: string;

  is_disposable: boolean;
  is_sterile: boolean;
  is_single_use: boolean;

  expiry_required: boolean;
  batch_tracking_required: boolean;

  warranty_months: string;
  reorder_level: string;
  weight_grams: string;

  status: string;
}

const productTypes = [
  {
    value: "SURGICAL_DISPOSABLE",
    label: "Surgical & Disposable",
  },
  {
    value: "SURGICAL_INSTRUMENT",
    label: "Surgical Instrument",
  },
  {
    value: "DIAGNOSTIC_DEVICE",
    label: "Diagnostic Device",
  },
  {
    value: "HOME_HEALTHCARE_DEVICE",
    label: "Home Healthcare Device",
  },
  {
    value: "MOBILITY_SUPPORT",
    label: "Mobility & Support",
  },
];

export default function AdminProductEdit({
  productId,
}: {
  productId: string;
}) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const [form, setForm] = useState<FormData>({
    name: "",
    slug: "",
    sku: "",
    category_id: "",
    brand_id: "",
    product_type: "",

    short_description: "",
    description: "",

    mrp: "",
    selling_price: "",

    manufacturer: "",
    country_of_origin: "",

    is_disposable: false,
    is_sterile: false,
    is_single_use: false,

    expiry_required: false,
    batch_tracking_required: false,

    warranty_months: "",
    reorder_level: "5",
    weight_grams: "",

    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      const token = getAuthToken();

      if (!token) {
        router.push(
          `/login?redirect=/admin/products/${productId}/edit`
        );
        return;
      }

      try {
        const [productData, categoryData] = await Promise.all([
          getAdminProduct(productId),
          getCategories(),
        ]);

        setProduct(productData);
        setCategories(categoryData);

        setForm({
          name: productData.name ?? "",
          slug: productData.slug ?? "",
          sku: productData.sku ?? "",
          category_id: productData.category_id ?? "",
          brand_id: productData.brand_id ?? "",
          product_type: productData.product_type ?? "",

          short_description:
            productData.short_description ?? "",

          description:
            productData.description ?? "",

          mrp: String(productData.mrp ?? ""),
          selling_price: String(productData.selling_price ?? ""),

          manufacturer:
            productData.manufacturer ?? "",

          country_of_origin:
            productData.country_of_origin ?? "",

          is_disposable:
            productData.is_disposable ?? false,

          is_sterile:
            productData.is_sterile ?? false,

          is_single_use:
            productData.is_single_use ?? false,

          expiry_required:
            productData.expiry_required ?? false,

          batch_tracking_required:
            productData.batch_tracking_required ?? false,

          warranty_months:
            productData.warranty_months != null
              ? String(productData.warranty_months)
              : "",

          reorder_level:
            productData.reorder_level != null
              ? String(productData.reorder_level)
              : "5",

          weight_grams:
            productData.weight_grams != null
              ? String(productData.weight_grams)
              : "",

          status: productData.status ?? "ACTIVE",
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load product.";

        if (
          message.toLowerCase().includes("admin access") ||
          message.includes("403")
        ) {
          router.push("/");
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [productId, router]);

  function updateField<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const mrp = Number(form.mrp);
    const sellingPrice = Number(form.selling_price);

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Slug is required.");
      return;
    }

    if (!form.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (!form.category_id) {
      setError("Please select a category.");
      return;
    }

    if (!form.product_type) {
      setError("Please select a product type.");
      return;
    }

    if (!mrp || mrp <= 0) {
      setError("MRP must be greater than 0.");
      return;
    }

    if (!sellingPrice || sellingPrice <= 0) {
      setError("Selling price must be greater than 0.");
      return;
    }

    if (sellingPrice > mrp) {
      setError("Selling price cannot be greater than MRP.");
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim(),
        category_id: form.category_id,
        product_type: form.product_type,

        short_description:
          form.short_description.trim() || null,

        description:
          form.description.trim() || null,

        mrp,
        selling_price: sellingPrice,

        manufacturer:
          form.manufacturer.trim() || null,

        country_of_origin:
          form.country_of_origin.trim() || null,

        is_disposable: form.is_disposable,
        is_sterile: form.is_sterile,
        is_single_use: form.is_single_use,

        expiry_required: form.expiry_required,
        batch_tracking_required:
          form.batch_tracking_required,

        warranty_months:
          form.warranty_months === ""
            ? null
            : Number(form.warranty_months),

        reorder_level:
          Number(form.reorder_level),

        weight_grams:
          form.weight_grams === ""
            ? null
            : Number(form.weight_grams),

      };

      if (form.brand_id.trim()) {
        payload.brand_id = form.brand_id.trim();
      } else {
        payload.brand_id = null;
      }

      await updateAdminProduct(productId, payload);

      if (form.status !== product?.status) {
        await updateProductStatus(productId, form.status);
        }

      router.push("/admin/products");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update product.";

      if (
        message.toLowerCase().includes("admin access") ||
        message.includes("403")
      ) {
        router.push("/");
        return;
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-black">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-5xl">

        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="mb-3 text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Products
          </button>

          <h1 className="text-3xl font-bold text-black">
            Edit Product
          </h1>

          <p className="mt-1 text-gray-600">
            Update product information and settings.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Basic Information */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-black">
              Basic Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Product Name
                </label>

                <input
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;

                    updateField("name", name);

                    if (
                      !form.slug ||
                      form.slug === generateSlug(form.name)
                    ) {
                      updateField(
                        "slug",
                        generateSlug(name)
                      );
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  SKU
                </label>

                <input
                  value={form.sku}
                  onChange={(e) =>
                    updateField("sku", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Slug
                </label>

                <input
                  value={form.slug}
                  onChange={(e) =>
                    updateField(
                      "slug",
                      generateSlug(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Category
                </label>

                <select
                  value={form.category_id}
                  onChange={(e) =>
                    updateField(
                      "category_id",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Product Type
                </label>

                <select
                  value={form.product_type}
                  onChange={(e) =>
                    updateField(
                      "product_type",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                  required
                >
                  <option value="">
                    Select product type
                  </option>

                  {productTypes.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Brand ID
                </label>

                <input
                  value={form.brand_id}
                  onChange={(e) =>
                    updateField(
                      "brand_id",
                      e.target.value
                    )
                  }
                  placeholder="Optional UUID"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                />
              </div>

            </div>
          </section>

          {/* Description */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-black">
              Description
            </h2>

            <div className="space-y-5">

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Short Description
                </label>

                <textarea
                  value={form.short_description}
                  onChange={(e) =>
                    updateField(
                      "short_description",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                />
              </div>

            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-black">
              Pricing
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  MRP
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.mrp}
                  onChange={(e) =>
                    updateField("mrp", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Selling Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.selling_price}
                  onChange={(e) =>
                    updateField(
                      "selling_price",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                  required
                />
              </div>

            </div>
          </section>

          {/* Manufacturer */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-black">
              Manufacturer Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Manufacturer
                </label>

                <input
                  value={form.manufacturer}
                  onChange={(e) =>
                    updateField(
                      "manufacturer",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Country of Origin
                </label>

                <input
                  value={form.country_of_origin}
                  onChange={(e) =>
                    updateField(
                      "country_of_origin",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                />
              </div>

            </div>
          </section>

          {/* Product Properties */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-black">
              Product Properties
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <label className="flex items-center gap-3 text-black">
                <input
                  type="checkbox"
                  checked={form.is_disposable}
                  onChange={(e) =>
                    updateField(
                      "is_disposable",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4"
                />
                Disposable
              </label>

              <label className="flex items-center gap-3 text-black">
                <input
                  type="checkbox"
                  checked={form.is_sterile}
                  onChange={(e) =>
                    updateField(
                      "is_sterile",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4"
                />
                Sterile
              </label>

              <label className="flex items-center gap-3 text-black">
                <input
                  type="checkbox"
                  checked={form.is_single_use}
                  onChange={(e) =>
                    updateField(
                      "is_single_use",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4"
                />
                Single Use
              </label>

              <label className="flex items-center gap-3 text-black">
                <input
                  type="checkbox"
                  checked={form.expiry_required}
                  onChange={(e) =>
                    updateField(
                      "expiry_required",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4"
                />
                Expiry Required
              </label>

              <label className="flex items-center gap-3 text-black">
                <input
                  type="checkbox"
                  checked={form.batch_tracking_required}
                  onChange={(e) =>
                    updateField(
                      "batch_tracking_required",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4"
                />
                Batch Tracking Required
              </label>

            </div>
          </section>

          {/* Additional Settings */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-black">
              Additional Settings
            </h2>

            <div className="grid gap-5 md:grid-cols-3">

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Warranty (Months)
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.warranty_months}
                  onChange={(e) =>
                    updateField(
                      "warranty_months",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Reorder Level
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.reorder_level}
                  onChange={(e) =>
                    updateField(
                      "reorder_level",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Weight (grams)
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.weight_grams}
                  onChange={(e) =>
                    updateField(
                      "weight_grams",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                />
              </div>

            </div>
          </section>

          {/* Status */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-black">
              Status
            </h2>

            <select
              value={form.status}
              onChange={(e) =>
                updateField("status", e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black md:w-1/2"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DRAFT">Draft</option>
            </select>
          </section>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                router.push("/admin/products")
              }
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-black hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}