"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError("That email and password combination could not be verified.");
        return;
      }

      router.push("/teacher/dashboard");
    } catch {
      setError("We couldn't connect to Vidwan authentication. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-[100dvh] items-center overflow-hidden bg-[#071321] px-4 py-6 text-white sm:min-h-screen sm:px-8 sm:py-8">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(700px circle at 80% 15%, rgba(35,135,255,0.16), transparent 55%), radial-gradient(500px circle at 10% 80%, rgba(35,135,255,0.1), transparent 60%)",
        }}
      />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2387ff]/10" />

      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center justify-between gap-4 sm:mb-10">
          <Link href="/" className="text-sm font-black tracking-[0.18em]">
            VIDWAN<span className="text-[#2387ff]">.</span>
          </Link>
          <Link
            href="/"
            className="text-right text-[9px] uppercase tracking-[0.16em] text-white/45 transition hover:text-white sm:text-[10px] sm:tracking-[0.2em]"
          >
            ← Back to Vidwan
          </Link>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-[#0a1b2e]/90 p-5 shadow-[0_0_100px_rgba(35,135,255,0.1)] backdrop-blur-xl sm:p-10">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">
            Restricted access
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.07em] sm:text-5xl">
            TEACHER LOGIN
          </h1>
          <p className="mt-5 border-l border-[#2387ff]/60 pl-4 text-[15px] leading-6 text-white/55">
            Teachers only. This area is restricted to authorized Vidwan teachers and staff.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-6">
            <label className="block">
              <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">
                EMAIL
              </span>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-[#071321]/80 px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#2387ff]/60"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">
                PASSWORD
              </span>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-[#071321]/80 px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#2387ff]/60"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm leading-6 text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#2387ff] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Logging in..." : "Log in"}
              {!isSubmitting && <span className="transition-transform group-hover:translate-x-1">→</span>}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}