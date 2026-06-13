import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const data = await request.json();
    const product = await prisma.product.update({
      where: { id: Number(resolvedParams.id) },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        color: data.color !== undefined ? data.color : undefined,
        description: data.description !== undefined ? data.description : undefined,
        price: data.price !== undefined ? Number(data.price) : undefined,
        stock: data.stock !== undefined ? Number(data.stock) : undefined,
        isVisible: data.isVisible !== undefined ? Boolean(data.isVisible) : undefined,
        image: data.image !== undefined ? data.image : undefined,
        images: data.images !== undefined ? data.images : undefined,
        category: data.category !== undefined ? data.category : undefined,
        features: data.features !== undefined ? data.features : undefined
      }
    });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await prisma.product.delete({
      where: { id: Number(resolvedParams.id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
