"use client";

import { useState } from "react";

type Stance = "agree" | "disagree" | "explore";
type Step = "drafting" | "collecting-email" | "submitted";

interface ClaimInteractionProps {
  claimSlug: string;
  claimTitle: string;
}

// Formspark form ID is read at runtime so m3ta can inject the real one later
// without a rebuild. If unset, submissions are held locally and the UI shows
// a "thanks, we'll be in touch" confirmation — no data sent, no dark pattern.
const FORMSPARK_ID = process.env.NEXT_PUBLIC_FORMSPARK_ID;

const OPENERS: Record<Stance, string> = {
  agree:
    "What convinced you? Evidence, personal experience, or a connection we haven't made yet — all welcome.",
  disagree:
    "What's your counter? Specific objection, counterexample, or missing evidence.",
  explore:
    "What would you like to dig into? Ask a question, request sources, or propose an angle we should cover.",
};

const HEADERS: Record<Stance, string> = {
  agree: "You agreed — tell us why",
  disagree: "You disagreed — tell us why",
  explore: "Tell us more",
};

export function ClaimInteraction({
  claimSlug,
  claimTitle,
}: ClaimInteractionProps) {
  const [stance, setStance] = useState<Stance | null>(null);
  const [step, setStep] = useState<Step>("drafting");
  const [reply, setReply] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function close() {
    setStance(null);
    setStep("drafting");
    setReply("");
    setEmail("");
  }

  function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setStep("collecting-email");
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);

    const payload = {
      stance,
      claim_slug: claimSlug,
      claim_title: claimTitle,
      reply: reply.trim(),
      email: email.trim(),
    };

    try {
      if (FORMSPARK_ID) {
        await fetch(`https://submit-form.com/${FORMSPARK_ID}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // No Formspark ID configured — dev / pre-launch stub.
        // Drop to console so we can verify the payload shape.
        console.info("[claim-interaction] formspark unconfigured, payload:", payload);
      }
    } catch (err) {
      console.error("[claim-interaction] submit failed:", err);
    } finally {
      setStep("submitted");
      setSubmitting(false);
    }
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
        {reply && step !== "drafting" && (
          <div className="chat-msg user">{reply}</div>
        )}
        {step === "collecting-email" && (
          <div className="chat-msg system">
            Leave your email so we can reply when we dig into this.
          </div>
        )}
      </div>

      {step === "drafting" && (
        <form className="chat-input-row" onSubmit={handleReplySubmit}>
          <input
            type="text"
            className="chat-input"
            placeholder="Type your response…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="chat-send"
            disabled={!reply.trim()}
            aria-label="Send"
          >
            <svg viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </form>
      )}

      {step === "collecting-email" && (
        <form className="chat-input-row" onSubmit={handleEmailSubmit}>
          <input
            type="email"
            className="chat-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <button
            type="submit"
            className="chat-send"
            disabled={!email.trim() || submitting}
            aria-label="Send"
          >
            <svg viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </form>
      )}

      {step === "submitted" && (
        <div className="done-msg">
          Thanks — <strong>we&apos;ll be in touch.</strong>
        </div>
      )}
    </div>
  );
}
