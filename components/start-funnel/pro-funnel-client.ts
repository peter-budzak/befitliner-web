import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function proFunnelClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return undefined;
  return client ??= createClient(url, key);
}

export async function recordProStep(id: string, step: number, profile?: {
  name: string;
  email: string;
  consent: boolean;
}) {
  const { data, error } = await proFunnelClient()?.rpc('record_fitliner_pro_funnel', {
    p_id: id,
    p_step: step,
    ...(profile && { p_name: profile.name, p_email: profile.email, p_consent: profile.consent }),
  }) ?? {};
  return !error && data === true;
}
