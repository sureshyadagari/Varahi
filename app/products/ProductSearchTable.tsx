"use client";

import { useState, useMemo } from "react";

type Category = { id: string; name: string };

type Product = {
  id: string;
  name: string;
  categoryId: string;
  brand: string | null;
  category: { name: string };
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  unit: string;
  minStock: number | null;
  purchasedFrom: string | null;
};

export function ProductSearchTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterPurchasedFrom, setFilterPurchasedFrom] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterOptions = useMemo(() => {
    const categoriesList = [...new Set(products.map((p) => p.category.name))].sort();
    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort() as string[];
    const purchasedFromList = [...new Set(products.map((p) => p.purchasedFrom).filter(Boolean))].sort() as string[];
    return { categoriesList, brands, purchasedFromList };
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) &&
          !(p.brand?.toLowerCase().includes(q)) &&
          !p.category.name.toLowerCase().includes(q) &&
          !(p.purchasedFrom?.toLowerCase().includes(q)))
        return false;
      if (filterCategory && p.category.name !== filterCategory) return false;
      if (filterBrand && (p.brand ?? "") !== filterBrand) return false;
      if (filterPurchasedFrom && (p.purchasedFrom ?? "") !== filterPurchasedFrom) return false;
      return true;
    });
  }, [products, search, filterCategory, filterBrand, filterPurchasedFrom]);

  const hasActiveFilters = search || filterCategory || filterBrand || filterPurchasedFrom;

  function clearAll() {
    setSearch("");
    setFilterCategory("");
    setFilterBrand("");
    setFilterPurchasedFrom("");
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setEditForm({
      name: p.name,
      categoryId: p.categoryId,
      brand: p.brand ?? "",
      purchasedFrom: p.purchasedFrom ?? "",
      costPrice: String(p.costPrice),
      sellingPrice: String(p.sellingPrice),
      quantity: String(p.quantity),
      unit: p.unit,
      minStock: p.minStock != null ? String(p.minStock) : "",
    });
    setError(null);
  }

  async function saveProduct() {
    if (!editProduct) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          categoryId: editForm.categoryId || undefined,
          brand: editForm.brand.trim() || null,
          purchasedFrom: editForm.purchasedFrom.trim() || null,
          costPrice: editForm.costPrice === "" ? undefined : Number(editForm.costPrice),
          sellingPrice: editForm.sellingPrice === "" ? undefined : Number(editForm.sellingPrice),
          quantity: editForm.quantity === "" ? undefined : Number(editForm.quantity),
          unit: editForm.unit || undefined,
          minStock: editForm.minStock === "" ? null : Number(editForm.minStock),
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditProduct(null);
      window.location.reload();
    } catch {
      setError("Failed to update product.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDeleteProduct() {
    if (!deleteProduct) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${deleteProduct.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteProduct(null);
      window.location.reload();
    } catch {
      setError("Failed to delete product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
          🔍
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, brand, category or supplier…"
          className="input pl-9"
          aria-label="Search inventory"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[120px]">
          <label className="label text-xs">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input py-2 text-sm"
            aria-label="Filter by category"
          >
            <option value="">All</option>
            {filterOptions.categoriesList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[120px]">
          <label className="label text-xs">Brand</label>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="input py-2 text-sm"
            aria-label="Filter by brand"
          >
            <option value="">All</option>
            {filterOptions.brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[140px]">
          <label className="label text-xs">Purchased from</label>
          <select
            value={filterPurchasedFrom}
            onChange={(e) => setFilterPurchasedFrom(e.target.value)}
            className="input py-2 text-sm"
            aria-label="Filter by supplier"
          >
            <option value="">All</option>
            {filterOptions.purchasedFromList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={clearAll}
              className="btn-secondary text-sm py-2"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-stone-500">
        {filtered.length === products.length
          ? `${products.length} product(s)`
          : `${filtered.length} of ${products.length} product(s)`}
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Selling</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Min</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Purchased from</th>
                <th className="px-4 py-3 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-stone-100">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-stone-600">{p.brand ?? "–"}</td>
                  <td className="px-4 py-3 text-stone-600">{p.category.name}</td>
                  <td className="px-4 py-3">₹{p.costPrice.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">₹{p.sellingPrice.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        (p.minStock != null && p.quantity < p.minStock) || p.quantity <= 0
                          ? "font-medium text-amber-600"
                          : ""
                      }
                    >
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.unit}</td>
                  <td className="px-4 py-3">{p.minStock ?? "–"}</td>
                  <td className="hidden px-4 py-3 text-stone-600 sm:table-cell">
                    {p.purchasedFrom ?? "–"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button type="button" onClick={() => openEdit(p)} className="text-brand-600 hover:underline text-xs">Edit</button>
                      <button type="button" onClick={() => { setDeleteProduct(p); setError(null); }} className="text-red-600 hover:underline text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-stone-500">
            {hasActiveFilters ? "No products match your search or filters." : "No products yet. Add one above."}
          </p>
        )}
      </div>

      {/* Edit product modal */}
      {editProduct && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit product</h2>
              <button type="button" onClick={() => setEditProduct(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Name</label>
                <input value={editForm.name ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Category</label>
                <select value={editForm.categoryId ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, categoryId: e.target.value }))} className="input">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Brand</label>
                  <input value={editForm.brand ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, brand: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="label">Purchased from</label>
                  <input value={editForm.purchasedFrom ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, purchasedFrom: e.target.value }))} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Cost (₹)</label>
                  <input type="number" step="0.01" min="0" value={editForm.costPrice ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, costPrice: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="label">Selling (₹)</label>
                  <input type="number" step="0.01" min="0" value={editForm.sellingPrice ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, sellingPrice: e.target.value }))} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Quantity</label>
                  <input type="number" min="0" value={editForm.quantity ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, quantity: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <input value={editForm.unit ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, unit: e.target.value }))} className="input" placeholder="pcs" />
                </div>
              </div>
              <div>
                <label className="label">Min stock (alert)</label>
                <input type="number" min="0" value={editForm.minStock ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, minStock: e.target.value }))} className="input" placeholder="Optional" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveProduct} className="btn-primary" disabled={loading}>{loading ? "Saving…" : "Save"}</button>
              <button type="button" onClick={() => setEditProduct(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete product confirm */}
      {deleteProduct && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Delete this product?</h2>
            <p className="text-sm text-stone-600 mb-2">“{deleteProduct.name}” will be removed permanently. This cannot be undone.</p>
            <p className="text-sm text-amber-600 mb-4">If this product was used in any sale, those records remain; only the product entry is deleted.</p>
            <div className="flex gap-2">
              <button type="button" onClick={confirmDeleteProduct} className="btn-primary bg-red-600 hover:bg-red-700" disabled={loading}>{loading ? "Deleting…" : "Delete"}</button>
              <button type="button" onClick={() => setDeleteProduct(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
