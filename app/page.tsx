'use client';
const CURRENT_YEAR = new Date().getUTCFullYear();

import React from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Zap, 
  FileText, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium border border-yellow-400/20">
                <Sparkles className="w-4 h-4" />
                <span>Smart Product Configuration</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  QLite Global
                </span>
                <br />
                <span className="text-white">Product Configurator</span>
              </h1>
              
              <p className="text-xl text-gray-400 leading-relaxed">
                Transform your quotation process with our intelligent product configurator. 
                Select, customize, and export professional quotations in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="group inline-flex items-center justify-center gap-2 bg-yellow-400 text-black font-semibold px-8 py-4 rounded-xl shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:scale-105 transition-all duration-300"
                >
                  <span>Create Quotation</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 text-white font-semibold px-8 py-4 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <span>Learn More</span>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-yellow-400">500+</div>
                  <div className="text-sm text-gray-400">Products</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">1000+</div>
                  <div className="text-sm text-gray-400">Quotations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">99%</div>
                  <div className="text-sm text-gray-400">Accuracy</div>
                </div>
              </div>
            </div>

            {/* Right visual element */}
            <div className="relative hidden md:block">
              <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl p-8 shadow-2xl shadow-yellow-400/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-black rounded-2xl p-6 space-y-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center border border-yellow-400/30">
                      <ShoppingCart className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-white/20 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-white/10 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-white/10 rounded"></div>
                    <div className="h-2 bg-white/10 rounded w-5/6"></div>
                    <div className="h-2 bg-white/10 rounded w-4/6"></div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <div className="flex-1 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg"></div>
                    <div className="w-10 h-10 bg-white/10 rounded-lg border border-white/20"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="text-yellow-400">QLite</span> to make QUOTATIONS 
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the future of product quotation with our powerful features
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border border-white/10 hover:border-yellow-400/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-400/20 border border-yellow-400/20 group-hover:scale-110 transition-all">
                <ShoppingCart className="w-7 h-7 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Easy Selection</h3>
              <p className="text-gray-400 leading-relaxed">
Browse our wide range of products with detailed specifications and pick what suits your project.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border border-white/10 hover:border-yellow-400/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-400/20 border border-yellow-400/20 group-hover:scale-110 transition-all">
                <Zap className="w-7 h-7 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3"> Flexible Configuration</h3>
              <p className="text-gray-400 leading-relaxed">
               
Customize quantities and specifications seamlessly before generating your project overview.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border border-white/10 hover:border-yellow-400/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-400/20 border border-yellow-400/20 group-hover:scale-110 transition-all">
                <FileText className="w-7 h-7 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Export Anywhere</h3>
              <p className="text-gray-400 leading-relaxed">
                Download professional quotations in PDF or Excel format. Share with clients instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-3xl overflow-hidden shadow-2xl shadow-yellow-400/20">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="relative px-8 py-16 md:py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black/20 rounded-full mb-6">
                <Award className="w-8 h-8 text-black" />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Ready to Get Started?
              </h2>
              
              <p className="text-xl text-black/80 mb-10 max-w-2xl mx-auto">
                Join hundreds of businesses already using QLite Global to streamline their quotation process.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="group inline-flex items-center justify-center gap-2 bg-black text-yellow-400 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <span>Create Your First Quotation</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                <span className="text-yellow-400">QLite</span> Global
              </h3>
              <p className="text-gray-500 text-sm">
                © {CURRENT_YEAR} QLite Global. All rights reserved.
              </p>
            </div>
            
            <div className="flex gap-8 text-sm">
              <Link href="/products" className="hover:text-yellow-400 transition-colors">
                Products
              </Link>
              <Link href="#features" className="hover:text-yellow-400 transition-colors">
                Features
              </Link>
              <Link href="#" className="hover:text-yellow-400 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}