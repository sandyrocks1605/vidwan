import { NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  getSupabaseForRequest,
} from "@/lib/supabase/server";

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

async function resolveAuthorizedTeacher(request: Request) {
  const { supabase, user } = await getSupabaseForRequest(request);

  if (!user) {
    return { error: NextResponse.json({ error: "Please log in again." }, { status: 401 }) };
  }

  const { data: teacherProfile, error: teacherError } = await supabase
    .from("teacher_profiles")
    .select("is_teacher, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    teacherError ||
    !teacherProfile?.is_teacher ||
    teacherProfile.status !== "ACTIVE"
  ) {
    return {
      error: NextResponse.json(
        { error: "You don't have teacher access." },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export async function POST(request: Request) {
  try {
    const teacher = await resolveAuthorizedTeacher(request);

    if (teacher.error) return teacher.error;

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

    if (!password) {
      return NextResponse.json(
        { error: "A temporary password is required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error: "The temporary password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const age =
      body.age === null ||
      body.age === undefined ||
      body.age === ""
        ? null
        : Number(body.age);

    if (
      age !== null &&
      (!Number.isInteger(age) || age < 6 || age > 21)
    ) {
      return NextResponse.json(
        {
          error: "Student age must be a whole number between 6 and 21.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      console.error(
        "SUPABASE_SERVICE_ROLE_KEY is missing from the server environment."
      );

      return NextResponse.json(
        {
          error: "Server configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    const {
      data: createdUser,
      error: createUserError,
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        age,
        mun_experience:
          body.mun_experience?.trim() || null,
        debate_experience:
          body.debate_experience?.trim() || null,
        goals: body.goals?.trim() || null,
        // Only accounts explicitly marked as students get a student profile
        // from public.handle_new_student().
        account_type: "student",
      },
    });

    if (createUserError) {
      console.error("Supabase createUser error:", createUserError.message);

      return NextResponse.json(
        {
          error:
            "Unable to create student. Please check the details and try again.",
        },
        { status: 400 }
      );
    }

    if (!createdUser.user) {
      return NextResponse.json(
        {
          error:
            "Unable to create student. Please check the details and try again.",
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
    console.error(
      "Create student error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the student.",
      },
      { status: 500 }
    );
  }
}

const CREATE_STUDENT_BODY_KEYS: (keyof CreateStudentBody)[] = [
  "full_name",
  "email",
  "age",
  "mun_experience",
  "debate_experience",
  "goals",
  "password",
];

void CREATE_STUDENT_BODY_KEYS;

/**
 * Toggles a student's account status. Students can never change their own
 * status: the request is rejected unless the caller is an authorized teacher
 * and the target row is a student profile they may manage.
 */
export async function PATCH(request: Request) {
  try {
    const teacher = await resolveAuthorizedTeacher(request);

    if (teacher.error) return teacher.error;

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
      console.error("Update student status error:", updateError?.message);

      return NextResponse.json(
        { error: "Unable to update this student right now." },
        { status: updateError ? 400 : 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student: {
        user_id: updated.user_id,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("Update student status error:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating the student." },
      { status: 500 }
    );
  }
}
