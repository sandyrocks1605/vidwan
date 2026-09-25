import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/server";

type CreateStudentBody = {
  full_name?: string;
  email?: string;
  age?: number | string | null;
  mun_experience?: string | null;
  debate_experience?: string | null;
  goals?: string | null;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in as a teacher." },
        { status: 401 }
      );
    }

    const { data: teacherProfile, error: teacherError } = await supabase
      .from("teacher_profiles")
      .select("is_teacher")
      .eq("user_id", user.id)
      .single();

    if (teacherError || !teacherProfile?.is_teacher) {
      return NextResponse.json(
        { error: "You are not authorized to create student accounts." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as CreateStudentBody;

    const fullName = body.full_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        {
          error:
            "Name, email, and temporary password are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "The temporary password must be at least 8 characters.",
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
          error: "Student age must be between 6 and 21.",
        },
        { status: 400 }
      );
    }

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error(
        "SUPABASE_SERVICE_ROLE_KEY is missing."
      );

      return NextResponse.json(
        {
          error:
            "Server configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

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
      },
    });

    if (createUserError) {
      return NextResponse.json(
        {
          error: createUserError.message,
        },
        { status: 400 }
      );
    }

    if (!createdUser.user) {
      return NextResponse.json(
        {
          error:
            "Student account could not be created.",
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