import { createClient } from '@supabase/supabase-js';

// Get environment variables or use placeholders for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 