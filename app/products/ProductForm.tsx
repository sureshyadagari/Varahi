"use client";

import { useState } from "react";

type Category = { id: string; name: string };

type ProductEntry = {
  name: string;
  categoryId: string;
  brand: string;
  purchasedFrom: string;
  costPrice: string;
  sellingPrice: string;
  quantity: string;
  unit: string;
  minStock: string;
};

const emptyEntry: ProductEntry = {
  name: "",
  categoryId: "",
  brand: "",
  purchasedFrom: "",
  costPrice: "",
  sellingPrice: "",
  quantity: "0",
  unit: "pcs",
  minStock: "",
};

function copyExceptPricesAndQty(prev: ProductEntry): ProductEntry {
  return {
    ...prev,
    costPrice: "",
    sellingPrice: "",
    quantity: "0",
  };
}

export function ProductForm({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProductEntry[]>([{ ...emptyEntry }]);

  function addAnotherItem() {
    const last = items[items.length - 1];
    setItems((prev) => [...prev, copyExceptPricesAndQty(last)]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof ProductEntry, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const toSave = items.filter(
      (i) => i.name.trim() && i.categoryId && i.costPrice !== "" && i.sellingPrice !== ""
    );
    if (toSave.length === 0) {
      setError("Fill at least one item with name, category, cost and selling price.");
      return;
    }
    setLoading(true);
    try {
      let saved = 0;
      for (const item of toSave) {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name.trim(),
            categoryId: item.categoryId,
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice,
            quantity: item.quantity || 0,
            unit: item.unit || "pcs",
            minStock: item.minStock || null,
            brand: item.brand || null,
            purchasedFrom: item.purchasedFrom || null,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to add product: ${item.name}`);
        }
        saved++;
      }
      setItems([{ ...emptyEntry }]);
      setOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setItems([{ ...emptyEntry }]);
    setError(null);
    setOpen(false);
  }

  const validCount = items.filter(
    (i) => i.name.trim() && i.categoryId && i.costPrice !== "" && i.sellingPrice !== ""
  ).length;
  const saveLabel = validCount === 1 ? "Save 1 product" : `Save ${validCount} products`;

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        Add product
      </button>
      {open && (
        <div className="fixed inset-0 z-10 flex flex-col bg-black/40">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
            <div className="card w-full max-w-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Add product(s)</h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-stone-400 hover:text-stone-600 p-1"
                >
                  ✕
                </button>
              </div>
              <form id="add-product-form" onSubmit={handleSubmit} className="space-y-4 pb-32">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-stone-200 bg-stone-50/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stone-500">
                      Item {index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="label">Name</label>
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                      className="input"
                      required={index === 0}
                      placeholder="e.g. Paint 1L"
                    />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select
                      value={item.categoryId}
                      onChange={(e) => updateItem(index, "categoryId", e.target.value)}
                      className="input"
                      required={index === 0}
                    >
                      <option value="">Select</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label">Brand</label>
                      <input
                        value={item.brand}
                        onChange={(e) => updateItem(index, "brand", e.target.value)}
                        className="input"
                        placeholder="e.g. Asian Paints"
                      />
                    </div>
                    <div>
                      <label className="label">Purchased from</label>
                      <input
                        value={item.purchasedFrom}
                        onChange={(e) => updateItem(index, "purchasedFrom", e.target.value)}
                        className="input"
                        placeholder="Supplier name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="label">Cost price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.costPrice}
                        onChange={(e) => updateItem(index, "costPrice", e.target.value)}
                        className="input"
                        required={index === 0}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="label">Selling price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.sellingPrice}
                        onChange={(e) => updateItem(index, "sellingPrice", e.target.value)}
                        className="input"
                        required={index === 0}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="label">Quantity in stock</label>
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        className="input"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Unit</label>
                      <input
                        value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                        className="input"
                        placeholder="pcs, kg, meter"
                      />
                    </div>
                    <div>
                      <label className="label">Min stock (alert below)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.minStock}
                        onChange={(e) => updateItem(index, "minStock", e.target.value)}
                        className="input"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addAnotherItem}
                className="btn-secondary w-full sm:w-auto"
              >
                + Add another item
              </button>
              <p className="text-xs text-stone-500">
                New item copies name, category, brand, purchased from, unit and min stock from the previous; you only need to enter cost, selling price and quantity.
              </p>
              </form>
            </div>
          </div>
          {/* Floating action bar - always visible at bottom */}
          <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-stone-200 bg-white px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                {error && <p className="text-sm text-red-600">{error}</p>}
                <p className="text-xs text-stone-500">
                  {validCount > 0 ? `${validCount} item(s) ready to save` : "Fill name, category, cost and selling price to save"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  form="add-product-form"
                  className="btn-primary"
                  disabled={loading || validCount === 0}
                >
                  {loading ? "Saving…" : saveLabel}
                </button>
                <button type="button" onClick={handleClose} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
