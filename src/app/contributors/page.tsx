import Link from "next/link";
import { fetchContributors } from "@/lib/api";

export default async function ContributorsPage() {
  const data = await fetchContributors(1);
  const contributors = data?.contributors || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Contributors</h1>

      <div className="space-y-3">
        {contributors.map(
          (c: {
            handle: string;
            display_name: string | null;
            primary_ci: number;
            action_ci: number;
            ci_score: number;
            claims_merged: number;
            first_contribution: string;
            last_contribution: string;
          }) => (
            <Link
              key={c.handle}
              href={`/contributors/${encodeURIComponent(c.handle)}`}
              className="flex items-center justify-between bg-bg-card border border-border rounded-lg p-4 hover:border-accent no-underline transition-colors"
            >
              <div>
                <div className="font-medium text-text">
                  {c.display_name || c.handle}
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {c.claims_merged} claims &middot; joined{" "}
                  {new Date(c.first_contribution).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-accent">
                  {c.primary_ci.toFixed(1)}
                </div>
                <div className="text-xs text-text-muted">CI Score</div>
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
