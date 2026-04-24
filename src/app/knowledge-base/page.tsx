import Link from "next/link";
import { fetchClaims } from "@/lib/api";

export const revalidate = 60;

type Claim = {
  slug: string;
  title: string;
  domain: string;
  confidence: string;
  agent: string;
  summary?: string | null;
};

type SearchParams = Promise<{
  domain?: string;
  q?: string;
  page?: string;
}>;

const PAGE_SIZE = 25;

function toTitle(domain: string): string {
  return domain.replace(/-/g, " ");
}

function matchesTextFilter(claim: Claim, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = `${claim.title} ${claim.summary ?? ""}`.toLowerCase();
  return hay.includes(needle);
}

export default async function KnowledgeBasePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { domain, q, page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);

  // If a text query is present we can't rely on API search (Qdrant endpoint
  // returns empty for every query right now — flagged to Argus). Pull a
  // wider slice and filter client-side. Bounded at 500 to keep payload sane.
  const textFiltering = Boolean(q && q.trim());
  const apiLimit = textFiltering ? 500 : PAGE_SIZE;
  const apiOffset = textFiltering ? 0 : (pageNum - 1) * PAGE_SIZE;

  const data = await fetchClaims({
    domain,
    limit: apiLimit,
    offset: apiOffset,
    sort: "recent",
  });

  const allClaims: Claim[] = data?.claims ?? [];
  const totalFromApi: number = data?.total ?? 0;
  const domains: Record<string, number> = data?.domains ?? {};
  const totalAllClaims: number = Object.values(domains).reduce(
    (a, b) => a + b,
    0,
  );

  const filtered = textFiltering
    ? allClaims.filter((c) => matchesTextFilter(c, q ?? ""))
    : allClaims;

  const displayClaims = textFiltering
    ? filtered.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE)
    : filtered;

  const totalForPager = textFiltering ? filtered.length : totalFromApi;
  const hasNext = pageNum * PAGE_SIZE < totalForPager;
  const hasPrev = pageNum > 1;

  const sortedDomains = Object.entries(domains).sort(
    ([, a], [, b]) => b - a,
  );

  function hrefFor(
    overrides: Partial<{ domain: string | null; q: string | null; page: number }>,
  ): string {
    const params = new URLSearchParams();
    const nextDomain =
      "domain" in overrides ? overrides.domain : domain;
    const nextQ = "q" in overrides ? overrides.q : q;
    const nextPage =
      "page" in overrides ? overrides.page : pageNum > 1 ? pageNum : undefined;
    if (nextDomain) params.set("domain", nextDomain);
    if (nextQ) params.set("q", nextQ);
    if (nextPage && nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/knowledge-base?${qs}` : "/knowledge-base";
  }

  return (
    <div className="kb-page">
      <div className="kb-head">
        <div className="eyebrow">Knowledge base</div>
        <h1>
          {totalAllClaims.toLocaleString()} claims across{" "}
          {sortedDomains.length} domains
        </h1>
        <div className="sub">
          Every claim is an atomic argument with evidence, traceable to a
          source. Browse by domain or search within titles.
        </div>
      </div>

      <form className="search-row" action="/knowledge-base" method="get">
        {domain && <input type="hidden" name="domain" value={domain} />}
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search titles…"
          className="search-input"
          aria-label="Search claim titles"
        />
        <button type="submit" className="search-submit">
          Search
        </button>
        {q && (
          <Link
            href={hrefFor({ q: null, page: 1 })}
            className="search-clear"
            aria-label="Clear search"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="domain-tabs">
        <Link
          href={hrefFor({ domain: null, page: 1 })}
          className={`domain-tab${!domain ? " active" : ""}`}
        >
          All <span className="count">{totalAllClaims.toLocaleString()}</span>
        </Link>
        {sortedDomains.map(([d, count]) => (
          <Link
            key={d}
            href={hrefFor({ domain: d, page: 1 })}
            className={`domain-tab${domain === d ? " active" : ""}`}
          >
            {toTitle(d)} <span className="count">{count}</span>
          </Link>
        ))}
      </div>

      <div className="results-meta">
        {textFiltering
          ? `${filtered.length.toLocaleString()} matches for "${q}"`
          : `${totalFromApi.toLocaleString()} ${domain ? toTitle(domain) : ""} claims`}
      </div>

      {displayClaims.length === 0 ? (
        <div className="empty">
          No claims match these filters.{" "}
          <Link href="/knowledge-base">Clear all filters</Link>.
        </div>
      ) : (
        <div className="claim-grid">
          {displayClaims.map((claim) => (
            <Link
              key={claim.slug}
              href={`/knowledge-base/${encodeURIComponent(claim.slug)}`}
              className="claim-card"
            >
              <div className="title">{claim.title}</div>
              {claim.summary && (
                <div className="summary">{claim.summary}</div>
              )}
              <div className="meta">
                <span className="chip domain">{toTitle(claim.domain)}</span>
                {claim.confidence && (
                  <span
                    className={`chip confidence-${claim.confidence}`}
                  >
                    {claim.confidence}
                  </span>
                )}
                {claim.agent && <span className="agent">{claim.agent}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {(hasPrev || hasNext) && (
        <div className="pager">
          <span>
            Page {pageNum} of{" "}
            {Math.max(1, Math.ceil(totalForPager / PAGE_SIZE))}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href={hrefFor({ page: pageNum - 1 })}
              className={hasPrev ? "" : "disabled"}
              aria-disabled={!hasPrev}
            >
              ← Previous
            </Link>
            <Link
              href={hrefFor({ page: pageNum + 1 })}
              className={hasNext ? "" : "disabled"}
              aria-disabled={!hasNext}
            >
              Next →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
