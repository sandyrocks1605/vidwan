"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        window.history.replaceState(null, "", "/teacher/login");
        setGoogleError(
          "Google sign-in could not be completed. Please try again."
        );
        setGoogleBusy(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        window.history.replaceState(null, "", "/teacher/login");

        if (userError || !user) {
          setGoogleError(
            "Google sign-in could not be completed. Please try again."
          );
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("teacher_profiles")
          .select("is_teacher, status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          setGoogleError(
            "We couldn't verify your teacher account right now. Please try again."
          );
          return;
        }

        if (!profile || !profile.is_teacher) {
          await supabase.auth.signOut();
          setGoogleError(
            "This Google account is not registered as a Vidwan teacher. Please contact the Vidwan administrator."
          );
          return;
        }

        if (profile.status !== "ACTIVE") {
          await supabase.auth.signOut();
          setGoogleError(
            "Your Vidwan teacher account is currently inactive. Please contact the Vidwan administrator."
          );
          return;
        }

        router.push("/teacher/dashboard");
      } catch {
        setGoogleError(
          "Google sign-in could not be completed. Please try again."
        );
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

      const { error: oauthError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/teacher/login`,
          },
        });

      if (oauthError) {
        setGoogleError(
          "Unable to start Google sign-in. Please try again."
        );
        setGoogleBusy(false);
      }
    } catch {
      setGoogleError(
        "Unable to start Google sign-in. Please try again."
      );
      setGoogleBusy(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { error: signInError } =
        await getSupabaseClient().auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        setError(
          "That email and password combination could not be verified."
        );
        return;
      }

      const {
        data: { user },
      } = await getSupabaseClient().auth.getUser();

      if (!user) {
        setError(
          "That email and password combination could not be verified."
        );
        return;
      }

      const { data: profile, error: profileError } =
        await getSupabaseClient()
          .from("teacher_profiles")
          .select("is_teacher, status")
          .eq("user_id", user.id)
          .maybeSingle();

      if (profileError) {
        setError(
          "We couldn't verify your account right now. Please try again."
        );
        return;
      }

      if (!profile || !profile.is_teacher) {
        await getSupabaseClient().auth.signOut();
        setError(
          "This account is not registered as a Vidwan teacher. Please contact the Vidwan administrator."
        );
        return;
      }

      if (profile.status !== "ACTIVE") {
        await getSupabaseClient().auth.signOut();
        setError(
          "Your Vidwan teacher account is currently inactive. Please contact the Vidwan administrator."
        );
        return;
      }

      router.push("/teacher/dashboard");
    } catch {
      setError(
        "We couldn't connect to Vidwan authentication. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#020711] text-white">
      {/* ATMOSPHERE */}

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -right-[20%] -top-[20%] h-[700px] w-[700px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(35,135,255,0.22), transparent 65%)",
          }}
        />

        <div
          className="absolute -bottom-[25%] -left-[20%] h-[600px] w-[600px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(35,135,255,0.16), transparent 65%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(120,184,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(120,184,255,0.4) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />

        <div className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2387ff]/[0.08]" />

        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2387ff]/[0.06]" />

        <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2387ff]/[0.05]" />
      </div>

      {/* TOP NAV */}

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 sm:py-8 lg:px-12">
        <Link
          href="/"
          aria-label="Vidwan home"
          className="group flex min-h-11 min-w-11 items-center gap-3"
        >
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition duration-500 group-hover:border-[#2387ff]/50 group-hover:bg-[#2387ff]/10">
            <Image
              src="/images/vidwan-logo.png"
              alt="Vidwan"
              width={128}
              height={128}
              className="h-8 w-8 object-contain"
            />
          </div>

          <span className="hidden text-[10px] font-bold uppercase tracking-[0.35em] text-white/50 sm:block">
            VIDWAN
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-[9px] font-medium uppercase tracking-[0.22em] text-white/50 transition hover:text-white sm:text-[10px]"
        >
          ← Back to Vidwan
        </Link>
      </header>

      {/* MAIN */}

      <div className="relative z-10 flex min-h-[calc(100dvh-88px)] items-center justify-center px-5 pb-10 pt-4 sm:px-8 sm:pb-16">
        <div className="w-full max-w-[460px]">
          {/* EYEBROW */}

          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-8 bg-[#2387ff]" />

            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#78b8ff]">
              Restricted access
            </p>

            <span className="h-px flex-1 bg-white/[0.08]" />
          </div>

          {/* HEADING */}

          <div className="mb-9">
            <h1 className="text-[clamp(3rem,9vw,5.5rem)] font-black leading-[0.86] tracking-[-0.075em]">
              TEACHER
              <br />
              <span className="text-white/20">LOGIN.</span>
            </h1>

            <p className="mt-7 max-w-[380px] border-l border-[#2387ff]/50 pl-4 text-[13px] leading-6 text-white/45 sm:text-sm">
              Authorized access for Vidwan teachers and staff.
              Your workspace begins here.
            </p>
          </div>

          {/* LOGIN CARD */}

          <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[#071321]/80 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            {/* CARD GLOW */}

            <div
              className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(35,135,255,0.13), transparent 70%)",
              }}
            />

            <div className="relative p-5 sm:p-8">
              {/* GOOGLE */}

              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={googleBusy}
                aria-busy={googleBusy}
                className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-white/[0.14] bg-white/[0.045] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition duration-300 hover:border-[#78b8ff]/50 hover:bg-[#2387ff]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78b8ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-[#4285f4]"
                >
                  G
                </span>

                <span>
                  {googleBusy
                    ? "Connecting to Google..."
                    : "Continue with Google"}
                </span>

                {!googleBusy && (
                  <span className="ml-auto text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
                    →
                  </span>
                )}
              </button>

              {googleError && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-300/10 bg-red-300/[0.04] px-4 py-3 text-xs leading-5 text-red-200"
                >
                  {googleError}
                </p>
              )}

              {/* DIVIDER */}

              <div className="my-7 flex items-center gap-4">
                <span className="h-px flex-1 bg-white/[0.08]" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-white/25">
                  or use email
                </span>

                <span className="h-px flex-1 bg-white/[0.08]" />
              </div>

              {/* FORM */}

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">
                    Email
                  </span>

                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="teacher@vidwan.com"
                    className="mt-2.5 w-full rounded-2xl border border-white/[0.09] bg-[#020711]/70 px-4 py-3.5 text-sm text-white placeholder:text-white/15 outline-none transition duration-300 focus:border-[#2387ff]/60 focus:bg-[#020711]/90 focus:ring-1 focus:ring-[#2387ff]/20"
                  />
                </label>

                <label className="block">
                  <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">
                    Password
                  </span>

                  <input
                    required
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="mt-2.5 w-full rounded-2xl border border-white/[0.09] bg-[#020711]/70 px-4 py-3.5 text-sm text-white placeholder:text-white/15 outline-none transition duration-300 focus:border-[#2387ff]/60 focus:bg-[#020711]/90 focus:ring-1 focus:ring-[#2387ff]/20"
                  />
                </label>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-300/10 bg-red-300/[0.04] px-4 py-3 text-xs leading-5 text-red-200"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#020711] transition duration-300 hover:bg-[#2387ff] hover:text-white hover:shadow-[0_0_35px_rgba(35,135,255,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {isSubmitting ? "Logging in..." : "Enter workspace"}
                  </span>

                  {!isSubmitting && (
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  )}
                </button>
              </form>

              {/* FOOTER */}

              <div className="mt-7 flex items-center justify-between border-t border-white/[0.07] pt-5">
                <span className="text-[8px] uppercase tracking-[0.2em] text-white/20">
                  VIDWAN / TEACHER
                </span>

                <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-white/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2387ff] shadow-[0_0_8px_rgba(35,135,255,0.8)]" />
                  SECURE ACCESS
                </span>
              </div>
            </div>
          </section>

          <p className="mt-6 text-center text-[8px] uppercase tracking-[0.25em] text-white/20">
            Access is granted by the Vidwan administrator
          </p>
        </div>
      </div>
    </main>
  );
}
