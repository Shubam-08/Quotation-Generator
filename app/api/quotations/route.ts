import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Quotation from "@/lib/models/Quotation";

export async function GET() {
  await dbConnect();
  const quotations = await Quotation.find().populate("products.productId");
  return NextResponse.json(quotations);
}

export async function POST(req: Request) {
  await dbConnect();
  const data = await req.json();
  const newQuotation = await Quotation.create(data);
  return NextResponse.json(newQuotation, { status: 201 });
}
