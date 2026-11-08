import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { fetchBcvEuroRate } from '../../settings/route';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bcvEuroRate = await fetchBcvEuroRate();
    
    if (!bcvEuroRate) {
      return NextResponse.json({ error: "Could not fetch BCV Euro rate from upstream APIs" }, { status: 502 });
    }

    let settings = await prisma.settings.findFirst();
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

    return NextResponse.json({
      success: true,
      message: "Tasa del Euro BCV actualizada exitosamente",
      rate: settings.usdtRate,
      updatedAt: settings.updatedAt
    });
  } catch (error: any) {
    console.error("Cron update BCV rate error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

