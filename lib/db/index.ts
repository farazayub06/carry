/**
 * lib/db/index.ts — picks WHICH database to use. Import `store` from here, never directly.
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 *
 *   import { store } from "@/lib/db";
 *   const state = await store.getStateByCode("demo42");
 *
 * Decision rule (no code changes needed to switch):
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set  → real Postgres (supabase.ts)
 *   - otherwise                                      → in-memory demo data (memory.ts)
 *
 * SERVER ONLY. This module reads secret env vars; never import it from a
 * "use client" file. The browser talks to the API routes instead (lib/api.ts).
 */

import "server-only";
import { memoryStore } from "./memory";
import { supabaseStore } from "./supabase";
import type { DataStore } from "./store";

export const usingSupabase = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const store: DataStore = usingSupabase ? supabaseStore : memoryStore;

export { StoreError } from "./store";
