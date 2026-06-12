import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const documentType = formData.get('documentType') as string;
    const documentNumber = formData.get('documentNumber') as string;
    
    const paymentMethod = formData.get('paymentMethod') as string;
    const paymentBank = formData.get('paymentBank') as string | null;
    const paymentPhone = formData.get('paymentPhone') as string | null;
    const paymentDestDocument = formData.get('paymentDestDocument') as string | null;
    const paymentReference = formData.get('paymentReference') as string;
    
    const totalUsd = Number(formData.get('totalUsd'));
    const totalBs = Number(formData.get('totalBs'));
    const itemsRaw = formData.get('items') as string;
    const items = JSON.parse(itemsRaw);
    
    let paymentScreenshotPath = null;
    const screenshotFile = formData.get('paymentScreenshot') as File | null;
    
    if (screenshotFile && screenshotFile.size > 0) {
      const buffer = Buffer.from(await screenshotFile.arrayBuffer());
      const filename = `${Date.now()}_${screenshotFile.name.replaceAll(' ', '_')}`;
      const filepath = path.join(process.cwd(), 'public/uploads', filename);
      await writeFile(filepath, buffer);
      paymentScreenshotPath = `/uploads/${filename}`;
    }
    
    // Check if the user passed valid products
    const order = await prisma.order.create({
      data: {
        firstName,
        lastName,
        documentType,
        documentNumber,
        paymentMethod,
        paymentBank,
        paymentPhone,
        paymentDestDocument,
        paymentReference,
        paymentScreenshot: paymentScreenshotPath,
        totalUsd,
        totalBs,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}
