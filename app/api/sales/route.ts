import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const query: { saleDate?: { gte?: Date; lte?: Date } } = {};
  if (from) query.saleDate = { ...query.saleDate, gte: new Date(from) };
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    query.saleDate = { ...query.saleDate, lte: toDate };
  }
  const sales = await prisma.sale.findMany({
    where: Object.keys(query).length ? query : undefined,
    include: { items: { include: { product: true } } },
    orderBy: { saleDate: "desc" },
  });
  return NextResponse.json(sales);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { items, note, customerName, customerAddress } = body as {
    items: { productId: string; quantity: number; unitPrice?: number }[];
    note?: string;
    customerName?: string;
    customerAddress?: string;
  };
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "At least one item required" }, { status: 400 });
  }

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalAmount = 0;
  let totalProfit = 0;
  const saleItems: { productId: string; quantity: number; unitPrice: number; total: number; costPrice: number; profit: number }[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
    const qty = Math.max(0, Math.floor(Number(item.quantity)) || 0);
    if (qty > product.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.name}. Available: ${product.quantity}` },
        { status: 400 }
      );
    }
    const unitPrice = Number(item.unitPrice) ?? product.sellingPrice;
    const total = qty * unitPrice;
    const costPrice = product.costPrice;
    const profit = (unitPrice - costPrice) * qty;
    totalAmount += total;
    totalProfit += profit;
    saleItems.push({ productId: product.id, quantity: qty, unitPrice, total, costPrice, profit });
  }

  const sale = await prisma.$transaction(async (tx) => {
    const newSale = await tx.sale.create({
      data: {
        totalAmount,
        totalProfit,
        note: note?.trim() || null,
        customerName: customerName?.trim() || null,
        customerAddress: customerAddress?.trim() || null,
      },
    });
    for (const it of saleItems) {
      await tx.saleItem.create({
        data: {
          saleId: newSale.id,
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.total,
          costPrice: it.costPrice,
          profit: it.profit,
        },
      });
    }
    for (const it of saleItems) {
      await tx.product.update({
        where: { id: it.productId },
        data: { quantity: { decrement: it.quantity } },
      });
    }
    return tx.sale.findUnique({
      where: { id: newSale.id },
      include: { items: { include: { product: true } } },
    });
  });

  return NextResponse.json(sale);
}
