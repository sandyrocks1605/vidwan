import { createBrowserClient } from "@supabase/ssr";

/**
 * A single browser Supabase client for the whole app.
 *
 * The instance is cached on `globalThis` rather than on the module scope so a
 * module re-evaluation (dev hot reload, a client component evaluated in more
 * than one chunk) always reuses the same auth client instead of creating a
 * second one. Creating more than one GoTrueClient in a browser context makes
 * supabase-js log "Multiple GoTrueClient instances detected in the same
 * browser context".
 *
 * Only public, browser-safe credentials are used here. The service role key is
 * never referenced in this file.
 */

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>;

declare global {
  var __vidwanSupabaseBrowserClient: SupabaseBrowserClient | undefined;
}

export function getSupabaseClient(): SupabaseBrowserClient {
  if (globalThis.__vidwanSupabaseBrowserClient) {
    return globalThis.__vidwanSupabaseBrowserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  const client = createBrowserClient(supabaseUrl, supabasePublishableKey);

  globalThis.__vidwanSupabaseBrowserClient = client;

  return client;
}