"use client";

import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import CartSidebar from "../components/CartSidebar";
import Navigation from "../components/Navigation";
import HydrationGuard from "../components/HydrationGuard";
import { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        {mounted ? (
          <>
            <Navigation />
            <main className="flex-1 flex flex-col pt-16">
              <HydrationGuard>{children}</HydrationGuard>
            </main>
            <CartSidebar />
          </>
        ) : (
          <div className="min-h-screen bg-white"></div>
        )}
      </body>
    </html>
  );
}
