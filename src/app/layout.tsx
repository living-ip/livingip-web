import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/components/providers";
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
        <Providers>
          <SiteHeader />
          {/* <main> is the full-viewport wrapper. Constrained content pages
              (.leaderboard, .profile-page) set their own max-width; full-bleed
              pages (.claim-home) use the full width for flex centering. */}
          <main className="flex-1 w-full">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
