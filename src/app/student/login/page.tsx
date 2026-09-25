"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) setError("We couldn't verify that email and password.");
    else router.push("/student/dashboard");
    setBusy(false);
  };

  return (
    <main className="relative flex min-h-[100dvh] items-center overflow-hidden bg-[#071321] px-4 py-6 text-white sm:min-h-screen sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_80%_15%,rgba(35,135,255,0.16),transparent_55%)]" />
      <section className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0a1b2e]/90 p-6 shadow-[0_0_100px_rgba(35,135,255,0.1)] backdrop-blur-xl sm:p-10">
        <Link href="/" aria-label="Vidwan home" className="flex items-center"><Image src="/images/vidwan-logo.png" alt="Vidwan" width={128} height={128} className="h-11 w-11 object-contain" /></Link>
        <p className="mt-10 text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">Student access</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.07em]">STUDENT LOGIN</h1>
        <p className="mt-4 text-sm leading-6 text-white/50">See what&apos;s next, stay close to the work, and keep your Vidwan journey moving.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block"><span className="text-[10px] uppercase tracking-[0.2em] text-white/55">EMAIL</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#071321] px-4 py-3.5 text-white outline-none focus:border-[#2387ff]/60" /></label>
          <label className="block"><span className="text-[10px] uppercase tracking-[0.2em] text-white/55">PASSWORD</span><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#071321] px-4 py-3.5 text-white outline-none focus:border-[#2387ff]/60" /></label>
          {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
          <button disabled={busy} className="min-h-12 w-full rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#2387ff] hover:text-white disabled:opacity-60">{busy ? "Logging in..." : "Log in →"}</button>
        </form>
        <p className="mt-7 text-center text-sm text-white/40">New to Vidwan? <Link href="/student/signup" className="text-[#78b8ff] hover:text-white">Create a student account</Link></p>
      </section>
    </main>
  );
}
