"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

type Registration = {
  id: string;
  created_at: string;
  parent_name: string;
  student_name: string;
  student_age: number;
  preferred_track: string;
  email: string;
  phone: string;
  prior_mun_experience: string;
  heard_from: string | null;
  additional_info: string | null;
  is_read: boolean;
  read_at: string | null;
  read_by: string | null;
};

type TeacherProfile = { name: string; is_teacher: boolean };
type Tab = "inbox" | "archive";

const trackOptions = [
  ["", "All tracks"],
  ["beginner-mun", "Beginner MUN"],
  ["intermediate-mun", "Intermediate MUN"],
  ["advanced-mun", "Advanced MUN"],
  ["mun-debate", "MUN + Debate"],
  ["unsure", "I'm not sure yet"],
];

const experienceOptions = [
  ["", "All experience"],
  ["none", "None"],
  ["one-to-two", "1–2 conferences"],
  ["three-to-five", "3–5 conferences"],
  ["five-plus", "5+ conferences"],
];

const trackLabel = (value: string) =>
  trackOptions.find(([option]) => option === value)?.[1] ?? value;

const experienceLabel = (value: string) =>
  experienceOptions.find(([option]) => option === value)?.[1] ?? value;

const referralLabel = (value: string | null) => {
  if (!value) return "Not provided";

  return (
    {
      instagram: "Instagram",
      friend: "Friend",
      school: "School",
      whatsapp: "WhatsApp",
      google: "Google",
      other: "Other",
    }[value] ?? value
  );
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function TeacherDashboardPage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selected, setSelected] = useState<Registration | null>(null);
  const [tab, setTab] = useState<Tab>("inbox");
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("");
  const [experience, setExperience] = useState("");
  const [page, setPage] = useState(0);
  const [matchingCount, setMatchingCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  const [beginnerCount, setBeginnerCount] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "denied" | "error">("loading");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ registration: Registration; timeoutId: number } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Registration | null>(null);
  const [actionId, setActionId] = useState("");

  const refreshData = useCallback(async () => {
    const supabase = getSupabaseClient();
    const searchTerm = search.trim().replace(/[(),]/g, "");

    let query = supabase
      .from("registrations")
      .select("*", { count: "exact" })
      .eq("is_read", tab === "archive")
      .order("created_at", { ascending: false })
      .range(page * 50, page * 50 + 49);

    if (searchTerm) {
      query = query.or(
        `student_name.ilike.%${searchTerm}%,parent_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
      );
    }

    if (track) query = query.eq("preferred_track", track);
    if (experience) query = query.eq("prior_mun_experience", experience);

    const [listResult, totalResult, unreadResult, archivedResult, beginnerResult] =
      await Promise.all([
        query,
        supabase.from("registrations").select("id", { count: "exact", head: true }),
        supabase.from("registrations").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("registrations").select("id", { count: "exact", head: true }).eq("is_read", true),
        supabase.from("registrations").select("id", { count: "exact", head: true }).eq("preferred_track", "beginner-mun"),
      ]);

    if (listResult.error || totalResult.error || unreadResult.error || archivedResult.error || beginnerResult.error) {
      throw new Error("We couldn't load registration responses. Please try again.");
    }

    setRegistrations((listResult.data ?? []) as Registration[]);
    setMatchingCount(listResult.count ?? 0);
    setTotalCount(totalResult.count ?? 0);
    setUnreadCount(unreadResult.count ?? 0);
    setArchivedCount(archivedResult.count ?? 0);
    setBeginnerCount(beginnerResult.count ?? 0);
    setStatus("ready");
  }, [experience, page, search, tab, track]);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseClient();

    const loadAuthorization = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        window.location.replace("/teacher/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("teacher_profiles")
        .select("name, is_teacher")
        .eq("user_id", sessionData.session.user.id)
        .maybeSingle();

      if (!active) return;

      if (profileError) {
        setError("We couldn't verify teacher authorization.");
        setStatus("error");
        return;
      }

      if (!profileData?.is_teacher) {
        setStatus("denied");
        return;
      }

      setProfile(profileData);
    };

    void loadAuthorization();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!profile?.is_teacher) return;

    let active = true;

    void Promise.resolve().then(() => refreshData()).catch((loadError: Error) => {
      if (active) {
        setError(loadError.message);
        setStatus("error");
      }
    });

    return () => {
      active = false;
    };
  }, [profile, refreshData]);

  const resetListing = () => {
    setPage(0);
    setSelected(null);
  };

  const updateRegistration = async (registration: Registration, isRead: boolean) => {
    setActionId(registration.id);
    setError("");
    const { data: sessionData } = await getSupabaseClient().auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      window.location.replace("/teacher/login");
      return;
    }

    const readAt = isRead ? new Date().toISOString() : null;
    const { error: updateError } = await getSupabaseClient()
      .from("registrations")
      .update({ is_read: isRead, read_at: readAt, read_by: isRead ? userId : null })
      .eq("id", registration.id);

    setActionId("");

    if (updateError) {
      setError("We couldn't update this registration. Please try again.");
      return;
    }

    setSelected(null);
    await refreshData();

    if (isRead) {
      const timeoutId = window.setTimeout(() => setToast(null), 7000);
      setToast({ registration: { ...registration, is_read: true, read_at: readAt, read_by: userId }, timeoutId });
    }
  };

  const undoToast = async () => {
    if (!toast) return;
    window.clearTimeout(toast.timeoutId);
    const registration = toast.registration;
    setToast(null);
    await updateRegistration(registration, false);
  };

  const deleteRegistration = async () => {
    if (!pendingDelete) return;

    setActionId(pendingDelete.id);
    const { error: deleteError } = await getSupabaseClient()
      .from("registrations")
      .delete()
      .eq("id", pendingDelete.id)
      .eq("is_read", true);
    setActionId("");

    if (deleteError) {
      setError("We couldn't delete this registration. Please try again.");
      return;
    }

    setPendingDelete(null);
    setSelected(null);
    await refreshData();
  };

  const logOut = async () => {
    await getSupabaseClient().auth.signOut();
    window.location.replace("/teacher/login");
  };

  if (status === "loading" && !profile) {
    return <DashboardShell><LoadingState /></DashboardShell>;
  }

  if (status === "denied") {
    return <DashboardShell><EmptyState title="ACCESS DENIED" message="This dashboard is restricted to authorized Vidwan teachers and staff." action="BACK TO VIDWAN" /></DashboardShell>;
  }

  if (status === "error") {
    return <DashboardShell><EmptyState title="WE COULDN'T LOAD THIS" message={error} action="TRY AGAIN" onAction={() => window.location.reload()} /></DashboardShell>;
  }

  return (
    <DashboardShell>
      <header className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">Teacher dashboard</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.06em] sm:text-6xl">Welcome, {profile?.name || "Teacher"}.</h1>
        </div>
        <button onClick={logOut} className="self-start rounded-full border border-white/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 transition hover:border-[#2387ff]/50 hover:text-white">Log out</button>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total registrations" value={totalCount} />
        <Stat label="Unread" value={unreadCount} />
        <Stat label="Archived" value={archivedCount} />
        <Stat label="Beginner" value={beginnerCount} />
      </div>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-[#0a1b2e]/80 p-5 shadow-[0_0_80px_rgba(35,135,255,0.06)] sm:p-7">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">Registrations</p>
            <div className="mt-4 flex gap-2">
              <TabButton active={tab === "inbox"} onClick={() => { setTab("inbox"); resetListing(); }}>Inbox <span>{unreadCount}</span></TabButton>
              <TabButton active={tab === "archive"} onClick={() => { setTab("archive"); resetListing(); }}>Archive <span>{archivedCount}</span></TabButton>
            </div>
          </div>
          <p className="text-xs text-white/35">{tab === "inbox" ? "New responses awaiting review" : "Read responses kept safely"}</p>
        </div>

        <div className="mt-7 flex flex-col gap-4 lg:flex-row">
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Search registrations..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#071321]/80 px-4 py-3 text-sm text-white outline-none focus:border-[#2387ff]/60" />
          <select value={track} onChange={(event) => { setTrack(event.target.value); setPage(0); }} className="rounded-xl border border-white/10 bg-[#071321]/80 px-4 py-3 text-sm text-white outline-none focus:border-[#2387ff]/60">{trackOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select value={experience} onChange={(event) => { setExperience(event.target.value); setPage(0); }} className="rounded-xl border border-white/10 bg-[#071321]/80 px-4 py-3 text-sm text-white outline-none focus:border-[#2387ff]/60">{experienceOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>

        {registrations.length === 0 ? (
          <div className="py-20 text-center"><p className="text-2xl font-semibold tracking-[-0.04em]">{tab === "inbox" ? "INBOX IS CLEAR" : "NO ARCHIVED REGISTRATIONS"}</p><p className="mt-3 text-sm text-white/40">{tab === "inbox" ? "New student responses will appear here." : "Registrations marked as read will stay here until restored or deleted."}</p></div>
        ) : (
          <>
            <div className="mt-7 hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1120px] text-left text-sm"><thead className="border-b border-white/10 text-[9px] uppercase tracking-[0.22em] text-white/35"><tr><th className="px-3 py-4">Date</th><th className="px-3 py-4">Student</th><th className="px-3 py-4">Parent / Guardian</th><th className="px-3 py-4">Age</th><th className="px-3 py-4">Track</th><th className="px-3 py-4">Contact</th><th className="px-3 py-4">Experience</th><th className="px-3 py-4">Action</th></tr></thead><tbody>{registrations.map((registration) => <RegistrationRow key={registration.id} registration={registration} tab={tab} onView={() => setSelected(registration)} onStatusChange={() => void updateRegistration(registration, tab === "inbox")} onDelete={() => setPendingDelete(registration)} busy={actionId === registration.id} />)}</tbody></table>
            </div>
            <div className="mt-7 grid gap-3 lg:hidden">{registrations.map((registration) => <RegistrationCard key={registration.id} registration={registration} tab={tab} onView={() => setSelected(registration)} onStatusChange={() => void updateRegistration(registration, tab === "inbox")} onDelete={() => setPendingDelete(registration)} busy={actionId === registration.id} />)}</div>
            <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between"><span>Showing {page * 50 + 1}–{Math.min(page * 50 + registrations.length, matchingCount)} of {matchingCount}</span><div className="flex gap-2"><button disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="rounded-full border border-white/15 px-4 py-2 uppercase tracking-[0.15em] transition hover:border-[#2387ff]/50 disabled:cursor-not-allowed disabled:opacity-30">Previous</button><button disabled={(page + 1) * 50 >= matchingCount} onClick={() => setPage((current) => current + 1)} className="rounded-full border border-white/15 px-4 py-2 uppercase tracking-[0.15em] transition hover:border-[#2387ff]/50 disabled:cursor-not-allowed disabled:opacity-30">Next</button></div></div>
          </>
        )}
      </section>

      {selected && <RegistrationModal registration={selected} tab={tab} onClose={() => setSelected(null)} onStatusChange={() => void updateRegistration(selected, tab === "inbox")} busy={actionId === selected.id} />}
      {pendingDelete && <DeleteModal onCancel={() => setPendingDelete(null)} onConfirm={() => void deleteRegistration()} busy={actionId === pendingDelete.id} />}
      {toast && <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-full border border-[#2387ff]/35 bg-[#0a1b2e]/95 px-5 py-3 text-sm text-white shadow-[0_15px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl"><span>Registration marked as read.</span><button onClick={() => void undoToast()} className="font-bold uppercase tracking-[0.16em] text-[#78b8ff] transition hover:text-white">Undo</button></div>}
    </DashboardShell>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen overflow-x-hidden bg-[#071321] px-5 py-6 text-white sm:px-8 sm:py-8"><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(700px_circle_at_80%_15%,rgba(35,135,255,0.14),transparent_55%)]" /><div className="relative mx-auto w-full max-w-7xl"><nav className="flex items-center justify-between"><Link href="/" className="text-sm font-black tracking-[0.18em]">VIDWAN<span className="text-[#2387ff]">.</span></Link><span className="text-[10px] uppercase tracking-[0.28em] text-white/35">Internal workspace</span></nav><div className="mt-14">{children}</div></div></main>;
}

function LoadingState() {
  return <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-white/40">Loading teacher workspace...</div>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-[9px] uppercase tracking-[0.24em] text-white/35">{label}</p><p className="mt-4 text-4xl font-bold tracking-[-0.06em] text-[#8bc3ff]">{value}</p></div>;
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition ${active ? "bg-[#2387ff]/20 text-[#8bc3ff]" : "text-white/40 hover:bg-white/[0.05] hover:text-white"}`}>{children}</button>;
}

function RegistrationRow({ registration, tab, onView, onStatusChange, onDelete, busy }: { registration: Registration; tab: Tab; onView: () => void; onStatusChange: () => void; onDelete: () => void; busy: boolean }) {
  return <tr className={`border-b border-white/[0.06] text-white/65 transition hover:bg-[#2387ff]/[0.08] ${tab === "archive" ? "opacity-75" : ""}`}><td className="px-3 py-4 text-xs text-white/40">{formatDate(registration.created_at)}</td><td className="px-3 py-4 font-semibold text-white"><button onClick={onView} className="text-left hover:text-[#8bc3ff]">{tab === "inbox" && <span className="mr-2 text-[#2387ff]">●</span>}{registration.student_name}</button></td><td className="px-3 py-4">{registration.parent_name}</td><td className="px-3 py-4">{registration.student_age}</td><td className="px-3 py-4">{trackLabel(registration.preferred_track)}</td><td className="px-3 py-4"><div>{registration.email}</div><div className="mt-1 text-xs text-white/35">{registration.phone}</div></td><td className="px-3 py-4">{experienceLabel(registration.prior_mun_experience)}</td><td className="px-3 py-4"><div className="flex flex-wrap gap-2"><button onClick={onView} className="rounded-full border border-white/15 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-white/60 hover:border-[#2387ff]/50 hover:text-white">View</button>{tab === "inbox" ? <button disabled={busy} onClick={onStatusChange} className="rounded-full bg-[#2387ff]/15 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8bc3ff] hover:bg-[#2387ff]/25 disabled:opacity-50">{busy ? "Saving..." : "Mark as read ✓"}</button> : <><button disabled={busy} onClick={onStatusChange} className="rounded-full border border-[#2387ff]/35 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8bc3ff] hover:bg-[#2387ff]/15 disabled:opacity-50">{busy ? "Saving..." : "Restore to inbox"}</button><button disabled={busy} onClick={onDelete} className="rounded-full border border-red-300/25 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-red-200/70 hover:border-red-300/50 hover:text-red-100 disabled:opacity-50">Delete permanently</button></>}</div></td></tr>;
}

function RegistrationCard({ registration, tab, onView, onStatusChange, onDelete, busy }: { registration: Registration; tab: Tab; onView: () => void; onStatusChange: () => void; onDelete: () => void; busy: boolean }) {
  return <article className={`rounded-2xl border border-white/10 bg-white/[0.035] p-5 ${tab === "archive" ? "opacity-75" : ""}`}><div className="flex items-start justify-between gap-4"><button onClick={onView} className="text-left"><p className="font-semibold text-white">{tab === "inbox" && <span className="mr-2 text-[#2387ff]">●</span>}{registration.student_name}</p><p className="mt-1 text-xs text-white/40">{formatDate(registration.created_at)}</p></button><span className="text-xs text-[#78b8ff]">{registration.student_age} yrs</span></div><div className="mt-5 grid gap-2 text-sm text-white/55"><p>{trackLabel(registration.preferred_track)}</p><p>{registration.email}</p><p>{registration.phone}</p></div><div className="mt-5 flex flex-wrap gap-2"><button onClick={onView} className="rounded-full border border-white/15 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-white/60">View</button>{tab === "inbox" ? <button disabled={busy} onClick={onStatusChange} className="rounded-full bg-[#2387ff]/15 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8bc3ff] disabled:opacity-50">{busy ? "Saving..." : "Mark as read ✓"}</button> : <><button disabled={busy} onClick={onStatusChange} className="rounded-full border border-[#2387ff]/35 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8bc3ff] disabled:opacity-50">{busy ? "Saving..." : "Restore to inbox"}</button><button disabled={busy} onClick={onDelete} className="rounded-full border border-red-300/25 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-red-200/70 disabled:opacity-50">Delete permanently</button></>}</div></article>;
}

function RegistrationModal({ registration, tab, onClose, onStatusChange, busy }: { registration: Registration; tab: Tab; onClose: () => void; onStatusChange: () => void; busy: boolean }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#020810]/80 p-5 backdrop-blur-sm" role="presentation" onClick={onClose}><div role="dialog" aria-modal="true" aria-label="Registration details" onClick={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#2387ff]/30 bg-[#0a1b2e] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.5)] sm:p-9"><div className="flex items-start justify-between gap-5"><div><p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">Registration</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.05em]">{registration.student_name}</h2><p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8bc3ff]">{registration.is_read ? "Read / Archived" : "Unread"}</p></div><button onClick={onClose} className="rounded-full border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white/60">Close</button></div><div className="mt-8 grid gap-5 sm:grid-cols-2">{[["Parent / Guardian", registration.parent_name], ["Age", String(registration.student_age)], ["Preferred Track", trackLabel(registration.preferred_track)], ["Email", registration.email], ["Phone / WhatsApp", registration.phone], ["Prior MUN Experience", experienceLabel(registration.prior_mun_experience)], ["How they heard about us", referralLabel(registration.heard_from)], ["Original registration date", formatDate(registration.created_at)]].map(([label, value]) => <div key={label}><p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{label}</p><p className="mt-2 text-sm text-white/80">{value}</p></div>)}</div><div className="mt-7 border-t border-white/10 pt-6"><p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Additional information</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/65">{registration.additional_info || "Not provided"}</p></div><div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-6"><button onClick={onClose} className="rounded-full border border-white/15 px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-white/60">Close</button>{tab === "inbox" ? <button disabled={busy} onClick={onStatusChange} className="rounded-full bg-[#2387ff]/20 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8bc3ff] disabled:opacity-50">{busy ? "Saving..." : "Mark as read ✓"}</button> : <button disabled={busy} onClick={onStatusChange} className="rounded-full border border-[#2387ff]/35 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8bc3ff] disabled:opacity-50">{busy ? "Saving..." : "Restore to inbox"}</button>}</div></div></div>;
}

function DeleteModal({ onCancel, onConfirm, busy }: { onCancel: () => void; onConfirm: () => void; busy: boolean }) {
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-[#020810]/85 p-5 backdrop-blur-sm" role="presentation"><div role="alertdialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-[2rem] border border-red-300/20 bg-[#0a1b2e] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.55)]"><p className="text-[10px] uppercase tracking-[0.35em] text-red-200/70">Permanent action</p><h2 id="delete-title" className="mt-4 text-3xl font-bold tracking-[-0.05em]">Delete this registration permanently?</h2><p className="mt-4 text-sm leading-6 text-white/50">This cannot be undone.</p><div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={onCancel} className="rounded-full border border-white/15 px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-white/65">Cancel</button><button disabled={busy} onClick={onConfirm} className="rounded-full bg-red-200 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#321018] disabled:opacity-50">{busy ? "Deleting..." : "Delete permanently"}</button></div></div></div>;
}

function EmptyState({ title, message, action, onAction }: { title: string; message: string; action: string; onAction?: () => void }) {
  return <div className="rounded-[2rem] border border-white/10 bg-[#0a1b2e]/80 px-6 py-24 text-center"><p className="text-3xl font-bold tracking-[-0.05em]">{title}</p><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/45">{message}</p>{onAction ? <button onClick={onAction} className="mt-8 rounded-full bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#071321]">{action}</button> : <Link href="/" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#071321]">{action}</Link>}</div>;
}