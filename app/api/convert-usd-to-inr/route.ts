import { NextResponse } from "next/server";
import { convertUsdToInr } from "@/lib/usdToInr";

export async function POST(req: Request) {
  try {
    const { usdAmount } = await req.json();

    if (!usdAmount || isNaN(Number(usdAmount))) {
      return NextResponse.json(
        { error: "Invalid USD amount" },
        { status: 400 }
      );
    }

    const inrAmount = await convertUsdToInr(Number(usdAmount));
    
    return NextResponse.json({ 
      usdAmount: Number(usdAmount),
      inrAmount: inrAmount,
      rate: inrAmount / Number(usdAmount)
    });
  } catch (err: any) {
    console.error("Error converting USD to INR:", err);
    return NextResponse.json(
      { error: "Failed to convert currency" },
      { status: 500 }
    );
  }
}
