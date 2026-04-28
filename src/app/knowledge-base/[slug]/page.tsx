import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchClaim } from "@/lib/api";
import { renderMarkdown } from "@/lib/render-markdown";

export const revalidate = 60;

type RelatedClaim =
  | string
  | { slug: string; title?: string; domain?: string };

function toTitle(domain: string): string {
  return domain.replace(/-/g, " ");
}

function relatedSlug(r: RelatedClaim): string {
  return typeof r === "string" ? r : r.slug;
}

function relatedTitle(r: RelatedClaim): string {
  if (typeof r === "string") return r.replace(/-/g, " ");
  return r.title || r.slug.replace(/-/g, " ");
}

export default async function KnowledgeBaseReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const claim = await fetchClaim(slug);

  if (!claim) notFound();

  const related: RelatedClaim[] = Array.isArray(claim.related_claims)
    ? claim.related_claims
    : [];

  const createdDate = claim.created
    ? new Date(claim.created).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <article className="kb-reader">
      <Link href="/knowledge-base" className="back-link">
        ← Knowledge Base
      </Link>

      <Link
        href={`/knowledge-base?domain=${encodeURIComponent(claim.domain)}`}
        className="domain-eyebrow"
      >
        {toTitle(claim.domain)}
      </Link>

      <h1 className="reader-title">{claim.title}</h1>

      <div className="reader-meta">
        {claim.confidence && (
          <span className={`chip confidence-${claim.confidence}`}>
            {claim.confidence}
          </span>
        )}
        {claim.scope && <span className="chip">{claim.scope}</span>}
        {claim.agent && <span className="chip">author: {claim.agent}</span>}
        {createdDate && <span className="chip">created {createdDate}</span>}
      </div>

      {(claim.source || claim.sourcer) && (
        <div className="source-note">
          <span className="label">Source</span>
          {claim.sourcer && (
            <>
              <strong>{claim.sourcer}</strong>
              {claim.source ? " — " : null}
            </>
          )}
          {claim.source ?? null}
        </div>
      )}

      {claim.body ? (
        <div className="body">{renderMarkdown(claim.body)}</div>
      ) : (
        claim.summary && (
          <div className="body">
            <p>{claim.summary}</p>
          </div>
        )
      )}

      {related.length > 0 && (
        <section className="related">
          <h2>Related claims</h2>
          {related.map((r) => (
            <Link
              key={relatedSlug(r)}
              href={`/knowledge-base/${encodeURIComponent(relatedSlug(r))}`}
              className="related-item"
            >
              {relatedTitle(r)}
            </Link>
          ))}
        </section>
      )}
    </article>
  );
}
