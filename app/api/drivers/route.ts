// app/api/drivers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Driver from '@/lib/models/Driver';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const wattage = searchParams.get('wattage');
    const voltage = searchParams.get('voltage');
    const all = searchParams.get('all'); // For admin to get all drivers

    let query: any = {};

    // Only filter by inStock if not requesting all drivers (admin view)
    if (!all) {
      query.inStock = true;
    }

    // Filter drivers based on product wattage
    if (wattage) {
      const wattValue = parseFloat(wattage);
      if (!isNaN(wattValue)) {
        query['wattageRange.min'] = { $lte: wattValue };
        query['wattageRange.max'] = { $gte: wattValue };
      }
    }

    // Filter by output voltage if specified
    if (voltage) {
      query.outputVoltage = new RegExp(voltage, 'i');
    }

    const drivers = await Driver.find(query).sort({ price: 1 });

    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const driver = await Driver.create(body);

    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    );
  }
}
