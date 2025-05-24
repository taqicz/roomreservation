"use client";

import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a singleton instance for client-side usage
let clientInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseBrowser = () => {
  if (clientInstance) return clientInstance;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing. Please check your .env.local file and ensure you have:\n" + "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n" + "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key");
  }

  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return clientInstance;
};
