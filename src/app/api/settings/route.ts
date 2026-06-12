import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      // Create default rate (e.g. 40.5 Bs/USDT)
      settings = await prisma.settings.create({
        data: { id: 1, usdtRate: 40.5 }
      });
    }
    return NextResponse.json({ rate: settings.usdtRate });
  } catch (error) {
    return NextResponse.json({ rate: 40.5 }, { status: 500 }); // fallback
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRate = Number(body.rate);
    
    if (isNaN(newRate)) throw new Error("Invalid rate");
    
    let settings = await prisma.settings.findFirst();
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: { usdtRate: newRate }
      });
    } else {
      settings = await prisma.settings.create({
        data: { id: 1, usdtRate: newRate }
      });
    }
    return NextResponse.json({ rate: settings.usdtRate });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update rate" }, { status: 500 });
  }
}
