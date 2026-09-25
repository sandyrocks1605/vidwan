"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

type Announcement = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type FormState = {
  title: string;
  message: string;
  link: string;
  is_published: boolean;
};

const emptyForm: FormState = {
  title: "",
  message: "",
  link: "",
  is_published: true,
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const supabase = getSupabaseClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/teacher/login");
        return;
      }

      const { data: teacher, error: teacherError } = await supabase
        .from("teacher_profiles")
        .select("is_teacher")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (teacherError || !teacher?.is_teacher) {
        if (active) {
          setError("You are not authorized to manage announcements.");
          setLoading(false);
        }
        return;
      }

      if (active) {
        setTeacherId(session.user.id);
      }

      const { data, error: announcementError } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (announcementError) {
        setError("We couldn't load announcements.");
        setLoading(false);
        return;
      }

      setAnnouncements((data ?? []) as Announcement[]);
      setLoading(false);
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const publishedCount = useMemo(
    () =>
      announcements.filter(
        (announcement) => announcement.is_published
      ).length,
    [announcements]
  );

  const draftCount = announcements.length - publishedCount;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!teacherId) {
      setError("Your teacher session has expired. Please log in again.");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    const supabase = getSupabaseClient();

    const { data, error: insertError } = await supabase
      .from("announcements")
      .insert({
        title: form.title.trim(),
        message: form.message.trim(),
        link: form.link.trim() || null,
        is_published: form.is_published,
        created_by: teacherId,
      })
      .select("*")
      .single();

    if (insertError) {
      setError(
        insertError.message ||
          "We couldn't create this announcement."
      );
      setCreating(false);
      return;
    }

    setAnnouncements((current) => [
      data as Announcement,
      ...current,
    ]);

    setForm(emptyForm);
    setSuccess(
      form.is_published
        ? "Announcement published successfully."
        : "Announcement saved as a draft."
    );

    setCreating(false);

    window.setTimeout(() => setSuccess(""), 4000);
  };

  const deleteAnnouncement = async (
    announcement: Announcement
  ) => {
    const confirmed = window.confirm(
      `Delete "${announcement.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(announcement.id);
    setError("");

    const { error: deleteError } = await getSupabaseClient()
      .from("announcements")
      .delete()
      .eq("id", announcement.id);

    setDeletingId(null);

    if (deleteError) {
      setError(
        "We couldn't delete this announcement."
      );
      return;
    }

    setAnnouncements((current) =>
      current.filter(
        (item) => item.id !== announcement.id
      )
    );
  };

  const togglePublished = async (
    announcement: Announcement
  ) => {
    setError("");

    const nextPublished = !announcement.is_published;

    const { data, error: updateError } =
      await getSupabaseClient()
        .from("announcements")
        .update({
          is_published: nextPublished,
        })
        .eq("id", announcement.id)
        .select("*")
        .single();

    if (updateError) {
      setError(
        "We couldn't update this announcement."
      );
      return;
    }

    setAnnouncements((current) =>
      current.map((item) =>
        item.id === announcement.id
          ? (data as Announcement)
          : item
      )
    );
  };

  const logOut = async () => {
    await getSupabaseClient().auth.signOut();
    window.location.replace("/teacher/login");
  };

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#071321] px-4 py-5 pb-10 text-white sm:px-8 sm:py-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(700px_circle_at_80%_15%,rgba(35,135,255,0.14),transparent_55%)]" />

      <div className="relative mx-auto w-full max-w-7xl">

        {/* Navigation */}
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
              className="rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 transition hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:text-white"
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
              className="rounded-full bg-[#2387ff]/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8bc3ff] transition hover:bg-[#2387ff]/25"
            >
              Announcements
            </Link>
          </div>

          <button
            onClick={logOut}
            className="self-start rounded-full border border-white/15 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 transition hover:border-[#2387ff]/50 hover:text-white sm:self-auto"
          >
            Log out
          </button>
        </nav>

        {/* Header */}
        <header className="mt-12 border-b border-white/10 pb-8 sm:mt-16 sm:pb-10">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">
            Teacher control
          </p>

          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-[-0.07em] sm:text-6xl">
                Announcements
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/40 sm:text-base">
                Share important updates, reminders and information
                directly with your students.
              </p>
            </div>

            <div className="flex gap-3">
              <StatCard
                label="Published"
                value={publishedCount}
              />

              <StatCard
                label="Drafts"
                value={draftCount}
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

        {/* Create announcement */}
        <section className="mt-8 rounded-[2rem] border border-[#2387ff]/20 bg-[linear-gradient(135deg,rgba(19,52,82,0.9),rgba(8,27,46,0.92))] p-5 shadow-[0_0_80px_rgba(35,135,255,0.07)] sm:mt-10 sm:p-8">

          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">
              New announcement
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.05em] sm:text-3xl">
              Tell students what matters
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Published announcements will appear on the student
              dashboard automatically.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                Title
              </label>

              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Important update"
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-[#071321]/80 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#2387ff]/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                Message
              </label>

              <textarea
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                placeholder="Write the announcement students should see..."
                rows={6}
                required
                className="w-full resize-none rounded-xl border border-white/10 bg-[#071321]/80 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-[#2387ff]/60"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Optional link
                </label>

                <input
                  type="url"
                  value={form.link}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      link: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#071321]/80 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#2387ff]/60"
                />
              </div>

              <div className="flex items-end">
                <label className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#071321]/80 px-4 transition hover:border-[#2387ff]/40">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_published:
                          event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-[#2387ff]"
                  />

                  <span>
                    <span className="block text-sm text-white/75">
                      Publish immediately
                    </span>

                    <span className="mt-0.5 block text-[10px] text-white/30">
                      Students will see it right away.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/30">
                You can publish or hide announcements later.
              </p>

              <button
                type="submit"
                disabled={creating}
                className="min-h-12 rounded-full bg-white px-7 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#071321] transition hover:-translate-y-0.5 hover:bg-[#dceeff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Saving..."
                  : form.is_published
                    ? "Publish announcement"
                    : "Save draft"}
              </button>
            </div>
          </form>
        </section>

        {/* Announcement list */}
        <section className="mt-10 pb-10 sm:mt-14">

          <div className="flex items-end justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">
                Communication
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.05em] sm:text-3xl">
                All announcements
              </h2>
            </div>

            <span className="text-xs text-white/30">
              {announcements.length} total
            </span>
          </div>

          {loading ? (
            <LoadingCard />
          ) : announcements.length === 0 ? (
            <EmptyCard />
          ) : (
            <div className="mt-5 grid gap-4">
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onToggle={() =>
                    void togglePublished(announcement)
                  }
                  onDelete={() =>
                    void deleteAnnouncement(announcement)
                  }
                  deleting={
                    deletingId === announcement.id
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function AnnouncementCard({
  announcement,
  onToggle,
  onDelete,
  deleting,
}: {
  announcement: Announcement;
  onToggle: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 transition hover:border-[#2387ff]/30 hover:bg-[#2387ff]/[0.05] sm:p-6">
      <div className="absolute left-0 top-0 h-full w-[3px] bg-[#2387ff]/60" />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">

            <span
              className={`rounded-full px-3 py-1 text-[8px] font-bold uppercase tracking-[0.16em] ${
                announcement.is_published
                  ? "bg-emerald-300/10 text-emerald-200/70"
                  : "bg-white/[0.06] text-white/35"
              }`}
            >
              {announcement.is_published
                ? "Published"
                : "Draft"}
            </span>

            <span className="text-[9px] uppercase tracking-[0.16em] text-white/25">
              {formatDate(announcement.created_at)}
            </span>
          </div>

          <h3 className="mt-4 text-xl font-bold tracking-[-0.04em] sm:text-2xl">
            {announcement.title}
          </h3>

          <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-white/45">
            {announcement.message}
          </p>

          {announcement.link && (
            <a
              href={announcement.link}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-full bg-[#2387ff]/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#8bc3ff] transition hover:bg-[#2387ff]/20"
            >
              Open attached link →
            </a>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 border-t border-white/10 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">

          <button
            onClick={onToggle}
            className="rounded-full border border-white/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white/50 transition hover:border-[#2387ff]/40 hover:text-white"
          >
            {announcement.is_published
              ? "Hide"
              : "Publish"}
          </button>

          <button
            onClick={onDelete}
            disabled={deleting}
            className="rounded-full border border-red-300/15 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-red-200/50 transition hover:border-red-300/35 hover:text-red-100 disabled:opacity-40"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
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

function LoadingCard() {
  return (
    <div className="mt-5 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-7 text-sm text-white/30">
      Loading announcements...
    </div>
  );
}

function EmptyCard() {
  return (
    <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.025] px-6 py-14 text-center">
      <p className="text-lg font-semibold tracking-[-0.03em] text-white/65">
        No announcements yet.
      </p>

      <p className="mx-auto mt-2 max-w-md text-sm text-white/30">
        Create your first announcement above and it will
        appear here.
      </p>
    </div>
  );
}