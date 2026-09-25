"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function StudentSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", age: "", munExperience: "", debateExperience: "", goals: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { data, error: signUpError } = await getSupabaseClient().auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: form.fullName.trim(), age: form.age, mun_experience: form.munExperience, debate_experience: form.debateExperience, goals: form.goals.trim() } },
    });
    if (signUpError) setError(signUpError.message);
    else if (data.session) router.push("/student/dashboard");
    else setError("Account created. Check your email to confirm it, then log in.");
    setBusy(false);
  };

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#071321] px-4 py-6 text-white sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_80%_15%,rgba(35,135,255,0.16),transparent_55%)]" />
      <section className="relative mx-auto w-full max-w-3xl rounded-[2rem] border border-white/10 bg-[#0a1b2e]/90 p-5 shadow-[0_0_100px_rgba(35,135,255,0.1)] backdrop-blur-xl sm:p-10">
        <Link href="/" aria-label="Vidwan home" className="flex items-center"><Image src="/images/vidwan-logo.png" alt="Vidwan" width={128} height={128} className="h-11 w-11 object-contain" /></Link>
        <p className="mt-10 text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">Your Vidwan account</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.07em] sm:text-6xl">CREATE YOUR ACCOUNT</h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-white/50">A simple home for your next meeting, update, and step forward.</p>
        <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className="field-label">FULL NAME</span><input required value={form.fullName} onChange={(event) => update("fullName", event.target.value)} className="field-input" /></label>
          <label className="block"><span className="field-label">EMAIL</span><input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="field-input" /></label>
          <label className="block"><span className="field-label">PASSWORD</span><input required minLength={8} type="password" value={form.password} onChange={(event) => update("password", event.target.value)} className="field-input" /></label>
          <label className="block"><span className="field-label">AGE</span><input required min={6} max={21} type="number" value={form.age} onChange={(event) => update("age", event.target.value)} className="field-input" /></label>
          <label className="block"><span className="field-label">MUN EXPERIENCE</span><select value={form.munExperience} onChange={(event) => update("munExperience", event.target.value)} className="field-input"><option value="">Select experience</option><option>None</option><option>1–2 conferences</option><option>3–5 conferences</option><option>5+ conferences</option></select></label>
          <label className="block"><span className="field-label">DEBATE EXPERIENCE</span><input value={form.debateExperience} onChange={(event) => update("debateExperience", event.target.value)} placeholder="Tell us briefly" className="field-input" /></label>
          <label className="block sm:col-span-2"><span className="field-label">YOUR GOAL</span><textarea rows={3} value={form.goals} onChange={(event) => update("goals", event.target.value)} placeholder="What do you want to become better at?" className="field-input resize-y" /></label>
          {error && <p role="alert" className="text-sm leading-6 text-red-200 sm:col-span-2">{error}</p>}
          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"><Link href="/student/login" className="text-sm text-white/45 hover:text-white">Already have an account?</Link><button disabled={busy} className="min-h-12 rounded-full bg-white px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#2387ff] hover:text-white disabled:opacity-60">{busy ? "Creating..." : "Create account →"}</button></div>
        </form>
      </section>
    </main>
  );
}
