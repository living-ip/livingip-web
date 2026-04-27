import rotationFile from "@/data/homepage-rotation.json";

// Snapshot of agents/leo/curation/homepage-rotation.json on the codex.
// Bumped manually when Leo revs the curation. JSON import keeps the file
// statically inlined — no runtime fetch, no markdown parsing.
//
// Schema v3 (2026-04-26): 9 load-bearing claims with steelman explainer
// and contributor attribution. evidence_claims[] + counter_arguments[]
// are present in the JSON but render is deferred to the dossier UI
// (Claude Design v0.3, future PR).

export type Contributor = {
  handle: string;
  role: string;
};

export type EvidenceClaim = {
  slug: string;
  path: string;
  title: string;
  rationale: string;
  api_fetchable: boolean;
};

export type CounterArgument = {
  objection: string;
  rebuttal: string;
  tension_claim_slug: string | null;
};

export type RotationEntry = {
  id: number;
  title: string;
  subtitle: string;
  steelman: string;
  evidence_claims: EvidenceClaim[];
  counter_arguments: CounterArgument[];
  contributors: Contributor[];
};

type RotationFile = {
  schema_version: number;
  maintained_by: string;
  last_updated: string;
  description: string;
  claims: RotationEntry[];
};

const file = rotationFile as unknown as RotationFile;

export const ROTATION: RotationEntry[] = file.claims;
export const ROTATION_VERSION = file.schema_version;
export const ROTATION_UPDATED = file.last_updated;

// Deterministic by UTC day. Same focal claim anywhere on the planet today.
export function pickFocalIndex(now: Date = new Date()): number {
  const day = Math.floor(now.getTime() / 86_400_000);
  return ((day % ROTATION.length) + ROTATION.length) % ROTATION.length;
}
