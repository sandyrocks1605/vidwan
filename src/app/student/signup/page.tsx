import Image from "next/image";
import Link from "next/link";

/**
 * Public student signup is disabled.
 *
 * Student accounts are created by Vidwan teachers from the teacher dashboard
 * (/teacher/students), which provisions the Auth user and the student profile.
 * This page only informs visitors and points them at the student login.
 */
export default function StudentSignupPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center overflow-hidden bg-[#071321] px-4 py-6 text-white sm:min-h-screen sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_80%_15%,rgba(35,135,255,0.16),transparent_55%)]" />

      <section className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0a1b2e]/90 p-6 shadow-[0_0_100px_rgba(35,135,255,0.1)] backdrop-blur-xl sm:p-10">
        <Link href="/" aria-label="Vidwan home" className="flex items-center">
          <Image
            src="/images/vidwan-logo.png"
            alt="Vidwan"
            width={128}
            height={128}
            className="h-11 w-11 object-contain"
          />
        </Link>

        <p className="mt-10 text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">
          Student access
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-[-0.07em]">
          ACCOUNTS ARE BY INVITATION
        </h1>

        <p className="mt-4 text-sm leading-6 text-white/50">
          Student accounts are created by Vidwan teachers. Once your teacher
          has set you up, log in with the details they shared with you.
        </p>

        <Link
          href="/student/login"
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#2387ff] hover:text-white"
        >
          Go to student login
        </Link>

        <p className="mt-7 text-center text-sm text-white/40">
          Vidwan teachers?{" "}
          <Link
            href="/teacher/login"
            className="inline-flex min-h-11 items-center px-1 text-[#78b8ff] hover:text-white"
          >
            Teacher login
          </Link>
        </p>
      </section>
    </main>
  );
}
