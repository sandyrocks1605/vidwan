import Image from "next/image";
import Link from "next/link";

export default function StaffAccessPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#020711] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(700px circle at 80% 15%, rgba(35,135,255,0.14), transparent 60%), radial-gradient(600px circle at 10% 85%, rgba(35,135,255,0.09), transparent 60%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(120,184,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(120,184,255,0.5) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2387ff]/[0.07]" />

      <header className="relative z-10 flex items-center justify-between px-5 py-6 sm:px-10 sm:py-8">
        <Link href="/" aria-label="Vidwan home">
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
          className="text-[9px] uppercase tracking-[0.22em] text-white/30 transition hover:text-white"
        >
          ← Back to Vidwan
        </Link>
      </header>

      <div className="relative z-10 flex min-h-[calc(100dvh-100px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-10 text-center">
            <div className="mb-5 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#2387ff]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#78b8ff]">
                Restricted
              </span>

              <span className="h-px w-8 bg-[#2387ff]" />
            </div>

            <h1 className="text-5xl font-black tracking-[-0.07em] sm:text-7xl">
              STAFF
              <span className="text-white/20"> ACCESS.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/35">
              Select the Vidwan workspace you are authorized to enter.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/teacher/login"
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#071321]/80 p-7 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-[#2387ff]/40 hover:bg-[#0a1b2e]"
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#2387ff]/10 blur-3xl transition duration-500 group-hover:bg-[#2387ff]/20" />

              <div className="relative">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#78b8ff]">
                  01 / Workspace
                </p>

                <h2 className="mt-6 text-3xl font-black tracking-[-0.05em]">
                  TEACHER
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/35">
                  Access meetings, students, announcements and the teacher
                  workspace.
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                    Authorized teachers
                  </span>

                  <span className="text-white/40 transition duration-300 group-hover:translate-x-1 group-hover:text-[#78b8ff]">
                    →
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/login"
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#071321]/80 p-7 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-[#2387ff]/40 hover:bg-[#0a1b2e]"
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#2387ff]/10 blur-3xl transition duration-500 group-hover:bg-[#2387ff]/20" />

              <div className="relative">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#78b8ff]">
                  02 / Control
                </p>

                <h2 className="mt-6 text-3xl font-black tracking-[-0.05em]">
                  ADMIN
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/35">
                  Owner control for students, teachers and the Vidwan
                  platform.
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                    Owner access
                  </span>

                  <span className="text-white/40 transition duration-300 group-hover:translate-x-1 group-hover:text-[#78b8ff]">
                    →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <p className="mt-8 text-center text-[8px] uppercase tracking-[0.25em] text-white/15">
            Access is controlled by Vidwan authorization
          </p>
        </div>
      </div>
    </main>
  );
}