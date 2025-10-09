// lib/auth-helpers.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getSession(req: Request) {
  return await getServerSession(authOptions);
}

export async function requireAuth(req: Request) {
  const session = await getSession(req);
  if (!session) return { error: "Unauthorized", status: 401 };
  return { session };
}

export async function requireAdmin(req: Request) {
  const session = await getSession(req);
  if (!session) return { error: "Unauthorized", status: 401 };
  if (session.user.role !== "admin") {
    return { error: "Forbidden: Admin access required", status: 403 };
  }
  return { session };
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}
