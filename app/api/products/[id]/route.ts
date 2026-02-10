import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(body.name != null && { name: String(body.name).trim() }),
      ...(body.categoryId != null && { categoryId: body.categoryId }),
      ...(body.costPrice != null && { costPrice: Number(body.costPrice) }),
      ...(body.sellingPrice != null && { sellingPrice: Number(body.sellingPrice) }),
      ...(body.quantity != null && { quantity: Number(body.quantity) }),
      ...(body.unit != null && { unit: body.unit }),
      ...(body.minStock != null && { minStock: body.minStock === "" ? null : Number(body.minStock) }),
      ...(body.sku != null && { sku: body.sku?.trim() || null }),
      ...(body.brand != null && { brand: body.brand?.trim() || null }),
      ...(body.purchasedFrom != null && { purchasedFrom: body.purchasedFrom?.trim() || null }),
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
