"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const journey = [
  {
    number: "01",
    title: "RESEARCH",
    short: "KNOW THE ISSUE",
    text: "Know your country. Understand the problem. Build arguments from facts.",
  },
  {
    number: "02",
    title: "SPEAK",
    short: "FIND YOUR VOICE",
    text: "Turn research into arguments people remember.",
  },
  {
    number: "03",
    title: "DEBATE",
    short: "CHALLENGE IDEAS",
    text: "Think on your feet. Respond. Make your voice count.",
  },
  {
    number: "04",
    title: "NEGOTIATE",
    short: "BUILD CONSENSUS",
    text: "Find common ground. Build coalitions. Move ideas forward.",
  },
  {
    number: "05",
    title: "LEAD",
    short: "MOVE THE ROOM",
    text: "Confidence isn’t about being the loudest person in the room. It’s about knowing when to speak — and knowing what to say.",
  },
];

const particles = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  top: `${(i * 61) % 100}%`,
  size: 2 + (i % 3),
  delay: `${(i % 8) * 0.7}s`,
  duration: `${5 + (i % 5)}s`,
}));

const simulationTabs = [
  {
    label: "COMMITTEE",
    value: "UN Security Council",
    text: "A room where every sentence can shift the balance.",
  },
  {
    label: "ROLE",
    value: "Represent Japan",
    text: "You are responsible for a position, not just an opinion.",
  },
  {
    label: "CRISIS",
    value: "A diplomatic crisis has erupted.",
    text: "The room is waiting. Your response starts the next move.",
  },
  {
    label: "DEBATE",
    value: "90 seconds to respond",
    text: "Think clearly, speak precisely, and move the room forward.",
  },
];

const learningSkills = [
  ["01", "Research", "Build arguments from evidence."],
  ["02", "Public Speaking", "Make people remember the point."],
  ["03", "Negotiation", "Find the overlap between positions."],
  ["04", "Critical Thinking", "Respond with clarity under pressure."],
  ["05", "Leadership", "Know when to speak and what to say."],
  ["06", "Confidence", "Carry the skill beyond the room."],
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [simulationTab, setSimulationTab] = useState(0);

  const [mouse, setMouse] = useState({
    x: 50,
    y: 50,
  });

  const [heroOffset, setHeroOffset] = useState(0);

  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const journeyRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress =
        documentHeight > 0 ? scrollY / documentHeight : 0;

      setScrollProgress(Math.min(1, Math.max(0, progress)));
      setScrolled(scrollY > 30);

      setHeroOffset(Math.min(scrollY * 0.22, 180));

      const stages = document.querySelectorAll<HTMLElement>(
        "[data-journey-stage]"
      );

      if (stages.length > 0) {
        const viewportCenter = window.innerHeight / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;

        stages.forEach((stage, index) => {
          const rect = stage.getBoundingClientRect();
          const stageCenter = rect.top + rect.height / 2;
          const distance = Math.abs(stageCenter - viewportCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActive(closestIndex);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("mousemove", handleMouseMove);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-reveal");

            if (id) {
              setVisible((current) => ({
                ...current,
                [id]: true,
              }));
            }
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    const elements =
      document.querySelectorAll("[data-reveal]");

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const reveal = (id: string) =>
    visible[id]
      ? "translate-y-0 scale-100 opacity-100 blur-0"
      : "translate-y-8 scale-[0.99] opacity-0 blur-[2px]";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071321] text-white">

      {/* =========================================================
          GLOBAL SCROLL PROGRESS
      ========================================================= */}

      <div className="fixed left-0 top-0 z-[100] h-[2px] w-full bg-transparent">
        <div
          className="h-full origin-left bg-[#2387ff] shadow-[0_0_15px_rgba(35,135,255,0.8)]"
          style={{
            transform: `scaleX(${scrollProgress})`,
          }}
        />
      </div>


      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <nav
        className={`fixed left-1/2 top-0 z-50 flex w-[calc(100%-24px)] max-w-7xl -translate-x-1/2 items-center justify-between rounded-full px-4 py-2 transition-all duration-700 sm:w-[calc(100%-28px)] sm:px-5 sm:py-3 ${
          scrolled
            ? "mt-4 border border-white/10 bg-[#071321]/80 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
            : "mt-3"
        }`}
      >

        <a
          href="#top"
          aria-label="Vidwan home"
          className="group flex items-center"
        >
          <Image
            src="/images/vidwan-logo.png"
            alt="Vidwan"
            width={128}
            height={128}
            className="h-11 w-11 object-contain sm:h-11 sm:w-11"
          />
        </a>


        <div className="hidden items-center gap-9 text-[10px] uppercase tracking-[0.22em] text-white/50 md:flex">

          <a
            href="#about"
            className="relative transition hover:text-white"
          >
            About
          </a>

          <a
            href="#experience"
            className="relative transition hover:text-white"
          >
            Experience
          </a>

          <a
            href="#journey"
            className="relative transition hover:text-white"
          >
            Journey
          </a>

        </div>

        <button
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-white/75 transition hover:border-[#2387ff]/50 md:hidden"
        >
          <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
          <span className="flex w-4 flex-col gap-1.5">
            <span className={`h-px w-full bg-current transition-transform ${mobileMenuOpen ? "translate-y-1 rotate-45" : ""}`} />
            <span className={`h-px w-full bg-current transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`h-px w-full bg-current transition-transform ${mobileMenuOpen ? "-translate-y-1 -rotate-45" : ""}`} />
          </span>
        </button>

        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="absolute left-0 right-0 top-[calc(100%+8px)] rounded-3xl border border-white/10 bg-[#071321]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:hidden"
          >
            {[
              ["About", "#about"],
              ["Experience", "#experience"],
              ["Journey", "#journey"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-2xl px-4 py-3.5 text-[10px] uppercase tracking-[0.22em] text-white/65 transition hover:bg-white/[0.06] hover:text-white"
              >
                {label}
              </a>
            ))}
            <a
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-1 block rounded-2xl bg-white px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#071321]"
            >
              Get started →
            </a>
          </div>
        )}


        <a
          href="/register"
          className="group relative hidden overflow-hidden rounded-full bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#071321] md:block"
        >
          <span className="relative z-10 whitespace-nowrap transition-colors group-hover:text-white">
            Get Started →
          </span>

          <span className="absolute inset-0 -translate-x-full bg-[#2387ff] transition-transform duration-500 group-hover:translate-x-0" />
        </a>

      </nav>


      {/* =========================================================
          HERO
      ========================================================= */}

      <section
        id="top"
        className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-5 py-24 text-center sm:px-6 md:min-h-screen md:py-0"
      >

        {/* Cursor glow */}

        <div
          className="pointer-events-none absolute inset-0 hidden transition-all duration-300 sm:block"
          style={{
            background: `radial-gradient(
              650px circle at ${mouse.x}% ${mouse.y}%,
              rgba(35,135,255,0.18),
              transparent 65%
            )`,
          }}
        />


        {/* Ambient glow */}

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2387ff]/10 blur-[80px] sm:h-[700px] sm:w-[700px] sm:blur-[120px]"
          style={{
            transform: `translate(-50%, -50%) scale(${
              1 + scrollProgress * 0.25
            })`,
          }}
        />


        {/* Orbital rings */}

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[680px] w-[680px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2387ff]/15 sm:block"
          style={{
            transform: `translate(-50%, -50%) rotate(${
              scrollProgress * 25
            }deg)`,
          }}
        />

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[460px] w-[460px] max-w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06] sm:block"
          style={{
            transform: `translate(-50%, -50%) rotate(${
              -scrollProgress * 40
            }deg)`,
          }}
        />


        {/* Particles */}

        {particles.map((particle) => (
          <div
            key={particle.id}
            className="pointer-events-none absolute hidden rounded-full bg-[#58a9ff]/40 sm:block"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationName: "floatParticle",
              animationDuration: particle.duration,
              animationDelay: particle.delay,
              animationIterationCount: "infinite",
              animationTimingFunction: "ease-in-out",
            }}
          />
        ))}


        {/* Hero content */}

        <div
          className="touch-tilt relative z-10 w-full max-w-7xl"
          style={{
            transform: `translate3d(
              ${(mouse.x - 50) * 0.35}px,
              ${(mouse.y - 50) * 0.35 - heroOffset}px,
              0
            )`,
          }}
        >

          <h1 className="bg-gradient-to-r from-white via-[#d4e7ff] to-[#2387ff] bg-clip-text text-[17vw] font-black leading-[0.82] tracking-[-0.075em] text-transparent sm:text-[15vw] lg:text-[14rem]">
            VIDWAN
          </h1>


          <p className="mt-7 text-[9px] uppercase tracking-[0.34em] text-[#78b8ff] sm:mt-8 sm:text-xs sm:tracking-[0.5em]">
            MUN • DEBATE • LEADERSHIP
          </p>


          <p className="mx-auto mt-7 max-w-3xl text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.025em] text-white sm:mt-8 sm:text-4xl">
            Become the delegate people remember.
          </p>


          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-white/60 sm:mt-6 sm:text-lg sm:leading-8">
            Model United Nations isn&apos;t about knowing everything.
            It&apos;s about learning how to think, speak, negotiate and lead.
          </p>


          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">

            <a
              href="/register"
              className="group inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#071321] transition-all duration-500 hover:scale-105 hover:bg-[#2387ff] hover:text-white sm:w-auto"
            >
              Start Your Journey
              <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>


            <a
              href="#experience"
              className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-xs uppercase tracking-[0.16em] text-white/70 transition-all duration-500 hover:border-[#2387ff]/50 hover:bg-[#2387ff]/10 hover:text-white sm:w-auto"
            >
              Explore Vidwan
            </a>

          </div>

        </div>


        {/* Scroll indicator */}

        <div
          className="absolute bottom-5 hidden flex-col items-center gap-3 transition-opacity duration-500 sm:flex"
          style={{
            opacity: Math.max(0, 1 - scrollProgress * 8),
          }}
        >

          <span className="text-[9px] uppercase tracking-[0.4em] text-white/35">
            Scroll to enter
          </span>

          <div className="relative h-12 w-px overflow-hidden bg-white/10">

            <div className="absolute left-0 top-0 h-1/2 w-full animate-[scrollLine_1.8s_ease-in-out_infinite] bg-[#2387ff]" />

          </div>

        </div>

      </section>


      {/* =========================================================
          INTRO
      ========================================================= */}

      <section
        id="about"
        className="relative flex min-h-[auto] items-center overflow-hidden bg-[#0a1b2e] px-5 py-24 sm:px-6 sm:py-32 md:min-h-screen"
      >

        <div
          data-reveal="intro"
          className={`mx-auto w-full max-w-7xl transform transition-all duration-1000 ${reveal("intro")}`}
        >

          <p className="mb-7 text-[10px] uppercase tracking-[0.4em] text-[#5da8ff]">
            The first step
          </p>


          <h2 className="max-w-6xl text-[2.75rem] font-bold leading-[0.94] tracking-[-0.055em] sm:text-7xl lg:text-[8rem]">

            MUN can be

            <span className="text-white/25">
              {" "}intimidating.
            </span>

          </h2>


          <p className="mt-8 max-w-2xl text-base leading-7 text-white/55 sm:mt-10 sm:text-lg sm:leading-8">
            New committees. New rules. New people.
            A room full of delegates who seem like they already
            know exactly what they&apos;re doing.
          </p>


          <div className="mt-10 grid gap-3 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">

            {[
              "Research.",
              "Speeches.",
              "Caucuses.",
              "Resolutions.",
              "Diplomacy.",
              "Negotiation.",
              "Confidence.",
              "Leadership.",
            ].map((item, index) => (

              <div
                key={item}
                className="group relative min-h-16 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:p-6"
                style={{
                  transitionDelay: `${index * 60}ms`,
                }}
              >

                <span className="relative z-10 text-lg text-white/60 transition-colors duration-300 group-hover:text-white">
                  {item}
                </span>

                <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-[#2387ff]/20 blur-2xl transition-all duration-500 group-hover:scale-150" />

              </div>

            ))}

          </div>


          <p className="mt-12 text-2xl font-semibold leading-tight tracking-[-0.03em] sm:mt-16 sm:text-5xl">

            <span className="text-[#58a9ff]">
              Good. That&apos;s where you grow.
            </span>

          </p>

        </div>

      </section>


      {/* =========================================================
          SCROLL JOURNEY
      ========================================================= */}

      <section
        id="journey"
        ref={journeyRef}
        className="relative bg-[#0d2138]"
      >

        <div className="relative">

          {journey.map((item, index) => (
            <article
              key={item.number}
              data-journey-stage={index}
              className="relative flex min-h-[680px] items-center overflow-hidden px-5 py-16 sm:px-6 sm:py-24 md:min-h-screen"
            >

            {/* Background glow */}

            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2387ff]/10 blur-[140px] transition-all duration-1000"
              style={{
                transform: `translate(-50%, -50%) scale(${
                  index === active ? 1.15 : 0.75
                })`,
                opacity: index === active ? 1 : 0.35,
              }}
            />

            <div
              className="pointer-events-none absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "70px 70px",
              }}
            />


            <div className="relative z-10 mx-auto w-full max-w-7xl">

              {/* Header */}

              {index === 0 && (
                <div
                  data-reveal="journey-heading"
                  className={`mb-12 transform transition-all duration-1000 ${reveal(
                    "journey-heading"
                  )}`}
                >

                <p className="mb-5 text-[10px] uppercase tracking-[0.4em] text-[#5da8ff]">
                  Start your journey
                </p>

                <h2 className="max-w-5xl text-[2.75rem] font-bold leading-[0.92] tracking-[-0.06em] sm:text-7xl lg:text-[6.5rem]">

                  From first-timer

                  <span className="text-white/25">
                    {" "}to delegate.
                  </span>

                </h2>

                </div>
              )}


              {/* Main journey */}

              <div className="grid items-center gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:gap-10">


                {/* LEFT */}

                <div className="flex flex-col justify-center gap-2">

                  {journey.map((navItem, navIndex) => {
                    const isActive = navIndex === active;

                    return (
                      <button
                        key={navItem.number}
                        onClick={() => {
                          document
                            .querySelector<HTMLElement>(
                              `[data-journey-stage="${navIndex}"]`
                            )
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                        }}
                        className={`group relative min-h-14 overflow-hidden rounded-2xl border p-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-500 sm:p-5 ${
                          isActive
                            ? "scale-[1.01] border-[#2387ff]/60 bg-[#2387ff]/15 shadow-[0_0_35px_rgba(35,135,255,0.16)]"
                            : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div
                          className={`absolute inset-y-0 left-0 w-1 bg-[#2387ff] transition-transform duration-500 ${
                            isActive
                              ? "translate-x-0"
                              : "-translate-x-full"
                          }`}
                        />

                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <span
                              className={`font-mono text-[10px] ${
                                isActive
                                  ? "text-[#78b8ff]"
                                  : "text-white/30"
                              }`}
                            >
                              {navItem.number}
                            </span>

                            <span
                              className={`text-lg font-semibold tracking-tight transition-all duration-500 sm:text-xl ${
                                isActive
                                  ? "translate-x-1 text-white"
                                  : "text-white/55"
                              }`}
                            >
                              {navItem.title}
                            </span>
                          </div>

                          <span
                            className={`transition-all duration-500 ${
                              isActive
                                ? "translate-x-0 text-[#78b8ff]"
                                : "-translate-x-2 text-white/20"
                            }`}
                          >
                            →
                          </span>
                        </div>
                      </button>
                    );
                  })}


                  {/* Journey progress */}

                  <div className="mt-4 flex items-center gap-1.5 px-1 sm:mt-5 sm:gap-2 sm:px-2">

                    {journey.map((item, index) => (

                      <div
                        key={item.number}
                        className={`h-1 rounded-full transition-all duration-700 ${
                          index <= active
                            ? "w-8 bg-[#2387ff] sm:w-12"
                            : "w-2 bg-white/15"
                        }`}
                      />

                    ))}

                    <span className="ml-2 text-[8px] uppercase tracking-[0.18em] text-white/25 sm:ml-3 sm:text-[9px] sm:tracking-[0.25em]">
                      {journey[active].number} / 05
                    </span>

                  </div>

                </div>


                {/* RIGHT CARD */}

                <div
                  className={`group relative min-h-[360px] overflow-hidden rounded-[2rem] border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] transition-all duration-700 sm:min-h-[500px] sm:rounded-[2.5rem] sm:p-12 ${
                    index === active
                      ? "border-[#2387ff]/40 bg-[#071525]"
                      : "border-white/10 bg-[#071525]/80"
                  }`}
                  style={{
                    transform:
                      index === active
                        ? `perspective(1200px) rotateX(${
                            (mouse.y - 50) * -0.018
                          }deg) rotateY(${(mouse.x - 50) * 0.018}deg) scale(1.01)`
                        : "scale(0.97)",
                  }}
                >


                  {/* Grid */}

                  <div className="pointer-events-none absolute inset-0 opacity-[0.035]">

                    <div
                      className="h-full w-full"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                        backgroundSize: "50px 50px",
                      }}
                    />

                  </div>


                  {/* Large number */}

                  <div
                    className="pointer-events-none absolute right-0 top-0 select-none text-[8rem] font-black leading-none tracking-[-0.1em] text-white/[0.04] transition-all duration-700 sm:text-[15rem]"
                    style={{
                      transform:
                        index === active
                          ? "translate(-8px, 8px) scale(1.025)"
                          : "translate(18px, 0) scale(0.95)",
                    }}
                  >
                    {item.number}
                  </div>


                  {/* Glow */}

                  <div
                    className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#2387ff]/20 blur-3xl transition-all duration-1000"
                    style={{
                      transform: `scale(${index === active ? 1.15 : 0.8})`,
                      opacity: index === active ? 1 : 0.3,
                    }}
                  />


                  {/* Content */}

                  <div
                    className={`relative flex min-h-[280px] flex-col justify-end transition-all duration-700 sm:min-h-[350px] ${
                      index === active
                        ? "translate-y-0 opacity-100"
                        : "translate-y-5 opacity-50"
                    }`}
                  >

                    <div className="mb-auto">

                      <div className="inline-flex rounded-full border border-[#2387ff]/25 bg-[#2387ff]/10 px-3 py-1.5">

                        <span className="text-[9px] uppercase tracking-[0.3em] text-[#78b8ff]">
                          {item.short}
                        </span>

                      </div>

                    </div>


                    <div>

                      <p className="text-[10px] uppercase tracking-[0.35em] text-[#68afff]">
                        {item.number} / 05
                      </p>


                      <h3 className="mt-3 text-4xl font-bold tracking-[-0.07em] sm:text-7xl">
                        {item.title}
                      </h3>


                      <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/55 sm:mt-5 sm:text-lg sm:leading-8">
                        {item.text}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            </article>
          ))}
        </div>

      </section>


      {/* =========================================================
          MARQUEE
      ========================================================= */}

      <section className="w-full overflow-hidden border-y border-white/10 bg-[#081525] py-5 sm:py-7">

        <div className="flex w-max animate-[marquee_25s_linear_infinite]">

          {[...Array(2)].map((_, group) => (

            <div
              key={group}
              className="flex items-center"
            >

              {[
                "MODEL UNITED NATIONS",
                "RESEARCH",
                "DEBATE",
                "DIPLOMACY",
                "LEADERSHIP",
                "CONFIDENCE",
              ].map((item) => (

                <div
                  key={`${group}-${item}`}
                  className="mx-5 flex items-center gap-5 whitespace-nowrap sm:mx-8 sm:gap-8"
                >

                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/30">
                    {item}
                  </span>

                  <span className="text-[#2387ff]">
                    ✦
                  </span>

                </div>

              ))}

            </div>

          ))}

        </div>

      </section>


      {/* =========================================================
          EXPERIENCE
      ========================================================= */}

      <section
        id="experience"
        className="relative overflow-hidden bg-[#071321] px-5 py-24 sm:px-6 sm:py-36"
      >

        <div
          data-reveal="experience"
          className={`mx-auto grid max-w-7xl items-center gap-20 transform transition-all duration-1000 ${reveal(
            "experience"
          )}`}
        >

          {/* TEXT */}

          <div>

            <p className="mb-7 text-[10px] uppercase tracking-[0.4em] text-[#5da8ff]">
              Experience MUN
            </p>


            <h2 className="max-w-3xl text-[2.75rem] font-bold leading-[0.92] tracking-[-0.06em] sm:text-7xl lg:text-[6.5rem]">

              Don&apos;t just

              <span className="text-white/25">
                {" "}learn MUN.
              </span>

              <span className="block text-[#5da8ff]">
                Experience it.
              </span>

            </h2>


            <p className="mt-7 max-w-xl text-base leading-7 text-white/55 sm:mt-9 sm:text-lg sm:leading-8">
              Step into a simulated committee, find your voice,
              navigate diplomacy, and discover what it feels like
              when the floor is yours.
            </p>


            <div className="mt-8 flex flex-wrap gap-2 sm:mt-10 sm:gap-3">

              {[
                "Confidence",
                "Communication",
                "Diplomacy",
                "Leadership",
              ].map((item) => (

                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[9px] uppercase tracking-[0.15em] text-white/45 transition hover:border-[#2387ff]/40 hover:text-white sm:px-4 sm:text-[10px] sm:tracking-[0.18em]"
                >
                  {item}
                </span>

              ))}

            </div>

          </div>


          {/* VIDWAN EXPERIENCE IMAGE */}

          <div
            data-reveal="experience-image"
            className={`relative mt-12 transform overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#06111f] shadow-[0_30px_100px_rgba(0,0,0,0.35)] transition-all duration-1000 sm:mt-16 sm:rounded-[2.5rem] ${reveal(
              "experience-image"
            )}`}
          >
            <div className="relative aspect-[941/1671] w-full md:aspect-[1672/941]">
              <Image
                src="/images/vidwan-experience.png"
                alt="The Vidwan Experience: more than MUN, a platform for what&apos;s next"
                fill
                sizes="(min-width: 768px) calc(100vw - 48px), 1200px"
                className="hidden object-contain md:block"
                priority={false}
              />
              <Image
                src="/images/vidwan-experience-mobile.png"
                alt=""
                fill
                sizes="calc(100vw - 40px)"
                className="object-contain md:hidden"
                priority={false}
              />
            </div>
          </div>


          {/* COMMITTEE */}

          <div
            className="touch-tilt group relative mx-auto w-full max-w-2xl"
            style={{
              transform: `perspective(1000px) rotateX(${
                (mouse.y - 50) * -0.025
              }deg) rotateY(${
                (mouse.x - 50) * 0.025
              }deg)`,
              transition: "transform 0.25s ease-out",
            }}
          >

            <div className="relative min-h-0 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#173d68] via-[#0c2037] to-[#06101c] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.35)] transition-shadow duration-700 group-hover:shadow-[0_35px_110px_rgba(0,0,0,0.42)] sm:aspect-square sm:rounded-[2.5rem] sm:p-7">

              {/* Outer glow */}

              <div className="pointer-events-none absolute -inset-5 rounded-[3rem] bg-[#2387ff]/5 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />


              <div className="relative flex flex-col rounded-[1.5rem] border border-white/10 bg-[#06111f]/80 p-4 backdrop-blur-xl sm:h-full sm:rounded-[2rem] sm:p-6">


                <div className="flex items-center justify-between border-b border-white/10 pb-4 sm:pb-5">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.3em] text-white/35">
                      Experience MUN
                    </p>
                    <p className="mt-1 text-xs font-semibold">Committee in session</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#2387ff]" />
                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/35">
                      LIVE
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 sm:mt-5">
                  {simulationTabs.map((simulation, index) => (
                    <button
                      key={simulation.label}
                      type="button"
                      onClick={() => setSimulationTab(index)}
                      className={`min-h-11 rounded-lg px-0.5 text-[8px] font-bold uppercase tracking-[0.06em] transition sm:min-h-10 sm:px-1 sm:text-[9px] sm:tracking-[0.08em] ${
                        simulationTab === index
                          ? "bg-[#2387ff]/20 text-[#8bc3ff]"
                          : "text-white/35 hover:text-white"
                      }`}
                    >
                      {simulation.label}
                    </button>
                  ))}
                </div>

                <div className="grid place-items-center py-5 text-center sm:flex-1 sm:py-10">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#68afff]">
                      {simulationTabs[simulationTab].label}
                    </p>
                    <h3 className="mt-2 text-xl font-bold leading-tight tracking-[-0.04em] sm:mt-3 sm:text-3xl">
                      {simulationTabs[simulationTab].value}
                    </h3>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/50 sm:mt-4">
                      {simulationTabs[simulationTab].text}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2387ff]/25 bg-[#2387ff]/10 p-4 sm:p-5">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-[#68afff]">
                    The Chair
                  </p>
                  <p className="mt-2 text-base leading-6">
                    What would you do?
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Choose a chapter above and practice your next move.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          WHAT YOU ACTUALLY LEARN
      ========================================================= */}

      <section className="relative overflow-hidden border-t border-white/10 bg-[#0a1b2e] px-5 py-24 sm:px-6 sm:py-36">
        <div
          data-reveal="learning"
          className={`mx-auto max-w-7xl transform transition-all duration-1000 ${reveal(
            "learning"
          )}`}
        >
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#5da8ff]">
                The real curriculum
              </p>
              <h2 className="mt-6 max-w-xl text-[2.75rem] font-bold leading-[0.92] tracking-[-0.06em] sm:text-7xl">
                You don&apos;t just learn MUN.
              </h2>
              <p className="mt-7 max-w-md text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
                You learn how to think, speak, negotiate and lead in any room
                that comes next.
              </p>
            </div>

            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
              {learningSkills.map(([number, title, text], index) => (
                <div
                  key={title}
                  className="group border-t border-white/10 pt-4 transition-all duration-500 hover:-translate-y-1 hover:border-[#2387ff]/60"
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-white/85 transition-colors group-hover:text-white">
                      {title}
                    </h3>
                    <span className="font-mono text-[10px] text-[#5da8ff]">
                      {number}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/45">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          CREDIBILITY
      ========================================================= */}

      <section className="relative overflow-hidden bg-[#071321] px-5 py-24 sm:px-6 sm:py-36">
        <div
          data-reveal="credibility"
          className={`mx-auto max-w-7xl transform transition-all duration-1000 ${reveal(
            "credibility"
          )}`}
        >
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#5da8ff]">
              Built for what&apos;s next
            </p>
            <h2 className="mt-6 text-[2.75rem] font-bold leading-[0.92] tracking-[-0.06em] sm:text-7xl">
              Built for students who want to go further.
            </h2>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
              Practical training. Real simulations. Skills that last beyond
              the conference room.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3 sm:mt-16">
            {[
              ["Student voices", "Verified stories from the people doing the work."],
              ["Mentor perspective", "A place for the coaches shaping the room."],
              ["Partners in progress", "Future collaborations, shared when confirmed."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#78b8ff]">
                  {title}
                </p>
                <p className="mt-4 text-sm leading-6 text-white/45">{text}</p>
                <p className="mt-8 text-[9px] uppercase tracking-[0.18em] text-white/25">
                  Coming soon
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================
          PROMISE
      ========================================================= */}

      <section className="relative overflow-hidden border-t border-white/10 bg-[#0a1b2e] px-5 py-24 text-center sm:px-6 sm:py-40">

        <div
          data-reveal="promise"
          className={`relative z-10 mx-auto max-w-6xl transform transition-all duration-1000 ${reveal(
            "promise"
          )}`}
        >

          <p className="text-[10px] uppercase tracking-[0.4em] text-[#5da8ff]">
            The promise
          </p>


          <h2 className="mt-7 text-[2.75rem] font-bold leading-[0.92] tracking-[-0.07em] sm:mt-8 sm:text-7xl lg:text-[7.5rem]">

            YOU DON&apos;T NEED TO BE

            <span className="text-white/25">
              {" "}AN EXPERT.
            </span>

            <br />

            <span className="text-[#58a9ff]">
              YOU JUST NEED TO START.
            </span>

          </h2>


          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/55 sm:mt-10 sm:text-lg sm:leading-8">
            We&apos;ll give you the tools, confidence, and practical
            skills to walk into your first committee ready.
          </p>

        </div>


        {/* Background rings */}

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2387ff]/5" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2387ff]/5" />

      </section>


      {/* =========================================================
          FINAL CTA
      ========================================================= */}

      <section
        id="start"
        className="relative overflow-hidden bg-[#071321] px-5 py-16 sm:px-6 sm:py-24"
      >

        <div
          data-reveal="cta"
          className={`relative mx-auto max-w-7xl transform transition-all duration-1000 ${reveal(
            "cta"
          )}`}
        >

          <div className="relative overflow-hidden rounded-[2rem] border border-[#2387ff]/35 bg-gradient-to-br from-[#153a65] via-[#0c223c] to-[#081525] px-5 py-16 text-center shadow-[0_30px_120px_rgba(35,135,255,0.12)] sm:rounded-[3rem] sm:px-12 sm:py-32">


            {/* Glow */}

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2387ff]/15 blur-[100px]" />


            {/* Content */}

            <div className="relative z-10">

              <p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">
                Your first MUN starts here
              </p>


              <h2 className="mt-6 text-[2.75rem] font-bold leading-[0.92] tracking-[-0.07em] sm:mt-7 sm:text-7xl lg:text-[7rem]">

                Ready to become the

                <br />

                <span className="text-white/60">
                  delegate people remember?
                </span>

              </h2>


              <a
                href="/register"
                className="group mt-9 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-4 rounded-full bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#071321] transition-all duration-500 hover:scale-105 hover:bg-[#2387ff] hover:text-white sm:mt-12 sm:w-auto"
              >

                Start Your Journey

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>

              </a>

            </div>

          </div>

        </div>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-2 py-8 text-[9px] uppercase tracking-[0.16em] text-white/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-10 sm:tracking-[0.2em]">

          <div className="flex items-center gap-3">
            <Image
              src="/images/vidwan-logo.png"
              alt="Vidwan"
              width={128}
              height={128}
              className="h-9 w-9 object-contain"
            />
            <span>© {new Date().getFullYear()} Vidwan</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>Experiment. Debate. Lead.</span>

            <Link href="/teacher/login" className="transition hover:text-white">
              Teacher Login
            </Link>
          </div>

        </footer>

      </section>


      {/* =========================================================
          ANIMATIONS
      ========================================================= */}

      <style>{`
        @keyframes floatParticle {
          0%, 100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.2;
          }

          50% {
            transform: translate3d(0, -22px, 0);
            opacity: 0.8;
          }
        }

        @keyframes scrollLine {
          0% {
            transform: translateY(-100%);
          }

          50% {
            transform: translateY(100%);
          }

          100% {
            transform: translateY(220%);
          }
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @keyframes journeyIn {
          from {
            opacity: 0;
            transform: translateY(22px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
