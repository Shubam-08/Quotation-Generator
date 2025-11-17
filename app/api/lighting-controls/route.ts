// app/api/lighting-controls/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LightingControl from '@/lib/models/LightingControl';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const controlType = searchParams.get('controlType') || '';
    const protocol = searchParams.get('protocol') || '';
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category) query.category = category;
    if (controlType) query.controlType = controlType;
    if (protocol) query.protocol = protocol;
    
    const controls = await LightingControl.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(controls);
  } catch (error: any) {
    console.error('Error fetching lighting controls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lighting controls', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const control = await LightingControl.create(body);
    
    return NextResponse.json(control, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lighting control:', error);
    return NextResponse.json(
      { error: 'Failed to create lighting control', details: error.message },
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
      return NextResponse.json({ error: 'Control ID is required' }, { status: 400 });
    }
    
    const control = await LightingControl.findByIdAndUpdate(_id, updateData, { new: true });
    
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }
    
    return NextResponse.json(control);
  } catch (error: any) {
    console.error('Error updating lighting control:', error);
    return NextResponse.json(
      { error: 'Failed to update lighting control', details: error.message },
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
      return NextResponse.json({ error: 'Control ID is required' }, { status: 400 });
    }
    
    const control = await LightingControl.findByIdAndDelete(id);
    
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Control deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting lighting control:', error);
    return NextResponse.json(
      { error: 'Failed to delete lighting control', details: error.message },
      { status: 500 }
    );
  }
}
