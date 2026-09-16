import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | undefined;
export const ADMIN_EMAIL = "peter@peterbudzak.com";
export function adminClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key)
      throw new Error(
        "Chýba pripojenie k databáze. Skontrolujte konfiguráciu nasadenia.",
      );
    client = createClient(url, key, {
      auth: {
        storageKey: "fitliner-admin-session",
        storage:
          typeof window !== "undefined" ? window.sessionStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
