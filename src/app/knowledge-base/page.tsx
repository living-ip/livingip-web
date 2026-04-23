// TODO(oberon): replace this stub with the Knowledge Base surface.
// Nav item points here in site-header.tsx; shipped to prevent a 404 on
// the demo URL for Accelerate. Keep the route path stable.

export default function KnowledgeBasePage() {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <h1 className="text-2xl font-semibold mb-3">Knowledge Base</h1>
      <p className="text-text-muted">
        Coming soon. The full knowledge base view is under construction.
      </p>
      <p className="text-sm text-text-dim mt-6">
        In the meantime, browse{" "}
        <a href="/claims" className="underline hover:text-accent">
          claims
        </a>{" "}
        or the{" "}
        <a href="/activity" className="underline hover:text-accent">
          timeline
        </a>
        .
      </p>
    </div>
  );
}
