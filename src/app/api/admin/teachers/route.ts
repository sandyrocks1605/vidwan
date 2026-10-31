import { NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  getSupabaseForRequest,
} from "@/lib/supabase/server";
import { resolveAuthorizedAdminWithBootstrap } from "@/lib/admin-auth";

type CreateTeacherBody = {
  full_name?: string;
  email?: string;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ADMIN — create a teacher Auth user + teacher_profiles row.
 *
 * Restricted to authorized admins (server-side check against
 * public.admin_profiles). Teachers, students, and anonymous callers are
 * rejected before any privileged operation runs.
 */
export async function POST(request: Request) {
  try {
    const admin = await resolveAuthorizedAdminWithBootstrap(request);

    if (admin.error) return admin.error;

    const body = (await request.json()) as CreateTeacherBody;

    const fullName = body.full_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!fullName) {
      return NextResponse.json(
        { error: "The teacher's full name is required." },
        { status: 400 }
      );
    }

    if (!email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "A temporary password of at least 8 characters is required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      console.error(
        "SUPABASE_SERVICE_ROLE_KEY is missing from the server environment."
      );

      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    const { data: createdUser, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          account_type: "teacher",
        },
      });

    if (createUserError || !createdUser.user) {
      console.error("Admin create teacher error:", createUserError?.message);

      return NextResponse.json(
        {
          error:
            "Unable to create teacher. Please check the details and try again.",
        },
        { status: 400 }
      );
    }

    // No auto-created teacher profile exists; insert it explicitly so the
    // account is an authorized teacher with status ACTIVE.
    const { error: profileError } = await supabaseAdmin
      .from("teacher_profiles")
      .upsert(
        {
          user_id: createdUser.user.id,
          email,
          name: fullName,
          is_teacher: true,
          status: "ACTIVE",
        },
        { onConflict: "user_id" }
      );

    if (profileError) {
      const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(
        createdUser.user.id
      );
      console.error("Admin teacher profile error:", profileError.message);

      if (rollbackError) {
        console.error("Admin teacher rollback error:", rollbackError.message);
      }

      return NextResponse.json(
        {
          error:
            rollbackError
              ? "The teacher profile could not be completed. Please contact support before retrying."
              : "The teacher profile could not be completed, so the account was removed. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      teacher: {
        id: createdUser.user.id,
        email: createdUser.user.email,
        full_name: fullName,
      },
    });
  } catch (error) {
    console.error("Admin create teacher error:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating the teacher." },
      { status: 500 }
    );
  }
}

/**
 * ADMIN — activate / deactivate a teacher.
 * Uses the admin's own authenticated client; RLS
 * ("Authorized admins can manage teacher status") rejects any non-admin.
 */
export async function PATCH(request: Request) {
  try {
    const admin = await resolveAuthorizedAdminWithBootstrap(request);

    if (admin.error) return admin.error;

    const body = (await request.json()) as {
      user_id?: string;
      status?: string;
    };

    const targetUserId = body.user_id?.trim();
    const nextStatus = body.status?.trim().toUpperCase();

    if (!targetUserId || !nextStatus) {
      return NextResponse.json(
        { error: "A teacher and a status are required." },
        { status: 400 }
      );
    }

    if (nextStatus !== "ACTIVE" && nextStatus !== "INACTIVE") {
      return NextResponse.json(
        { error: "Status must be ACTIVE or INACTIVE." },
        { status: 400 }
      );
    }

    const { supabase } = await getSupabaseForRequest(request);

    const { data: updated, error: updateError } = await supabase
      .from("teacher_profiles")
      .update({ status: nextStatus })
      .eq("user_id", targetUserId)
      .select("user_id, status")
      .maybeSingle();

    if (updateError || !updated) {
      console.error("Admin update teacher status error:", updateError?.message);

      return NextResponse.json(
        { error: "Unable to update this teacher right now." },
        { status: updateError ? 400 : 404 }
      );
    }

    return NextResponse.json({
      success: true,
      teacher: { user_id: updated.user_id, status: updated.status },
    });
  } catch (error) {
    console.error("Admin update teacher status error:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating the teacher." },
      { status: 500 }
    );
  }
}
