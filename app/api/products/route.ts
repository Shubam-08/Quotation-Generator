// app/api/product/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { convertUsdToInr } from "@/lib/usdToInr"; // import conversion module

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

    // Convert USD → INR dynamically
    let inrPrice = data.price
      ? await convertUsdToInr(Number(data.price))
      : 0; // fallback if missing

    // Round to 1 decimal place
    inrPrice = Math.round(inrPrice * 10) / 10;

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
      ipRating: data.ipRating,
      price: inrPrice,         // save converted INR price rounded
      images: data.images || [],
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

    const search = searchParams.get("search") || "";
    const sku = searchParams.get("sku") || "";
    const category = searchParams.get("category") || "";
    const application = searchParams.get("application") || "";
    const beamAngle = searchParams.get("beamAngle") || "";
    const wattMin = searchParams.get("wattMin");
    const wattMax = searchParams.get("wattMax");
    const lumenMin = searchParams.get("lumenMin");
    const lumenMax = searchParams.get("lumenMax");
    const inputVoltage = searchParams.get("inputVoltage") || "";
    const cutOut = searchParams.get("cutOut") || "";
    const dimension = searchParams.get("dimension") || "";
    const ipRating = searchParams.get("ipRating") || ""; 
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const query: any = {};

    // Global search across all fields
    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { application: { $regex: search, $options: "i" } },
        { inputVoltage: { $regex: search, $options: "i" } },
        { lumen: { $regex: search, $options: "i" } },
        { beamAngle: { $regex: search, $options: "i" } },
        { dimension: { $regex: search, $options: "i" } },
        { cutOut: { $regex: search, $options: "i" } },
        { ipRating: { $regex: search, $options: "i" } },
      ];
    }

    // Specific field filters
    if (sku) query.sku = { $regex: sku, $options: "i" };
    if (category) query.category = { $regex: category, $options: "i" };
    if (application) query.application = { $regex: application, $options: "i" };
    if (beamAngle) query.beamAngle = { $regex: beamAngle, $options: "i" };
    if (inputVoltage) query.inputVoltage = { $regex: inputVoltage, $options: "i" };
    if (cutOut) query.cutOut = { $regex: cutOut, $options: "i" };
    if (dimension) query.dimension = { $regex: dimension, $options: "i" };
    if (ipRating) query.ipRating = { $regex: ipRating, $options: "i" };

    // Wattage range filter
    if (wattMin || wattMax) query.watt = {};
    if (wattMin) query.watt.$gte = Number(wattMin);
    if (wattMax) query.watt.$lte = Number(wattMax);

    // Lumen range filter - extract numeric value from string like "1000 Lm" or "1000"
    if (lumenMin || lumenMax) {
      const products = await Product.find(query);
      const filteredProducts = products.filter((product: any) => {
        if (!product.lumen) return false;
        
        // Extract numeric value from lumen string (e.g., "1000 Lm" -> 1000)
        const lumenValue = parseFloat(product.lumen.toString().replace(/[^\d.]/g, ''));
        
        if (isNaN(lumenValue)) return false;
        
        if (lumenMin && lumenValue < Number(lumenMin)) return false;
        if (lumenMax && lumenValue > Number(lumenMax)) return false;
        
        return true;
      });

      const sortOrder = order === "asc" ? 1 : -1;
      const sortedProducts = filteredProducts.sort((a: any, b: any) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (aVal < bVal) return -sortOrder;
        if (aVal > bVal) return sortOrder;
        return 0;
      });

      return NextResponse.json(sortedProducts);
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sort: any = { [sortBy]: sortOrder };

    const products = await Product.find(query).sort(sort);

    return NextResponse.json(products);
  } catch (err: any) {
    console.error("Error fetching products:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
