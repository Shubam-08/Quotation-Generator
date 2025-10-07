import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET() {
  await dbConnect();
  const users = await User.find();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  await dbConnect();
  const data = await req.json();
  const newUser = await User.create(data);
  return NextResponse.json(newUser, { status: 201 });
}
