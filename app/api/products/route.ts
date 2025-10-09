// app/api/product/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { convertUsdToInr } from "@/lib/usdToInr";
import { requireAdmin, forbiddenResponse, unauthorizedResponse } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  const authCheck = await requireAdmin(req);
  if ("error" in authCheck) {
    return authCheck.status === 401
      ? unauthorizedResponse(authCheck.error)
      : forbiddenResponse(authCheck.error);
  }

  try {
    await dbConnect();
    const data = await req.json();

    const existingProduct = await Product.findOne({ sku: data.sku });
    if (existingProduct) {
      return NextResponse.json(
        { error: `Model Number "${data.sku}" already exists.` },
        { status: 400 }
      );
    }

    let inrPrice = data.price ? await convertUsdToInr(Number(data.price)) : 0;
    inrPrice = Math.round(inrPrice * 10) / 10;

    const newProduct = new Product({
      ...data,
      price: inrPrice,
      images: data.images || [],
    });

    await newProduct.save();
    return NextResponse.json(newProduct, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authCheck = await requireAdmin(req);
  if ("error" in authCheck) {
    return authCheck.status === 401
      ? unauthorizedResponse(authCheck.error)
      : forbiddenResponse(authCheck.error);
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    const data = await req.json();
    if (data.price) {
      let inrPrice = await convertUsdToInr(Number(data.price));
      data.price = Math.round(inrPrice * 10) / 10;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updatedProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json(updatedProduct);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authCheck = await requireAdmin(req);
  if ("error" in authCheck) {
    return authCheck.status === 401
      ? unauthorizedResponse(authCheck.error)
      : forbiddenResponse(authCheck.error);
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ message: "Product deleted successfully", product: deletedProduct });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query: any = {};

    // Global search across selected fields
    const search = searchParams.get("search");
    if (search) {
      const rx = { $regex: search, $options: "i" };
      query.$or = [
        { sku: rx },
        { category: rx },
        { application: rx },
        { inputVoltage: rx },
        { lumen: rx },
        { beamAngle: rx },
        { ipRating: rx },
      ];
    }

    // Field-specific filters (combine with global search if provided)
    const fieldFilters = [
      "sku",
      "category",
      "application",
      "beamAngle",
      "inputVoltage",
      "ipRating",
    ];
    for (const field of fieldFilters) {
      const val = searchParams.get(field);
      if (val) {
        query[field] = { $regex: val, $options: "i" };
      }
    }

    // Wattage range filter
    const wattMin = searchParams.get("wattMin");
    const wattMax = searchParams.get("wattMax");
    if (wattMin || wattMax) {
      query.watt = {};
      if (wattMin) query.watt.$gte = Number(wattMin);
      if (wattMax && wattMax !== "Infinity") query.watt.$lte = Number(wattMax);
    }

    // Lumen range filter - extract numeric value from string like "1000 Lm"
    const lumenMin = searchParams.get("lumenMin");
    const lumenMax = searchParams.get("lumenMax");
    
    let products = await Product.find(query).sort({ createdAt: -1 });

    // Client-side lumen filtering since lumen is stored as string
    if (lumenMin || lumenMax) {
      products = products.filter((product: any) => {
        if (!product.lumen) return false;
        
        // Extract numeric value from lumen string (e.g., "1000 Lm" -> 1000)
        const lumenValue = parseFloat(product.lumen.toString().replace(/[^\d.]/g, ''));
        
        if (isNaN(lumenValue)) return false;
        
        if (lumenMin && lumenValue < Number(lumenMin)) return false;
        if (lumenMax && lumenMax !== "Infinity" && lumenValue > Number(lumenMax)) return false;
        
        return true;
      });
    }

    return NextResponse.json(products);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
