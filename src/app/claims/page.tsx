"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://77.42.65.182:8081";

interface Claim {
  slug: string;
  title: string;
  domain: string;
  confidence: string;
  agent: string;
  wiki_links: number;
  date_added: string;
}

function ClaimsBrowser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [domains, setDomains] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const domain = searchParams.get("domain") || "";
  const confidence = searchParams.get("confidence") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "recent";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 50;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.delete("page");
      router.push(`/claims?${params.toString()}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (domain) query.set("domain", domain);
    if (confidence) query.set("confidence", confidence);
    if (search) query.set("search", search);
    if (sort) query.set("sort", sort);
    query.set("limit", String(limit));
    query.set("offset", String((page - 1) * limit));

    fetch(`${API_BASE}/api/claims?${query}`)
      .then((r) => r.json())
      .then((data) => {
        setClaims(data.claims || []);
        setDomains(data.domains || {});
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [domain, confidence, search, sort, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex gap-6">
      <aside className="w-56 shrink-0 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-text-muted mb-2">
            Domains
          </h3>
          <button
            onClick={() => updateParam("domain", "")}
            className={`block w-full text-left text-sm px-2 py-1 rounded ${!domain ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text"}`}
          >
            All ({total})
          </button>
          {Object.entries(domains)
            .sort(([, a], [, b]) => b - a)
            .map(([d, count]) => (
              <button
                key={d}
                onClick={() => updateParam("domain", d)}
                className={`block w-full text-left text-sm px-2 py-1 rounded ${domain === d ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text"}`}
              >
                {d} ({count})
              </button>
            ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-muted mb-2">
            Confidence
          </h3>
          {["", "established", "high", "moderate", "experimental", "emerging"].map(
            (c) => (
              <button
                key={c || "all"}
                onClick={() => updateParam("confidence", c)}
                className={`block w-full text-left text-sm px-2 py-1 rounded ${confidence === c ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text"}`}
              >
                {c || "All"}
              </button>
            )
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-muted mb-2">Sort</h3>
          {["recent", "alpha", "domain"].map((s) => (
            <button
              key={s}
              onClick={() => updateParam("sort", s)}
              className={`block w-full text-left text-sm px-2 py-1 rounded ${sort === s ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text"}`}
            >
              {s === "alpha" ? "Alphabetical" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search claims..."
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParam("search", (e.target as HTMLInputElement).value);
              }
            }}
            className="flex-1 bg-bg-card border border-border rounded-lg px-4 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:border-accent"
          />
          <span className="text-sm text-text-muted whitespace-nowrap">
            {total.toLocaleString()} claims
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-muted">Loading...</div>
        ) : (
          <>
            <div className="space-y-2">
              {claims.map((c) => (
                <Link
                  key={c.slug}
                  href={`/claims/${encodeURIComponent(c.slug)}`}
                  className="block bg-bg-card border border-border rounded-lg p-4 hover:border-accent no-underline transition-colors"
                >
                  <div className="text-sm font-medium text-text line-clamp-2">
                    {c.title}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">
                      {c.domain}
                    </span>
                    {c.confidence && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green/10 text-green">
                        {c.confidence}
                      </span>
                    )}
                    {c.agent && (
                      <span className="text-xs text-text-muted">
                        by {c.agent}
                      </span>
                    )}
                    {c.wiki_links > 0 && (
                      <span className="text-xs text-text-muted">
                        {c.wiki_links} links
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => updateParam("page", String(page - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 text-sm bg-bg-card border border-border rounded-lg hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-text-muted self-center">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => updateParam("page", String(page + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 text-sm bg-bg-card border border-border rounded-lg hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ClaimsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-text-muted">Loading...</div>}>
      <ClaimsBrowser />
    </Suspense>
  );
}
