"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://77.42.65.182:8081";

interface ActivityEvent {
  type: string;
  claim_slug: string;
  domain: string;
  contributor: string;
  timestamp: string;
  ci_earned: number;
  summary: string;
  pr_number: number;
}

function ActivityFeed() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const sort = searchParams.get("sort") || "recent";
  const domain = searchParams.get("domain") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 20;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "page") params.delete("page");
      router.push(`/activity?${params.toString()}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    query.set("sort", sort);
    if (domain) query.set("domain", domain);
    query.set("limit", String(limit));
    query.set("offset", String((page - 1) * limit));

    fetch(`${API_BASE}/api/activity-feed?${query}`)
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.events || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sort, domain, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Activity</h1>
        <div className="flex gap-2">
          {["recent", "hot", "important"].map((s) => (
            <button
              key={s}
              onClick={() => updateParam("sort", s)}
              className={`px-3 py-1.5 text-sm rounded-lg border ${
                sort === s
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-text-muted hover:text-text"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading...</div>
      ) : (
        <>
          <div className="space-y-3">
            {events.map((e, i) => (
              <div
                key={`${e.pr_number}-${i}`}
                className="bg-bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <TypeBadge type={e.type} />
                  <span className="text-sm font-medium text-text">
                    {e.contributor}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">
                    {e.domain}
                  </span>
                  <span className="text-xs text-text-muted ml-auto">
                    {new Date(e.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-text">{e.summary}</div>
                {e.ci_earned > 0 && (
                  <div className="text-xs text-green mt-2">
                    +{e.ci_earned.toFixed(2)} CI earned
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => updateParam("page", String(page - 1))}
                disabled={page <= 1}
                className="px-4 py-2 text-sm bg-bg-card border border-border rounded-lg hover:border-accent disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-text-muted self-center">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => updateParam("page", String(page + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 text-sm bg-bg-card border border-border rounded-lg hover:border-accent disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
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
      className={`text-xs px-2 py-0.5 rounded font-medium ${colors[type] || "bg-border text-text-muted"}`}
    >
      {type}
    </span>
  );
}

export default function ActivityPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12 text-text-muted">Loading...</div>
      }
    >
      <ActivityFeed />
    </Suspense>
  );
}
