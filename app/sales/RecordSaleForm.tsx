"use client";

import { useState } from "react";

type Product = { id: string; name: string; sellingPrice: number; quantity: number; unit: string; category: { name: string } };

export function RecordSaleForm({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([
    { productId: "", quantity: 1, unitPrice: 0 },
  ]);

  function addLine() {
    setLines((prev) => [...prev, { productId: "", quantity: 1, unitPrice: 0 }]);
  }
  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }
  function setLine(i: number, field: "productId" | "quantity" | "unitPrice", value: string | number) {
    setLines((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      if (field === "productId") {
        const p = products.find((x) => x.id === value);
        if (p) next[i].unitPrice = p.sellingPrice;
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const valid = lines.filter((l) => l.productId && l.quantity > 0);
    if (valid.length === 0) {
      setError("Add at least one product with quantity.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: valid.map((l) => ({ productId: l.productId, quantity: l.quantity, unitPrice: l.unitPrice })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to record sale");
      }
      setLines([{ productId: "", quantity: 1, unitPrice: 0 }]);
      setOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        Record sale
      </button>
      {open && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Record sale</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {lines.map((line, i) => (
                <div key={i} className="flex flex-wrap items-end gap-2 rounded-lg border border-stone-200 p-3">
                  <div className="min-w-[180px] flex-1">
                    <label className="label">Product</label>
                    <select
                      value={line.productId}
                      onChange={(e) => setLine(i, "productId", e.target.value)}
                      className="input"
                      required={i === 0}
                    >
                      <option value="">Select</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category.name}) – stock: {p.quantity} {p.unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="label">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => setLine(i, "quantity", Number(e.target.value) || 0)}
                      className="input"
                    />
                  </div>
                  <div className="w-28">
                    <label className="label">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={line.unitPrice || ""}
                      onChange={(e) => setLine(i, "unitPrice", Number(e.target.value) || 0)}
                      className="input"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="btn-secondary py-2"
                    disabled={lines.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={addLine} className="btn-secondary text-sm">
                + Add another item
              </button>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Saving…" : "Save sale"}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
