import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Public client — read only (used by all visitors)
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client — full access (used only in Admin page)
// Uses the service role key which bypasses RLS
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY // falls back to anon if not set
);
