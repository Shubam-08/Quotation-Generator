import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Quotation from "@/lib/models/Quotation";
import User from "@/lib/models/User";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  await dbConnect();
  const quotations = await Quotation.find().populate("products.productId");
  return NextResponse.json(quotations);
}

export async function POST(req: Request) {
  // Ensure user is logged in
  const authCheck = await requireAuth(req);
  if ("error" in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { session } = authCheck;

  try {
    await dbConnect();

    const body = await req.json();

    // Expect frontend to send the generated quotationNumber
    const { 
      quotationNumber, 
      clientName, 
      clientEmail, 
      products, 
      totalPrice, 
      pdfUrl, 
      status,
      userDepartment,
      userCountry,
      userMobile,
      userCompanyName
    } = body;

    console.log('Received status from frontend:', status);
    console.log('Full body received:', body);

    if (!quotationNumber || !clientName) {
      return NextResponse.json(
        { error: "quotationNumber and clientName are required" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newQuotation = await Quotation.create({
      clientName,
      clientEmail: clientEmail || '',
      products,
      totalPrice,
      pdfUrl,
      quotationNumber,
      status: status || 'final',
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      userDepartment: userDepartment || '',
      userCountry: userCountry || '',
      userMobile: userMobile || '',
      userCompanyName: userCompanyName || '',
    });

    return NextResponse.json(newQuotation, { status: 201 });
  } catch (error: any) {
    console.error("Error creating quotation:", error);
    return NextResponse.json({ error: error.message || "Failed to create quotation" }, { status: 500 });
  }
}
