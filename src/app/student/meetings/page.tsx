"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

type Meeting = { id: string; title: string; description: string; date: string; start_time: string; end_time: string | null; meeting_type: string; location: string; meeting_link: string | null; status: string };
const dateLabel = (date: string) => new Intl.DateTimeFormat("en-IN", { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00`));
const timeLabel = (time: string) => new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(`1970-01-01T${time}`));

export default function StudentMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const load = useCallback(async () => { const supabase = getSupabaseClient(); const { data: session } = await supabase.auth.getSession(); if (!session.session) { window.location.replace("/student/login"); return; } const { data, error } = await supabase.from("meetings").select("*").order("date", { ascending: true }).order("start_time", { ascending: true }); if (error) throw error; setMeetings(data ?? []); setState("ready"); }, []);
  useEffect(() => { void Promise.resolve().then(load).catch(() => setState("error")); }, [load]);
  if (state === "loading") return <StudentPageShell><p className="text-white/45">Loading schedule...</p></StudentPageShell>;
  if (state === "error") return <StudentPageShell><p className="text-red-200">We couldn&apos;t load the schedule.</p></StudentPageShell>;
  return <StudentPageShell><p className="text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">Your schedule</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.06em] sm:text-6xl">Meetings</h1><p className="mt-5 max-w-xl text-sm leading-6 text-white/45">Know what is happening next, where it is, and how to show up ready.</p><div className="mt-10 grid gap-4">{meetings.map((meeting) => <article key={meeting.id} className={`rounded-[2rem] border p-6 ${meeting.status === "CANCELLED" ? "border-red-300/20 bg-red-300/[0.04]" : "border-white/10 bg-white/[0.035]"}`}><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[9px] uppercase tracking-[0.22em] text-[#78b8ff]">{meeting.meeting_type} · {meeting.status}</p><h2 className="mt-3 text-2xl font-bold tracking-[-0.04em]">{meeting.title}</h2></div><p className="text-sm text-white/55 sm:text-right">{dateLabel(meeting.date)}<br />{timeLabel(meeting.start_time)}{meeting.end_time ? ` – ${timeLabel(meeting.end_time)}` : ""}</p></div><p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">{meeting.description}</p>{meeting.location && <p className="mt-4 text-xs text-white/40">{meeting.location}</p>}{meeting.meeting_link && meeting.status !== "CANCELLED" && <a href={meeting.meeting_link} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071321] hover:bg-[#2387ff] hover:text-white">Join meeting →</a>}</article>)}{meetings.length === 0 && <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-white/45">Nothing scheduled yet.</div>}</div></StudentPageShell>;
}

function StudentPageShell({ children }: { children: React.ReactNode }) { return <main className="min-h-[100dvh] overflow-x-hidden bg-[#071321] px-4 py-5 text-white sm:px-8 sm:py-8"><div className="relative mx-auto w-full max-w-5xl"><nav className="flex items-center justify-between"><Link href="/student/dashboard" className="text-xs uppercase tracking-[0.18em] text-white/55 hover:text-white">← Dashboard</Link><Link href="/" className="text-sm font-black tracking-[0.18em]">VIDWAN<span className="text-[#2387ff]">.</span></Link></nav><div className="mt-12">{children}</div></div></main>; }
