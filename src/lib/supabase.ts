import { createClient } from '@supabase/supabase-js';

// Fallback to empty strings if not configured yet, so the app doesn't crash during build
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
