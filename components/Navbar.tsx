"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User, ShieldCheck, KeyRound } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              QLite Global
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Products
            </Link>

            {status === "loading" ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : session ? (
              <>
                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <ShieldCheck size={18} />
                    Admin
                  </Link>
                )}

                <Link
                  href="/change-password"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <KeyRound size={18} />
                  Change Password
                </Link>

                <div className="flex items-center gap-3 border-l pl-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={18} className="text-gray-500" />
                    <span className="text-gray-700">{session.user.name}</span>
                    {session.user.role === "admin" && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
