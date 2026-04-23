import { ClaimInteraction } from "@/components/claim-interaction";
import { fetchClaims } from "@/lib/api";

export const dynamic = "force-dynamic";

const CONFIDENCE_PRIORITY: Record<string, number> = {
  established: 5,
  proven: 4,
  likely: 3,
  experimental: 2,
  speculative: 1,
};

interface Claim {
  slug: string;
  title: string;
  domain: string;
  confidence: string;
  agent: string;
  sourcer?: string | null;
  source?: string | null;
}

// Pick the highest-conviction recent claim as today's focal.
// No daily-pick cron yet — we read the most recent 20 and choose on each
// server render.
function pickFocalClaim(claims: Claim[]): Claim | null {
  if (!claims.length) return null;
  return [...claims].sort((a, b) => {
    const ca = CONFIDENCE_PRIORITY[a.confidence] ?? 0;
    const cb = CONFIDENCE_PRIORITY[b.confidence] ?? 0;
    return cb - ca;
  })[0];
}

function formatDomain(domain: string): string {
  return domain.replace(/-/g, " ");
}

function formatContributor(claim: Claim): string {
  // Prefer human source attribution. If sourcer is missing or obviously
  // institutional, fall back to the agent. This is best-effort — Argus
  // doesn't yet emit a clean human_author field.
  if (claim.sourcer && claim.sourcer.trim()) return claim.sourcer;
  return claim.agent
    ? claim.agent.charAt(0).toUpperCase() + claim.agent.slice(1)
    : "the collective";
}

export default async function HomePage() {
  const data = await fetchClaims({ sort: "recent", limit: 20 });
  const claim = pickFocalClaim(data?.claims ?? []);

  if (!claim) {
    return (
      <div className="claim-home">
        <div className="claim-block">
          <div className="claim-text">
            No claims available right now. Check back in a minute.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="claim-home">
      <div className="claim-block">
        <div className="claim-domain">{formatDomain(claim.domain)}</div>
        <div className="claim-text">{claim.title}</div>
        <div className="claim-source">
          Contributed by <strong>{formatContributor(claim)}</strong>
        </div>

        <ClaimInteraction claimSlug={claim.slug} claimTitle={claim.title} />
      </div>
    </div>
  );
}
