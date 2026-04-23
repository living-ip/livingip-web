import Link from "next/link";
import { fetchClaim } from "@/lib/api";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const claim = await fetchClaim(slug);

  if (!claim) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/claims"
        className="text-sm text-text-muted hover:text-accent mb-4 inline-block"
      >
        &larr; Back to claims
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">{claim.title}</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={`/claims?domain=${claim.domain}`}
          className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent no-underline hover:bg-accent/20"
        >
          {claim.domain}
        </Link>
        {claim.confidence && (
          <span className="text-xs px-3 py-1 rounded-full bg-green/10 text-green">
            {claim.confidence}
          </span>
        )}
        {claim.type && (
          <span className="text-xs px-3 py-1 rounded-full bg-border text-text-muted">
            {claim.type}
          </span>
        )}
        {claim.agent && (
          <span className="text-xs px-3 py-1 rounded-full bg-border text-text-muted">
            by {claim.agent}
          </span>
        )}
      </div>

      {claim.body && (
        <div className="bg-bg-card border border-border rounded-lg p-6 mb-6">
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-text">
            {claim.body}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <MetaCard title="Metadata">
          {claim.scope && (
            <MetaRow label="Scope" value={claim.scope} />
          )}
          {claim.date_added && (
            <MetaRow label="Added" value={claim.date_added} />
          )}
          {claim.wiki_links > 0 && (
            <MetaRow
              label="Wiki Links"
              value={String(claim.wiki_links)}
            />
          )}
        </MetaCard>

        {claim.challenged_by && claim.challenged_by.length > 0 && (
          <MetaCard title="Challenged By">
            <div className="space-y-1">
              {claim.challenged_by.map((c: string, i: number) => (
                <div key={i} className="text-sm text-orange">
                  {c}
                </div>
              ))}
            </div>
          </MetaCard>
        )}
      </div>

      {claim.related_claims && claim.related_claims.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Related Claims</h2>
          <div className="space-y-2">
            {claim.related_claims.map((r: string, i: number) => (
              <Link
                key={i}
                href={`/claims/${encodeURIComponent(r.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}`}
                className="block text-sm text-accent hover:underline"
              >
                {r}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-text-muted mb-2">{title}</h3>
      {children}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-text-muted">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}
