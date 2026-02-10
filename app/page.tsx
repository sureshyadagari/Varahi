import Link from "next/link";
import { prisma } from "@/lib/prisma";

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday = start
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function getDashboardData() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [products, todaySales, weekMonthYearSales] = await Promise.all([
    prisma.product.findMany({ include: { category: true } }),
    prisma.sale.findMany({
      where: { saleDate: { gte: todayStart, lt: tomorrow } },
      include: { items: { include: { product: true } } },
    }),
    prisma.sale.findMany({
      where: { saleDate: { gte: yearStart } },
      select: { saleDate: true, totalAmount: true, totalProfit: true },
    }),
  ]);

  const stockValue = products.reduce((sum, p) => sum + p.quantity * p.costPrice, 0);
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const todayProfit = todaySales.reduce((sum, s) => sum + s.totalProfit, 0);

  let weekRevenue = 0, weekProfit = 0, monthRevenue = 0, monthProfit = 0, yearRevenue = 0, yearProfit = 0;
  for (const s of weekMonthYearSales) {
    const d = new Date(s.saleDate);
    if (d >= weekStart) {
      weekRevenue += s.totalAmount;
      weekProfit += s.totalProfit;
    }
    if (d >= monthStart) {
      monthRevenue += s.totalAmount;
      monthProfit += s.totalProfit;
    }
    if (d >= yearStart) {
      yearRevenue += s.totalAmount;
      yearProfit += s.totalProfit;
    }
  }

  const lowStockProducts = products.filter(
    (p) => (p.minStock != null && p.quantity < p.minStock) || p.quantity <= 0
  );

  return {
    stockValue,
    todayRevenue,
    todayProfit,
    weekRevenue,
    weekProfit,
    monthRevenue,
    monthProfit,
    yearRevenue,
    yearProfit,
    totalProducts: products.length,
    lowStockProducts,
    recentSales: todaySales.slice(0, 5),
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-stone-800">Business Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-stone-500">Stock value</p>
          <p className="text-2xl font-semibold text-stone-800">
            ₹{data.stockValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-stone-500">Products</p>
          <p className="text-2xl font-semibold text-stone-800">{data.totalProducts}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold text-stone-800">Sales &amp; profit</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4">
            <p className="text-sm text-stone-500">Today</p>
            <p className="text-xl font-semibold text-stone-800">
              ₹{data.todayRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-green-700">Profit ₹{data.todayProfit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4">
            <p className="text-sm text-stone-500">This week</p>
            <p className="text-xl font-semibold text-stone-800">
              ₹{data.weekRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-green-700">Profit ₹{data.weekProfit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4">
            <p className="text-sm text-stone-500">This month</p>
            <p className="text-xl font-semibold text-stone-800">
              ₹{data.monthRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-green-700">Profit ₹{data.monthProfit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4">
            <p className="text-sm text-stone-500">This year</p>
            <p className="text-xl font-semibold text-stone-800">
              ₹{data.yearRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-green-700">Profit ₹{data.yearProfit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-semibold text-stone-800">Low stock</h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-stone-500">No low stock items.</p>
          ) : (
            <ul className="space-y-2">
              {data.lowStockProducts.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="font-medium text-amber-600">
                    {p.quantity} {p.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-stone-800">Today&apos;s sales</h2>
            <Link href="/sales" className="text-sm text-brand-600 hover:underline">
              Record sale
            </Link>
          </div>
          {data.recentSales.length === 0 ? (
            <p className="text-stone-500">No sales today yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.recentSales.map((s) => (
                <li key={s.id} className="flex justify-between text-sm">
                  <span>Sale</span>
                  <span>
                    ₹{s.totalAmount.toLocaleString("en-IN")} (profit ₹
                    {s.totalProfit.toLocaleString("en-IN")})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
