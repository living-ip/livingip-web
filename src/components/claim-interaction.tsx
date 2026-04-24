"use client";

import Link from "next/link";
import { useState } from "react";

type Stance = "agree" | "disagree" | "explore";

const HEADERS: Record<Stance, string> = {
  agree: "You agreed",
  disagree: "You disagreed",
  explore: "Tell me more",
};

const OPENERS: Record<Stance, string> = {
  agree:
    "Curious what convinced you — evidence, personal experience, or a connection we haven't made yet.",
  disagree:
    "Curious what your counter is — specific objection, counterexample, or missing evidence.",
  explore:
    "Curious what you want to dig into — question, request for sources, or an angle we should cover.",
};

export function ClaimInteraction() {
  const [stance, setStance] = useState<Stance | null>(null);

  function close() {
    setStance(null);
  }

  if (!stance) {
    return (
      <>
        <div className="actions">
          <button
            type="button"
            className="action-btn primary"
            onClick={() => setStance("agree")}
          >
            I agree
          </button>
          <button
            type="button"
            className="action-btn secondary"
            onClick={() => setStance("disagree")}
          >
            Disagree — here&apos;s why
          </button>
          <button
            type="button"
            className="action-btn secondary"
            onClick={() => setStance("explore")}
          >
            Tell me more
          </button>
        </div>
        <button
          type="button"
          className="skip-link"
          onClick={() => window.location.reload()}
        >
          show me another →
        </button>
      </>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span>{HEADERS[stance]}</span>
        <button
          type="button"
          className="chat-close"
          onClick={close}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="chat-messages">
        <div className="chat-msg system">{OPENERS[stance]}</div>
        <div className="chat-msg system">
          <strong>Chat with our agents coming soon.</strong> In the meantime,
          browse the{" "}
          <Link href="/knowledge-base">Knowledge Base</Link> or follow along in
          the <Link href="/activity">Timeline</Link>.
        </div>
      </div>
    </div>
  );
}
