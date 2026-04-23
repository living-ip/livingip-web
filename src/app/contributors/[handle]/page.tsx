import Link from "next/link";
import { fetchContributor } from "@/lib/api";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ContributorProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await fetchContributor(handle);

  if (!profile) notFound();

  const actionCi = profile.action_ci;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/contributors"
        className="text-sm text-text-muted hover:text-accent mb-4 inline-block"
      >
        &larr; Back to contributors
      </Link>

      <div className="flex items-start justify-between mt-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {profile.display_name || profile.handle}
          </h1>
          <div className="text-sm text-text-muted mt-1">@{profile.handle}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-accent">
            {profile.primary_ci?.toFixed(1) || "0.0"}
          </div>
          <div className="text-xs text-text-muted">CI Score</div>
        </div>
      </div>

      {profile.hero_badge && (
        <div className="inline-block mb-6 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-sm font-medium text-accent">
          {profile.hero_badge}
        </div>
      )}

      {profile.badges && profile.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {profile.badges.map(
            (b: { name: string; rarity: string }, i: number) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded-full border ${
                  b.rarity === "rare" || b.rarity === "limited"
                    ? "border-orange/30 bg-orange/10 text-orange"
                    : "border-border bg-bg-card text-text-muted"
                }`}
              >
                {b.name}
              </span>
            )
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-text-muted mb-3">
            Contribution Breakdown
          </h3>
          {actionCi?.breakdown ? (
            <div className="space-y-2">
              {Object.entries(
                actionCi.breakdown as Record<
                  string,
                  { count: number; ci: number }
                >
              ).map(([type, data]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-text capitalize">{type}</span>
                  <span className="text-text-muted">
                    {data.count}x &middot; {data.ci.toFixed(2)} CI
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-text-muted">
              {profile.claims_merged} claims merged
            </div>
          )}
        </div>

        {profile.active_domains && profile.active_domains.length > 0 && (
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-text-muted mb-3">
              Active Domains
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.active_domains.map((d: string) => (
                <Link
                  key={d}
                  href={`/claims?domain=${d}`}
                  className="text-xs px-2 py-1 rounded bg-accent/10 text-accent no-underline hover:bg-accent/20"
                >
                  {d}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-muted mb-3">Info</h3>
        <div className="space-y-2 text-sm">
          {profile.joined && (
            <div className="flex justify-between">
              <span className="text-text-muted">Joined</span>
              <span>{new Date(profile.joined).toLocaleDateString()}</span>
            </div>
          )}
          {profile.last_active && (
            <div className="flex justify-between">
              <span className="text-text-muted">Last active</span>
              <span>{new Date(profile.last_active).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-text-muted">Claims merged</span>
            <span>{profile.claims_merged || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
