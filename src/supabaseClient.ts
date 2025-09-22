// src/supabaseClient.ts
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const extras = (Constants.expoConfig && (Constants.expoConfig as any).extra) || {};
const SUPABASE_URL = extras.SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = extras.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env or app.config.js');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
});

export const SUPABASE_URL_CONST = SUPABASE_URL;
