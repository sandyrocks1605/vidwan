"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string;
  email: string;
  age: number | null;
  mun_experience: string | null;
  debate_experience: string | null;
  goals: string | null;
  status: string;
};

type Meeting = {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string | null;
  meeting_type: string;
  location: string;
  meeting_link: string | null;
  status: string;
};

type Announcement = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  created_at: string;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));

const formatTime = (time: string) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(`1970-01-01T${time}`));

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const isMeetingUpcoming = (meeting: Meeting) => {
  if (meeting.status !== "UPCOMING") return false;

  const meetingDateTime = new Date(
    `${meeting.date}T${meeting.start_time}`
  );

  return meetingDateTime.getTime() >= Date.now();
};

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = getSupabaseClient();

    const { data: session } = await supabase.auth.getSession();

    if (!session.session) {
      window.location.replace("/student/login");
      return;
    }

    const [
      profileResult,
      meetingsResult,
      announcementsResult,
    ] = await Promise.all([
      supabase
        .from("student_profiles")
        .select(
          "full_name,email,age,mun_experience,debate_experience,goals,status"
        )
        .eq("user_id", session.session.user.id)
        .maybeSingle(),

      supabase
        .from("meetings")
        .select("*")
        .in("status", ["UPCOMING", "CANCELLED"])
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(20),

      supabase
        .from("announcements")
        .select("id,title,message,link,created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (
      profileResult.error ||
      meetingsResult.error ||
      announcementsResult.error
    ) {
      throw new Error("We couldn't load your Vidwan dashboard.");
    }
    // An authenticated Auth user is not automatically a student. Handle a
    // missing or inactive student profile with a useful message instead of
    // rendering a broken dashboard.
    if (!profileResult.data) {
      setError(
        "Your student account is not set up yet. Please ask your Vidwan teacher for access."
      );
      setStatus("error");
      return;
    }
    if (profileResult.data.status !== "ACTIVE") {
      setError(
        "Your student account is currently inactive. Please contact your Vidwan teacher."
      );
      setStatus("error");
      return;
    }
    setProfile(profileResult.data);
    setMeetings(meetingsResult.data ?? []);
    setAnnouncements(announcementsResult.data ?? []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    void Promise.resolve()
      .then(load)
      .catch((loadError: Error) => {
        setError(loadError.message);
        setStatus("error");
      });
  }, [load]);

  const logout = async () => {
    await getSupabaseClient().auth.signOut();
    window.location.replace("/student/login");
  };

  const upcomingMeetings = meetings.filter(isMeetingUpcoming);

  const cancelledMeetings = meetings.filter(
    (meeting) => meeting.status === "CANCELLED"
  );

  const nextMeeting = upcomingMeetings[0];

  if (status === "loading") {
    return (
      <StudentShell>
        <Loading />
      </StudentShell>
    );
  }

  if (status === "error") {
    return (
      <StudentShell>
        <Empty
          title="WE COULDN'T LOAD THIS"
          text={error}
          action="TRY AGAIN"
          onClick={() => window.location.reload()}
        />
      </StudentShell>
    );
  }

  return (
    <StudentShell>
      <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">
            Student dashboard
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-[-0.06em] sm:text-6xl">
            {getGreeting()},{" "}
            {profile?.full_name?.split(" ")[0] || "Student"}.
          </h1>

          <p className="mt-3 text-sm text-white/45">
            Here&apos;s what&apos;s next.
          </p>
        </div>

        <button
          onClick={logout}
          className="min-h-11 self-start rounded-full border border-white/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 transition hover:border-[#2387ff]/50 hover:text-white"
        >
          Log out
        </button>
      </header>

      <section className="mt-8 rounded-[2rem] border border-[#2387ff]/30 bg-gradient-to-br from-[#153a65] via-[#0c223c] to-[#081525] p-6 shadow-[0_25px_90px_rgba(35,135,255,0.12)] sm:p-9">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#8bc3ff]">
          What&apos;s next?
        </p>

        {nextMeeting ? (
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                Next meeting
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-5xl">
                {nextMeeting.title}
              </h2>

              <p className="mt-3 text-sm text-white/65">
                {formatDate(nextMeeting.date)} ·{" "}
                {formatTime(nextMeeting.start_time)}
                {nextMeeting.location
                  ? ` · ${nextMeeting.location}`
                  : ""}
              </p>
            </div>

            {nextMeeting.meeting_link && (
              <a
                href={nextMeeting.meeting_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#2387ff] hover:text-white"
              >
                Join meeting →
              </a>
            )}
          </div>
        ) : (
          <div className="mt-5">
            <h2 className="text-3xl font-bold tracking-[-0.05em]">
              Nothing scheduled yet.
            </h2>

            <p className="mt-3 text-sm text-white/55">
              Your next Vidwan meeting will appear here.
            </p>
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#5da8ff]">
                Your schedule
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em]">
                Upcoming
              </h2>
            </div>

            <Link
              href="/student/meetings"
              className="text-xs text-[#78b8ff] transition hover:text-white"
            >
              View all →
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {upcomingMeetings.slice(0, 4).map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
              />
            ))}

            {upcomingMeetings.length === 0 && (
              <Empty
                title="Nothing scheduled yet."
                text="Your upcoming meetings will appear here."
              />
            )}
          </div>

          {cancelledMeetings.length > 0 && (
            <div className="mt-8">
              <p className="text-[10px] uppercase tracking-[0.35em] text-red-300/70">
                Schedule changes
              </p>

              <div className="mt-4 grid gap-3">
                {cancelledMeetings.slice(0, 3).map((meeting) => (
                  <CancelledMeetingCard
                    key={meeting.id}
                    meeting={meeting}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <section>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#5da8ff]">
            Latest from Vidwan
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em]">
            Updates
          </h2>

          <div className="mt-5 grid gap-3">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
              >
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#78b8ff]">
                  NEW
                </p>

                <h3 className="mt-3 font-semibold text-white">
                  {announcement.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/50">
                  {announcement.message}
                </p>

                {announcement.link && (
                  <a
                    href={announcement.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block text-xs text-[#78b8ff] transition hover:text-white"
                  >
                    Open update →
                  </a>
                )}
              </article>
            ))}

            {announcements.length === 0 && (
              <Empty
                title="No new updates from Vidwan."
                text="Important announcements will appear here."
              />
            )}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#5da8ff]">
              Your profile
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em]">
              {profile?.full_name}
            </h2>
          </div>

          <Link
            href="/student/profile"
            className="text-xs text-[#78b8ff] transition hover:text-white"
          >
            View profile →
          </Link>
        </div>

        <p className="mt-3 text-sm text-white/45">
          {profile?.email} · {profile?.status}
        </p>
      </section>
    </StudentShell>
  );
}

function MeetingCard({
  meeting,
}: {
  meeting: Meeting;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-[#2387ff]/25 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#78b8ff]">
            {meeting.meeting_type}
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            {meeting.title}
          </h3>
        </div>

        <span className="shrink-0 text-right text-xs text-white/45">
          {formatDate(meeting.date)}
          <br />
          {formatTime(meeting.start_time)}
        </span>
      </div>

      {meeting.description && (
        <p className="mt-4 text-sm leading-6 text-white/50">
          {meeting.description}
        </p>
      )}

      {meeting.location && (
        <p className="mt-3 text-xs text-white/35">
          {meeting.location}
        </p>
      )}

      {meeting.meeting_link && (
        <a
          href={meeting.meeting_link}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-10 items-center rounded-full border border-[#2387ff]/35 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8bc3ff] transition hover:bg-[#2387ff] hover:text-white"
        >
          Join meeting
        </a>
      )}
    </article>
  );
}

function CancelledMeetingCard({
  meeting,
}: {
  meeting: Meeting;
}) {
  return (
    <article className="rounded-2xl border border-red-300/10 bg-red-300/[0.025] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-red-300/70">
            Cancelled · {meeting.meeting_type}
          </p>

          <h3 className="mt-2 text-lg font-semibold text-white/80">
            {meeting.title}
          </h3>
        </div>

        <span className="shrink-0 text-right text-xs text-white/35">
          {formatDate(meeting.date)}
        </span>
      </div>

      <p className="mt-3 text-sm text-white/40">
        This meeting has been cancelled. Check your schedule for the latest
        updates.
      </p>
    </article>
  );
}

function StudentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#071321] px-4 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white sm:px-8 sm:py-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(700px_circle_at_80%_15%,rgba(35,135,255,0.14),transparent_55%)]" />

      <div className="relative mx-auto w-full max-w-7xl">
        <nav className="flex items-center justify-between">
          <Link
            href="/student/dashboard"
            aria-label="Vidwan student dashboard"
          >
            <Image
              src="/images/vidwan-logo.png"
              alt="Vidwan"
              width={128}
              height={128}
              className="h-10 w-10 object-contain"
            />
          </Link>

          <div className="flex gap-4 text-xs text-white/50">
            <Link
              href="/student/dashboard"
              className="transition hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/student/meetings"
              className="transition hover:text-white"
            >
              Meetings
            </Link>

            <Link
              href="/student/profile"
              className="transition hover:text-white"
            >
              Profile
            </Link>
          </div>
        </nav>

        <div className="mt-10 sm:mt-14">
          {children}
        </div>
      </div>
    </main>
  );
}

function Loading() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-white/40">
      Loading your Vidwan space...
    </div>
  );
}

function Empty({
  title,
  text,
  action,
  onClick,
}: {
  title: string;
  text: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
      <p className="font-semibold text-white">{title}</p>

      <p className="mt-2 text-sm leading-6 text-white/45">
        {text}
      </p>

      {action && (
        <button
          onClick={onClick}
          className="mt-4 rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#2387ff] hover:text-white"
        >
          {action}
        </button>
      )}
    </div>
  );
}