import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import type { Metadata } from "next";
import CartSidebar from "../components/CartSidebar";
import Navigation from "../components/Navigation";
import HydrationGuard from "../components/HydrationGuard";
import ToastViewport from "../components/ToastViewport";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AURA. E-Com",
  description: "Premium futuristic luxury ecommerce experience",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  themeColor: "#212020",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AURA. E-Com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f6f4ef] text-slate-950">
        <Navigation />
        <ToastViewport />
        <main className="flex-1 flex flex-col">
          <HydrationGuard>{children}</HydrationGuard>
        </main>
        <CartSidebar />
      </body>
    </html>
  );
}
