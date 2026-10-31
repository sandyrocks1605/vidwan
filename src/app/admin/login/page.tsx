"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

import styles from "./page.module.css";

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
    <main className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.story}>
          <Image
            src="/images/vidwan-hero-conference.jpg"
            alt="A student delegate speaking to a conference audience"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 52vw"
            className={styles.storyImage}
          />
          <div className={styles.storyShade} />
          <Link href="/" className={styles.brand} aria-label="Vidwan home">
            <Image src="/images/vidwan-logo.png" alt="" width={48} height={48} />
            <span><strong>VIDWAN</strong><small>IDEAS INTO IMPACT</small></span>
          </Link>
          <div className={styles.storyCopy}>
            <p className={styles.storyEyebrow}><span /> THE OWNER WORKSPACE</p>
            <h1>Lead the work<br /><em>behind the voices.</em></h1>
            <p>One thoughtful community. A hundred ways to help it grow.</p>
            <div className={styles.storyRule}><span /> MUN <i>·</i> DEBATE <i>·</i> LEADERSHIP</div>
          </div>
          <span className={styles.storyIndex}>VIDWAN / 01</span>
        </aside>

        <div className={styles.formColumn}>
          <Link href="/" className={styles.backLink}>← Back to Vidwan</Link>
          <section className={styles.formCard}>
            <div className={styles.formHeading}>
              <p>PRIVATE ACCESS <span>·</span> OWNER</p>
              <h2>Welcome back.</h2>
              <span>Sign in to manage your Vidwan community.</span>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.field}>
                <span>Email address</span>
                <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@vidwan.in" />
              </label>
              <label className={styles.field}>
                <span>Password</span>
                <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
              </label>

              {error && <p role="alert" className={styles.error}>{error}</p>}

              <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                {isSubmitting ? "Signing in…" : "Sign in to workspace"}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <div className={styles.divider}><span /> <b>or</b> <span /></div>

            <button type="button" onClick={signInWithGoogle} disabled={googleBusy} aria-busy={googleBusy} className={styles.googleButton}>
              <span aria-hidden="true" className={styles.googleMark}>G</span>
              {googleBusy ? "Connecting to Google…" : "Continue with Google"}
            </button>
            {googleError && <p role="alert" className={styles.error}>{googleError}</p>}

            <div className={styles.formFoot}>
              <span className={styles.lockIcon} aria-hidden="true">◆</span>
              Admin access is granted by the Vidwan owner only.
            </div>
          </section>
          <p className={styles.help}>Private workspace for the Vidwan owner.</p>
        </div>
      </div>
    </main>
  );
}
