import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.settings.create({
    data: {
      usdtRate: 40.5
    }
  });

  await prisma.product.createMany({
    data: [
      {
        name: "cortez aviator",
        color: "Gold & Dark",
        price: 120,
        stock: 5,
        image: "/images/lente_1_1781241251041.png",
        description: "Diseño clásico y atemporal. Montura metálica ligera y lentes polarizadas para máxima protección."
      },
      {
        name: "cortez wayfarer",
        color: "Matte Black",
        price: 150,
        stock: 0,
        image: "/images/lente_2_1781241268932.png",
        description: "El icono reinventado. Acabado mate sofisticado con la más alta tecnología en protección UV."
      },
      {
        name: "cortez vintage",
        color: "Tortoise",
        price: 110,
        stock: 10,
        image: "/images/lente_3_1781241285563.png",
        description: "Estilo retro con toques modernos. Patrón tortoise exclusivo hecho a mano."
      }
    ]
  });
  console.log("Database seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
