
import { createClient } from '@supabase/supabase-js'

// Check if environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provide fallback values or error handling if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anonymous Key missing. Make sure you've set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
  );
}

// Create the Supabase client with appropriate error handling
export const supabase = createClient(
  supabaseUrl || "", 
  supabaseAnonKey || ""
);
