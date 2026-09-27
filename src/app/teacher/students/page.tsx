"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { getSupabaseClient } from "@/lib/supabase/client";

type Student = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  age: number | null;
  mun_experience: string | null;
  debate_experience: string | null;
  goals: string | null;
  status: string;
  created_at: string;
};

type StudentForm = {
  full_name: string;
  email: string;
  age: string;
  password: string;
  mun_experience: string;
  debate_experience: string;
  goals: string;
};

const emptyForm: StudentForm = {
  full_name: "",
  email: "",
  age: "",
  password: "",
  mun_experience: "",
  debate_experience: "",
  goals: "",
};

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusActionId, setStatusActionId] = useState("");
  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = getSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      window.location.replace("/teacher/login");
      return;
    }
    // A signed-in Auth user is not automatically a teacher. Confirm the
    // teacher profile before querying or changing any student data.
    const { data: teacherProfile, error: teacherError } = await supabase
      .from("teacher_profiles")
      .select("is_teacher")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (teacherError || !teacherProfile?.is_teacher) {
      setError("You don't have teacher access.");
      setLoading(false);
      setStudents([]);
      return;
    }
    const { data, error: studentsError } = await supabase
      .from("student_profiles")
      .select(
        "id,user_id,full_name,email,age,mun_experience,debate_experience,goals,status,created_at"
      )
      .order("created_at", { ascending: false });

    if (studentsError) {
      setError(
        "We couldn't load the student list. Make sure you are logged in as an authorized teacher."
      );
      setLoading(false);
      return;
    }

    setStudents(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadStudents);
  }, [loadStudents]);

  const updateForm = (
    field: keyof StudentForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const createStudent = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setCreating(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/teacher/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          age: form.age || null,
          password: form.password,
          mun_experience: form.mun_experience,
          debate_experience: form.debate_experience,
          goals: form.goals,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to create the student account."
        );
      }

      setMessage(
        `Student account created for ${result.student.full_name}.`
      );

      setForm(emptyForm);

      await loadStudents();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create the student account."
      );
    } finally {
      setCreating(false);
    }
  };

  const logout = async () => {
    await getSupabaseClient().auth.signOut();
    window.location.replace("/teacher/login");
  };

  const toggleStudentStatus = async (student: Student) => {
    const nextStatus = student.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setStatusActionId(student.id);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/teacher/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: student.user_id,
          status: nextStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to update this student."
        );
      }

      setStudents((current) =>
        current.map((item) =>
          item.user_id === student.user_id
            ? { ...item, status: nextStatus }
            : item
        )
      );

      setMessage(
        `${student.full_name} is now ${nextStatus === "ACTIVE" ? "active" : "inactive"}.`
      );
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update this student."
      );
    } finally {
      setStatusActionId("");
    }
  };

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return students;

    return students.filter((student) =>
      [
        student.full_name,
        student.email,
        student.mun_experience,
        student.debate_experience,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term)
        )
    );
  }, [search, students]);

  const activeCount = students.filter(
    (student) => student.status === "ACTIVE"
  ).length;

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#071321] px-4 py-5 pb-10 text-white sm:px-8 sm:py-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(700px_circle_at_80%_15%,rgba(35,135,255,0.14),transparent_55%)]" />

      <div className="relative mx-auto w-full max-w-7xl">

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <Link
            href="/"
            aria-label="Vidwan home"
            className="flex items-center"
          >
            <Image
              src="/images/vidwan-logo.png"
              alt="Vidwan"
              width={128}
              height={128}
              className="h-10 w-10 object-contain"
            />
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/teacher/dashboard"
              className="rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 transition hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/teacher/students"
              className="rounded-full bg-[#2387ff]/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8bc3ff] transition hover:bg-[#2387ff]/25"
            >
              Students
            </Link>

            <Link
              href="/teacher/meetings"
              className="rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 transition hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:text-white"
            >
              Meetings
            </Link>

            <Link
              href="/teacher/announcements"
              className="rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 transition hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:text-white"
            >
              Announcements
            </Link>
          </div>

          <button
            onClick={logout}
            className="self-start rounded-full border border-white/15 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 transition hover:border-[#2387ff]/50 hover:text-white sm:self-auto"
          >
            Log out
          </button>
        </nav>

        {/* HEADER */}
        <header className="mt-12 border-b border-white/10 pb-8 sm:mt-16 sm:pb-10">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">
            Teacher control
          </p>

          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-[-0.07em] sm:text-6xl">
                Students
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/40 sm:text-base">
                Create and manage the students who have access to Vidwan.
              </p>
            </div>

            <div className="flex gap-3">
              <StatCard
                label="Students"
                value={students.length}
              />

              <StatCard
                label="Active"
                value={activeCount}
              />
            </div>
          </div>
        </header>

        {/* FEEDBACK */}
        {message && (
          <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] px-5 py-4 text-sm text-emerald-200/80">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-300/20 bg-red-300/[0.05] px-5 py-4 text-sm text-red-200/80">
            {error}
          </div>
        )}

        {/* CREATE STUDENT */}
        <section className="mt-8 rounded-[2rem] border border-[#2387ff]/20 bg-[linear-gradient(135deg,rgba(19,52,82,0.9),rgba(8,27,46,0.92))] p-5 shadow-[0_0_80px_rgba(35,135,255,0.07)] sm:mt-10 sm:p-8">

          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">
              Add student
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.05em] sm:text-3xl">
              Create a student account
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Only authorized teachers can create accounts. The
              student will use the email and temporary password
              you provide to log in.
            </p>
          </div>

          <form
            onSubmit={createStudent}
            className="mt-8 space-y-6"
          >
            <div className="grid gap-5 sm:grid-cols-2">

              <Field
                label="Full name"
                value={form.full_name}
                onChange={(value) =>
                  updateForm("full_name", value)
                }
                placeholder="Student name"
                required
              />

              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) =>
                  updateForm("email", value)
                }
                placeholder="student@example.com"
                required
              />

              <Field
                label="Age"
                type="number"
                value={form.age}
                onChange={(value) =>
                  updateForm("age", value)
                }
                placeholder="12"
                min="6"
                max="21"
              />

              <Field
                label="Temporary password"
                type="password"
                value={form.password}
                onChange={(value) =>
                  updateForm("password", value)
                }
                placeholder="At least 8 characters"
                minLength={8}
                required
              />

              <Field
                label="MUN experience"
                value={form.mun_experience}
                onChange={(value) =>
                  updateForm("mun_experience", value)
                }
                placeholder="Beginner, intermediate..."
              />

              <Field
                label="Debate experience"
                value={form.debate_experience}
                onChange={(value) =>
                  updateForm("debate_experience", value)
                }
                placeholder="School debates, none..."
              />
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                Goals
              </label>

              <textarea
                value={form.goals}
                onChange={(event) =>
                  updateForm(
                    "goals",
                    event.target.value
                  )
                }
                placeholder="What does the student want to improve?"
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#071321]/80 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-[#2387ff]/60"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/30">
                The account is created immediately and can then be
                used on the student login page.
              </p>

              <button
                type="submit"
                disabled={creating}
                className="min-h-12 rounded-full bg-white px-7 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#071321] transition hover:-translate-y-0.5 hover:bg-[#dceeff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Creating account..."
                  : "Create student"}
              </button>
            </div>
          </form>
        </section>

        {/* STUDENT LIST */}
        <section className="mt-10 pb-10 sm:mt-14">

          <div className="flex flex-col gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">
                Access control
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.05em] sm:text-3xl">
                Your students
              </h2>
            </div>

            {students.length > 0 && (
              <div className="w-full sm:w-72">
                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search students..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#071321]/80 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#2387ff]/60"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="mt-5 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-7 text-sm text-white/30">
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.025] px-6 py-14 text-center">
              <p className="text-lg font-semibold tracking-[-0.03em] text-white/65">
                No students yet.
              </p>

              <p className="mx-auto mt-2 max-w-md text-sm text-white/30">
                Create your first student account above and it
                will appear here.
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.025] px-6 py-12 text-center">
              <p className="text-lg font-semibold text-white/60">
                No students found.
              </p>

              <p className="mt-2 text-sm text-white/30">
                Try a different name or email.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {filteredStudents.map((student, index) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  index={index}
                  busy={statusActionId === student.user_id}
                  onToggleStatus={() => toggleStudentStatus(student)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StudentCard({
  student,
  index,
  busy,
  onToggleStatus,
}: {
  student: Student;
  index: number;
  busy: boolean;
  onToggleStatus: () => void;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 transition hover:border-[#2387ff]/30 hover:bg-[#2387ff]/[0.05] sm:p-6">

      <div className="absolute left-0 top-0 h-full w-[3px] bg-[#2387ff]/60" />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex min-w-0 gap-4 sm:gap-5">

          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#071321] sm:flex">
            <span className="text-xs font-bold text-[#8bc3ff]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold tracking-[-0.03em] sm:text-xl">
                {student.full_name}
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-[8px] font-bold uppercase tracking-[0.16em] ${
                  student.status === "ACTIVE"
                    ? "bg-emerald-300/10 text-emerald-200/70"
                    : "bg-white/[0.06] text-white/35"
                }`}
              >
                {student.status}
              </span>
            </div>

            <p className="mt-2 break-all text-sm text-white/40">
              {student.email}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {student.age && (
                <Tag>
                  Age {student.age}
                </Tag>
              )}

              {student.mun_experience && (
                <Tag>
                  MUN · {student.mun_experience}
                </Tag>
              )}

              {student.debate_experience && (
                <Tag>
                  Debate · {student.debate_experience}
                </Tag>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 lg:min-w-[190px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">

          <div>
            <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">
              Account created
            </p>

            <p className="mt-1 text-xs text-white/45">
              {new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date(student.created_at))}
            </p>
          </div>

          {student.goals && (
            <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                Goals
              </p>

              <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/35">
                {student.goals}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleStatus}
            disabled={busy}
            aria-busy={busy}
            className="min-h-11 w-full rounded-full border border-white/15 px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/55 transition hover:border-[#2387ff]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
          >
            {busy
              ? "Saving..."
              : student.status === "ACTIVE"
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#2387ff]/10 px-3 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-[#8bc3ff]">
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-[90px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-[-0.05em] text-[#8bc3ff]">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  max,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        minLength={minLength}
        className="h-12 w-full rounded-xl border border-white/10 bg-[#071321]/80 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#2387ff]/60"
      />
    </div>
  );
}