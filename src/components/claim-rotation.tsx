"use client";

import { useEffect, useState } from "react";
import type { RotationEntry } from "@/lib/rotation";
import { ClaimInteraction } from "@/components/claim-interaction";

interface Props {
  rotation: RotationEntry[];
  initialIndex: number;
}

// Hash handle → hue for deterministic avatar gradient. Mirrors the inline
// pattern in auth-button + profile pages (same user → same color sitewide).
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

// Skip rotation nav while the user is typing in the chat panel — otherwise
// hitting an arrow key inside a textarea also walks the focal claim.
function isTextInputFocused(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function ClaimRotation({ rotation, initialIndex }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const total = rotation.length;
  const entry = rotation[index];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTextInputFocused()) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // prev/next are stable wrt total (closures over setIndex) so no deps
    // beyond total are needed; total is constant after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  if (!entry) return null;

  const visibleContributors = entry.contributors.slice(0, 3);

  return (
    <div className="claim-home">
      <div className="claim-block">
        <div className="claim-text">{entry.title}</div>
        <div className="claim-steelman">{entry.steelman}</div>

        {visibleContributors.length > 0 && (
          <div
            className="claim-contributors"
            aria-label="Contributors to this claim"
          >
            {visibleContributors.map((c) => (
              <span key={c.handle} className="claim-contributor">
                <span
                  className="claim-contributor-avatar"
                  style={avatarStyle(c.handle)}
                  aria-hidden="true"
                >
                  {initial(c.handle)}
                </span>
                <span className="claim-contributor-handle">{c.handle}</span>
              </span>
            ))}
          </div>
        )}

        <ClaimInteraction key={entry.id} />

        <div className="rotation-nav" aria-label="Walk the rotation">
          <button
            type="button"
            className="rotation-arrow"
            onClick={prev}
            aria-label="Previous claim"
          >
            ←
          </button>
          <span className="rotation-counter" aria-live="polite">
            {index + 1} / {total}
          </span>
          <button
            type="button"
            className="rotation-arrow"
            onClick={next}
            aria-label="Next claim"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
