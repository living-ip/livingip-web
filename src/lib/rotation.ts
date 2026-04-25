import rotationFile from "@/data/homepage-rotation.json";

// Snapshot of agents/leo/curation/homepage-rotation.json on the codex.
// Bumped manually when Leo revs the curation. JSON import keeps the file
// statically inlined — no runtime fetch, no markdown parsing.

export type RotationEntry = {
  order: number;
  act: string;
  pillar: string;
  slug: string;
  path: string;
  title: string;
  domain: string;
  sourcer: string;
  api_fetchable: boolean;
  note: string;
};

type RotationFile = {
  version: number;
  schema_version: number;
  updated: string;
  rotation: RotationEntry[];
};

const file = rotationFile as RotationFile;

export const ROTATION: RotationEntry[] = file.rotation;
export const ROTATION_VERSION = file.version;
export const ROTATION_UPDATED = file.updated;

// Deterministic by UTC day. Same focal claim anywhere on the planet today.
export function pickFocalIndex(now: Date = new Date()): number {
  const day = Math.floor(now.getTime() / 86_400_000);
  return ((day % ROTATION.length) + ROTATION.length) % ROTATION.length;
}
