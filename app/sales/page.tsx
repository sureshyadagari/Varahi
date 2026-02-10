import { prisma } from "@/lib/prisma";
import { RecordSaleForm } from "./RecordSaleForm";

async function getData() {
  const [products, recentSales] = await Promise.all([
    prisma.product.findMany({
      where: { quantity: { gt: 0 } },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.sale.findMany({
      take: 20,
      include: { items: { include: { product: true } } },
      orderBy: { saleDate: "desc" },
    }),
  ]);
  return { products, recentSales };
}

export default async function SalesPage() {
  const { products, recentSales } = await getData();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Sales</h1>
        <RecordSaleForm products={products} />
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold text-stone-800">Recent sales</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Profit</th>
                <th className="px-4 py-3 font-medium">Items</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((s) => (
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
                  <td className="px-4 py-3">
                    {s.items.map((i) => `${i.product.name} × ${i.quantity}`).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentSales.length === 0 && (
          <p className="py-6 text-center text-stone-500">No sales recorded yet.</p>
        )}
      </div>
    </div>
  );
}
