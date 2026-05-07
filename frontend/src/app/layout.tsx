import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import CartSidebar from "../components/CartSidebar";
import Navigation from "../components/Navigation";
import HydrationGuard from "../components/HydrationGuard";
import ToastViewport from "../components/ToastViewport";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
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
