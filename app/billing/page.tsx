import { prisma } from "@/lib/prisma";
import { BillingPanel } from "./BillingPanel";

async function getProducts() {
  return prisma.product.findMany({
    where: { quantity: { gt: 0 } },
    include: { category: true },
    orderBy: { name: "asc" },
  });
}

export default async function BillingPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Billing</h1>
      <p className="text-stone-600">
        Type item name to search, select product, enter quantity. Cost price is shown so you don’t sell below actual price.
      </p>
      <BillingPanel products={products} />
    </div>
  );
}
