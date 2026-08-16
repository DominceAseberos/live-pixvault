export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.trim() ?? "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "",
} as const;

export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);
