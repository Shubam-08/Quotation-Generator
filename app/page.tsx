'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            QLite Global <br /> Product Configurator
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10">
            Explore, configure, and download tailored product selections for your next project.
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-blue-900 font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
          >
            Explore Products
          </Link>
        </div>
      </section>

      {/* Features / Why QLite Global */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <h2 className="text-2xl font-bold mb-3 text-blue-900">Easy Selection</h2>
            <p className="text-gray-600">
              Browse our wide range of products with detailed specifications and pick what suits your project.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <h2 className="text-2xl font-bold mb-3 text-blue-900">Flexible Configuration</h2>
            <p className="text-gray-600">
              Customize quantities and specifications seamlessly before generating your project overview.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <h2 className="text-2xl font-bold mb-3 text-blue-900">Export & Share</h2>
            <p className="text-gray-600">
              Download your selected products in PDF or Excel format, ready to share with your team or clients.
            </p>
          </div>

        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-blue-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-blue-900">
            Start Your Project Today
          </h2>
          <p className="text-gray-700 mb-8">
            Quickly configure your products and get a comprehensive overview ready for planning and budgeting.
          </p>
          <Link
            href="/products"
            className="inline-block bg-blue-900 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-blue-800 transition"
          >
            Start Configuring
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-200 py-10 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} QLite Global. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
