const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://77.42.65.182:8081";

export async function fetchClaims(params: {
  domain?: string;
  confidence?: string;
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams();
  if (params.domain) query.set("domain", params.domain);
  if (params.confidence) query.set("confidence", params.confidence);
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);
  query.set("limit", String(params.limit || 50));
  query.set("offset", String(params.offset || 0));
  const res = await fetch(`${API_BASE}/api/claims?${query}`, { next: { revalidate: 60 } });
  return res.json();
}

export async function fetchClaim(slug: string) {
  const res = await fetch(`${API_BASE}/api/claims/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchActivityFeed(params: {
  sort?: string;
  domain?: string;
  contributor?: string;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams();
  if (params.sort) query.set("sort", params.sort);
  if (params.domain) query.set("domain", params.domain);
  if (params.contributor) query.set("contributor", params.contributor);
  query.set("limit", String(params.limit || 20));
  query.set("offset", String(params.offset || 0));
  const res = await fetch(`${API_BASE}/api/activity-feed?${query}`, { next: { revalidate: 30 } });
  return res.json();
}

export async function fetchContributors(minClaims = 1) {
  const res = await fetch(`${API_BASE}/api/contributors/list?min_claims=${minClaims}`, {
    next: { revalidate: 120 },
  });
  return res.json();
}

export async function fetchContributor(handle: string) {
  const res = await fetch(`${API_BASE}/api/contributors/${encodeURIComponent(handle)}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchGrowth() {
  const res = await fetch(`${API_BASE}/api/contributor-growth`, { next: { revalidate: 300 } });
  return res.json();
}
