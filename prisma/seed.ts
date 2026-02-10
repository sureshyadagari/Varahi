import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const names = ["Painting", "Hardware", "Plumbing", "Electrical"];
  for (const name of names) {
    const existing = await prisma.category.findFirst({ where: { name } });
    if (!existing) await prisma.category.create({ data: { name } });
  }
  const painting = await prisma.category.findFirst({ where: { name: "Painting" } });
  if (painting) {
    const existing = await prisma.product.findFirst({ where: { name: "Sample Paint 1L" } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: "Sample Paint 1L",
          categoryId: painting.id,
          costPrice: 200,
          sellingPrice: 280,
          quantity: 50,
          unit: "pcs",
          minStock: 10,
        },
      });
    }
  }
  console.log("Seed done.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
