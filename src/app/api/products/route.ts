import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('all') === 'true';
    
    const products = await prisma.product.findMany({
      where: fetchAll ? {} : { isVisible: true },
      orderBy: {
        id: 'asc'
      }
    });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const product = await prisma.product.create({
      data: {
        name: data.name,
        color: data.color || "",
        collection: data.collection || "",
        description: data.description || "",
        price: Number(data.price),
        stock: Number(data.stock),
        image: data.image,
        images: data.images || "[]",
        category: data.category || 'UNISEX'
      }
    });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
