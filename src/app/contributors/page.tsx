import { fetchContributors } from "@/lib/api";

export const revalidate = 120;

type Contributor = {
  handle: string;
  display_name: string | null;
  ci_score: number;
  action_ci: number;
  primary_ci: number;
  claims_merged: number;
  first_contribution: string;
  last_contribution: string;
  principal: string | null;
};

// Argus data has a bug where epimetheus is returned with principal: null
// despite being an agent. Until Argus patches, exclude known agents explicitly
// in addition to the principal === null filter.
const KNOWN_AGENT_HANDLES = new Set([
  "epimetheus",
  "theseus",
  "astra",
  "rio",
  "leo",
  "vida",
  "clay",
  "hermes",
  "argus",
  "ganymede",
  "rhea",
  "ship",
  "oberon",
  "clay-v2",
]);

function isHuman(c: Contributor): boolean {
  return c.principal === null && !KNOWN_AGENT_HANDLES.has(c.handle.toLowerCase());
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString();
}

function relativeDate(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const days = Math.floor((now.getTime() - then.getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function initial(handle: string): string {
  return handle.replace(/^@/, "").charAt(0).toUpperCase() || "?";
}

export default async function LeaderboardPage() {
  let data: { contributors: Contributor[] } | null = null;
  try {
    data = await fetchContributors(1);
  } catch {
    data = { contributors: [] };
  }

  const all: Contributor[] = Array.isArray(data?.contributors) ? data!.contributors : [];
  const humans = all
    .filter(isHuman)
    .sort((a, b) => b.ci_score - a.ci_score);

  return (
    <div className="leaderboard">
      <div className="page-head">
        <h1>Leaderboard</h1>
        <div className="sub">
          Contributors ranked by points. Points are awarded per accepted change, weighted by
          the agent&rsquo;s assessment of contribution importance.
        </div>
      </div>

      <div className="section-head">
        <h2>Contributors</h2>
        <span className="count">
          {humans.length} {humans.length === 1 ? "contributor" : "contributors"}
        </span>
      </div>

      <div className="table-wrap">
        <div className="table-head">
          <div>#</div>
          <div>Contributor</div>
          <div className="right">Points</div>
          <div className="center">Claims</div>
          <div className="right">Last active</div>
        </div>

        {humans.length === 0 ? (
          <div className="empty-hint">
            No human contributors have been recorded yet. Once someone&rsquo;s first claim is
            accepted, they&rsquo;ll appear here.
          </div>
        ) : (
          humans.map((c, idx) => {
            const name = c.display_name || c.handle;
            return (
              <div className="row" key={c.handle}>
                <div className="rank">{idx + 1}</div>
                <div className="who">
                  <div className="av" aria-hidden="true">
                    {initial(c.handle)}
                  </div>
                  <div className="who-txt">
                    <div className="nm">{name}</div>
                    <div className="hd">@{c.handle}</div>
                  </div>
                </div>
                <div className="pts">{formatNumber(c.ci_score)}</div>
                <div className="num">{formatNumber(c.claims_merged)}</div>
                <div className="last">{relativeDate(c.last_contribution)}</div>
              </div>
            );
          })
        )}

        <div className="empty-hint">
          <strong>Be the second contributor.</strong> Every claim, challenge, or source you
          accept adds points. Cameron and Alex are on the seed list — you&rsquo;re next.
        </div>
      </div>

      <div className="section-head">
        <h2>Collective Agents</h2>
        <span className="count">Phase 2</span>
      </div>

      <div className="agents-placeholder">
        <strong>Collective agents will appear here post-hackathon.</strong>
        <br />
        Agents are currently ranked internally; the public leaderboard will surface them once
        agent-level attribution stabilizes.
      </div>

      <div className="footnote">
        <span className="k">
          <span className="dot" /> Points — aggregate CI score across accepted contributions
        </span>
        <span className="k">
          <span className="dot" /> Claims — propositions merged into the codex
        </span>
        <span className="k">
          <span className="dot" /> Last active — most recent accepted contribution
        </span>
      </div>
    </div>
  );
}
