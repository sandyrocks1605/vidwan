"use client";

import { type FormEvent, useRef, useState } from "react";
import Link from "next/link";

import { getSupabaseClient } from "@/lib/supabase/client";

type FormValues = {
  parentName: string;
  studentName: string;
  age: string;
  track: string;
  email: string;
  phone: string;
  experience: string;
  referral: string;
  additionalInfo: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  parentName: "",
  studentName: "",
  age: "",
  track: "",
  email: "",
  phone: "",
  experience: "",
  referral: "",
  additionalInfo: "",
};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#071321]/80 px-4 py-3.5 text-sm text-white outline-none transition duration-300 placeholder:text-white/25 hover:border-white/20 focus:border-[#2387ff]/60 focus:shadow-[0_0_25px_rgba(35,135,255,0.08)]";

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const age = Number(values.age);
  const phoneDigits = values.phone.replace(/\D/g, "");

  if (!values.parentName.trim()) {
    errors.parentName = "Please enter the parent or guardian's name.";
  }

  if (!values.studentName.trim()) {
    errors.studentName = "Please enter the student's name.";
  }

  if (!Number.isInteger(age) || age < 6 || age > 21) {
    errors.age = "Please enter an age between 6 and 21.";
  }

  if (!values.track) {
    errors.track = "Please select a preferred track.";
  }

  if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    errors.phone = "Please enter a valid phone or WhatsApp number.";
  }

  if (!values.experience) {
    errors.experience = "Please share the student's MUN experience.";
  }

  return errors;
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submissionLock = useRef(false);

  const updateField = (field: keyof FormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmitError("");

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submissionLock.current) {
      return;
    }

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    setSubmitError("");

    let error: Error | null = null;

    try {
      const response = await getSupabaseClient().from("registrations").insert({
        parent_name: form.parentName.trim(),
        student_name: form.studentName.trim(),
        student_age: Number(form.age),
        preferred_track: form.track,
        email: form.email.trim(),
        phone: form.phone.trim(),
        prior_mun_experience: form.experience,
        heard_from: form.referral || null,
        additional_info: form.additionalInfo.trim() || null,
      });

      error = response.error;
    } catch {
      error = new Error("Supabase configuration is unavailable.");
    } finally {
      setIsSubmitting(false);
      submissionLock.current = false;
    }

    if (error) {
      setSubmitError(
        "We couldn't submit your registration. Please check your connection and try again."
      );
      return;
    }

    setForm(initialValues);
    setIsSubmitted(true);
  };

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#071321] px-4 py-4 text-white sm:min-h-screen sm:px-8 sm:py-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(700px circle at 80% 15%, rgba(35,135,255,0.16), transparent 55%), radial-gradient(500px circle at 10% 80%, rgba(35,135,255,0.1), transparent 60%)",
        }}
      />

      <div className="pointer-events-none absolute left-1/2 top-80 h-[650px] w-[650px] -translate-x-1/2 rounded-full border border-[#2387ff]/10" />
      <div className="pointer-events-none absolute left-1/2 top-80 h-[460px] w-[460px] -translate-x-1/2 rounded-full border border-white/[0.05]" />

      <div className="relative mx-auto w-full max-w-6xl">
        <nav className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group text-sm font-black tracking-[0.18em] text-white"
          >
            VIDWAN
            <span className="text-[#2387ff] transition-colors duration-300 group-hover:text-white">
              .
            </span>
          </Link>

          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.2em] text-white/45 transition hover:text-white"
          >
            ← Back to Vidwan
          </Link>
        </nav>

        <header className="mx-auto mt-16 max-w-4xl text-center sm:mt-28">
          <p className="animate-[registrationRise_700ms_ease-out_both] text-[10px] uppercase tracking-[0.45em] text-[#78b8ff] sm:text-xs">
            Start your journey
          </p>

          <h1 className="mt-6 animate-[registrationRise_800ms_ease-out_both] text-[2.75rem] font-bold leading-[0.92] tracking-[-0.065em] sm:text-7xl lg:text-[6.5rem]">
            Your first MUN
            <span className="block bg-gradient-to-r from-white via-[#b8d9ff] to-[#2387ff] bg-clip-text text-transparent">
              starts here.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl animate-[registrationRise_900ms_ease-out_both] text-[15px] leading-7 text-white/55 sm:mt-8 sm:text-lg sm:leading-8">
            Tell us a little about yourself and we&apos;ll help you find the
            right starting point.
          </p>
        </header>

        <section className="relative mx-auto mt-10 max-w-5xl pb-8 sm:mt-20 sm:pb-20">
          <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-[#2387ff]/10 blur-3xl" />

          {isSubmitted ? (
            <div className="relative overflow-hidden rounded-[2rem] border border-[#2387ff]/30 bg-[#0a1b2e]/90 px-5 py-16 text-center shadow-[0_0_100px_rgba(35,135,255,0.12)] backdrop-blur-xl sm:px-14 sm:py-28">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2387ff]/20 animate-[successRing_2.4s_ease-in-out_infinite]" />

              <div className="relative">
                <div className="mx-auto grid h-14 w-14 animate-[checkIn_650ms_ease-out_both] place-items-center rounded-full border border-[#2387ff]/50 bg-[#2387ff]/15 text-2xl text-[#8bc3ff]">
                  ✓
                </div>

                <p className="mt-8 text-[10px] uppercase tracking-[0.45em] text-[#78b8ff]">
                  Vidwan
                </p>

                <h2 className="mt-4 text-4xl font-bold tracking-[-0.06em] sm:text-7xl">
                  YOU&apos;RE IN.
                </h2>

                <p className="mx-auto mt-6 max-w-lg text-lg leading-8 text-white/65">
                  Your journey starts now.
                </p>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/35">
                  We&apos;ve received your details and will be in touch soon.
                </p>

                <Link
                  href="/"
                  className="mt-10 inline-flex rounded-full border border-white/15 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 transition hover:border-[#2387ff]/50 hover:bg-[#2387ff]/10 hover:text-white"
                >
                  Back to Vidwan
                </Link>
              </div>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={handleSubmit}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1b2e]/90 p-5 shadow-[0_0_100px_rgba(35,135,255,0.1)] backdrop-blur-xl animate-[registrationRise_900ms_ease-out_both] sm:p-10 lg:p-14"
            >
              <div className="pointer-events-none absolute inset-0 opacity-[0.025]">
                <div
                  className="h-full w-full"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                  }}
                />
              </div>

              <div className="relative">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">
                      About you
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-4xl">
                      Let&apos;s find your starting point.
                    </h2>
                  </div>

                  <p className="text-sm text-white/40">* Required fields</p>
                </div>

                <div className="mt-7 grid gap-x-6 gap-y-6 sm:mt-9 sm:grid-cols-2 sm:gap-y-7">
                  <label className="block animate-[formFieldIn_600ms_ease-out_both]">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">
                      PARENT / GUARDIAN NAME *
                    </span>
                    <input
                      type="text"
                      autoComplete="name"
                      value={form.parentName}
                      onChange={(event) => updateField("parentName", event.target.value)}
                      aria-invalid={Boolean(errors.parentName)}
                      aria-describedby={errors.parentName ? "parent-name-error" : undefined}
                      placeholder="Enter your name"
                      className={`mt-3 ${inputClassName} ${
                        errors.parentName ? "border-red-300/70" : ""
                      }`}
                    />
                    {errors.parentName && (
                      <span id="parent-name-error" className="mt-2 block text-xs text-red-200">
                        {errors.parentName}
                      </span>
                    )}
                  </label>

                  <label className="block animate-[formFieldIn_600ms_ease-out_80ms_both]">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">
                      STUDENT NAME *
                    </span>
                    <input
                      type="text"
                      autoComplete="name"
                      value={form.studentName}
                      onChange={(event) => updateField("studentName", event.target.value)}
                      aria-invalid={Boolean(errors.studentName)}
                      aria-describedby={errors.studentName ? "student-name-error" : undefined}
                      placeholder="Enter student's name"
                      className={`mt-3 ${inputClassName} ${
                        errors.studentName ? "border-red-300/70" : ""
                      }`}
                    />
                    {errors.studentName && (
                      <span id="student-name-error" className="mt-2 block text-xs text-red-200">
                        {errors.studentName}
                      </span>
                    )}
                  </label>

                  <label className="block animate-[formFieldIn_600ms_ease-out_160ms_both]">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">
                      STUDENT AGE *
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="6"
                      max="21"
                      value={form.age}
                      onChange={(event) => updateField("age", event.target.value)}
                      aria-invalid={Boolean(errors.age)}
                      aria-describedby={errors.age ? "age-error" : undefined}
                      placeholder="Age"
                      className={`mt-3 ${inputClassName} ${
                        errors.age ? "border-red-300/70" : ""
                      }`}
                    />
                    {errors.age && (
                      <span id="age-error" className="mt-2 block text-xs text-red-200">
                        {errors.age}
                      </span>
                    )}
                  </label>

                  <label className="block animate-[formFieldIn_600ms_ease-out_240ms_both]">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">
                      PREFERRED TRACK *
                    </span>
                    <select
                      value={form.track}
                      onChange={(event) => updateField("track", event.target.value)}
                      aria-invalid={Boolean(errors.track)}
                      aria-describedby={errors.track ? "track-error" : undefined}
                      className={`mt-3 appearance-none ${inputClassName} ${
                        errors.track ? "border-red-300/70" : ""
                      }`}
                    >
                      <option value="">Select a track</option>
                      <option value="beginner-mun">Beginner MUN</option>
                      <option value="intermediate-mun">Intermediate MUN</option>
                      <option value="advanced-mun">Advanced MUN</option>
                      <option value="mun-debate">MUN + Debate</option>
                      <option value="unsure">I&apos;m not sure yet</option>
                    </select>
                    {errors.track && (
                      <span id="track-error" className="mt-2 block text-xs text-red-200">
                        {errors.track}
                      </span>
                    )}
                  </label>

                  <label className="block animate-[formFieldIn_600ms_ease-out_320ms_both]">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">
                      EMAIL *
                    </span>
                    <input
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      placeholder="you@example.com"
                      className={`mt-3 ${inputClassName} ${
                        errors.email ? "border-red-300/70" : ""
                      }`}
                    />
                    {errors.email && (
                      <span id="email-error" className="mt-2 block text-xs text-red-200">
                        {errors.email}
                      </span>
                    )}
                  </label>

                  <label className="block animate-[formFieldIn_600ms_ease-out_400ms_both]">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">
                      PHONE / WHATSAPP *
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      placeholder="+91 XXXXX XXXXX"
                      className={`mt-3 ${inputClassName} ${
                        errors.phone ? "border-red-300/70" : ""
                      }`}
                    />
                    {errors.phone && (
                      <span id="phone-error" className="mt-2 block text-xs text-red-200">
                        {errors.phone}
                      </span>
                    )}
                  </label>

                  <label className="block animate-[formFieldIn_600ms_ease-out_480ms_both]">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">
                      PRIOR MUN EXPERIENCE *
                    </span>
                    <select
                      value={form.experience}
                      onChange={(event) => updateField("experience", event.target.value)}
                      aria-invalid={Boolean(errors.experience)}
                      aria-describedby={errors.experience ? "experience-error" : undefined}
                      className={`mt-3 appearance-none ${inputClassName} ${
                        errors.experience ? "border-red-300/70" : ""
                      }`}
                    >
                      <option value="">Select experience</option>
                      <option value="none">None — this will be my first</option>
                      <option value="one-to-two">1–2 conferences</option>
                      <option value="three-to-five">3–5 conferences</option>
                      <option value="five-plus">5+ conferences</option>
                    </select>
                    {errors.experience && (
                      <span id="experience-error" className="mt-2 block text-xs text-red-200">
                        {errors.experience}
                      </span>
                    )}
                  </label>

                  <label className="block animate-[formFieldIn_600ms_ease-out_560ms_both]">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">
                      HOW DID YOU HEAR ABOUT US?
                    </span>
                    <select
                      value={form.referral}
                      onChange={(event) => updateField("referral", event.target.value)}
                      className={`mt-3 appearance-none ${inputClassName}`}
                    >
                      <option value="">Select an option</option>
                      <option value="instagram">Instagram</option>
                      <option value="friend">Friend</option>
                      <option value="school">School</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="google">Google</option>
                      <option value="other">Other</option>
                    </select>
                  </label>

                  <label className="block animate-[formFieldIn_600ms_ease-out_640ms_both] sm:col-span-2">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">
                      ANYTHING WE SHOULD KNOW?
                    </span>
                    <textarea
                      rows={5}
                      value={form.additionalInfo}
                      onChange={(event) => updateField("additionalInfo", event.target.value)}
                      placeholder="Prior MUN experience, preferred session times, questions..."
                      className={`mt-3 resize-y ${inputClassName}`}
                    />
                  </label>
                </div>

                <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
                  <p aria-live="polite" className="text-sm leading-6 text-white/35">
                    {submitError ||
                      "We&apos;ll use these details only to guide your Vidwan journey."}
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#071321] transition-all duration-500 hover:scale-105 hover:bg-[#2387ff] hover:text-white hover:shadow-[0_0_30px_rgba(35,135,255,0.25)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 sm:w-auto"
                  >
                    {isSubmitting ? "Submitting…" : "Start my journey"}
                    {!isSubmitting && (
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>
      </div>

      <style>{`
        @keyframes registrationRise {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes formFieldIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes checkIn {
          from {
            opacity: 0;
            transform: scale(0.7);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes successRing {
          0%,
          100% {
            opacity: 0.35;
            transform: translate(-50%, -50%) scale(0.9);
          }

          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
