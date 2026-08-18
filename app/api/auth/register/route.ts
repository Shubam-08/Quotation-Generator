// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const {
      name,
      email,
      password,
      mobile,
      companyName,
      department,
      role,
      country,
      city,
    } = await req.json();

    // Validate input
    if (!name || !email || !password || !mobile || !companyName || !department || !role || !country || !city) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (default role is "user" unless specified)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      companyName,
      department,
      role: role || "user",
      country,
      city,
    });

    await newUser.save();

    return NextResponse.json(
      {
        message: "Registration successful. Please wait for admin approval.",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
