"use client";

import { useEffect, useState, type ReactNode } from "react";
import { DynamicProvider } from "./dynamic-provider";

/**
 * Client-mount guard around the Dynamic Labs provider.
 *
 * The Dynamic SDK references `window` at module-load time, which breaks
 * Next.js static prerendering. By guarding on a `useEffect`-set flag,
 * we let the server render `children` directly (no auth context), then
 * wrap them with the provider once the client hydrates.
 *
 * AuthButton already treats "not logged in" as the default state, so
 * the brief server→client transition shows the Sign in button either
 * way — no visible flicker for unauthenticated users. Logged-in users
 * see a sub-second swap from Sign in → avatar once the SDK rehydrates
 * their session, which is acceptable UX for v1.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Intentional did-mount pattern to gate SDK provider on client hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <DynamicProvider>{children}</DynamicProvider>;
}
