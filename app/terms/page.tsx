'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, AlertCircle, DollarSign, Package, Scale, Shield } from 'lucide-react';

export default function TermsConditionsPage() {
  const [isDarkMode] = useState(true);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all mb-6 ${
              isDarkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-yellow-400" />
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Terms & Conditions
            </h1>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Last Updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className={`rounded-xl p-8 ${
          isDarkMode ? 'bg-gray-900/50 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Welcome to Qlite Global's quotation platform. By accessing or using our services, you agree to be bound 
                by these Terms and Conditions. Please read them carefully before using our platform.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-yellow-400" />
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  1. Service Description
                </h2>
              </div>
              <div className={`space-y-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>
                  Qlite Global provides an online quotation generation platform for LED lighting products. Our service allows 
                  you to browse products, select items, and generate quotations for your business needs.
                </p>
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    BETA VERSION: This platform is currently in beta testing. Features may change, and we appreciate your feedback.
                  </p>
                </div>
              </div>
            </section>

            {/* User Accounts */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-yellow-400" />
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  2. User Accounts
                </h2>
              </div>
              <ul className={`list-disc list-inside space-y-2 text-sm ml-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </section>

            {/* Quotations & Pricing */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  3. Quotations & Pricing
                </h2>
              </div>
              <div className={`space-y-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                    IMPORTANT: Quotations are Estimates Only
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Quotations generated are estimates and not binding offers</li>
                    <li>Quotations are valid for 30 days from the date of generation</li>
                    <li>Prices are subject to change based on market conditions</li>
                    <li>Final pricing will be confirmed upon order placement</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Multi-Currency Pricing:</h3>
                  <p>
                    Prices displayed in various currencies are converted using current exchange rates and are for reference only. 
                    Final invoicing will be in USD or as otherwise agreed in writing.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Address Selection:</h3>
                  <p>
                    Users may select their preferred Qlite office address for quotations. This selection does not guarantee 
                    product availability from that specific location.
                  </p>
                </div>
              </div>
            </section>

            {/* Product Information */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                4. Product Information
              </h2>
              <ul className={`list-disc list-inside space-y-2 text-sm ml-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Product specifications and descriptions are approximate</li>
                <li>Product images may differ from actual products</li>
                <li>Technical data is subject to change without notice</li>
                <li>Users should verify specifications before placing orders</li>
                <li>We strive for accuracy but do not guarantee error-free information</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                5. Intellectual Property
              </h2>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                All content on this platform, including product images, descriptions, datasheets, and software, is the 
                property of Qlite Global or its licensors. You may not reproduce, distribute, or create derivative works 
                without our written permission.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-yellow-400" />
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  6. Limitation of Liability
                </h2>
              </div>
              <div className={`space-y-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>
                  The platform is provided "as is" without warranties of any kind. To the maximum extent permitted by law:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We are not liable for quotation errors or pricing discrepancies</li>
                  <li>We are not responsible for third-party service failures</li>
                  <li>We are not liable for indirect, incidental, or consequential damages</li>
                  <li>Our maximum liability is limited to the value of the disputed quotation</li>
                </ul>
              </div>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                7. User Conduct
              </h2>
              <p className={`text-sm leading-relaxed mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                You agree not to:
              </p>
              <ul className={`list-disc list-inside space-y-2 text-sm ml-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Use the platform for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the platform's operation</li>
                <li>Upload malicious code or viruses</li>
                <li>Scrape or harvest data without permission</li>
                <li>Impersonate others or provide false information</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                8. Termination
              </h2>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We reserve the right to suspend or terminate your access to the platform at any time, without notice, 
                for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, 
                or for any other reason.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                9. Governing Law
              </h2>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                These Terms shall be governed by and construed in accordance with the laws of the Kingdom of Bahrain, 
                without regard to its conflict of law provisions. Any disputes shall be subject to the exclusive 
                jurisdiction of the courts of Bahrain.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                10. Changes to Terms
              </h2>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes 
                by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the 
                platform after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Contact */}
            <section className={`p-6 rounded-lg ${
              isDarkMode ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <h2 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                Contact Us
              </h2>
              <p className={`text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p><strong>Email:</strong> sales@qliteglobal.com</p>
                <p><strong>Phone:</strong> +973 3330 8969</p>
                <p><strong>Address:</strong> QLITE CO. WLL, P.O. Box: 1858, Manama, Kingdom of Bahrain</p>
              </div>
            </section>

            {/* Acceptance */}
            <section className={`p-4 rounded-lg border-2 ${
              isDarkMode ? 'border-yellow-400/50 bg-yellow-400/5' : 'border-yellow-400 bg-yellow-50'
            }`}>
              <p className={`text-sm font-semibold text-center ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                By using this platform, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
