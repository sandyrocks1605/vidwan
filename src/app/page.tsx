"use client";

import Link from "next/link";
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

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [active, setActive] = useState(0);

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
      ? "translate-y-0 opacity-100"
      : "translate-y-12 opacity-0";

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
        className={`fixed left-1/2 top-0 z-50 flex w-[calc(100%-28px)] max-w-7xl -translate-x-1/2 items-center justify-between rounded-full px-5 py-3 transition-all duration-700 ${
          scrolled
            ? "mt-4 border border-white/10 bg-[#071321]/80 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
            : "mt-3"
        }`}
      >

        <a
          href="#top"
          className="group text-sm font-black tracking-[0.18em]"
        >
          VIDWAN
          <span className="text-[#2387ff] transition-all duration-300 group-hover:text-white">
            .
          </span>
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


        <a
          href="/register"
          className="group relative overflow-hidden rounded-full bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#071321]"
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
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-center"
      >

        {/* Cursor glow */}

        <div
          className="pointer-events-none absolute inset-0 transition-all duration-300"
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
          className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2387ff]/10 blur-[120px]"
          style={{
            transform: `translate(-50%, -50%) scale(${
              1 + scrollProgress * 0.25
            })`,
          }}
        />


        {/* Orbital rings */}

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[680px] w-[680px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2387ff]/15"
          style={{
            transform: `translate(-50%, -50%) rotate(${
              scrollProgress * 25
            }deg)`,
          }}
        />

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] max-w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]"
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
            className="pointer-events-none absolute rounded-full bg-[#58a9ff]/40"
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
          className="relative z-10 max-w-7xl"
          style={{
            transform: `translate3d(
              ${(mouse.x - 50) * 0.35}px,
              ${(mouse.y - 50) * 0.35 - heroOffset}px,
              0
            )`,
          }}
        >

          <h1 className="bg-gradient-to-r from-white via-[#b8d9ff] to-[#2387ff] bg-clip-text text-[20vw] font-black leading-[0.8] tracking-[-0.085em] text-transparent sm:text-[15vw] lg:text-[14rem]">
            VIDWAN
          </h1>


          <p className="mt-8 text-[10px] uppercase tracking-[0.5em] text-[#78b8ff] sm:text-xs">
            MUN • DEBATE • LEADERSHIP
          </p>


          <p className="mx-auto mt-8 max-w-3xl text-2xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Become the delegate people remember.
          </p>


          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
            Model United Nations isn&apos;t about knowing everything.
            It&apos;s about learning how to think, speak, negotiate and lead.
          </p>


          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <a
              href="/register"
              className="group rounded-full bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#071321] transition-all duration-500 hover:scale-105 hover:bg-[#2387ff] hover:text-white"
            >
              Start your journey
              <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>


            <a
              href="#experience"
              className="rounded-full border border-white/15 px-7 py-3.5 text-xs uppercase tracking-[0.16em] text-white/70 transition-all duration-500 hover:border-[#2387ff]/50 hover:bg-[#2387ff]/10 hover:text-white"
            >
              Experience MUN
            </a>

          </div>

        </div>


        {/* Scroll indicator */}

        <div
          className="absolute bottom-7 flex flex-col items-center gap-3 transition-opacity duration-500"
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
        className="relative flex min-h-screen items-center overflow-hidden bg-[#0a1b2e] px-6 py-32"
      >

        <div
          data-reveal="intro"
          className={`mx-auto w-full max-w-7xl transform transition-all duration-1000 ${reveal("intro")}`}
        >

          <p className="mb-7 text-[10px] uppercase tracking-[0.4em] text-[#5da8ff]">
            The first step
          </p>


          <h2 className="max-w-6xl text-5xl font-bold leading-[0.9] tracking-[-0.06em] sm:text-7xl lg:text-[8rem]">

            MUN can be

            <span className="text-white/25">
              {" "}intimidating.
            </span>

          </h2>


          <p className="mt-10 max-w-2xl text-lg leading-8 text-white/55">
            New committees. New rules. New people.
            A room full of delegates who seem like they already
            know exactly what they&apos;re doing.
          </p>


          <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

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
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-6 transition-all duration-500 hover:-translate-y-2 hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10"
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


          <p className="mt-16 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">

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
              className="relative flex min-h-screen items-center overflow-hidden px-6 py-24"
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

                <h2 className="max-w-5xl text-5xl font-bold leading-[0.92] tracking-[-0.06em] sm:text-7xl lg:text-[6.5rem]">

                  From first-timer

                  <span className="text-white/25">
                    {" "}to delegate.
                  </span>

                </h2>

                </div>
              )}


              {/* Main journey */}

              <div className="grid items-center gap-10 lg:grid-cols-[0.7fr_1.3fr]">


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
                        className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-500 ${
                          isActive
                            ? "scale-[1.01] border-[#2387ff]/60 bg-[#2387ff]/15 shadow-[0_0_35px_rgba(35,135,255,0.12)]"
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

                  <div className="mt-5 flex items-center gap-2 px-2">

                    {journey.map((item, index) => (

                      <div
                        key={item.number}
                        className={`h-1 rounded-full transition-all duration-700 ${
                          index <= active
                            ? "w-12 bg-[#2387ff]"
                            : "w-2 bg-white/15"
                        }`}
                      />

                    ))}

                    <span className="ml-3 text-[9px] uppercase tracking-[0.25em] text-white/25">
                      {journey[active].number} / 05
                    </span>

                  </div>

                </div>


                {/* RIGHT CARD */}

                <div
                  className={`group relative min-h-[440px] overflow-hidden rounded-[2.5rem] border p-8 shadow-[0_0_100px_rgba(35,135,255,0.08)] transition-all duration-700 sm:min-h-[500px] sm:p-12 ${
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
                    className="pointer-events-none absolute right-0 top-0 select-none text-[12rem] font-black leading-none tracking-[-0.1em] text-white/[0.04] transition-all duration-700 sm:text-[15rem]"
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
                    className={`relative flex min-h-[350px] flex-col justify-end transition-all duration-700 ${
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


                      <h3 className="mt-3 text-5xl font-bold tracking-[-0.07em] sm:text-7xl">
                        {item.title}
                      </h3>


                      <p className="mt-5 max-w-xl text-base leading-8 text-white/55 sm:text-lg">
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

      <section className="overflow-hidden border-y border-white/10 bg-[#081525] py-7">

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
                  className="mx-8 flex items-center gap-8 whitespace-nowrap"
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
        className="relative overflow-hidden bg-[#071321] px-6 py-36"
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


            <h2 className="max-w-3xl text-5xl font-bold leading-[0.9] tracking-[-0.06em] sm:text-7xl lg:text-[6.5rem]">

              Don&apos;t just

              <span className="text-white/25">
                {" "}learn MUN.
              </span>

              <span className="block text-[#5da8ff]">
                Experience it.
              </span>

            </h2>


            <p className="mt-9 max-w-xl text-lg leading-8 text-white/55">
              Step into a simulated committee, find your voice,
              navigate diplomacy, and discover what it feels like
              when the floor is yours.
            </p>


            <div className="mt-10 flex flex-wrap gap-3">

              {[
                "Confidence",
                "Communication",
                "Diplomacy",
                "Leadership",
              ].map((item) => (

                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white/45 transition hover:border-[#2387ff]/40 hover:text-white"
                >
                  {item}
                </span>

              ))}

            </div>

          </div>


          {/* COMMITTEE */}

          <div
            className="group relative mx-auto w-full max-w-2xl"
            style={{
              transform: `perspective(1000px) rotateX(${
                (mouse.y - 50) * -0.025
              }deg) rotateY(${
                (mouse.x - 50) * 0.025
              }deg)`,
              transition: "transform 0.25s ease-out",
            }}
          >

            <div className="relative aspect-square rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#173d68] via-[#0c2037] to-[#06101c] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-7">

              {/* Outer glow */}

              <div className="pointer-events-none absolute -inset-5 rounded-[3rem] bg-[#2387ff]/5 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />


              <div className="relative flex h-full flex-col rounded-[2rem] border border-white/10 bg-[#06111f]/80 p-6 backdrop-blur-xl">


                {/* Header */}

                <div className="flex items-center justify-between border-b border-white/10 pb-5">

                  <div>

                    <p className="text-[8px] uppercase tracking-[0.3em] text-white/35">
                      United Nations
                    </p>

                    <p className="mt-1 text-xs font-semibold">
                      Committee in session
                    </p>

                  </div>


                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#2387ff]" />

                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/35">
                      LIVE
                    </span>

                  </div>

                </div>


                {/* Center */}

                <div className="grid flex-1 place-items-center">

                  <div className="relative grid h-48 w-48 place-items-center rounded-full border border-[#2387ff]/30 bg-[#2387ff]/5 shadow-[0_0_100px_rgba(35,135,255,0.15)] transition-all duration-700 group-hover:scale-110 group-hover:border-[#2387ff]/60">

                    <div className="absolute inset-3 rounded-full border border-white/5" />

                    <div className="text-center">

                      <div className="text-4xl">
                        🎤
                      </div>

                      <p className="mt-3 text-[9px] uppercase tracking-[0.25em] text-[#68afff]">
                        The floor
                      </p>

                    </div>

                  </div>

                </div>


                {/* Chair */}

                <div className="rounded-2xl border border-[#2387ff]/25 bg-[#2387ff]/10 p-5">

                  <p className="text-[8px] uppercase tracking-[0.3em] text-[#68afff]">
                    The Chair
                  </p>

                  <p className="mt-2 text-base leading-6">
                    The delegate of your country has the floor.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          PROMISE
      ========================================================= */}

      <section className="relative overflow-hidden border-t border-white/10 bg-[#0a1b2e] px-6 py-40 text-center">

        <div
          data-reveal="promise"
          className={`relative z-10 mx-auto max-w-6xl transform transition-all duration-1000 ${reveal(
            "promise"
          )}`}
        >

          <p className="text-[10px] uppercase tracking-[0.4em] text-[#5da8ff]">
            The promise
          </p>


          <h2 className="mt-8 text-5xl font-bold leading-[0.9] tracking-[-0.07em] sm:text-7xl lg:text-[7.5rem]">

            YOU DON&apos;T NEED TO BE

            <span className="text-white/25">
              {" "}AN EXPERT.
            </span>

            <br />

            <span className="text-[#58a9ff]">
              YOU JUST NEED TO START.
            </span>

          </h2>


          <p className="mx-auto mt-10 max-w-2xl text-lg leading-8 text-white/55">
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
        className="relative overflow-hidden bg-[#071321] px-6 py-24"
      >

        <div
          data-reveal="cta"
          className={`relative mx-auto max-w-7xl transform transition-all duration-1000 ${reveal(
            "cta"
          )}`}
        >

          <div className="relative overflow-hidden rounded-[3rem] border border-[#2387ff]/30 bg-gradient-to-br from-[#153a65] via-[#0c223c] to-[#081525] px-7 py-24 text-center shadow-[0_30px_120px_rgba(35,135,255,0.08)] sm:px-12 sm:py-32">


            {/* Glow */}

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2387ff]/15 blur-[100px]" />


            {/* Content */}

            <div className="relative z-10">

              <p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">
                Your first MUN starts here
              </p>


              <h2 className="mt-7 text-5xl font-bold leading-[0.9] tracking-[-0.07em] sm:text-7xl lg:text-[7rem]">

                Ready to become the

                <br />

                <span className="text-white/60">
                  delegate people remember?
                </span>

              </h2>


              <a
                href="/register"
                className="group mt-12 inline-flex items-center gap-4 rounded-full bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#071321] transition-all duration-500 hover:scale-105 hover:bg-[#2387ff] hover:text-white"
              >

                Start your journey

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

        <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-2 py-10 text-[9px] uppercase tracking-[0.2em] text-white/30 sm:flex-row sm:items-center sm:justify-between">

          <span>
            © {new Date().getFullYear()} Vidwan
          </span>

          <div className="flex items-center gap-6">
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
