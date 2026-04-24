"use client";

import {
  useDynamicContext,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Hash handle → hue for deterministic avatar gradient.
// Mirrors the logic in /contributors/[handle]/page.tsx so the same
// user shows the same avatar color everywhere.
function handleHue(handle: string): number {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = (hash * 31 + handle.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash) % 360;
}

function avatarStyle(handle: string) {
  const hue = handleHue(handle);
  return {
    background: `linear-gradient(135deg, oklch(0.70 0.15 ${hue}deg) 0%, oklch(0.48 0.17 ${hue}deg) 100%)`,
  };
}

function initial(handle: string): string {
  return handle.replace(/^@/, "").charAt(0).toUpperCase() || "?";
}

function SignInStub({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className="sign-in" onClick={onClick}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      Sign in
    </button>
  );
}

/**
 * SSR-safe wrapper. The Dynamic Labs hooks throw when called outside
 * the provider (which only mounts after client hydration via <Providers>).
 * We render the stub during SSR + first client render, then swap to the
 * provider-aware inner component once mounted.
 */
export function AuthButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Intentional did-mount pattern to gate on client-only render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <SignInStub />;
  }

  return <AuthButtonInner />;
}

function AuthButtonInner() {
  const isLoggedIn = useIsLoggedIn();
  const { setShowAuthFlow, handleLogOut, user } = useDynamicContext();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!isLoggedIn) {
    return <SignInStub onClick={() => setShowAuthFlow(true)} />;
  }

  const handle =
    (user?.username as string | undefined) ||
    (user?.alias as string | undefined) ||
    "me";
  const display = handle.replace(/^@/, "");

  return (
    <div className="auth-menu" ref={wrapRef}>
      <button
        type="button"
        className="auth-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="auth-avatar" style={avatarStyle(handle)}>
          {initial(handle)}
        </span>
        <span className="auth-handle">{display}</span>
      </button>
      {open && (
        <div className="auth-dropdown" role="menu">
          <Link
            className="auth-item"
            href={`/contributors/${encodeURIComponent(handle)}`}
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            My profile
          </Link>
          <button
            type="button"
            className="auth-item"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await handleLogOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
