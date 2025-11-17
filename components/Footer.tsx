"use client";

import { 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  ShoppingCart,
  Shield,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-black via-gray-900/50 to-black border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image 
                src="/logoqliteweb.png" 
                alt="Qlite Global Logo" 
                width={120} 
                height={40}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              The modern way to generate professional quotations. Fast, accurate, and effortless.
            </p>
            <div className="flex items-center gap-2 bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/30 w-fit">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-xs tracking-wide">
                BETA VERSION
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-400" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/products" 
                  className="text-gray-400 hover:text-yellow-400 transition-colors text-sm flex items-center gap-2 group"
                >
                  <ShoppingCart className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Browse Products
                </Link>
              </li>
              <li>
                <Link 
                  href="/cart" 
                  className="text-gray-400 hover:text-yellow-400 transition-colors text-sm flex items-center gap-2 group"
                >
                  <FileText className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  My Quotations
                </Link>
              </li>
              <li>
                <Link 
                  href="/login" 
                  className="text-gray-400 hover:text-yellow-400 transition-colors text-sm flex items-center gap-2 group"
                >
                  <Shield className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  href="/register" 
                  className="text-gray-400 hover:text-yellow-400 transition-colors text-sm flex items-center gap-2 group"
                >
                  <Shield className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
<div>
  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
    <Phone className="w-5 h-5 text-yellow-400" />
    Contact Us
  </h3>

  <ul className="space-y-6">

    {/* India Contact */}
    <li>
      <h4 className="text-yellow-400 font-semibold text-sm mb-2">India Office</h4>
      <a 
        href="mailto:ankit.mittal@qliteglobal.com" 
        className="text-gray-400 hover:text-yellow-400 transition-colors text-sm flex items-start gap-2 group"
      >
        <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span className="break-all">ankit.mittal@qliteglobal.com</span>
      </a>

      <p className="text-gray-400 text-sm mt-2 flex items-start gap-2">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-400" />
        <span className="leading-relaxed">
          Qlite Electronics Controls Private Limited<br />
          First Floor, Block -2, KSSIDC Complex, A-203,<br />
          Indra Nagar, Electronic City Phase I,<br />
          Electronic City, Bengaluru, Karnataka 560100
        </span>
      </p>
    </li>

    {/* Gulf Contact */}
    <li>
      <h4 className="text-yellow-400 font-semibold text-sm mb-2">Gulf Office</h4>
      <a 
        href="mailto:revant@qliteglobal.com" 
        className="text-gray-400 hover:text-yellow-400 transition-colors text-sm flex items-start gap-2 group"
      >
        <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span className="break-all">revant@qliteglobal.com</span>
      </a>
    </li>

  </ul>
</div>


          {/* Support & Resources */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-yellow-400" />
              Support
            </h3>
            <div className="space-y-4">
              {/* Beta Feedback Card */}
              <div className="bg-gradient-to-br from-yellow-400/10 to-yellow-500/5 border border-yellow-400/30 rounded-lg p-4 hover:border-yellow-400/50 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span className="text-yellow-400 font-semibold text-sm">
                    Beta Feedback
                  </span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed mb-3">
                  We're in beta testing. Your feedback helps us improve!
                </p>
                <a 
                  href="mailto:shubam@qliteglobal.com?subject=Beta Feedback"
                  className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-xs font-semibold transition-colors group"
                >
                  <Mail className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  Send Feedback
                </a>
              </div>

              {/* Help Resources */}
              <div className="space-y-2">
                <a 
                  href="mailto:sales@qliteglobal.com?subject=Support Request"
                  className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 text-sm transition-colors group"
                >
                  <Mail className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Get Help
                </a>
                <a 
                  href="mailto:sales@qliteglobal.com?subject=Report Issue"
                  className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 text-sm transition-colors group"
                >
                  <Shield className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Report Issue
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} <span className="text-white font-semibold">Qlite Global</span>. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
