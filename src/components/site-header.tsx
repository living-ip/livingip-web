"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth-button";

const NAV_ITEMS = [
  { label: "Claims", href: "/" },
  { label: "Timeline", href: "/activity" },
  { label: "Knowledge Base", href: "/knowledge-base" },
  { label: "Leaderboard", href: "/contributors" },
];

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link href="/" className="logo" aria-label="teleo home">
        {/* Convergence mark — Symbol-Color.svg recolored purple */}
        <svg
          className="symbol"
          viewBox="0 0 1033 1033"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1033 -4.51539e-05L1033 893.496C1033 970.459 970.61 1033 893.496 1033L0 1033L-7.96247e-06 850.84L601.813 850.84L79.3578 549.201L170.438 391.445L693.172 693.246L391.36 170.492L549.115 79.412L850.84 602.014L850.84 -3.71914e-05L1033 -4.51539e-05Z"
            fill="#6E46E5"
          />
        </svg>
        <span className="wordmark">teleo</span>
      </Link>

      <nav className="site-nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActiveRoute(pathname, item.href) ? "active" : ""}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <AuthButton />
    </header>
  );
}
