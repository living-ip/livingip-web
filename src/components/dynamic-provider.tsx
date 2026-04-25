"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import type { ReactNode } from "react";

// Dynamic environment ID. Read from Vercel env in production; fall back to
// the legacy teleo-app env in dev so local builds work without a .env.local.
// Production fails loud if the env var is missing — silent fallback would
// cause auth to silently target a stale tenant.
const LEGACY_TELEO_ENV_ID = "f1b86804-237b-43bd-8802-89dd7e918055";

function resolveDynamicEnvId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID;
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return LEGACY_TELEO_ENV_ID;
  throw new Error(
    "NEXT_PUBLIC_DYNAMIC_ENV_ID is required in production builds.",
  );
}

const DYNAMIC_ENV_ID = resolveDynamicEnvId();

export function DynamicProvider({ children }: { children: ReactNode }) {
  return (
    <DynamicContextProvider
      theme="dark"
      settings={{
        environmentId: DYNAMIC_ENV_ID,
        walletConnectors: [SolanaWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
