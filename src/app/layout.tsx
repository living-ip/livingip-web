import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Providers } from "@/components/providers";
import "./globals.css";

const DESCRIPTION =
  "A collective intelligence knowledge base. Browse claims, follow contributors, see the system grow.";

export const metadata: Metadata = {
  title: {
    default: "teleo",
    template: "teleo — %s",
  },
  description: DESCRIPTION,
  openGraph: {
    siteName: "LivingIP",
    title: "teleo",
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "teleo",
    description: DESCRIPTION,
  },
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
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
