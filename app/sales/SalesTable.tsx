"use client";

import { useState } from "react";
import Link from "next/link";

type SaleItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: { name: string };
};

type Sale = {
  id: string;
  saleDate: string;
  totalAmount: number;
  totalProfit: number;
  note: string | null;
  customerName: string | null;
  customerAddress: string | null;
  items: SaleItem[];
};

export function SalesTable({ sales }: { sales: Sale[] }) {
  const [detailSale, setDetailSale] = useState<Sale | null>(null);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [editForm, setEditForm] = useState({ customerName: "", customerAddress: "", note: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEdit(sale: Sale) {
    setEditSale(sale);
    setEditForm({
      customerName: sale.customerName ?? "",
      customerAddress: sale.customerAddress ?? "",
      note: sale.note ?? "",
    });
    setError(null);
  }

  async function saveEdit() {
    if (!editSale) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/${editSale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditSale(null);
      window.location.reload();
    } catch {
      setError("Failed to update sale.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sales/${deleteConfirm.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteConfirm(null);
      window.location.reload();
    } catch {
      setError("Failed to delete sale. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Profit</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-b border-stone-100">
                  <td className="px-4 py-3">
                    {new Date(s.saleDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">₹{s.totalAmount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-green-700">₹{s.totalProfit.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-stone-600">{s.customerName ?? "–"}</td>
                  <td className="px-4 py-3">
                    {s.items.map((i) => `${i.product.name} × ${i.quantity}`).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setDetailSale(s)}
                        className="text-brand-600 hover:underline text-xs"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="text-brand-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDeleteConfirm(s); setError(null); }}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sales.length === 0 && (
          <p className="py-6 text-center text-stone-500">No sales recorded yet.</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* View details modal */}
      {detailSale && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sale details</h2>
              <button type="button" onClick={() => setDetailSale(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <p><span className="text-stone-500">Date:</span> {new Date(detailSale.saleDate).toLocaleString("en-IN")}</p>
              <p><span className="text-stone-500">Customer name:</span> {detailSale.customerName || "–"}</p>
              <p><span className="text-stone-500">Customer address:</span> {detailSale.customerAddress || "–"}</p>
              {detailSale.note && <p><span className="text-stone-500">Note:</span> {detailSale.note}</p>}
            </div>
            <table className="w-full text-sm mt-3 border-t border-stone-200 pt-3">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 font-medium">Item</th>
                  <th className="text-right py-2 font-medium">Qty</th>
                  <th className="text-right py-2 font-medium">Price</th>
                  <th className="text-right py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {detailSale.items.map((i) => (
                  <tr key={i.id} className="border-b border-stone-100">
                    <td className="py-2">{i.product.name}</td>
                    <td className="text-right py-2">{i.quantity}</td>
                    <td className="text-right py-2">₹{i.unitPrice.toLocaleString("en-IN")}</td>
                    <td className="text-right py-2">₹{i.total.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-right font-medium">Total: ₹{detailSale.totalAmount.toLocaleString("en-IN")} (Profit: ₹{detailSale.totalProfit.toLocaleString("en-IN")})</p>
          </div>
        </div>
      )}

      {/* Edit modal (customer name, address, note) */}
      {editSale && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit sale details</h2>
              <button type="button" onClick={() => setEditSale(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <p className="text-xs text-stone-500 mb-3">Date: {new Date(editSale.saleDate).toLocaleDateString("en-IN")} · ₹{editSale.totalAmount.toLocaleString("en-IN")}</p>
            <div className="space-y-3">
              <div>
                <label className="label">Customer name (optional)</label>
                <input
                  value={editForm.customerName}
                  onChange={(e) => setEditForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Customer address (optional)</label>
                <input
                  value={editForm.customerAddress}
                  onChange={(e) => setEditForm((f) => ({ ...f, customerAddress: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Note (optional)</label>
                <input
                  value={editForm.note}
                  onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))}
                  className="input"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveEdit} className="btn-primary" disabled={loading}>{loading ? "Saving…" : "Save"}</button>
              <button type="button" onClick={() => setEditSale(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Delete this sale?</h2>
            <p className="text-sm text-stone-600 mb-4">
              This will restore stock for all items in this sale. This cannot be undone.
            </p>
            <p className="text-sm mb-4">
              Sale of ₹{deleteConfirm.totalAmount.toLocaleString("en-IN")} on {new Date(deleteConfirm.saleDate).toLocaleDateString("en-IN")}.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={confirmDelete} className="btn-primary bg-red-600 hover:bg-red-700" disabled={loading}>{loading ? "Deleting…" : "Delete"}</button>
              <button type="button" onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
