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
      <Link href="/" className="logo" aria-label="LivingIP home">
        {/* LivingIP convergence mark — Symbol-Color.svg recolored purple */}
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
        {/* LivingIP wordmark — Wordmark-White.svg */}
        <svg
          className="wordmark"
          viewBox="0 0 2100 575"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1649.95 0V442.615H1731.98V0H1649.95ZM1817.27 0V442.615H1899.3V274.332H1925.66C1986.2 274.332 2014.33 269.514 2038.28 256.364C2076.63 234.816 2100 189.311 2100 136.58C2100 86.8435 2079.62 45.57 2043.69 22.785C2017.32 5.9892 1986.79 0 1926.9 0H1817.27ZM1923.25 195.886H1899.3V78.5107H1926.83C1952.55 78.5107 1965.76 79.6825 1978.91 82.6771C2002.87 89.3173 2017.26 110.279 2017.26 138.403C2017.26 192.891 1964.01 195.886 1923.25 195.886ZM1232.54 469.569H1322.9C1346.27 495.348 1368.99 504.918 1406.16 504.918C1465.47 504.918 1498.99 470.805 1498.99 409.677V398.87C1467.88 435.391 1436.69 450.364 1390.02 450.364C1295.36 450.364 1227.14 376.671 1227.14 274.268C1227.14 171.866 1296.6 102.99 1390.67 102.99C1438.58 102.99 1473.93 119.135 1499.06 152.727V110.802H1575.1V379.731C1575.1 508.498 1516.38 574.966 1403.23 574.966C1322.38 574.966 1259.49 536.622 1232.54 469.569ZM1400.76 377.322C1458.24 377.322 1495.41 337.806 1495.41 276.677C1495.41 215.548 1456.48 176.032 1398.42 176.032C1343.93 176.032 1307.41 216.785 1307.41 277.849C1307.41 338.913 1343.93 377.257 1400.82 377.257L1400.76 377.322ZM884.709 110.801V442.616H964.392V286.311C964.392 209.623 985.94 176.097 1036.26 176.097C1081.77 176.097 1099.73 206.043 1099.73 280.322V442.616H1179.42V264.763C1179.42 153.377 1139.84 103.055 1051.82 103.055C1013.48 103.055 987.763 113.796 958.402 142.57V110.801H884.709ZM740.244 442.615V110.8H819.927V442.615H740.244ZM740.244 74.8651V3.6905e-05H819.927V74.8651H740.244ZM375.686 110.801L509.271 442.615H572.744L706.329 110.801H616.491L541.04 330.578L464.352 110.801H375.686ZM261.761 442.615V110.8H341.444V442.615H261.761ZM261.761 74.8651V3.6905e-05H341.444V74.8651H261.761ZM0 0.000106862V442.615H217.369V364.17H82.0261V0.000106862H0Z"
            fill="white"
          />
        </svg>
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
