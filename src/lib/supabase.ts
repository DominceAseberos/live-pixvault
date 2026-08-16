import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseConfig } from "@/lib/env";

export const supabase = hasSupabaseConfig
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
