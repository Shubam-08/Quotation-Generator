// app/api/led-displays/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LedDisplay from '@/lib/models/LedDisplay';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const application = searchParams.get('application') || '';
    const pixelPitch = searchParams.get('pixelPitch') || '';
    const ipRating = searchParams.get('ipRating') || '';
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category) query.category = category;
    if (application) query.application = application;
    if (pixelPitch) query.pixelPitch = pixelPitch;
    if (ipRating) query.ipRating = ipRating;
    
    const displays = await LedDisplay.find(query).sort({ createdAt: -1 });
    
    const response = NextResponse.json(displays);
    // Cache for 5 minutes, revalidate in background
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (error: any) {
    console.error('Error fetching LED displays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LED displays', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    console.log('Creating LED display with data:', JSON.stringify(body, null, 2));
    console.log('Cabinet Material Variants:', body.cabinetMaterialVariants);
    
    const display = await LedDisplay.create(body);
    console.log('Created display:', display._id, 'with variants:', display.cabinetMaterialVariants);
    
    return NextResponse.json(display, { status: 201 });
  } catch (error: any) {
    console.error('Error creating LED display:', error);
    return NextResponse.json(
      { error: 'Failed to create LED display', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { _id, ...updateData } = body;
    
    if (!_id) {
      return NextResponse.json({ error: 'Display ID is required' }, { status: 400 });
    }
    
    console.log('Updating LED display:', _id);
    console.log('Cabinet Material Variants:', updateData.cabinetMaterialVariants);
    
    const display = await LedDisplay.findByIdAndUpdate(_id, updateData, { new: true });
    
    if (!display) {
      return NextResponse.json({ error: 'Display not found' }, { status: 404 });
    }
    
    console.log('Updated display with variants:', display.cabinetMaterialVariants);
    
    return NextResponse.json(display);
  } catch (error: any) {
    console.error('Error updating LED display:', error);
    return NextResponse.json(
      { error: 'Failed to update LED display', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Display ID is required' }, { status: 400 });
    }
    
    const display = await LedDisplay.findByIdAndDelete(id);
    
    if (!display) {
      return NextResponse.json({ error: 'Display not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Display deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting LED display:', error);
    return NextResponse.json(
      { error: 'Failed to delete LED display', details: error.message },
      { status: 500 }
    );
  }
}
