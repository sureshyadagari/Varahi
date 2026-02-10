"use client";

import { useState, useRef, useEffect } from "react";

type Product = {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  unit: string;
  category: { name: string };
};

type BillLine = {
  productId: string;
  name: string;
  costPrice: number;
  unitPrice: number;
  quantity: number;
  total: number;
  unit: string;
};

export function BillingPanel({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lines, setLines] = useState<BillLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const suggestions = search.trim().length >= 1
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        listRef.current?.contains(e.target as Node) ||
        inputRef.current?.contains(e.target as Node)
      )
        return;
      setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectProduct(p: Product) {
    const existing = lines.find((l) => l.productId === p.id);
    if (existing) {
      setLines((prev) =>
        prev.map((l) =>
          l.productId === p.id
            ? { ...l, quantity: l.quantity + 1, total: (l.quantity + 1) * l.unitPrice }
            : l
        )
      );
    } else {
      setLines((prev) => [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          costPrice: p.costPrice,
          unitPrice: p.sellingPrice,
          quantity: 1,
          total: p.sellingPrice,
          unit: p.unit,
        },
      ]);
    }
    setSearch("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function updateLine(index: number, field: "quantity" | "unitPrice", value: number) {
    setLines((prev) => {
      const next = [...prev];
      const line = { ...next[index] };
      if (field === "quantity") {
        line.quantity = Math.max(0, value);
      } else {
        line.unitPrice = Math.max(0, value);
      }
      line.total = line.quantity * line.unitPrice;
      next[index] = line;
      return next;
    });
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const grandTotal = lines.reduce((sum, l) => sum + l.total, 0);
  const belowCostLines = lines.filter((l) => l.unitPrice < l.costPrice);

  async function completeBill() {
    setError(null);
    if (lines.length === 0) {
      setError("Add at least one item.");
      return;
    }
    if (belowCostLines.length > 0) {
      setError("Some items are below cost price. Adjust price or remove to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
          customerName: customerName.trim() || undefined,
          customerAddress: customerAddress.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to complete bill");
      }
      setLines([]);
      setSearch("");
      setCustomerName("");
      setCustomerAddress("");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Optional customer details */}
      <div className="card grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label text-stone-500">Customer name (optional)</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="For reference"
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label text-stone-500">Customer address (optional)</label>
          <input
            type="text"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="For reference"
            className="input"
          />
        </div>
      </div>

      {/* Item search with autocomplete */}
      <div className="card">
        <label className="label">Add item (type name to search)</label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Type product name…"
            className="input"
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul
              ref={listRef}
              className="absolute top-full left-0 right-0 z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-stone-200 bg-white py-1 shadow-lg"
            >
              {suggestions.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left text-sm hover:bg-stone-100 flex justify-between items-center"
                    onClick={() => selectProduct(p)}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-stone-500">
                      ₹{p.sellingPrice.toLocaleString("en-IN")} · Stock: {p.quantity} {p.unit}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bill lines */}
      <div className="card overflow-hidden p-0">
        <div className="border-b border-stone-200 bg-stone-50 px-4 py-2 font-medium text-stone-700">
          Bill items
        </div>
        {lines.length === 0 ? (
          <p className="px-4 py-8 text-center text-stone-500">No items added. Search and select above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr>
                  <th className="px-4 py-2 font-medium">Item</th>
                  <th className="px-4 py-2 font-medium">Cost (min)</th>
                  <th className="px-4 py-2 font-medium">Price (₹)</th>
                  <th className="px-4 py-2 font-medium">Qty</th>
                  <th className="px-4 py-2 font-medium">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr
                    key={`${line.productId}-${index}`}
                    className={`border-b border-stone-100 ${line.unitPrice < line.costPrice ? "bg-red-50" : ""}`}
                  >
                    <td className="px-4 py-2 font-medium">{line.name}</td>
                    <td className="px-4 py-2 text-stone-500">
                      ₹{line.costPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.unitPrice}
                        onChange={(e) =>
                          updateLine(index, "unitPrice", Number(e.target.value) || 0)
                        }
                        className="input w-24 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(index, "quantity", Number(e.target.value) || 0)
                        }
                        className="input w-20 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">
                      ₹{line.total.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {lines.length > 0 && (
          <div className="border-t border-stone-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-stone-600">Grand total: </span>
              <span className="text-xl font-bold text-stone-800">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
            {belowCostLines.length > 0 && (
              <p className="text-sm text-red-600">
                {belowCostLines.length} item(s) below cost — increase price or remove
              </p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={completeBill}
          className="btn-primary"
          disabled={loading || lines.length === 0 || belowCostLines.length > 0}
        >
          {loading ? "Completing…" : "Complete bill"}
        </button>
      </div>
    </div>
  );
}
