"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAuthToken,
  getAdminProducts,
  getProductInventory,
  createInventoryBatch,
  adjustInventory,
  getInventoryMovements,
  getLowStockProducts,
} from "@/lib/api";

import type { Product } from "@/lib/types";

interface Batch {
  id: string;
  product_id: string;
  batch_number: string;
  quantity: number;
  manufacturing_date: string | null;
  expiry_date: string | null;
  is_active: boolean;
}

interface InventoryMovement {
  id: string;
  product_id: string;
  batch_id: string;
  quantity: number;
  movement_type: string;
  reason: string | null;
  created_at: string;
}

interface LowStockProduct {
  product_id: string;
  product_name: string;
  current_stock: number;
  reorder_level: number;
}

export default function AdminInventoryContent() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [batches, setBatches] = useState<Batch[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add batch form
  const [batchNumber, setBatchNumber] = useState("");
  const [batchQuantity, setBatchQuantity] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // Adjustment form
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [movementType, setMovementType] = useState("STOCK_IN");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const [lowStockProducts, setLowStockProducts] = useState<
    LowStockProduct[]
  >([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login?redirect=/admin/inventory");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [productData, lowStockData] = await Promise.all([
        getAdminProducts(),
        getLowStockProducts(),
        ]);

        setProducts(productData);
        setLowStockProducts(lowStockData);

        if (productData.length > 0) {
        setSelectedProductId(productData[0].id);
        }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load products";

      if (
        message.toLowerCase().includes("admin access required") ||
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

  useEffect(() => {
    if (selectedProductId) {
      loadInventory(selectedProductId);
    }
  }, [selectedProductId]);

  async function loadInventory(productId: string) {
    try {
      setLoadingInventory(true);
      setError("");

      const [batchData, movementData] = await Promise.all([
        getProductInventory(productId),
        getInventoryMovements(productId),
      ]);

      setBatches(batchData);
      setMovements(movementData);

      if (batchData.length > 0) {
        setSelectedBatchId(batchData[0].id);
      } else {
        setSelectedBatchId("");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load inventory"
      );
    } finally {
      setLoadingInventory(false);
    }
  }

  async function handleAddBatch(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedProductId) {
      setError("Please select a product.");
      return;
    }

    if (!batchNumber.trim()) {
      setError("Batch number is required.");
      return;
    }

    const quantity = Number(batchQuantity);

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Quantity must be a valid non-negative integer.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      await createInventoryBatch({
        product_id: selectedProductId,
        batch_number: batchNumber.trim(),
        quantity,
        manufacturing_date: manufacturingDate || null,
        expiry_date: expiryDate || null,
      });

      setBatchNumber("");
      setBatchQuantity("");
      setManufacturingDate("");
      setExpiryDate("");

      await loadInventory(selectedProductId);

      setSuccess("Inventory batch added successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add inventory batch"
      );
    }
  }

  async function handleAdjustment(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedBatchId) {
      setError("Please select a batch.");
      return;
    }

    const quantity = Number(adjustmentQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Adjustment quantity must be greater than zero.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      await adjustInventory({
        batch_id: selectedBatchId,
        quantity,
        movement_type: movementType,
        reason: adjustmentReason.trim() || null,
      });

      setAdjustmentQuantity("");
      setAdjustmentReason("");

      await loadInventory(selectedProductId);

      setSuccess("Inventory adjusted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to adjust inventory"
      );
    }
  }

  const selectedProduct = products.find(
    (product) => product.id === selectedProductId
  );

  const totalStock = batches
    .filter((batch) => batch.is_active)
    .reduce((total, batch) => total + batch.quantity, 0);

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <p className="text-black">Loading inventory...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            Inventory Management
          </h1>

          <p className="mt-2 text-gray-700">
            Manage product batches, stock adjustments and inventory history.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {/* Low Stock Alert */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
            <div>
            <h2 className="text-xl font-bold text-black">
                Low Stock Products
            </h2>

            <p className="mt-1 text-sm text-gray-600">
                Products at or below their reorder level.
            </p>
            </div>

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
            {lowStockProducts.length}
            </span>
        </div>

        {lowStockProducts.length === 0 ? (
            <p className="text-gray-600">
            No products are currently low on stock.
            </p>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
                <thead>
                <tr className="border-b text-left">
                    <th className="p-3 text-sm text-gray-600">
                    Product
                    </th>

                    <th className="p-3 text-sm text-gray-600">
                    Current Stock
                    </th>

                    <th className="p-3 text-sm text-gray-600">
                    Reorder Level
                    </th>

                    <th className="p-3 text-sm text-gray-600">
                    Action
                    </th>
                </tr>
                </thead>

                <tbody>
                {lowStockProducts.map((product) => (
                    <tr
                    key={product.product_id}
                    className="border-b last:border-0"
                    >
                    <td className="p-3 font-medium text-black">
                        {product.product_name}
                    </td>

                    <td className="p-3 font-semibold text-red-600">
                        {product.current_stock}
                    </td>

                    <td className="p-3 text-black">
                        {product.reorder_level}
                    </td>

                    <td className="p-3">
                        <button
                        type="button"
                        onClick={() =>
                            setSelectedProductId(product.product_id)
                        }
                        className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                        Manage Stock
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </div>

        {/* Product selector */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <label className="mb-2 block text-sm font-semibold text-black">
            Select Product
          </label>

          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black md:max-w-2xl"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {product.sku}
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <>
            {/* Summary */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm text-gray-600">
                  Product
                </p>

                <p className="mt-2 text-xl font-bold text-black">
                  {selectedProduct.name}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm text-gray-600">
                  Total Available Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-black">
                  {totalStock}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm text-gray-600">
                  Active Batches
                </p>

                <p className="mt-2 text-3xl font-bold text-black">
                  {batches.filter((batch) => batch.is_active).length}
                </p>
              </div>

            </div>

            {loadingInventory ? (
              <div className="rounded-xl bg-white p-8 shadow">
                <p className="text-black">
                  Loading product inventory...
                </p>
              </div>
            ) : (
              <>
                {/* Batches */}
                <section className="mb-8 rounded-xl bg-white p-6 shadow">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-black">
                      Inventory Batches
                    </h2>
                  </div>

                  {batches.length === 0 ? (
                    <p className="text-gray-600">
                      No inventory batches found.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px]">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="p-3 text-sm text-gray-600">
                              Batch
                            </th>

                            <th className="p-3 text-sm text-gray-600">
                              Quantity
                            </th>

                            <th className="p-3 text-sm text-gray-600">
                              Manufacturing
                            </th>

                            <th className="p-3 text-sm text-gray-600">
                              Expiry
                            </th>

                            <th className="p-3 text-sm text-gray-600">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {batches.map((batch) => (
                            <tr
                              key={batch.id}
                              className="border-b last:border-0"
                            >
                              <td className="p-3 font-medium text-black">
                                {batch.batch_number}
                              </td>

                              <td className="p-3 text-black">
                                {batch.quantity}
                              </td>

                              <td className="p-3 text-black">
                                {batch.manufacturing_date || "-"}
                              </td>

                              <td className="p-3 text-black">
                                {batch.expiry_date || "-"}
                              </td>

                              <td className="p-3">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    batch.is_active
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {batch.is_active
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* Add batch */}
                <section className="mb-8 rounded-xl bg-white p-6 shadow">
                  <h2 className="mb-6 text-xl font-bold text-black">
                    Add Inventory Batch
                  </h2>

                  <form
                    onSubmit={handleAddBatch}
                    className="grid gap-5 md:grid-cols-2"
                  >
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-black">
                        Batch Number
                      </label>

                      <input
                        value={batchNumber}
                        onChange={(e) =>
                          setBatchNumber(e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black"
                        placeholder="e.g. BATCH-2026-001"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-black">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={batchQuantity}
                        onChange={(e) =>
                          setBatchQuantity(e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-black">
                        Manufacturing Date
                      </label>

                      <input
                        type="date"
                        value={manufacturingDate}
                        onChange={(e) =>
                          setManufacturingDate(e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-black">
                        Expiry Date
                      </label>

                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) =>
                          setExpiryDate(e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
                      >
                        Add Batch
                      </button>
                    </div>
                  </form>
                </section>

                {/* Stock adjustment */}
                <section className="mb-8 rounded-xl bg-white p-6 shadow">
                  <h2 className="mb-6 text-xl font-bold text-black">
                    Stock Adjustment
                  </h2>

                  <form
                    onSubmit={handleAdjustment}
                    className="grid gap-5 md:grid-cols-2"
                  >
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-black">
                        Batch
                      </label>

                      <select
                        value={selectedBatchId}
                        onChange={(e) =>
                          setSelectedBatchId(e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black"
                      >
                        {batches
                          .filter((batch) => batch.is_active)
                          .map((batch) => (
                            <option
                              key={batch.id}
                              value={batch.id}
                            >
                              {batch.batch_number} —{" "}
                              {batch.quantity} units
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-black">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={adjustmentQuantity}
                        onChange={(e) =>
                          setAdjustmentQuantity(e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-black">
                        Movement Type
                      </label>

                      <select
                        value={movementType}
                        onChange={(e) =>
                          setMovementType(e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black"
                      >
                        <option value="STOCK_IN">
                            Stock In
                        </option>

                        <option value="STOCK_OUT">
                            Stock Out
                        </option>

                        <option value="ADJUSTMENT">
                            Set Stock Quantity
                        </option>

                        <option value="RETURN">
                            Return
                        </option>

                        <option value="DAMAGED">
                            Damaged
                        </option>

                        <option value="EXPIRED">
                            Expired
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-black">
                        Reason
                      </label>

                      <input
                        value={adjustmentReason}
                        onChange={(e) =>
                          setAdjustmentReason(e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black"
                        placeholder="Reason for adjustment"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
                      >
                        Adjust Stock
                      </button>
                    </div>
                  </form>
                </section>

                {/* Movement history */}
                <section className="rounded-xl bg-white p-6 shadow">
                  <h2 className="mb-6 text-xl font-bold text-black">
                    Inventory Movement History
                  </h2>

                  {movements.length === 0 ? (
                    <p className="text-gray-600">
                      No inventory movements found.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px]">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="p-3 text-sm text-gray-600">
                              Date
                            </th>

                            <th className="p-3 text-sm text-gray-600">
                              Batch
                            </th>

                            <th className="p-3 text-sm text-gray-600">
                              Quantity
                            </th>

                            <th className="p-3 text-sm text-gray-600">
                              Type
                            </th>

                            <th className="p-3 text-sm text-gray-600">
                              Reason
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {movements.map((movement) => {
                            const batch = batches.find(
                              (item) =>
                                item.id === movement.batch_id
                            );

                            return (
                              <tr
                                key={movement.id}
                                className="border-b last:border-0"
                              >
                                <td className="p-3 text-black">
                                  {new Date(
                                    movement.created_at
                                  ).toLocaleString()}
                                </td>

                                <td className="p-3 text-black">
                                  {batch?.batch_number || "-"}
                                </td>

                                <td className="p-3 text-black">
                                  {movement.quantity}
                                </td>

                                <td className="p-3 text-black">
                                  {movement.movement_type}
                                </td>

                                <td className="p-3 text-black">
                                  {movement.reason || "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}