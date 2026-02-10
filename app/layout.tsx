import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Varahi Traders – Inventory & Sales",
  description: "Manage inventory, sales and profit for your shop",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
            <Link href="/" className="text-lg font-bold text-brand-700 sm:text-xl shrink-0">
              Varahi Traders
            </Link>
            <nav className="flex gap-2 sm:gap-4">
              <Link
                href="/"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2 text-stone-600 hover:bg-stone-100 hover:text-brand-600 sm:min-h-0 sm:min-w-0"
              >
                Dashboard
              </Link>
              <Link
                href="/products"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2 text-stone-600 hover:bg-stone-100 hover:text-brand-600 sm:min-h-0 sm:min-w-0"
              >
                Products
              </Link>
              <Link
                href="/billing"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2 text-stone-600 hover:bg-stone-100 hover:text-brand-600 sm:min-h-0 sm:min-w-0"
              >
                Billing
              </Link>
              <Link
                href="/sales"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2 text-stone-600 hover:bg-stone-100 hover:text-brand-600 sm:min-h-0 sm:min-w-0"
              >
                Sales
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">{children}</main>
      </body>
    </html>
  );
}
