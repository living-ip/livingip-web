import Link from "next/link";
import { fetchActivityFeed, fetchClaims } from "@/lib/api";

export const revalidate = 60;

type Event = {
  type: string;
  claim_slug: string;
  domain: string;
  contributor: string;
  timestamp: string;
  ci_earned: number;
  summary: string;
  pr_number: number;
  source_channel: string | null;
};

// Map pipeline event types → visual kinds.
// Ready for enrich/challenge when they land; today the pipeline only emits `create`.
const KIND_BY_TYPE: Record<string, { label: string; kind: string }> = {
  create: { label: "New claim", kind: "claim" },
  enrich: { label: "Enrichment", kind: "enrichment" },
  challenge: { label: "Counter", kind: "counter" },
};

// Hash-to-hue — same pattern as contributor profile avatars.
// TODO post-sprint: extract to src/lib/avatar.ts so this doesn't live in 3 files.
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

function dayKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

function dayLabel(isoDay: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (isoDay === today) return "Today";
  const yesterdayIso = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (isoDay === yesterdayIso) return "Yesterday";
  const d = new Date(isoDay + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function timeOfDay(iso: string): string {
  // API returns "2026-04-23 12:22:58" (no TZ). Treat as UTC.
  const d = new Date(iso.replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function groupByDay(events: Event[]): Array<{ day: string; items: Event[] }> {
  const groups = new Map<string, Event[]>();
  for (const e of events) {
    const key = dayKey(e.timestamp);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  // Most recent day first; events within each day already sorted recent-first by API.
  return [...groups.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, items]) => ({ day, items }));
}

function eventsThisWeek(events: Event[]): number {
  const oneWeekAgo = Date.now() - 7 * 86_400_000;
  return events.filter((e) => {
    const t = new Date(e.timestamp.replace(" ", "T") + "Z").getTime();
    return t >= oneWeekAgo;
  }).length;
}

export default async function ActivityPage() {
  // Pull the last 100 events + claim totals in parallel.
  const [activity, claims] = await Promise.all([
    fetchActivityFeed({ sort: "recent", limit: 100 }),
    fetchClaims({ limit: 1 }),
  ]);

  const events: Event[] = activity?.events ?? [];
  const totalEvents: number = activity?.total ?? events.length;
  const totalClaims: number = claims?.total ?? 0;
  const domainCount: number = claims?.domains ? Object.keys(claims.domains).length : 0;
  const uniqueContributors = new Set(events.map((e) => e.contributor)).size;

  const groups = groupByDay(events);
  const weekCount = eventsThisWeek(events);

  return (
    <div className="timeline-page">
      <div className="page-head">
        <h1>Timeline</h1>
        <div className="sub">
          Every change flowing into the knowledge base. Claims, enrichments, and
          challenges as contributors ship them.
        </div>
      </div>

      <div className="stats-strip">
        <div className="stat">
          <div className="v">{weekCount.toLocaleString()}</div>
          <div className="l">Events this week</div>
        </div>
        <div className="stat">
          <div className="v">{uniqueContributors.toLocaleString()}</div>
          <div className="l">Contributors active</div>
        </div>
        <div className="stat">
          <div className="v">{totalEvents.toLocaleString()}</div>
          <div className="l">Events all-time</div>
        </div>
        <div className="stat">
          <div className="v">{totalClaims.toLocaleString()}</div>
          <div className="l">Claims in codex ({domainCount} domains)</div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="empty">
          No recent activity. Check back in a minute — the pipeline is live.
        </div>
      ) : (
        <div className="timeline">
          {groups.map((group) => (
            <div key={group.day}>
              <div className="day-header">
                <div className="day-label">{dayLabel(group.day)}</div>
              </div>
              {group.items.map((e, idx) => {
                const mapping = KIND_BY_TYPE[e.type] ?? {
                  label: e.type,
                  kind: "claim",
                };
                const initial = (e.contributor[0] ?? "?").toUpperCase();
                return (
                  <div
                    key={`${e.pr_number}-${idx}`}
                    className="tl-item"
                    data-kind={mapping.kind}
                  >
                    <div className="tl-left">
                      <div className="tl-meta">
                        <span className="tl-kind">{mapping.label}</span>
                        <span className="tl-sep">·</span>
                        <Link
                          className="tl-contributor"
                          href={`/contributors/${encodeURIComponent(e.contributor)}`}
                        >
                          <span
                            className="av"
                            style={{ background: avatarGradient(e.contributor) }}
                          >
                            {initial}
                          </span>
                          <span className="name">{e.contributor}</span>
                        </Link>
                        <span className="tl-sep">·</span>
                        <span className="tl-domain">{e.domain}</span>
                      </div>
                      <div className="tl-title">
                        <Link href={`/knowledge-base/${encodeURIComponent(e.claim_slug)}`}>
                          {e.summary}
                        </Link>
                      </div>
                    </div>
                    <div className="tl-right">
                      {e.source_channel && e.source_channel !== "unknown" && (
                        <span className="tl-channel">via {e.source_channel}</span>
                      )}
                      {e.ci_earned > 0 && (
                        <span className="tl-ci">+{e.ci_earned.toFixed(2)} CI</span>
                      )}
                      <span className="tl-time">{timeOfDay(e.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
