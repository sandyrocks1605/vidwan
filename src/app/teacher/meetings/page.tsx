"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

type Meeting = {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string | null;
  meeting_type:
    | "CLASS"
    | "MUN TRAINING"
    | "WORKSHOP"
    | "MOCK MUN"
    | "DEBATE"
    | "OTHER";
  location: string;
  meeting_link: string | null;
  status: "UPCOMING" | "COMPLETED" | "CANCELLED";
  created_by: string;
  created_at: string;
};

type FormState = {
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  meeting_type: Meeting["meeting_type"];
  location: string;
  meeting_link: string;
};

const meetingTypes: Meeting["meeting_type"][] = [
  "CLASS",
  "MUN TRAINING",
  "WORKSHOP",
  "MOCK MUN",
  "DEBATE",
  "OTHER",
];

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const formatTime = (time: string | null) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const emptyForm: FormState = {
  title: "",
  description: "",
  date: "",
  start_time: "",
  end_time: "",
  meeting_type: "CLASS",
  location: "",
  meeting_link: "",
};

export default function TeacherMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const supabase = getSupabaseClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          window.location.replace("/staff");
          return;
        }

        const { data: teacher, error: teacherError } = await supabase
          .from("teacher_profiles")
          .select("is_teacher, status")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const isActiveTeacher =
          !teacherError && teacher?.is_teacher && teacher.status === "ACTIVE";
        let isActiveAdmin = false;

        if (!isActiveTeacher) {
          const { data: admin, error: adminError } = await supabase
            .from("admin_profiles")
            .select("is_active")
            .eq("user_id", session.user.id)
            .maybeSingle();
          isActiveAdmin = !adminError && admin?.is_active === true;
        }

        if (!isActiveTeacher && !isActiveAdmin) {
          if (active) {
            setError("You are not authorized to manage meetings.");
            setLoading(false);
          }
          return;
        }

        if (active) {
          setTeacherId(session.user.id);
          setIsAdmin(isActiveAdmin);
        }

        const { data, error: meetingError } = await supabase
          .from("meetings")
          .select("*")
          .order("date", { ascending: true })
          .order("start_time", { ascending: true });

        if (!active) return;

        if (meetingError) {
          setError("We couldn't load meetings.");
          setLoading(false);
          return;
        }

        setMeetings((data ?? []) as Meeting[]);
        setLoading(false);
      } catch {
        if (active) {
          setError("We couldn't connect to Vidwan. Please try again.");
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const upcomingMeetings = useMemo(
    () => meetings.filter((meeting) => meeting.status === "UPCOMING"),
    [meetings]
  );

  const pastMeetings = useMemo(
    () => meetings.filter((meeting) => meeting.status !== "UPCOMING"),
    [meetings]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!teacherId) {
      setError("Your staff session has expired. Please log in again.");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const supabase = getSupabaseClient();

      const { data, error: insertError } = await supabase
        .from("meetings")
        .insert({
          title: form.title.trim(),
          description: form.description.trim(),
          date: form.date,
          start_time: form.start_time,
          end_time: form.end_time || null,
          meeting_type: form.meeting_type,
          location: form.location.trim(),
          meeting_link: form.meeting_link.trim() || null,
          status: "UPCOMING",
          created_by: teacherId,
        })
        .select("*")
        .single();

      if (insertError || !data) {
        throw new Error(insertError?.message || "We couldn't create this meeting.");
      }

      setMeetings((current) =>
        [...current, data as Meeting].sort((a, b) => {
          const first = `${a.date} ${a.start_time}`;
          const second = `${b.date} ${b.start_time}`;
          return first.localeCompare(second);
        })
      );

      setForm(emptyForm);
      setSuccess("Meeting created successfully.");
      window.setTimeout(() => setSuccess(""), 4000);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "We couldn't create this meeting.");
    } finally {
      setCreating(false);
    }
  };

  const deleteMeeting = async (meeting: Meeting) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Delete "${meeting.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(meeting.id);
    setError("");
    setSuccess("");

    try {
      const { error: deleteError } = await getSupabaseClient()
        .from("meetings")
        .delete()
        .eq("id", meeting.id);

      if (deleteError) throw deleteError;

      setMeetings((current) =>
        current.filter((item) => item.id !== meeting.id)
      );
      setSuccess("Meeting deleted.");
    } catch {
      setError("We couldn't delete this meeting. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const logOut = async () => {
    await getSupabaseClient().auth.signOut();
    window.location.replace(isAdmin ? "/admin/login" : "/teacher/login");
  };

  if (loading && !teacherId) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#071321] px-4 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-sm text-white/55">
          Checking access and loading meetings…
        </div>
      </main>
    );
  }

  if (!teacherId) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#071321] px-4 text-white">
        <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a1b2e]/90 p-8 text-center">
          <h1 className="text-2xl font-bold tracking-[-0.05em]">ACCESS RESTRICTED</h1>
          <p role="alert" className="mt-4 text-sm leading-6 text-white/55">
            {error || "You are not authorized to manage meetings."}
          </p>
          <Link href="/staff" className="mt-7 inline-flex rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071321]">
            Go to staff access
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#071321] px-4 py-5 pb-10 text-white sm:px-8 sm:py-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(700px_circle_at_80%_15%,rgba(35,135,255,0.14),transparent_55%)]" />

      <div className="relative mx-auto w-full max-w-7xl">
        {/* Navigation */}
        <nav aria-label="Teacher workspace navigation" className="flex flex-col gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <Link
            href="/"
            aria-label="Vidwan home"
            className="inline-flex min-h-11 min-w-11 items-center"
          >
            <Image
              src="/images/vidwan-logo.png"
              alt="Vidwan"
              width={128}
              height={128}
              className="h-10 w-10 object-contain"
            />
          </Link>

          <div className="flex w-full flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-auto sm:flex-wrap sm:overflow-visible sm:pb-0">
            {isAdmin ? (
              <Link
                href="/admin/dashboard"
                className="min-h-11 shrink-0 rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 transition hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:text-white"
              >
                Owner dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/teacher/dashboard"
                  className="min-h-11 shrink-0 rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 transition hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:text-white"
                >
                  Dashboard
                </Link>

                <Link
                  href="/teacher/students"
                  className="min-h-11 shrink-0 rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 transition hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:text-white"
                >
                  Students
                </Link>
              </>
            )}

            <Link
              href="/teacher/meetings"
              className="min-h-11 shrink-0 rounded-full bg-[#2387ff]/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8bc3ff] transition hover:bg-[#2387ff]/25"
            >
              Meetings
            </Link>

            <Link
              href="/teacher/announcements"
              className="min-h-11 shrink-0 rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 transition hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:text-white"
            >
              Announcements
            </Link>
          </div>

          <button
            onClick={logOut}
            className="min-h-11 self-start rounded-full border border-white/15 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 transition hover:border-[#2387ff]/50 hover:text-white sm:self-auto"
          >
            Log out
          </button>
        </nav>

        {/* Header */}
        <header className="mt-12 border-b border-white/10 pb-8 sm:mt-16 sm:pb-10">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">
            {isAdmin ? "Owner control" : "Teacher control"}
          </p>

          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-[-0.07em] sm:text-6xl">
                Meetings
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/40 sm:text-base">
                Create and manage the schedule students see inside Vidwan.
              </p>
            </div>

            <div className="flex gap-3">
              <StatCard
                label="Upcoming"
                value={upcomingMeetings.length}
              />

              <StatCard
                label="Total"
                value={meetings.length}
              />
            </div>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-300/20 bg-red-300/[0.05] px-5 py-4 text-sm text-red-200/80">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-[#2387ff]/25 bg-[#2387ff]/[0.08] px-5 py-4 text-sm text-[#a9d2ff]">
            {success}
          </div>
        )}

        {/* Create meeting */}
        <section className="mt-8 rounded-[2rem] border border-[#2387ff]/20 bg-[linear-gradient(135deg,rgba(19,52,82,0.9),rgba(8,27,46,0.92))] p-5 shadow-[0_0_80px_rgba(35,135,255,0.07)] sm:mt-10 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">
              New meeting
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.05em] sm:text-3xl">
              Schedule a session
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Add the details students need. The meeting will appear on their
              student dashboard once created.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Meeting title"
                value={form.title}
                placeholder="MUN Research Session"
                required
                onChange={(value) =>
                  setForm((current) => ({ ...current, title: value }))
                }
              />

              <div>
                <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Meeting type
                </label>

                <select
                  value={form.meeting_type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      meeting_type:
                        event.target.value as Meeting["meeting_type"],
                    }))
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#071321]/80 px-4 text-sm text-white outline-none transition focus:border-[#2387ff]/60"
                >
                  {meetingTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="What will students be doing in this session?"
                rows={4}
                required
                className="w-full resize-none rounded-xl border border-white/10 bg-[#071321]/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#2387ff]/60"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field
                label="Date"
                type="date"
                value={form.date}
                required
                onChange={(value) =>
                  setForm((current) => ({ ...current, date: value }))
                }
              />

              <Field
                label="Start time"
                type="time"
                value={form.start_time}
                required
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    start_time: value,
                  }))
                }
              />

              <Field
                label="End time"
                type="time"
                value={form.end_time}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    end_time: value,
                  }))
                }
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Location"
                value={form.location}
                placeholder="Vidwan Studio / Online"
                required
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    location: value,
                  }))
                }
              />

              <Field
                label="Meeting link"
                value={form.meeting_link}
                placeholder="https://meet.google.com/..."
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    meeting_link: value,
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/30">
                Students will see this meeting automatically.
              </p>

              <button
                type="submit"
                disabled={creating}
                className="min-h-12 rounded-full bg-white px-7 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#071321] transition hover:-translate-y-0.5 hover:bg-[#dceeff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create meeting"}
              </button>
            </div>
          </form>
        </section>

        {/* Upcoming */}
        <section className="mt-10 sm:mt-14">
          <div className="flex items-end justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">
                Schedule
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.05em] sm:text-3xl">
                Upcoming meetings
              </h2>
            </div>

            <span className="text-xs text-white/30">
              {upcomingMeetings.length} scheduled
            </span>
          </div>

          {loading ? (
            <LoadingCard />
          ) : upcomingMeetings.length === 0 ? (
            <EmptyCard message="Nothing scheduled yet. Create your first meeting above." />
          ) : (
            <div className="mt-5 grid gap-4">
              {upcomingMeetings.map((meeting, index) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  index={index}
                  onDelete={() => void deleteMeeting(meeting)}
                  deleting={deletingId === meeting.id}
                  busy={Boolean(deletingId)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Past / cancelled */}
        {pastMeetings.length > 0 && (
          <section className="mt-12 pb-10">
            <div className="border-b border-white/10 pb-5">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">
                History
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.05em]">
                Previous meetings
              </h2>
            </div>

            <div className="mt-5 grid gap-3">
              {pastMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  index={0}
                  onDelete={() => void deleteMeeting(meeting)}
                  deleting={deletingId === meeting.id}
                  busy={Boolean(deletingId)}
                  muted
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  placeholder,
  type = "text",
  required = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-white/10 bg-[#071321]/80 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#2387ff]/60"
      />
    </div>
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

function MeetingCard({
  meeting,
  index,
  onDelete,
  deleting,
  busy,
  muted = false,
}: {
  meeting: Meeting;
  index: number;
  onDelete: () => void;
  deleting: boolean;
  busy: boolean;
  muted?: boolean;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 transition hover:border-[#2387ff]/30 hover:bg-[#2387ff]/[0.05] sm:p-6 ${
        muted ? "opacity-55" : ""
      }`}
    >
      <div className="absolute left-0 top-0 h-full w-[3px] bg-[#2387ff]/60" />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-5">
          <div className="hidden h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#071321] sm:flex">
            <span className="text-[8px] uppercase tracking-[0.18em] text-white/30">
              #{String(index + 1).padStart(2, "0")}
            </span>

            <span className="mt-1 text-xs font-bold text-[#8bc3ff]">
              {meeting.date.slice(8, 10)}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#2387ff]/10 px-3 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-[#8bc3ff]">
                {meeting.meeting_type}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-[8px] font-bold uppercase tracking-[0.16em] ${
                  meeting.status === "UPCOMING"
                    ? "bg-emerald-300/10 text-emerald-200/70"
                    : meeting.status === "CANCELLED"
                      ? "bg-red-300/10 text-red-200/70"
                      : "bg-white/[0.06] text-white/35"
                }`}
              >
                {meeting.status}
              </span>
            </div>

            <h3 className="mt-3 text-xl font-bold tracking-[-0.04em] sm:text-2xl">
              {meeting.title}
            </h3>

            {meeting.description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                {meeting.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 lg:min-w-[280px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55">
            <span>
              <span className="text-white/25">DATE</span>{" "}
              {formatDate(meeting.date)}
            </span>

            <span>
              <span className="text-white/25">TIME</span>{" "}
              {formatTime(meeting.start_time)}
              {meeting.end_time
                ? ` – ${formatTime(meeting.end_time)}`
                : ""}
            </span>
          </div>

          {meeting.location && (
            <p className="text-xs text-white/40">
              <span className="text-white/25">LOCATION</span>{" "}
              {meeting.location}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {meeting.meeting_link && (
              <a
                href={meeting.meeting_link}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#071321] transition hover:bg-[#dceeff]"
              >
                Open link
              </a>
            )}

            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="rounded-full border border-red-300/15 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-red-200/50 transition hover:border-red-300/35 hover:text-red-100 disabled:cursor-wait disabled:opacity-40"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function LoadingCard() {
  return (
    <div className="mt-5 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-7 text-sm text-white/30">
      Loading meetings...
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.025] px-6 py-12 text-center">
      <p className="text-lg font-semibold tracking-[-0.03em] text-white/65">
        Nothing here yet.
      </p>

      <p className="mx-auto mt-2 max-w-md text-sm text-white/30">
        {message}
      </p>
    </div>
  );
}
