
import { createClient } from '@supabase/supabase-js'

// Hardcoded Supabase credentials
const supabaseUrl = "https://ipnzlpfwftnunqppkylb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbnpscGZ3ZnRudW5xcHBreWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NDI1MDIsImV4cCI6MjA2MjExODUwMn0.upsYt6jbWvUPZ6rUvlBGLw2YCIaZYlgJ336peJLonqQ";

// Create the Supabase client with the provided credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
