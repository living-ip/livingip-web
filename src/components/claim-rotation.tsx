"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RotationEntry } from "@/lib/rotation";
import { ClaimInteraction } from "@/components/claim-interaction";

interface Props {
  rotation: RotationEntry[];
  initialIndex: number;
}

function formatDomain(domain: string): string {
  return domain.replace(/-/g, " ");
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

  // Title is a click-through to the KB reader only when the underlying
  // claim is fetchable via /api/claims/{slug}. Foundations + core claims
  // aren't yet exposed (Argus FOUND-001) — render as static text.
  const titleEl = entry.api_fetchable ? (
    <Link
      href={`/knowledge-base/${encodeURIComponent(entry.slug)}`}
      className="claim-text claim-text-link"
    >
      {entry.title}
    </Link>
  ) : (
    <div className="claim-text">{entry.title}</div>
  );

  return (
    <div className="claim-home">
      <div className="claim-block">
        <div className="claim-domain">{formatDomain(entry.domain)}</div>
        {titleEl}
        <div className="claim-source">
          Contributed by <strong>{entry.sourcer}</strong>
        </div>

        <ClaimInteraction key={entry.slug} />

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
