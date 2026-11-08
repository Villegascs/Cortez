import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchBcvEuroRate(): Promise<number | null> {
  // Primary API: DolarApi (ve.dolarapi.com) - official BCV Euro
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/euros/oficial', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      const rate = data?.promedio || data?.venta || data?.compra;
      if (rate && !isNaN(Number(rate)) && Number(rate) > 0) {
        return Number(rate);
      }
    }
  } catch (err) {
    console.warn('Error fetching from ve.dolarapi.com:', err);
  }

  // Fallback 1: DolarVZLA BCV current rates
  try {
    const res = await fetch('https://rates.dolarvzla.com/bcv/current.json', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      const rate = data?.current?.eur || data?.previous?.eur;
      if (rate && !isNaN(Number(rate)) && Number(rate) > 0) {
        return Number(rate);
      }
    }
  } catch (err) {
    console.warn('Error fetching from rates.dolarvzla.com:', err);
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    let settings = await prisma.settings.findFirst();
    
    // Check if we need to update the rate (every 6 hours)
    const sixHours = 6 * 60 * 60 * 1000;
    const now = new Date();

    const isExpired = !settings || (now.getTime() - new Date(settings.updatedAt).getTime() > sixHours);

    if (forceRefresh || isExpired) {
      try {
        const bcvEuroRate = await fetchBcvEuroRate();
        
        if (bcvEuroRate) {
          if (settings) {
            settings = await prisma.settings.update({
              where: { id: settings.id },
              data: { usdtRate: bcvEuroRate }
            });
          } else {
            settings = await prisma.settings.create({
              data: { id: 1, usdtRate: bcvEuroRate }
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch BCV Euro rate:", e);
      }
    }

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 1, usdtRate: 1004.95 }
      });
    }
    
    return NextResponse.json({ 
      rate: settings.usdtRate,
      bcvEuroRate: settings.usdtRate,
      updatedAt: settings.updatedAt 
    });
  } catch (error) {
    return NextResponse.json({ rate: 1004.95, error: "Failed to retrieve rate" }, { status: 500 });
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
    return NextResponse.json({ 
      rate: settings.usdtRate,
      bcvEuroRate: settings.usdtRate,
      updatedAt: settings.updatedAt 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update rate" }, { status: 500 });
  }
}
