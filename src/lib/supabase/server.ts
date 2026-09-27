import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function requirePublicEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase public environment variables are missing.");
  }

  return { supabaseUrl, supabasePublishableKey };
}

export async function getSupabaseClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabasePublishableKey } = requirePublicEnv();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie writes can fail in some server-rendering contexts.
          }
        },
      },
    }
  );
}

/**
 * Resolves a Supabase client for a user-scoped API request.
 *
 * The browser stores its session in cookies (Supabase SSR), so the default
 * cookie-based client is tried first. Some browser clients instead keep the
 * session in memory and send it as an `Authorization: Bearer <access_token>`
 * header, so that is supported as a fallback.
 *
 * The returned client always uses the anon/publishable key. Privileged work
 * (creating Auth users) must use a separate service-role client in the route
 * that needs it.
 */
export async function getSupabaseForRequest(request: Request) {
  const { supabaseUrl, supabasePublishableKey } = requirePublicEnv();

  const cookieClient = await getSupabaseClient();

  const {
    data: { user: cookieUser },
  } = await cookieClient.auth.getUser();

  if (cookieUser) {
    return { supabase: cookieClient, user: cookieUser };
  }

  const authorization = request.headers.get("Authorization") ?? "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!accessToken) {
    return { supabase: cookieClient, user: null };
  }

  const cookieStore = await cookies();
  const requestScopedClient = createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie writes can fail in some server-rendering contexts.
          }
        },
      },
    }
  );

  const {
    data: { user: tokenUser },
  } = await requestScopedClient.auth.getUser();

  if (!tokenUser) {
    return { supabase: cookieClient, user: null };
  }

  return { supabase: requestScopedClient, user: tokenUser };
}

/**
 * Service-role (privileged) client for server-only operations such as
 * creating Auth users from the teacher dashboard.
 *
 * SUPABASE_SERVICE_ROLE_KEY is read here and nowhere else. This function must
 * only ever be imported by server code — never by a client component, and
 * never returned in an API response.
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}