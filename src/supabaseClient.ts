// src/supabaseClient.ts
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Use .env and app.config.js for secrets - do not hardcode keys in this file

/**
 * Robust read of extras (works with different Expo versions / manifest shapes)
 */
const extras =
  (Constants.expoConfig && (Constants.expoConfig as any).extra) ||
  ((Constants as any).manifest && (Constants as any).manifest.extra) ||
  {};

const SUPABASE_URL = extras.SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = extras.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

/**
 * Diagnostic log - remove in production
 */
console.log('[supabaseClient] extras from Constants.expoConfig / manifest:', extras);
console.log('[supabaseClient] process.env keys:', {
  SUPABASE_URL: !!process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
});
console.log('[supabaseClient] final values present:', {
  SUPABASE_URL: !!SUPABASE_URL,
  SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // This triggers the runtime error you saw ("supabaseUrl is required")
  console.warn('Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env or app.config.js');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
});

export const SUPABASE_URL_CONST = SUPABASE_URL;
