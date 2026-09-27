"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

const UNAUTHORIZED_MESSAGE =
  "This account doesn't have Vidwan admin access.";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const oauthCheckStarted = useRef(false);

  const verifyAdminAccess = async (
    supabase: ReturnType<typeof getSupabaseClient>,
    userId: string
  ) => {
    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("is_active")
      .eq("user_id", userId)
      .maybeSingle();

    if (adminError) {
      return "We couldn't verify your admin access right now. Please try again.";
    }

    if (!adminProfile?.is_active) {
      await supabase.auth.signOut();
      return UNAUTHORIZED_MESSAGE;
    }

    return null;
  };

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
        window.history.replaceState(null, "", "/admin/login");
        setGoogleError("Google sign-in could not be completed. Please try again.");
        setGoogleBusy(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        window.history.replaceState(null, "", "/admin/login");

        if (userError || !user) {
          setGoogleError("Google sign-in could not be completed. Please try again.");
          return;
        }

        const verificationError = await verifyAdminAccess(supabase, user.id);

        if (verificationError) {
          setGoogleError(verificationError);
          return;
        }

        router.push("/admin/dashboard");
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
          redirectTo: `${window.location.origin}/admin/login`,
        },
      });

      if (oauthError) {
        setGoogleError("Unable to start Google sign-in. Please try again.");
        setGoogleBusy(false);
      }
    } catch {
      setGoogleError("Unable to start Google sign-in. Please try again.");
      setGoogleBusy(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError("That email and password combination could not be verified.");
        return;
      }

      if (!data.user) {
        setError("That email and password combination could not be verified.");
        return;
      }

      const verificationError = await verifyAdminAccess(supabase, data.user.id);

      if (verificationError) {
        setError(verificationError);
        return;
      }

      router.push("/admin/dashboard");
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
          <Link href="/" aria-label="Vidwan home" className="flex items-center">
            <Image
              src="/images/vidwan-logo.png"
              alt="Vidwan"
              width={128}
              height={128}
              className="h-10 w-10 object-contain"
            />
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
            Master control
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.07em] sm:text-5xl">
            ADMIN LOGIN
          </h1>
          <p className="mt-5 border-l border-[#2387ff]/60 pl-4 text-[15px] leading-6 text-white/55">
            Owner access only. This area is restricted to the Vidwan administrator.
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

          <div className="mt-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
            <span className="h-px flex-1 bg-white/10" />
            <span>or use Google</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={googleBusy}
            aria-busy={googleBusy}
            className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-full border-[1px] border-white/20 bg-white/[0.045] px-6 py-3 text-xs font-bold tracking-[0.08em] text-white transition hover:border-[#78b8ff]/60 hover:bg-[#2387ff]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78b8ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden="true" className="text-base font-black text-[#78b8ff]">G</span>
            {googleBusy ? "Connecting to Google..." : "Continue with Google"}
          </button>
          {googleError && <p role="alert" className="mt-4 text-sm text-red-200">{googleError}</p>}

          <p className="mt-7 text-center text-xs text-white/35">
            Admin access is granted by the Vidwan owner only.
          </p>
        </section>
      </div>
    </main>
  );
}
