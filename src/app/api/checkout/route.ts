import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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
    
    const shippingMethod = formData.get('shippingMethod') as string || 'PICKUP';
    const shippingZone = formData.get('shippingZone') as string | null;
    const shippingAgency = formData.get('shippingAgency') as string | null;

    const totalUsd = Number(formData.get('totalUsd'));
    const totalBs = Number(formData.get('totalBs'));
    const itemsRaw = formData.get('items') as string;
    const items = JSON.parse(itemsRaw);
    
    let paymentScreenshotPath = null;
    const screenshotFile = formData.get('screenshot') as File | null;
    
    if (screenshotFile && screenshotFile.size > 0) {
      const buffer = Buffer.from(await screenshotFile.arrayBuffer());
      const base64Image = buffer.toString('base64');
      const imgbbFormData = new FormData();
      imgbbFormData.append('image', base64Image);
      
      const apiKey = process.env.IMGBB_API_KEY;
      if (apiKey) {
        const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: imgbbFormData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          paymentScreenshotPath = uploadData.data.url;
        }
      }
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
        shippingMethod,
        shippingZone,
        shippingAgency,
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

    // Deduct stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } }
      });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}
