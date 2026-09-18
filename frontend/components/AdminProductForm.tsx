"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAdminProduct,
  getCategories,
  getAuthToken,
} from "@/lib/api";
import { Category } from "@/lib/types";

export default function AdminProductForm() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
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
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const token = getAuthToken();

      if (!token) {
        router.replace("/login?redirect=/admin/products/new");
        return;
      }

      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load categories"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  function updateField(
    field: string,
    value: string | boolean
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

  function handleNameChange(value: string) {
    setForm((previous) => ({
      ...previous,
      name: value,
      slug: generateSlug(value),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!form.category_id) {
      setError("Please select a category.");
      return;
    }

    const mrp = Number(form.mrp);
    const sellingPrice = Number(form.selling_price);

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

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim(),
        category_id: form.category_id,
        brand_id: form.brand_id.trim()
          ? form.brand_id.trim()
          : null,

        product_type: form.product_type.trim(),

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
          form.warranty_months.trim()
            ? Number(form.warranty_months)
            : null,

        reorder_level: Number(form.reorder_level),

        weight_grams:
          form.weight_grams.trim()
            ? Number(form.weight_grams)
            : null,
      };

      await createAdminProduct(payload);

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create product."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="rounded-xl bg-white p-8 text-black shadow-sm">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="mb-3 text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Products
          </button>

          <h1 className="text-2xl font-bold text-black">
            Add Product
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Add a new medical product to the store.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-black">
              Basic Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Product Name"
                required
                value={form.name}
                onChange={handleNameChange}
                placeholder="Digital Blood Pressure Monitor"
              />

              <Field
                label="SKU"
                required
                value={form.sku}
                onChange={(value) =>
                  updateField("sku", value)
                }
                placeholder="BPM-001"
              />

              <Field
                label="Slug"
                required
                value={form.slug}
                onChange={(value) =>
                  updateField("slug", value)
                }
                placeholder="digital-blood-pressure-monitor"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Category <span className="text-red-500">*</span>
                </label>

                <select
                  value={form.category_id}
                  onChange={(event) =>
                    updateField(
                      "category_id",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-black outline-none focus:border-blue-500"
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
                    setForm({ ...form, product_type: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
                    required
                >
                    <option value="">Select product type</option>
                    <option value="SURGICAL_DISPOSABLE">
                    Surgical & Disposable
                    </option>
                    <option value="SURGICAL_INSTRUMENT">
                    Surgical Instrument
                    </option>
                    <option value="DIAGNOSTIC_DEVICE">
                    Diagnostic Device
                    </option>
                    <option value="HOME_HEALTHCARE_DEVICE">
                    Home Healthcare Device
                    </option>
                    <option value="MOBILITY_SUPPORT">
                    Mobility & Support
                    </option>
                </select>
                </div>

              <Field
                label="Brand ID"
                value={form.brand_id}
                onChange={(value) =>
                  updateField("brand_id", value)
                }
                placeholder="Optional brand UUID"
              />
            </div>
          </section>

          {/* Description */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-black">
              Description
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Short Description
                </label>

                <input
                  value={form.short_description}
                  onChange={(event) =>
                    updateField(
                      "short_description",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-black outline-none focus:border-blue-500"
                  placeholder="Short product summary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-black outline-none focus:border-blue-500"
                  placeholder="Detailed product description"
                />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-black">
              Pricing
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="MRP"
                required
                type="number"
                value={form.mrp}
                onChange={(value) =>
                  updateField("mrp", value)
                }
                placeholder="2999"
              />

              <Field
                label="Selling Price"
                required
                type="number"
                value={form.selling_price}
                onChange={(value) =>
                  updateField("selling_price", value)
                }
                placeholder="2499"
              />
            </div>
          </section>

          {/* Manufacturer */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-black">
              Manufacturer Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Manufacturer"
                value={form.manufacturer}
                onChange={(value) =>
                  updateField("manufacturer", value)
                }
                placeholder="Manufacturer name"
              />

              <Field
                label="Country of Origin"
                value={form.country_of_origin}
                onChange={(value) =>
                  updateField(
                    "country_of_origin",
                    value
                  )
                }
                placeholder="India"
              />
            </div>
          </section>

          {/* Product Properties */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-black">
              Product Properties
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Checkbox
                label="Disposable"
                checked={form.is_disposable}
                onChange={(value) =>
                  updateField("is_disposable", value)
                }
              />

              <Checkbox
                label="Sterile"
                checked={form.is_sterile}
                onChange={(value) =>
                  updateField("is_sterile", value)
                }
              />

              <Checkbox
                label="Single Use"
                checked={form.is_single_use}
                onChange={(value) =>
                  updateField("is_single_use", value)
                }
              />

              <Checkbox
                label="Expiry Tracking Required"
                checked={form.expiry_required}
                onChange={(value) =>
                  updateField("expiry_required", value)
                }
              />

              <Checkbox
                label="Batch Tracking Required"
                checked={form.batch_tracking_required}
                onChange={(value) =>
                  updateField(
                    "batch_tracking_required",
                    value
                  )
                }
              />
            </div>
          </section>

          {/* Additional Information */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-black">
              Additional Information
            </h2>

            <div className="grid gap-5 md:grid-cols-3">
              <Field
                label="Warranty (Months)"
                type="number"
                value={form.warranty_months}
                onChange={(value) =>
                  updateField(
                    "warranty_months",
                    value
                  )
                }
                placeholder="12"
              />

              <Field
                label="Reorder Level"
                type="number"
                value={form.reorder_level}
                onChange={(value) =>
                  updateField(
                    "reorder_level",
                    value
                  )
                }
                placeholder="5"
              />

              <Field
                label="Weight (grams)"
                type="number"
                value={form.weight_grams}
                onChange={(value) =>
                  updateField(
                    "weight_grams",
                    value
                  )
                }
                placeholder="500"
              />
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/products")
              }
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-black hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-black">
        {label}

        {required && (
          <span className="text-red-500"> *</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "any" : undefined}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-black outline-none focus:border-blue-500"
      />
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 text-black hover:bg-gray-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="h-4 w-4"
      />

      <span className="text-sm font-medium">
        {label}
      </span>
    </label>
  );
}