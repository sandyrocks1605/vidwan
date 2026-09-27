"use client";

import { useEffect, useRef, useState } from "react";

const stages = [
  {
    number: "01",
    title: "RESEARCH",
    subtitle: "KNOW THE ISSUE",
  },
  {
    number: "02",
    title: "SPEAK",
    subtitle: "FIND YOUR VOICE",
  },
  {
    number: "03",
    title: "DEBATE",
    subtitle: "CHALLENGE IDEAS",
  },
  {
    number: "04",
    title: "NEGOTIATE",
    subtitle: "BUILD CONSENSUS",
  },
  {
    number: "05",
    title: "LEAD",
    subtitle: "MOVE THE ROOM",
  },
];

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function ease(value: number) {
  return value * value * (3 - 2 * value);
}

export default function JourneyScroller() {
  const sectionRef = useRef<HTMLElement>(null);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrame = 0;

    const update = () => {
      animationFrame = 0;

      const section = sectionRef.current;

      if (!section) return;

      const rect = section.getBoundingClientRect();

      const totalDistance =
        section.offsetHeight - window.innerHeight;

      if (totalDistance <= 0) return;

      const travelled = -rect.top;

      const nextProgress = clamp(
        travelled / totalDistance
      );

      setProgress(nextProgress);
    };

    const onScroll = () => {
      if (!animationFrame) {
        animationFrame =
          window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    window.addEventListener("resize", onScroll);

    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (animationFrame) {
        window.cancelAnimationFrame(
          animationFrame
        );
      }
    };
  }, []);

  /*
   * Divide the journey into five cinematic chapters.
   */

  const rawStage =
    progress * stages.length;

  const stageIndex = Math.min(
    stages.length - 1,
    Math.floor(rawStage)
  );

  const stageStart =
    stageIndex / stages.length;

  const stageEnd =
    (stageIndex + 1) / stages.length;

  const stageProgress = clamp(
    (progress - stageStart) /
      (stageEnd - stageStart)
  );

  const eased = ease(stageProgress);

  /*
   * Transition begins during the final 24%
   * of each chapter.
   */

  const transition = clamp(
    (stageProgress - 0.76) / 0.24
  );

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="relative bg-[#050b13]"
      style={{
        height: "500vh",
      }}
    >
      {/* =====================================================
          STICKY VIEWPORT
      ===================================================== */}

      <div className="sticky top-0 h-screen">

        {/* ===================================================
            CINEMATIC FRAME
        =================================================== */}

        <div className="relative h-full w-full overflow-hidden bg-[#050b13]">

          {/* BACKGROUND */}

          <div
            className="absolute inset-0 transition-colors duration-700"
            style={{
              background:
                stageIndex === 0
                  ? "#071525"
                  : stageIndex === 1
                    ? "#08182a"
                    : stageIndex === 2
                      ? "#0a1524"
                      : stageIndex === 3
                        ? "#071a25"
                        : "#081321",
            }}
          />

          {/* BLUE ATMOSPHERE */}

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[45rem] w-[45rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
            style={{
              background:
                "rgba(35,135,255,0.10)",
              transform: `
                translate(-50%, -50%)
                scale(${0.8 + eased * 0.35})
              `,
            }}
          />

          {/* GRID */}

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `
                linear-gradient(
                  rgba(255,255,255,0.5) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(255,255,255,0.5) 1px,
                  transparent 1px
                )
              `,
              backgroundSize: "80px 80px",
            }}
          />

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="absolute left-5 top-6 z-30 sm:left-10 sm:top-9">
            <p className="text-[9px] uppercase tracking-[0.45em] text-[#65adff]">
              THE VIDWAN JOURNEY
            </p>
          </div>

          {/* =================================================
              DESKTOP PROGRESS
          ================================================= */}

          <div className="absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 sm:right-10 sm:flex">
            {stages.map((stage, index) => (
              <div
                key={stage.number}
                className="flex items-center gap-3"
              >
                <span
                  className={`font-mono text-[9px] transition-colors duration-500 ${
                    index === stageIndex
                      ? "text-[#65adff]"
                      : "text-white/20"
                  }`}
                >
                  {stage.number}
                </span>

                <span
                  className={`block w-[2px] transition-all duration-500 ${
                    index === stageIndex
                      ? "h-9 bg-[#2387ff] shadow-[0_0_15px_rgba(35,135,255,0.8)]"
                      : "h-2 bg-white/15"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* =================================================
              CONTENT FRAME
          ================================================= */}

          <div className="absolute inset-0 flex items-center justify-center px-5 sm:px-12">

            {/* =================================================
                RESEARCH
            ================================================= */}

            {stageIndex === 0 && (
              <div
                className="relative flex w-full max-w-6xl flex-col items-center justify-center text-center"
                style={{
                  opacity: 1 - transition,
                  transform: `
                    translateY(${
                      transition * -90
                    }px)
                  `,
                }}
              >
                <p className="mb-5 text-[9px] uppercase tracking-[0.45em] text-[#65adff] sm:mb-7">
                  01 / 05
                </p>

                {/* BIG WORD */}

                <h2
                  className="relative z-10 whitespace-nowrap font-black leading-none tracking-[-0.09em] text-white"
                  style={{
                    fontSize:
                      "clamp(3.4rem, 10.5vw, 10.5rem)",
                  }}
                >
                  {Array.from("RESEARCH").map(
                    (letter, index) => {
                      const spread =
                        (1 - eased) * 18;

                      const direction =
                        index % 2 === 0
                          ? -1
                          : 1;

                      return (
                        <span
                          key={`${letter}-${index}`}
                          className="inline-block"
                          style={{
                            transform: `
                              translateX(
                                ${
                                  spread *
                                  direction
                                }px
                              )
                            `,
                          }}
                        >
                          {letter}
                        </span>
                      );
                    }
                  )}
                </h2>

                <p className="mt-6 max-w-lg text-xs leading-6 text-white/45 sm:text-sm">
                  Find the evidence before you take
                  a position.
                </p>

                {/* ORBIT */}

                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 sm:h-[420px] sm:w-[420px]"
                  style={{
                    transform: `
                      translate(-50%, -50%)
                      rotate(${eased * 30}deg)
                    `,
                    opacity:
                      0.2 + eased * 0.7,
                  }}
                >
                  <div className="absolute inset-3 rounded-full border border-[#2387ff]/20 sm:inset-8" />

                  <div className="absolute inset-12 rounded-full border border-white/[0.06] sm:inset-20" />

                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[7px] uppercase tracking-[0.25em] text-[#65adff] sm:text-[9px]">
                    EVIDENCE
                  </span>

                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[7px] uppercase tracking-[0.25em] text-[#65adff] sm:text-[9px]">
                    POSITION
                  </span>

                  <span className="absolute left-1/2 top-0 -translate-x-1/2 text-[7px] uppercase tracking-[0.25em] text-white/30 sm:text-[9px]">
                    ISSUE
                  </span>
                </div>

                {/* BRIEFING */}

                <div
                  className="absolute bottom-[-115px] left-1/2 w-[250px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#071321]/90 p-4 text-left backdrop-blur-xl sm:bottom-auto sm:left-auto sm:right-0 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0"
                  style={{
                    opacity: clamp(
                      (stageProgress - 0.25) * 2.5
                    ),
                    transform: `
                      translateY(
                        ${
                          (1 -
                            clamp(
                              (stageProgress -
                                0.25) *
                                2.5
                            )) *
                          20
                        }px
                      )
                    `,
                  }}
                >
                  <p className="text-[8px] uppercase tracking-[0.3em] text-[#65adff]">
                    Briefing
                  </p>

                  <p className="mt-2 text-xs font-semibold sm:text-sm">
                    UN SECURITY COUNCIL
                  </p>

                  <div className="mt-3 space-y-1.5 text-[8px] uppercase tracking-[0.1em] text-white/35">
                    <p>
                      Issue{" "}
                      <span className="text-white/65">
                        Regional instability
                      </span>
                    </p>

                    <p>
                      Position{" "}
                      <span className="text-white/65">
                        Build consensus
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                SPEAK
            ================================================= */}

            {stageIndex === 1 && (
              <div
                className="w-full max-w-6xl text-center"
                style={{
                  opacity: 1 - transition,
                  transform: `
                    translateY(${
                      transition * -90
                    }px)
                  `,
                }}
              >
                <p className="mb-7 text-[9px] uppercase tracking-[0.45em] text-[#65adff]">
                  02 / 05
                </p>

                <h2
                  className="font-black leading-none tracking-[-0.1em]"
                  style={{
                    fontSize:
                      "clamp(4rem, 14vw, 12rem)",
                  }}
                >
                  SPEAK
                </h2>

                {/* WAVE */}

                <div className="mx-auto mt-8 flex h-20 max-w-2xl items-center justify-center gap-[3px] sm:mt-12 sm:h-28 sm:gap-1">
                  {Array.from({ length: 42 }).map(
                    (_, index) => {
                      const center =
                        Math.abs(index - 21) /
                        21;

                      const wave =
                        Math.sin(index * 0.7) *
                        (1 - center);

                      return (
                        <span
                          key={index}
                          className="w-1 rounded-full bg-[#4da0ff]"
                          style={{
                            height: `${
                              6 +
                              Math.abs(wave) *
                                (30 +
                                  eased * 70)
                            }px`,
                            opacity:
                              0.2 + eased * 0.8,
                          }}
                        />
                      );
                    }
                  )}
                </div>

                <p className="mt-7 text-[9px] uppercase tracking-[0.4em] text-white/35">
                  YOUR VOICE
                </p>

                <p
                  className="mt-3 text-xl font-semibold sm:text-3xl"
                  style={{
                    opacity: clamp(
                      (stageProgress - 0.25) *
                        2
                    ),
                  }}
                >
                  MAKE THE ROOM LISTEN.
                </p>
              </div>
            )}

            {/* =================================================
                DEBATE
            ================================================= */}

            {stageIndex === 2 && (
              <div
                className="w-full max-w-6xl"
                style={{
                  opacity: 1 - transition,
                  transform: `
                    translateY(${
                      transition * -90
                    }px)
                  `,
                }}
              >
                <p className="text-center text-[9px] uppercase tracking-[0.45em] text-[#65adff]">
                  03 / 05
                </p>

                <h2
                  className="mt-6 text-center font-black leading-none tracking-[-0.1em]"
                  style={{
                    fontSize:
                      "clamp(3.8rem, 12vw, 11rem)",
                  }}
                >
                  DEBATE
                </h2>

                <div className="relative mx-auto mt-12 h-44 max-w-4xl sm:h-56">

                  <div
                    className="absolute left-0 top-1/2"
                    style={{
                      transform: `
                        translate(
                          ${
                            eased * 110
                          }px,
                          -50%
                        )
                      `,
                    }}
                  >
                    <p className="text-xl font-semibold sm:text-4xl">
                      ARGUMENT
                    </p>

                    <p className="mt-2 text-[8px] uppercase tracking-[0.3em] text-white/25">
                      QUESTION
                    </p>
                  </div>

                  <div
                    className="absolute right-0 top-1/2 text-right"
                    style={{
                      transform: `
                        translate(
                          ${
                            eased * -110
                          }px,
                          -50%
                        )
                      `,
                    }}
                  >
                    <p className="text-xl font-semibold sm:text-4xl">
                      COUNTER
                    </p>

                    <p className="mt-2 text-[8px] uppercase tracking-[0.3em] text-white/25">
                      RESPONSE
                    </p>
                  </div>

                  <div
                    className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2387ff]/60 bg-[#2387ff]/10 sm:h-20 sm:w-20"
                    style={{
                      transform: `
                        translate(-50%, -50%)
                        scale(
                          ${
                            0.5 +
                            eased * 1
                          }
                        )
                      `,
                    }}
                  />

                  <div
                    className="absolute left-1/2 top-1/2 h-px bg-[#2387ff]/50"
                    style={{
                      width: `${
                        10 + eased * 75
                      }%`,
                      transform:
                        "translate(-50%, -50%)",
                    }}
                  />
                </div>

                <p className="text-center text-[8px] uppercase tracking-[0.35em] text-white/25">
                  QUESTION • RESPONSE • EVIDENCE
                </p>
              </div>
            )}

            {/* =================================================
                NEGOTIATE
            ================================================= */}

            {stageIndex === 3 && (
              <div
                className="w-full max-w-6xl text-center"
                style={{
                  opacity: 1 - transition,
                  transform: `
                    translateY(${
                      transition * -90
                    }px)
                  `,
                }}
              >
                <p className="text-[9px] uppercase tracking-[0.45em] text-[#65adff]">
                  04 / 05
                </p>

                <h2
                  className="mt-6 font-black leading-none tracking-[-0.1em]"
                  style={{
                    fontSize:
                      "clamp(3rem, 10vw, 9rem)",
                  }}
                >
                  NEGOTIATE
                </h2>

                <div className="relative mx-auto mt-10 h-56 max-w-3xl">

                  <div
                    className="absolute left-1/2 top-1/2 h-28 w-28 rounded-full border border-[#4da0ff]/50 bg-[#2387ff]/5 sm:h-36 sm:w-36"
                    style={{
                      transform: `
                        translate(
                          calc(
                            -50% -
                            ${
                              105 *
                              (1 -
                                eased)
                            }px
                          ),
                          -50%
                        )
                      `,
                    }}
                  >
                    <span className="absolute inset-0 grid place-items-center text-[7px] uppercase tracking-[0.2em] text-white/50 sm:text-[8px]">
                      INTEREST A
                    </span>
                  </div>

                  <div
                    className="absolute left-1/2 top-1/2 h-28 w-28 rounded-full border border-[#4da0ff]/50 bg-[#2387ff]/5 sm:h-36 sm:w-36"
                    style={{
                      transform: `
                        translate(
                          calc(
                            -50% +
                            ${
                              105 *
                              (1 -
                                eased)
                            }px
                          ),
                          -50%
                        )
                      `,
                    }}
                  >
                    <span className="absolute inset-0 grid place-items-center text-[7px] uppercase tracking-[0.2em] text-white/50 sm:text-[8px]">
                      INTEREST B
                    </span>
                  </div>

                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      opacity: clamp(
                        (stageProgress -
                          0.45) *
                          2
                      ),
                    }}
                  >
                    <p className="whitespace-nowrap text-[8px] uppercase tracking-[0.35em] text-[#65adff]">
                      COMMON GROUND
                    </p>

                    <div className="mx-auto mt-3 h-px w-16 bg-[#2387ff]" />
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                LEAD
            ================================================= */}

            {stageIndex === 4 && (
              <div
                className="relative w-full max-w-6xl text-center"
                style={{
                  opacity: 1,
                  transform: `
                    scale(
                      ${
                        0.9 +
                        eased * 0.1
                      }
                    )
                  `,
                }}
              >
                <p className="text-[9px] uppercase tracking-[0.45em] text-[#65adff]">
                  05 / 05
                </p>

                <h2
                  className="mt-5 font-black leading-none tracking-[-0.12em]"
                  style={{
                    fontSize:
                      "clamp(5rem, 18vw, 15rem)",
                  }}
                >
                  LEAD
                </h2>

                <p
                  className="mt-5 text-xs uppercase tracking-[0.4em] text-white/45 sm:text-sm"
                  style={{
                    opacity: clamp(
                      (stageProgress -
                        0.15) *
                        2
                    ),
                  }}
                >
                  MOVE THE ROOM.
                </p>

                {/* REAPPEARING MOTIFS */}

                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 sm:h-[560px] sm:w-[560px]"
                  style={{
                    opacity:
                      eased * 0.8,
                    transform: `
                      translate(-50%, -50%)
                      rotate(
                        ${eased * 25}deg
                      )
                    `,
                  }}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[7px] uppercase tracking-[0.25em] text-white/20 sm:text-[9px]">
                    RESEARCH
                  </span>

                  <span className="absolute left-1/2 top-0 -translate-x-1/2 text-[7px] uppercase tracking-[0.25em] text-white/20 sm:text-[9px]">
                    SPEAK
                  </span>

                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[7px] uppercase tracking-[0.25em] text-white/20 sm:text-[9px]">
                    DEBATE
                  </span>

                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.25em] text-white/20 sm:text-[9px]">
                    NEGOTIATE
                  </span>

                  <div className="absolute inset-10 rounded-full border border-[#2387ff]/10 sm:inset-16" />

                  <div className="absolute inset-20 rounded-full border border-white/[0.05] sm:inset-28" />
                </div>

                <p
                  className="relative z-10 mx-auto mt-9 max-w-xl text-lg font-semibold tracking-[-0.03em] text-white/75 sm:text-3xl"
                  style={{
                    opacity: clamp(
                      (stageProgress -
                        0.35) *
                        2
                    ),
                  }}
                >
                  Research.
                  <span className="text-white/20">
                    {" "}Speak.
                  </span>
                  <span className="text-white/20">
                    {" "}Debate.
                  </span>
                  <span className="text-white/20">
                    {" "}Negotiate.
                  </span>
                  <span className="text-[#65adff]">
                    {" "}Lead.
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* =================================================
              BOTTOM PROGRESS
          ================================================= */}

          <div className="absolute bottom-6 left-5 right-5 z-40 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
            <div className="flex items-center justify-between sm:hidden">
              <span className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                {stages[stageIndex].number}
              </span>

              <span className="text-[8px] uppercase tracking-[0.3em] text-[#65adff]">
                {stages[stageIndex].title}
              </span>
            </div>

            <div className="mt-3 h-[2px] w-full overflow-hidden bg-white/10 sm:mt-0 sm:w-32">
              <div
                className="h-full bg-[#2387ff]"
                style={{
                  width: `${progress * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}