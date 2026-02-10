import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecordSaleForm } from "./RecordSaleForm";
import { SalesTable } from "./SalesTable";

async function getData() {
  const [products, sales] = await Promise.all([
    prisma.product.findMany({
      where: { quantity: { gt: 0 } },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.sale.findMany({
      take: 100,
      include: { items: { include: { product: true } } },
      orderBy: { saleDate: "desc" },
    }),
  ]);
  return { products, sales };
}

export default async function SalesPage() {
  const { products, sales } = await getData();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-stone-800">Sales</h1>
        <div className="flex gap-2">
          <Link href="/billing" className="btn-primary">
            New bill
          </Link>
          <RecordSaleForm products={products} />
        </div>
      </div>

      <p className="text-sm text-stone-600">View full details, or edit customer name/address/note. Delete restores stock.</p>
      <SalesTable sales={sales} />
    </div>
  );
}
