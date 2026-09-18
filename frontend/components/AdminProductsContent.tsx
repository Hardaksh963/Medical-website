"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Product } from "@/lib/types";
import {
  getAdminProducts,
  deleteAdminProduct,
  updateProductStatus,
  getCategories,
  Category,
} from "@/lib/api";

export default function AdminProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");

  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          window.location.href = "/login?redirect=/admin/products";
          return;
        }

        const [productsData, categoriesData] = await Promise.all([
          getAdminProducts(),
          getCategories(),
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to load admin products:", err);

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load products.";

        if (
          message.toLowerCase().includes("admin access required") ||
          message.includes("403")
        ) {
          window.location.href = "/";
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        product.name.toLowerCase().includes(searchText) ||
        product.sku?.toLowerCase().includes(searchText);

      const matchesCategory =
        !categoryId ||
        product.category_id === categoryId;

      const matchesStatus =
        !status ||
        product.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [products, search, categoryId, status]);

  function getCategoryName(product: Product) {
    const category = categories.find(
      (item) => item.id === product.category_id
    );

    return category?.name || "Uncategorized";
  }

  async function handleToggleStatus(product: Product) {
    setError("");
    setSuccess("");

    const newStatus =
      product.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    try {
      setProcessingId(product.id);

      const updatedProduct = await updateProductStatus(
        product.id,
        newStatus
      );

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? updatedProduct
            : item
        )
      );

      setSuccess(
        `${product.name} is now ${newStatus.toLowerCase()}.`
      );
    } catch (err) {
      console.error("Failed to update product status:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update product status."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Deactivate "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setProcessingId(product.id);

      await deleteAdminProduct(product.id);

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                status: "INACTIVE",
              }
            : item
        )
      );

      setSuccess(
        `${product.name} has been deactivated.`
      );
    } catch (err) {
      console.error("Failed to delete product:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to deactivate product."
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-8 text-black">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-black">
              Loading products...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 text-black">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold text-black">
              Products
            </h1>

            <p className="mt-2 text-black">
              Manage your medical store products.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="w-fit rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            + Add Product
          </Link>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {/* Filters */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-3">

            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-black"
              >
                Search
              </label>

              <input
                id="search"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name or SKU..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder:text-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-black"
              >
                Category
              </label>

              <select
                id="category"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  All Categories
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
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-black"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  All Statuses
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

                <option value="DRAFT">
                  Draft
                </option>
              </select>
            </div>

          </div>
        </section>

        {/* Product count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-black">
            Showing{" "}
            <span className="font-semibold">
              {filteredProducts.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold">
              {products.length}
            </span>{" "}
            products
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:block">

          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-black">
                  Product
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-black">
                  SKU
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-black">
                  Category
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-black">
                  Price
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-black">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-sm font-semibold text-black">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-black">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {product.product_type}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-black">
                    {product.sku || "—"}
                  </td>

                  <td className="px-5 py-4 text-sm text-black">
                    {getCategoryName(product)}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-black">
                      ₹
                      {Number(
                        product.selling_price
                      ).toLocaleString("en-IN")}
                    </p>

                    <p className="text-xs text-gray-500 line-through">
                      ₹
                      {Number(
                        product.mrp
                      ).toLocaleString("en-IN")}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={product.status}
                    />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">

                      <Link
                        href={`/products/${product.id}`}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-black hover:bg-gray-50"
                      >
                        View
                      </Link>

                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-black hover:bg-gray-50"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={
                          processingId === product.id
                        }
                        onClick={() =>
                          handleToggleStatus(product)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50"
                      >
                        {processingId === product.id
                          ? "..."
                          : product.status === "ACTIVE"
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          processingId === product.id
                        }
                        onClick={() =>
                          handleDelete(product)
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-medium text-black">
                No products found.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          )}

        </div>

        {/* Mobile cards */}
        <div className="space-y-4 lg:hidden">

          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="font-semibold text-black">
                    {product.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    SKU: {product.sku || "—"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {getCategoryName(product)}
                  </p>
                </div>

                <StatusBadge
                  status={product.status}
                />

              </div>

              <div className="mt-4">
                <p className="font-semibold text-black">
                  ₹
                  {Number(
                    product.selling_price
                  ).toLocaleString("en-IN")}
                </p>

                <p className="text-sm text-gray-500 line-through">
                  ₹
                  {Number(
                    product.mrp
                  ).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">

                <Link
                  href={`/products/${product.id}`}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-black"
                >
                  View
                </Link>

                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-black"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  disabled={
                    processingId === product.id
                  }
                  onClick={() =>
                    handleToggleStatus(product)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
                >
                  {product.status === "ACTIVE"
                    ? "Deactivate"
                    : "Activate"}
                </button>

              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <p className="font-medium text-black">
                No products found.
              </p>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  let classes =
    "bg-gray-100 text-gray-700";

  if (status === "ACTIVE") {
    classes =
      "bg-green-100 text-green-700";
  } else if (status === "INACTIVE") {
    classes =
      "bg-red-100 text-red-700";
  } else if (status === "DRAFT") {
    classes =
      "bg-yellow-100 text-yellow-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}