import { prisma } from "@/lib/prisma";
import { ProductForm } from "./ProductForm";
import { ProductSearchTable } from "./ProductSearchTable";

async function getData() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { products, categories };
}

export default async function ProductsPage() {
  const { products, categories } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-stone-800">Products & Inventory</h1>
        <ProductForm categories={categories} />
      </div>

      <ProductSearchTable products={products} />
    </div>
  );
}
