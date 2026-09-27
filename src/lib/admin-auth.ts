import { NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  getSupabaseForRequest,
} from "@/lib/supabase/server";

/**
 * Server-side admin authorization.
 *
 * Admin status is resolved from the database (public.admin_profiles) using the
 * request's authenticated user — never from a browser-supplied role, email
 * string, or metadata. This module must only be imported by server code.
 */
export async function resolveAuthorizedAdmin(request: Request) {
  const { supabase, user } = await getSupabaseForRequest(request);

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Please log in as a Vidwan admin." },
        { status: 401 }
      ),
    };
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_profiles")
    .select("is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminProfile?.is_active) {
    return {
      error: NextResponse.json(
        { error: "You don't have Vidwan admin access." },
        { status: 403 }
      ),
    };
  }

  return { supabase, user };
}

/**
 * Server-side initial owner/admin bootstrap.
 *
 * Works ONLY when public.admin_profiles is completely empty (zero rows) and
 * VIDWAN_ADMIN_USER_ID (server-only env) matches the authenticated user. In
 * that exact case the FIRST admin profile is inserted with the service-role
 * client. A plain insert (never an upsert) is used, so this can never
 * reactivate an existing inactive admin, overwrite any existing row, or act
 * as a recurring privilege-escalation path: once a single admin profile
 * exists, this function is a no-op and all authorization is database-backed.
 */
async function bootstrapInitialAdmin(user: { id: string }): Promise<boolean> {
  const adminUserId = process.env.VIDWAN_ADMIN_USER_ID?.trim();

  if (!adminUserId || adminUserId !== user.id) {
    return false;
  }

  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    console.error(
      "VIDWAN_ADMIN_USER_ID is set but SUPABASE_SERVICE_ROLE_KEY is missing."
    );
    return false;
  }

  // Existence check + insert are performed server-side only with the
  // service-role client (RLS cannot gate this privileged check).
  const { count, error: countError } = await supabaseAdmin
    .from("admin_profiles")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error("Admin bootstrap existence check failed:", countError.message);
    return false;
  }

  // At least one admin already exists: do NOT bootstrap anyone. Reactivating
  // an inactive admin via the env variable is explicitly prevented here.
  if ((count ?? 0) > 0) {
    return false;
  }

  const { error } = await supabaseAdmin
    .from("admin_profiles")
    .insert({ user_id: user.id, is_active: true });

  if (error) {
    console.error("Admin bootstrap insert failed:", error.message);
    return false;
  }

  return true;
}

/**
 * resolveAuthorizedAdmin with the strict one-time bootstrap for the initial
 * owner: only fires when admin_profiles is empty (see bootstrapInitialAdmin).
 */
export async function resolveAuthorizedAdminWithBootstrap(request: Request) {
  const base = await resolveAuthorizedAdmin(request);

  if (!base.error) {
    return base;
  }

  const { user } = await getSupabaseForRequest(request);

  if (user && (await bootstrapInitialAdmin(user))) {
    const retry = await resolveAuthorizedAdmin(request);

    if (!retry.error) {
      return retry;
    }
  }

  return base;
}
