import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    
    // Check if we need to update the rate (every 6 hours)
    const sixHours = 6 * 60 * 60 * 1000;
    const now = new Date();

    if (!settings || (now.getTime() - new Date(settings.updatedAt).getTime() > sixHours)) {
      try {
        const res = await fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=binance', { next: { revalidate: 0 } });
        const data = await res.json();
        const binanceRate = data?.monitors?.enparalelovzla?.price || data?.monitors?.binance?.price || null;
        
        if (binanceRate) {
          if (settings) {
            settings = await prisma.settings.update({
              where: { id: settings.id },
              data: { usdtRate: binanceRate }
            });
          } else {
            settings = await prisma.settings.create({
              data: { id: 1, usdtRate: binanceRate }
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch Binance rate:", e);
      }
    }

    if (!settings) {
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
