'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Zap, 
  FileText, 
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Download,
  Sparkles,
  Clock,
  Globe,
  Shield
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black overflow-hidden">

      {/* Hero Section with Animated Background */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-20">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Streamline Your Quotation Process</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 leading-tight">
            <span className="text-white block mb-2">Create Quotations</span>
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">In Minutes</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            The modern way to generate professional quotations. Fast, accurate, and effortless.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/products"
              className="group relative inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-10 py-5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/50"
            >
              <span className="text-lg">Start Creating</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold px-10 py-5 rounded-xl border border-white/10 hover:border-yellow-400/50 transition-all duration-300 backdrop-blur-sm"
            >
              <span className="text-lg">See How It Works</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-2">500+</div>
              <div className="text-sm md:text-base text-gray-500">Products</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-2">1K+</div>
              <div className="text-sm md:text-base text-gray-500">Quotations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-2">99%</div>
              <div className="text-sm md:text-base text-gray-500">Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gradient-to-b from-black via-gray-900/50 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 hover:border-yellow-400/50 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Lightning Fast</h3>
                <p className="text-sm text-gray-400">Generate quotations in under 2 minutes</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 hover:border-yellow-400/50 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Multi-Currency</h3>
                <p className="text-sm text-gray-400">Support for USD, INR, and more</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 hover:border-yellow-400/50 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Download className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Export Ready</h3>
                <p className="text-sm text-gray-400">PDF & Excel formats available</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 hover:border-yellow-400/50 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Secure & Safe</h3>
                <p className="text-sm text-gray-400">Your data is protected always</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Three simple steps to your perfect quotation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-yellow-400/50 via-yellow-400/20 to-yellow-400/50"></div>

            {/* Step 1 */}
            <div className="relative text-center group">
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 text-black rounded-2xl text-3xl font-bold mx-auto mb-6 shadow-lg shadow-yellow-400/50 group-hover:scale-110 transition-transform">
                <span>1</span>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 hover:border-yellow-400/50 transition-all">
                <ShoppingCart className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Browse Products</h3>
                <p className="text-gray-400">
                  Explore our extensive catalog with detailed specifications
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center group">
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 text-black rounded-2xl text-3xl font-bold mx-auto mb-6 shadow-lg shadow-yellow-400/50 group-hover:scale-110 transition-transform">
                <span>2</span>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 hover:border-yellow-400/50 transition-all">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Customize</h3>
                <p className="text-gray-400">
                  Select quantities and configure product options
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative text-center group">
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 text-black rounded-2xl text-3xl font-bold mx-auto mb-6 shadow-lg shadow-yellow-400/50 group-hover:scale-110 transition-transform">
                <span>3</span>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 hover:border-yellow-400/50 transition-all">
                <FileText className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Export</h3>
                <p className="text-gray-400">
                  Download professional quotations instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black via-gray-900/50 to-black">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl p-1 shadow-2xl shadow-yellow-400/30">
            <div className="bg-black rounded-3xl p-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Join businesses worldwide using Qlite Global for faster, smarter quotations
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-10 py-5 rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/50"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}