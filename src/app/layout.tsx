import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LivingIP",
  description: "Collective intelligence knowledge system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <nav className="border-b border-border px-6 py-3 flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="font-bold text-lg text-text no-underline hover:no-underline"
          >
            LivingIP
          </Link>
          <Link
            href="/claims"
            className="text-text-muted hover:text-text no-underline"
          >
            Claims
          </Link>
          <Link
            href="/activity"
            className="text-text-muted hover:text-text no-underline"
          >
            Activity
          </Link>
          <Link
            href="/contributors"
            className="text-text-muted hover:text-text no-underline"
          >
            Contributors
          </Link>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
