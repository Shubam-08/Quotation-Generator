import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const data = await req.json();

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: data.sku });
    if (existingProduct) {
      return NextResponse.json(
        { error: `Model Number "${data.sku}" already exists.` },
        { status: 400 }
      );
    }

    // Create new product including price
    const newProduct = new Product({
  sku: data.sku,
  category: data.category,
  application: data.application,
  inputVoltage: data.inputVoltage,
  watt: data.watt,
  lumen: data.lumen,
  beamAngle: data.beamAngle,
  dimension: data.dimension,
  cutOut: data.cutOut,
  price: data.price,
  images: data.images || [] // <-- add images array
});

    await newProduct.save();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const wattMin = searchParams.get('wattMin');
    const wattMax = searchParams.get('wattMax');
    const lumenMin = searchParams.get('lumenMin');
    const lumenMax = searchParams.get('lumenMax');
    const inputVoltage = searchParams.get('inputVoltage') || '';
    const cutOut = searchParams.get('cutOut') || '';
    const dimension = searchParams.get('dimension') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const query: any = {};

    if (search) query.sku = { $regex: search, $options: 'i' };
    if (category) query.category = { $regex: category, $options: 'i' };
    if (inputVoltage) query.inputVoltage = { $regex: inputVoltage, $options: 'i' };
    if (cutOut) query.cutOut = { $regex: cutOut, $options: 'i' };
    if (dimension) query.dimension = { $regex: dimension, $options: 'i' };

    if (wattMin || wattMax) query.watt = {};
    if (wattMin) query.watt.$gte = Number(wattMin);
    if (wattMax) query.watt.$lte = Number(wattMax);

    if (lumenMin || lumenMax) query.lumen = {};
    if (lumenMin) query.lumen.$gte = Number(lumenMin);
    if (lumenMax) query.lumen.$lte = Number(lumenMax);

    const sortOrder = order === 'asc' ? 1 : -1;
    const sort: any = { [sortBy]: sortOrder };

    const products = await Product.find(query).sort(sort);

    return NextResponse.json(products);
  } catch (err: any) {
    console.error('Error fetching products:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

