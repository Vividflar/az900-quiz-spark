import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Publishable (anon) key only — never a secret. These variables are provisioned
// when the user's Supabase project is connected in Lovable. Until then the app
// renders its friendly error state instead of crashing.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

export const supabase: SupabaseClient = createClient(
  url ?? "https://placeholder.invalid",
  publishableKey ?? "public-anon-key-placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
