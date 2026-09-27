"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const oauthCheckStarted = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasCode = params.has("code");
    const hasOAuthError = params.has("error");

    if ((!hasCode && !hasOAuthError) || oauthCheckStarted.current) return;
    oauthCheckStarted.current = true;

    const finishGoogleLogin = async () => {
      setGoogleBusy(true);
      setGoogleError("");

      if (hasOAuthError) {
        window.history.replaceState(null, "", "/student/login");
        setGoogleError("Google sign-in could not be completed. Please try again.");
        setGoogleBusy(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        window.history.replaceState(null, "", "/student/login");

        if (userError || !user) {
          setGoogleError("Google sign-in could not be completed. Please try again.");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("student_profiles")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          setGoogleError("We couldn't verify your student account right now. Please try again.");
          return;
        }

        if (!profile) {
          await supabase.auth.signOut();
          setGoogleError("This Google account is not registered as a Vidwan student. Please contact your teacher.");
          return;
        }

        if (profile.status !== "ACTIVE") {
          await supabase.auth.signOut();
          setGoogleError("Your Vidwan student account is currently inactive. Please contact your teacher.");
          return;
        }

        router.push("/student/dashboard");
      } catch {
        setGoogleError("Google sign-in could not be completed. Please try again.");
      } finally {
        setGoogleBusy(false);
      }
    };

    void Promise.resolve().then(finishGoogleLogin);
  }, [router]);

  const signInWithGoogle = async () => {
    setGoogleBusy(true);
    setGoogleError("");

    try {
      const supabase = getSupabaseClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/student/login`,
        },
      });

      if (oauthError) {
        setGoogleError("Unable to start Google sign-in. Please try again.");
        setGoogleBusy(false);
      }
      // On success, Supabase navigates away; keep the button disabled until then.
    } catch {
      setGoogleError("Unable to start Google sign-in. Please try again.");
      setGoogleBusy(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const supabase = getSupabaseClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

      if (signInError) {
        setError("We couldn't verify that email and password.");
        return;
      }

      // A signed-in Auth user is not automatically a student. Confirm a
      // student profile exists before sending them to the dashboard.
      const userId = data.user?.id;

      if (!userId) {
        await supabase.auth.signOut();
        setError("We couldn't verify that email and password.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("student_profiles")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) {
        setError("We couldn't verify your account right now. Please try again.");
        return;
      }

      if (!profile) {
        await supabase.auth.signOut();
        setError("This account doesn't have student access. Please contact your Vidwan teacher.");
        return;
      }

      router.push("/student/dashboard");
    } catch {
      setError("We couldn't connect to Vidwan authentication. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-[100dvh] items-center overflow-hidden bg-[#071321] px-4 py-6 text-white sm:min-h-screen sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_80%_15%,rgba(35,135,255,0.16),transparent_55%)]" />
      <section className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0a1b2e]/90 p-6 shadow-[0_0_100px_rgba(35,135,255,0.1)] backdrop-blur-xl sm:p-10">
        <Link href="/" aria-label="Vidwan home" className="flex items-center"><Image src="/images/vidwan-logo.png" alt="Vidwan" width={128} height={128} className="h-11 w-11 object-contain" /></Link>
        <p className="mt-10 text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">Student access</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.07em]">STUDENT LOGIN</h1>
        <p className="mt-4 text-sm leading-6 text-white/50">See what&apos;s next, stay close to the work, and keep your Vidwan journey moving.</p>
        <div className="mt-8">
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={googleBusy}
            aria-busy={googleBusy}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full border-[1px] border-white/20 bg-white/[0.045] px-6 py-3 text-xs font-bold tracking-[0.08em] text-white transition hover:border-[#78b8ff]/60 hover:bg-[#2387ff]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78b8ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden="true" className="text-base font-black text-[#78b8ff]">G</span>
            {googleBusy ? "Connecting to Google..." : "Continue with Google"}
          </button>
          {googleError && <p role="alert" className="mt-4 text-sm text-red-200">{googleError}</p>}
          <div className="mt-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
            <span className="h-px flex-1 bg-white/10" />
            <span>or use email</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-5">
          <label className="block"><span className="text-[10px] uppercase tracking-[0.2em] text-white/55">EMAIL</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#071321] px-4 py-3.5 text-white outline-none focus:border-[#2387ff]/60" /></label>
          <label className="block"><span className="text-[10px] uppercase tracking-[0.2em] text-white/55">PASSWORD</span><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#071321] px-4 py-3.5 text-white outline-none focus:border-[#2387ff]/60" /></label>
          {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
          <button disabled={busy} className="min-h-12 w-full rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#2387ff] hover:text-white disabled:opacity-60">{busy ? "Logging in..." : "Log in →"}</button>
        </form>
        <p className="mt-7 text-center text-sm text-white/40">Student accounts are created by your Vidwan teacher. Need help? <Link href="/" className="text-[#78b8ff] hover:text-white">Contact Vidwan</Link></p>
      </section>
    </main>
  );
}
