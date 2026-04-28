import Link from "next/link";
import { fetchClaims, fetchSearch, type SearchResult } from "@/lib/api";
import { HowItWorks } from "@/components/how-it-works";

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
const SEARCH_LIMIT = 50;

function toTitle(domain: string): string {
  return domain.replace(/-/g, " ");
}

// Derive the claim slug from Argus's claim_path.
// Verified against /api/claims/{slug} for both space-delimited and
// dash-delimited filenames — both round-trip correctly when URL-encoded.
function slugFromPath(path: string): string {
  const filename = path.substring(path.lastIndexOf("/") + 1);
  return filename.endsWith(".md") ? filename.slice(0, -3) : filename;
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
  const hasQuery = Boolean(q && q.trim());

  // Always fetch claims for domain tabs + total counts + text-filter fallback.
  // When searching we pull a wider slice (for the fallback path); otherwise
  // just the current page.
  const fallbackLimit = hasQuery ? 500 : PAGE_SIZE;
  const fallbackOffset = hasQuery ? 0 : (pageNum - 1) * PAGE_SIZE;

  const [claimsData, searchData] = await Promise.all([
    fetchClaims({
      domain,
      limit: fallbackLimit,
      offset: fallbackOffset,
      sort: "recent",
    }),
    hasQuery ? fetchSearch(q!.trim(), SEARCH_LIMIT) : Promise.resolve(null),
  ]);

  const allClaims: Claim[] = claimsData?.claims ?? [];
  const totalFromApi: number = claimsData?.total ?? 0;
  const domains: Record<string, number> = claimsData?.domains ?? {};
  const totalAllClaims: number = Object.values(domains).reduce(
    (a, b) => a + b,
    0,
  );

  // Semantic search results — filter to claim-type (entity slugs 404 at
  // /api/claims/{slug}), then apply the domain filter client-side if set
  // since /api/search doesn't take a domain param today.
  const searchResults: SearchResult[] = (() => {
    if (!hasQuery || !searchData) return [];
    const direct = (searchData.direct_results ?? []).filter(
      (r) => r.type === "claim",
    );
    if (!domain) return direct;
    return direct.filter((r) => r.domain === domain);
  })();

  // Fallback: semantic search returned 0 (Argus min_score=0.25 filters weak
  // matches — real signal, not bug). Use the wider claims slice as a text
  // filter so users see something instead of a dead end.
  const usingFallback = hasQuery && searchResults.length === 0;
  const fallbackMatches = usingFallback
    ? allClaims.filter((c) => matchesTextFilter(c, q ?? ""))
    : [];

  // Paging only applies to the non-search path + the fallback path.
  // Semantic results are top-K already, no pager.
  const browseSlice = !hasQuery
    ? allClaims
    : fallbackMatches.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE);

  const totalForPager = usingFallback ? fallbackMatches.length : totalFromApi;
  const pagerActive = !hasQuery || usingFallback;
  const hasNext = pagerActive && pageNum * PAGE_SIZE < totalForPager;
  const hasPrev = pagerActive && pageNum > 1;
  const showPager = hasPrev || hasNext;

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

  const resultsMeta = (() => {
    if (!hasQuery) {
      return `${totalFromApi.toLocaleString()} ${domain ? toTitle(domain) : ""} claims`;
    }
    if (searchResults.length > 0) {
      return `${searchResults.length} semantic ${searchResults.length === 1 ? "match" : "matches"} for "${q}"`;
    }
    if (usingFallback && fallbackMatches.length > 0) {
      return `${fallbackMatches.length.toLocaleString()} title ${fallbackMatches.length === 1 ? "match" : "matches"} for "${q}" (no strong semantic matches — showing title matches)`;
    }
    return `No matches for "${q}"`;
  })();

  const nothingToShow =
    (!hasQuery && browseSlice.length === 0) ||
    (hasQuery && searchResults.length === 0 && fallbackMatches.length === 0);

  return (
    <div className="kb-page">
      <div className="kb-head">
        <div className="page-head-row">
          <div className="eyebrow">Knowledge base</div>
          <HowItWorks
            title="How the Knowledge Base works"
            body={
              <>
                <p>
                  Every entry is an atomic claim with evidence and a traceable
                  source. Browse by domain tab, or search semantically — typing
                  in the box queries Qdrant against claim embeddings, ranked
                  by similarity score above a 0.25 floor.
                </p>
                <p>
                  When semantic search returns nothing, the page falls back to
                  a title text filter so the click never dead-ends. Click any
                  claim to read its full body, evidence, and connections.
                </p>
              </>
            }
          />
        </div>
        <h1>
          {totalAllClaims.toLocaleString()} claims across{" "}
          {sortedDomains.length} domains
        </h1>
        <div className="sub">
          Every claim is an atomic argument with evidence, traceable to a
          source. Browse by domain or search semantically.
        </div>
      </div>

      <form className="search-row" action="/knowledge-base" method="get">
        {domain && <input type="hidden" name="domain" value={domain} />}
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search claims…"
          className="search-input"
          aria-label="Search claims"
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

      <div className="results-meta">{resultsMeta}</div>

      {nothingToShow ? (
        <div className="empty">
          No claims match these filters.{" "}
          <Link href="/knowledge-base">Clear all filters</Link>.
        </div>
      ) : hasQuery && searchResults.length > 0 ? (
        <div className="claim-grid">
          {searchResults.map((r) => {
            const slug = slugFromPath(r.claim_path);
            return (
              <Link
                key={r.claim_path}
                href={`/knowledge-base/${encodeURIComponent(slug)}`}
                className="claim-card"
              >
                <div className="title">{r.claim_title}</div>
                {r.snippet && (
                  <div className="summary">{r.snippet}</div>
                )}
                <div className="meta">
                  <span className="chip domain">{toTitle(r.domain)}</span>
                  {r.confidence && r.confidence !== "unknown" && (
                    <span className={`chip confidence-${r.confidence}`}>
                      {r.confidence}
                    </span>
                  )}
                  <span className="agent">
                    score {r.score.toFixed(2)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="claim-grid">
          {browseSlice.map((claim) => (
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
                  <span className={`chip confidence-${claim.confidence}`}>
                    {claim.confidence}
                  </span>
                )}
                {claim.agent && <span className="agent">{claim.agent}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showPager && (
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
