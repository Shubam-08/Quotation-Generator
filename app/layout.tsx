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
  title: "Qlite Global | Automatic Quotation Generator",
  description:
    "Generate professional product quotations in minutes. Qlite Global helps businesses automate pricing, proposals, and client management efficiently.",
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
  authors: [{ name: "Qlite Global" }],
  creator: "Qlite Global",
  publisher: "Qlite Global",
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
      { url: "/logoqliteweb.png", type: "image/png" },
    ],
    apple: [
      { url: "/logoqliteweb.png", type: "image/png" },
    ],
    shortcut: "/logoqliteweb.png",
  },
  openGraph: {
    title: "Qlite Global | Instant Quotation Automation",
    description:
      "Qlite Global enables instant product quotation generation with smart automation tools. Create, manage, and send quotes within minutes.",
    url: "https://quotation.qrpixeldesign.com",
    siteName: "Qlite Global",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Qlite Global - Automatic Quotation Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qlite Global | Automatic Quotation Generator",
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
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('wheel', function(e) {
              if (document.activeElement.type === 'number') {
                document.activeElement.blur();
              }
            }, { passive: false });
          `
        }} />
        <Script
          id="organization-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Qlite Global",
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
