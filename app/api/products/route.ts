import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, categoryId, costPrice, sellingPrice, quantity, unit, minStock, sku, brand, purchasedFrom } = body;
  if (!name?.trim() || !categoryId) {
    return NextResponse.json({ error: "Name and category required" }, { status: 400 });
  }
  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      categoryId,
      costPrice: Number(costPrice) ?? 0,
      sellingPrice: Number(sellingPrice) ?? 0,
      quantity: Number(quantity) ?? 0,
      unit: (unit as string) || "pcs",
      minStock: minStock != null ? Number(minStock) : null,
      sku: sku?.trim() || null,
      brand: brand?.trim() || null,
      purchasedFrom: purchasedFrom?.trim() || null,
    },
  });
  return NextResponse.json(product);
}
