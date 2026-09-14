import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-[#071321] px-5 py-10 text-white sm:min-h-screen">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2387ff]/10 blur-[120px]" />
      <div className="relative w-full max-w-xl text-center">
        <Image
          src="/images/vidwan-logo.png"
          alt="Vidwan"
          width={128}
          height={128}
          className="mx-auto h-16 w-16 object-contain"
        />
        <p className="mt-14 font-mono text-sm tracking-[0.35em] text-[#78b8ff]">
          404
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-[-0.06em] sm:text-6xl">
          Looks like this committee doesn&apos;t exist.
        </h1>
        <Link
          href="/"
          className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#2387ff] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#78b8ff]"
        >
          Return to Vidwan
        </Link>
      </div>
    </main>
  );
}