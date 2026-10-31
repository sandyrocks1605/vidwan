import { NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  getSupabaseForRequest,
} from "@/lib/supabase/server";
import { resolveAuthorizedAdminWithBootstrap } from "@/lib/admin-auth";

type CreateStudentBody = {
  full_name?: string;
  email?: string;
  age?: number | string | null;
  mun_experience?: string | null;
  debate_experience?: string | null;
  goals?: string | null;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ADMIN — create a student Auth user (service-role, server-only).
 * The student trigger public.handle_new_student() only creates a
 * student_profiles row because user_metadata.account_type = "student".
 */
export async function POST(request: Request) {
  try {
    const admin = await resolveAuthorizedAdminWithBootstrap(request);

    if (admin.error) return admin.error;

    const body = (await request.json()) as CreateStudentBody;

    const fullName = body.full_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!fullName) {
      return NextResponse.json(
        { error: "The student's full name is required." },
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

    const age =
      body.age === null || body.age === undefined || body.age === ""
        ? null
        : Number(body.age);

    if (age !== null && (!Number.isInteger(age) || age < 6 || age > 21)) {
      return NextResponse.json(
        { error: "Student age must be a whole number between 6 and 21." },
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
          age,
          mun_experience: body.mun_experience?.trim() || null,
          debate_experience: body.debate_experience?.trim() || null,
          goals: body.goals?.trim() || null,
          account_type: "student",
        },
      });

    if (createUserError || !createdUser.user) {
      console.error("Admin create student error:", createUserError?.message);

      return NextResponse.json(
        {
          error:
            "Unable to create student. Please check the details and try again.",
        },
        { status: 400 }
      );
    }

    const { error: profileError } = await supabaseAdmin
      .from("student_profiles")
      .upsert(
        {
          user_id: createdUser.user.id,
          full_name: fullName,
          email,
          age,
          mun_experience: body.mun_experience?.trim() || null,
          debate_experience: body.debate_experience?.trim() || null,
          goals: body.goals?.trim() || null,
          status: "ACTIVE",
        },
        { onConflict: "user_id" }
      );

    if (profileError) {
      const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(
        createdUser.user.id
      );
      console.error("Admin student profile error:", profileError.message);

      if (rollbackError) {
        console.error("Admin student rollback error:", rollbackError.message);
      }

      return NextResponse.json(
        {
          error: rollbackError
            ? "The student profile could not be completed. Please contact support before retrying."
            : "The student profile could not be completed, so the account was removed. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      student: {
        id: createdUser.user.id,
        email: createdUser.user.email,
        full_name: fullName,
      },
    });
  } catch (error) {
    console.error("Admin create student error:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating the student." },
      { status: 500 }
    );
  }
}

/**
 * ADMIN — activate / deactivate a student.
 * Uses the admin's own authenticated client; RLS
 * ("Teachers can manage student profiles" includes is_authorized_admin)
 * rejects any non-admin caller.
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
        { error: "A student and a status are required." },
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
      .from("student_profiles")
      .update({ status: nextStatus })
      .eq("user_id", targetUserId)
      .select("user_id, status")
      .maybeSingle();

    if (updateError || !updated) {
      console.error("Admin update student status error:", updateError?.message);

      return NextResponse.json(
        { error: "Unable to update this student right now." },
        { status: updateError ? 400 : 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student: { user_id: updated.user_id, status: updated.status },
    });
  } catch (error) {
    console.error("Admin update student status error:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating the student." },
      { status: 500 }
    );
  }
}
