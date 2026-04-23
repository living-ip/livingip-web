import Link from "next/link";
import { fetchClaims, fetchActivityFeed, fetchContributors } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [claimsData, activityData, contributorsData] = await Promise.all([
    fetchClaims({ limit: 5, sort: "recent" }),
    fetchActivityFeed({ sort: "recent", limit: 5 }),
    fetchContributors(1),
  ]);

  const claims = claimsData?.claims || [];
  const domains = claimsData?.domains || {};
  const totalClaims = claimsData?.total || 0;
  const activity = activityData?.events || [];
  const contributors = contributorsData?.contributors || [];

  return (
    <div className="space-y-12">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">LivingIP</h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          A collective intelligence knowledge system. Browse claims, challenge
          ideas, and contribute research across domains.
        </p>
        <div className="flex justify-center gap-8 mt-8">
          <Stat value={totalClaims} label="Claims" />
          <Stat value={Object.keys(domains).length} label="Domains" />
          <Stat value={contributors.length} label="Contributors" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Domains</h2>
          <Link href="/claims" className="text-sm text-accent">
            Browse all claims
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(domains)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([domain, count]) => (
              <Link
                key={domain}
                href={`/claims?domain=${domain}`}
                className="bg-bg-card border border-border rounded-lg p-4 hover:border-accent no-underline transition-colors"
              >
                <div className="text-sm font-medium text-text">{domain}</div>
                <div className="text-2xl font-bold text-accent mt-1">
                  {count as number}
                </div>
              </Link>
            ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Claims</h2>
            <Link href="/claims?sort=recent" className="text-sm text-accent">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {claims.map(
              (c: {
                slug: string;
                title: string;
                domain: string;
                confidence: string;
              }) => (
                <Link
                  key={c.slug}
                  href={`/claims/${encodeURIComponent(c.slug)}`}
                  className="block bg-bg-card border border-border rounded-lg p-3 hover:border-accent no-underline transition-colors"
                >
                  <div className="text-sm text-text line-clamp-2">
                    {c.title}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">
                      {c.domain}
                    </span>
                    {c.confidence && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green/10 text-green">
                        {c.confidence}
                      </span>
                    )}
                  </div>
                </Link>
              )
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link href="/activity" className="text-sm text-accent">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {activity.map(
              (
                e: {
                  pr_number: number;
                  type: string;
                  contributor: string;
                  domain: string;
                  summary: string;
                  ci_earned: number;
                },
                i: number
              ) => (
                <div
                  key={`${e.pr_number}-${i}`}
                  className="bg-bg-card border border-border rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TypeBadge type={e.type} />
                    <span className="text-xs text-text-muted">
                      {e.contributor}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">
                      {e.domain}
                    </span>
                  </div>
                  <div className="text-sm text-text line-clamp-2">
                    {e.summary}
                  </div>
                  {e.ci_earned > 0 && (
                    <div className="text-xs text-green mt-1">
                      +{e.ci_earned.toFixed(2)} CI
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-accent">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-text-muted">{label}</div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    create: "bg-green/10 text-green",
    enrich: "bg-accent/10 text-accent",
    challenge: "bg-orange/10 text-orange",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded ${colors[type] || "bg-border text-text-muted"}`}
    >
      {type}
    </span>
  );
}
