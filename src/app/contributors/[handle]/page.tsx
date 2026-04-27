import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchContributor, fetchActivityFeed } from "@/lib/api";

type Params = Promise<{ handle: string }>;

type ActionBreakdownEntry = { count: number; ci: number };
type Badge = { name: string; rarity: string; desc?: string };
type ActivityEvent = {
  type: string;
  claim_slug: string;
  domain: string;
  timestamp: string;
  ci_earned: number;
  summary: string;
  pr_number?: number;
  source_channel?: string | null;
};

// Hash handle → hue for deterministic avatar gradient.
function handleHue(handle: string): number {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = (hash * 31 + handle.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash) % 360;
}

function avatarGradient(handle: string): string {
  const hue = handleHue(handle);
  return `linear-gradient(135deg, oklch(0.70 0.15 ${hue}deg) 0%, oklch(0.48 0.17 ${hue}deg) 100%)`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1mo ago";
  return `${months}mo ago`;
}

export async function generateMetadata({ params }: { params: Params }) {
  const { handle } = await params;
  return {
    // Rendered through layout's title.template as "teleo — @handle"
    title: `@${handle}`,
    description: `Contributor profile for @${handle}`,
  };
}

export default async function ContributorProfilePage({ params }: { params: Params }) {
  const { handle } = await params;

  const [profile, activity] = await Promise.all([
    fetchContributor(handle),
    fetchActivityFeed({ contributor: handle, limit: 15 }),
  ]);

  if (!profile) notFound();

  const actionBreakdown: Record<string, ActionBreakdownEntry> =
    profile.action_ci?.breakdown ?? {};
  const actionMaxCi = Math.max(
    ...Object.values(actionBreakdown).map((a) => a.ci),
    0.01,
  );

  const rolePercentages: Record<string, number> = profile.role_percentages ?? {};
  const rolesOrdered: string[] = ["sourcer", "extractor", "challenger", "synthesizer", "reviewer"];
  const roleMax = Math.max(...Object.values(rolePercentages).map((v: number) => v), 1);

  const domainBreakdown: Record<string, number> = profile.domain_breakdown ?? {};
  const topDomains = Object.entries(domainBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const badges: Badge[] = profile.badges ?? [];
  const events: ActivityEvent[] = activity?.events ?? [];

  const name = profile.display_name || profile.handle;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <Link href="/contributors" className="back-link">
        ← Contributors
      </Link>

      <div className="grid">
        {/* ─── LEFT COLUMN ─── */}
        <div>
          {/* Hero card */}
          <div className="hero">
            <div className="hero-banner">
              <div className="grid-texture" />
              <svg
                className="watermark"
                width="100"
                height="100"
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
            </div>

            <div className="hero-body">
              <div className="hero-top">
                <div className="avatar-frame">
                  <div className="avatar" style={{ background: avatarGradient(profile.handle) }}>
                    {initial}
                  </div>
                </div>
                <div className="hero-meta">
                  <h1 className="hero-name">{name}</h1>
                  <div className="hero-handle">
                    <strong>@{profile.handle}</strong> · Joined {formatDate(profile.joined)}
                  </div>
                  {profile.hero_badge && (
                    <span className="hero-badge">★ {profile.hero_badge}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat">
                <div className="eyebrow">CI Score</div>
                <div className="stat-value">{(profile.primary_ci ?? profile.ci_score ?? 0).toFixed(1)}</div>
              </div>
              <div className="stat">
                <div className="eyebrow">Claims</div>
                <div className="stat-value">{(profile.claims_merged ?? 0).toLocaleString()}</div>
              </div>
              <div className="stat">
                <div className="eyebrow">Joined</div>
                <div className="stat-value muted">{formatDate(profile.joined)}</div>
              </div>
              <div className="stat">
                <div className="eyebrow">Last Active</div>
                <div className="stat-value muted">{formatRelative(profile.last_active) || "—"}</div>
              </div>
            </div>
          </div>

          {/* Action breakdown */}
          <div className="card">
            <div className="card-head">
              <div className="eyebrow">Contribution breakdown</div>
            </div>
            <div className="card-body">
              {Object.keys(actionBreakdown).length === 0 ? (
                <div className="empty">No contributions yet.</div>
              ) : (
                Object.entries(actionBreakdown)
                  .sort(([, a], [, b]) => b.ci - a.ci)
                  .map(([type, data]) => {
                    const pct = (data.ci / actionMaxCi) * 100;
                    return (
                      <div key={type} className="bd-row">
                        <div className="bd-label">{type}</div>
                        <div className="bd-bar">
                          <div className="bd-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="bd-meta">
                          {data.count}× · {data.ci.toFixed(2)} CI
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Role breakdown — 5 roles from schemas/contribution-weights.yaml */}
          {Object.keys(rolePercentages).length > 0 && (
            <div className="card">
              <div className="card-head">
                <div className="eyebrow">Role mix</div>
              </div>
              <div className="card-body">
                {rolesOrdered.map((role) => {
                  const pct = rolePercentages[role] ?? 0;
                  const count = profile.role_breakdown?.[role] ?? 0;
                  const fillPct = (pct / roleMax) * 100;
                  return (
                    <div key={role} className="bd-row">
                      <div className="bd-label">{role}</div>
                      <div className="bd-bar">
                        <div
                          className="bd-fill"
                          style={{ width: `${fillPct}%`, opacity: pct === 0 ? 0.15 : 1 }}
                        />
                      </div>
                      <div className="bd-meta">
                        {pct}% · {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div>
          {/* Badges */}
          {badges.length > 0 && (
            <div className="card">
              <div className="card-head">
                <div className="eyebrow">Badges · {badges.length}</div>
              </div>
              <div className="card-body">
                <div className="badges">
                  {badges.map((b) => (
                    <div key={b.name} className={`badge ${b.rarity}`} title={b.desc}>
                      <div className="badge-name">{b.name}</div>
                      {b.desc && <div className="badge-desc">{b.desc}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active domains */}
          {topDomains.length > 0 && (
            <div className="card">
              <div className="card-head">
                <div className="eyebrow">Top domains</div>
              </div>
              <div className="card-body">
                <div className="domain-chips">
                  {topDomains.map(([domain, count]) => (
                    <Link key={domain} href={`/claims?domain=${domain}`} className="domain-chip">
                      {domain} <span className="count">{count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div className="card">
            <div className="card-head">
              <div className="eyebrow">Recent activity · {activity?.total ?? events.length}</div>
            </div>
            {events.length === 0 ? (
              <div className="empty">No recent activity.</div>
            ) : (
              <div className="activity">
                {events.map((e, i) => (
                  <div key={`${e.pr_number ?? i}-${e.timestamp}`} className="row">
                    <div className="time">{formatRelative(e.timestamp)}</div>
                    <div className="body">
                      <Link href={`/claims/${encodeURIComponent(e.claim_slug)}`}>
                        {e.summary}
                      </Link>
                      <div className="meta">
                        <span className={`chip type-${e.type}`}>{e.type}</span>
                        {e.domain && <span className="chip">{e.domain}</span>}
                        {e.source_channel && e.source_channel !== "unknown" && (
                          <span className="chip">via {e.source_channel}</span>
                        )}
                      </div>
                    </div>
                    {e.ci_earned > 0 && (
                      <div className="ci-earned">+{e.ci_earned.toFixed(2)} CI</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
