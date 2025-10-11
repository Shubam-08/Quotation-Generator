"use client";

import { MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} QLite Global. All rights reserved.
          </div>
          
          <div className="flex items-center gap-2 bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/30">
            <MessageCircle size={16} className="text-yellow-400" />
            <span className="text-yellow-400 font-medium text-sm">
              We're in beta testing — feedback is welcome
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
