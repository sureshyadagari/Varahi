"use client";

import { useState, useMemo } from "react";

type Product = {
  id: string;
  name: string;
  brand: string | null;
  category: { name: string };
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  unit: string;
  minStock: number | null;
  purchasedFrom: string | null;
};

export function ProductSearchTable({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterPurchasedFrom, setFilterPurchasedFrom] = useState("");

  const filterOptions = useMemo(() => {
    const categories = [...new Set(products.map((p) => p.category.name))].sort();
    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort() as string[];
    const purchasedFromList = [...new Set(products.map((p) => p.purchasedFrom).filter(Boolean))].sort() as string[];
    return { categories, brands, purchasedFromList };
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

      {/* Filters: Category, Brand, Purchased from */}
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
            {filterOptions.categories.map((c) => (
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
    </div>
  );
}
