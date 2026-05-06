import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import CartSidebar from "../components/CartSidebar";
import Navigation from "../components/Navigation";
import HydrationGuard from "../components/HydrationGuard";

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
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navigation />
        <main className="flex-1 flex flex-col pt-16">
          <HydrationGuard>{children}</HydrationGuard>
        </main>
        <CartSidebar />
      </body>
    </html>
  );
}
