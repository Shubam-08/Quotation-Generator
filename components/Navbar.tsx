"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, User, ShieldCheck, KeyRound } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logoqliteweb.png" 
                alt="Qlite Global Logo" 
                width={120} 
                height={40}
                className="h-18 w-auto mt-3"
                priority
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Products
            </Link>

            {status === "loading" ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : session ? (
              <>
                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <ShieldCheck size={18} />
                    Admin
                  </Link>
                )}

               {/* <Link
                  href="/change-password"
                  className="flex items-center gap-2 text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <KeyRound size={18} />
                  Change Password
                </Link>  */}

                <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={18} className="text-gray-400" />
                    <span className="text-white">{session.user.name}</span>
                    {session.user.role === "admin" && (
                      <span className="bg-yellow-400/10 text-yellow-400 text-xs px-2 py-1 rounded border border-yellow-400/20">
                        Admin
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
                  className="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-yellow-400 text-black hover:bg-yellow-500 px-4 py-2 rounded-md text-sm font-medium transition-colors"
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