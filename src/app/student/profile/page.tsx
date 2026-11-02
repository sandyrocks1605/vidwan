"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

type Profile = { full_name: string; email: string; age: number | null; mun_experience: string | null; debate_experience: string | null; goals: string | null; status: string };
export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [state, setState] = useState("loading");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => { const supabase = getSupabaseClient(); const { data: session } = await supabase.auth.getSession(); if (!session.session) { window.location.replace("/student/login"); return; } const { data, error } = await supabase.from("student_profiles").select("full_name,email,age,mun_experience,debate_experience,goals,status").eq("user_id", session.session.user.id).maybeSingle(); if (error) throw error; if (!data) { setNotice("Your student account is not set up yet. Please ask your Vidwan teacher for access."); setState("error"); return; } setProfile(data); setState("ready"); }, []);
  useEffect(() => { void Promise.resolve().then(load).catch(() => { setNotice("We couldn't load your profile. Please try again."); setState("error"); }); }, [load]);
  if (state === "loading") return <StudentShell><p className="text-white/45">Loading profile...</p></StudentShell>;
  if (state === "error" || !profile) return <StudentShell><p className="text-red-200">{notice || "We couldn't load your profile."}</p></StudentShell>;
  return <StudentShell><p className="text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">Your profile</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.06em] sm:text-6xl">{profile.full_name}</h1><div className="mt-10 grid gap-4 sm:grid-cols-2">{[["Email", profile.email], ["Age", profile.age ? String(profile.age) : "Not provided"], ["MUN Experience", profile.mun_experience || "Not provided"], ["Debate Experience", profile.debate_experience || "Not provided"], ["Status", profile.status], ["Goal", profile.goals || "Not provided"]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{label}</p><p className="mt-3 text-sm leading-6 text-white/80">{value}</p></div>)}</div></StudentShell>;
}
function StudentShell({ children }: { children: React.ReactNode }) { return <main className="min-h-[100dvh] overflow-x-hidden bg-[#071321] px-4 py-5 text-white sm:px-8 sm:py-8"><div className="relative mx-auto w-full max-w-5xl"><nav aria-label="Student page navigation" className="flex items-center justify-between"><Link href="/student/dashboard" className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-3 text-[10px] uppercase tracking-[0.14em] text-white/55 hover:border-[#2387ff]/40 hover:text-white sm:text-xs">← Dashboard</Link><Link href="/" aria-label="Vidwan home" className="inline-flex min-h-11 min-w-11 items-center justify-center text-sm font-black tracking-[0.18em]">VIDWAN<span className="text-[#2387ff]">.</span></Link></nav><div className="mt-12">{children}</div></div></main>; }
