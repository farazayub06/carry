/** Uses the Supabase store when its env vars are set, otherwise the in-memory store. */

import "server-only";
import { memoryStore } from "./memory";
import { supabaseStore } from "./supabase";
import type { DataStore } from "./store";

export const usingSupabase = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const store: DataStore = usingSupabase ? supabaseStore : memoryStore;

export { StoreError } from "./store";
