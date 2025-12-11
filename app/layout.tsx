// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductChatbot from "@/components/ProductChatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Focused metadata for quotation platform
export const metadata: Metadata = {
  title: "QLite Global | Automatic Quotation Generator",
  description:
    "Generate professional product quotations in minutes. QLite Global helps businesses automate pricing, proposals, and client management efficiently.",
  keywords: [
    "automatic quotation generator",
    "quotation software",
    "product quotation system",
    "quote automation",
    "quotation management",
    "proposal generator",
    "sales automation",
    "instant quote builder",
    "LED lighting quotation",
    "business proposal tool",
  ],
  authors: [{ name: "QLite Global" }],
  creator: "QLite Global",
  publisher: "QLite Global",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logoqliteweb.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/logoqliteweb.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "QLite Global | Instant Quotation Automation",
    description:
      "QLite Global enables instant product quotation generation with smart automation tools. Create, manage, and send quotes within minutes.",
    url: "https://quotation.qrpixeldesign.com",
    siteName: "QLite Global",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QLite Global - Automatic Quotation Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QLite Global | Automatic Quotation Generator",
    description:
      "Generate professional product quotations in minutes with smart automation tools.",
    images: ["/og-image.png"],
    creator: "@qliteglobal",
  },
  verification: {
    // Add your verification codes here when available
    // google: "abc123xyz456",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  metadataBase: new URL("https://quotation.qrpixeldesign.com"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="organization-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "QLite Global",
            url: "https://quotation.qrpixeldesign.com",
            logo: "https://quotation.qrpixeldesign.com/logo.jpg",
          })}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white flex flex-col min-h-screen`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          {/*<ProductChatbot />*/}
        </Providers>
      </body>
    </html>
  );
}
