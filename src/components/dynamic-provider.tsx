"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import type { ReactNode } from "react";

// Dynamic environment ID. Defaults to the teleo-app env so livingip-web
// users share identity with teleo-app. Override in Vercel env with
// NEXT_PUBLIC_DYNAMIC_ENV if we later decide to split tenants.
const DYNAMIC_ENV_ID =
  process.env.NEXT_PUBLIC_DYNAMIC_ENV ||
  "f1b86804-237b-43bd-8802-89dd7e918055";

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
