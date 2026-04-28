"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  title: string;
  body: React.ReactNode;
}

// Inline help disclosure. Click trigger to open, click outside or press
// Escape to close. Body content is page-specific (Timeline explains event
// flow, KB explains semantic search + scoring).
export function HowItWorks({ title, body }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="how-it-works" ref={wrapRef}>
      <button
        type="button"
        className="hiw-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        How it works
      </button>
      {open && (
        <div className="hiw-popover" role="dialog" aria-label={title}>
          <div className="hiw-title">{title}</div>
          <div className="hiw-body">{body}</div>
        </div>
      )}
    </div>
  );
}
