"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const journey = [
  {
    number: "01",
    title: "RESEARCH",
    subtitle: "KNOW THE ISSUE.",
    description:
      "Understand the room before you enter it. Research the issue, the evidence, the interests and the details that shape a position.",
    keywords: ["ISSUE", "EVIDENCE", "CONTEXT", "POSITION"],
  },
  {
    number: "02",
    title: "SPEAK",
    subtitle: "OWN THE ROOM.",
    description:
      "Turn preparation into presence. Structure ideas clearly and communicate them with confidence when the room is listening.",
    keywords: ["VOICE", "CLARITY", "PRESENCE", "IMPACT"],
  },
  {
    number: "03",
    title: "DEBATE",
    subtitle: "CHALLENGE IDEAS.",
    description:
      "Listen, respond and defend your position. Strong debate is not about speaking the most — it is about thinking the fastest.",
    keywords: ["ARGUMENT", "RESPONSE", "LOGIC", "DEFENCE"],
  },
  {
    number: "04",
    title: "NEGOTIATE",
    subtitle: "FIND COMMON GROUND.",
    description:
      "Move beyond opposing positions. Learn how alliances form, compromises happen and agreements are built.",
    keywords: ["ALLIANCE", "COMPROMISE", "TRUST", "AGREEMENT"],
  },
  {
    number: "05",
    title: "LEAD",
    subtitle: "MOVE THE ROOM.",
    description:
      "Bring everything together. Leadership is preparation, communication, judgment and the ability to move people forward.",
    keywords: ["VISION", "DECISION", "DIRECTION", "LEADERSHIP"],
  },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function ease(value: number) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
}

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  /* KEEPING THE WORKING SCROLL ENGINE EXACTLY INTACT */
  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;

      const scrollY = window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const overallProgress =
        documentHeight > 0
          ? clamp(scrollY / documentHeight)
          : 0;

      setScrollProgress(overallProgress);

      const journeyElement =
        document.getElementById("journey");

      if (!journeyElement) {
        setJourneyProgress(0);
        return;
      }

      const rect =
        journeyElement.getBoundingClientRect();

      const journeyDistance =
        journeyElement.offsetHeight -
        window.innerHeight;

      if (journeyDistance <= 0) {
        setJourneyProgress(0);
        return;
      }

      const travelled = -rect.top;

      setJourneyProgress(
        clamp(
          travelled / journeyDistance
        )
      );
    };

    const onScroll = () => {
      if (raf) return;

      raf =
        window.requestAnimationFrame(
          update
        );
    };

    const onResize = () => {
      if (raf) return;

      raf =
        window.requestAnimationFrame(
          update
        );
    };

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      onResize
    );

    update();

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll
      );

      window.removeEventListener(
        "resize",
        onResize
      );

      if (raf) {
        window.cancelAnimationFrame(raf);
      }
    };
  }, []);

  /* FORCE NORMAL BROWSER SCROLLING */
  useEffect(() => {
    const html =
      document.documentElement;

    const previous =
      html.style.scrollBehavior;

    html.style.scrollBehavior = "auto";

    return () => {
      html.style.scrollBehavior =
        previous;
    };
  }, []);

  const journeyState = useMemo(() => {
    const position =
      journeyProgress *
      (journey.length - 1);

    const currentIndex = Math.min(
      journey.length - 1,
      Math.floor(position)
    );

    const nextIndex = Math.min(
      journey.length - 1,
      currentIndex + 1
    );

    const localProgress =
      position - currentIndex;

    return {
      position,
      currentIndex,
      nextIndex,
      localProgress,
      current: journey[currentIndex],
      next: journey[nextIndex],
    };
  }, [journeyProgress]);

  const goToStage = (index: number) => {
    const section =
      document.getElementById("journey");

    if (!section) return;

    const distance =
      section.offsetHeight -
      window.innerHeight;

    const sectionTop =
      window.scrollY +
      section.getBoundingClientRect().top;

    const target =
      sectionTop +
      (index /
        (journey.length - 1)) *
        distance;

    window.scrollTo({
      top: target,
      behavior: "auto",
    });
  };

  const transition = ease(
    journeyState.localProgress
  );

  const currentOpacity =
    1 - transition * 0.92;

  const nextOpacity =
    transition;

  const currentY =
    -transition * 70;

  const nextY =
    80 -
    transition * 80;

  const currentScale =
    1 -
    transition * 0.08;

  const nextScale =
    0.92 +
    transition * 0.08;

  /*
   * VISUAL PROGRESS
   *
   * These values only affect the graphics.
   * They never modify scroll position.
   */
  const visualStage =
    journeyState.currentIndex;

  const visualLocal =
    journeyState.localProgress;

  const researchRotation =
    journeyProgress * 180;

  const researchSignal =
    visualStage === 0
      ? 1 - visualLocal * 0.5
      : 0.5;

  const speakIntensity =
    0.55 +
    Math.sin(journeyProgress * 18) *
      0.2;

  const debateDistance =
    150 -
    visualLocal * 150;

  const negotiateDistance =
    150 -
    visualLocal * 150;

  const leadConvergence =
    visualStage === 4
      ? journeyState.localProgress
      : 0;

  return (
    <main className="vidwan-page">

      <div
        className="global-progress"
        style={{
          width:
            `${scrollProgress * 100}%`,
        }}
      />

      <div className="global-background">
        <div className="global-grid" />
        <div className="background-orb background-orb-one" />
        <div className="background-orb background-orb-two" />
      </div>

      {/* NAV */}

      <header className="site-header">
        <nav className="site-nav">

          <Link
            href="/"
            aria-label="Vidwan home"
            className="logo-link"
          >
            <Image
              src="/images/vidwan-logo.png"
              alt="Vidwan"
              width={58}
              height={58}
              priority
              className="logo-image"
            />
          </Link>

          <div className="desktop-nav">
            <a href="#about">ABOUT</a>
            <a href="#experience">EXPERIENCE</a>
            <a href="#journey">JOURNEY</a>
          </div>

          <div className="desktop-actions">
            <Link
              href="/student/login"
              className="login-button"
            >
              STUDENT LOGIN
            </Link>

            <Link
              href="/register"
              className="started-button"
            >
              GET STARTED →
            </Link>
          </div>

          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenu}
            onClick={() =>
              setMobileMenu(
                (value) => !value
              )
            }
          >
            <span />
            <span />
            <span />
          </button>
        </nav>

        {mobileMenu && (
          <div className="mobile-menu">

            <a
              href="#about"
              onClick={() =>
                setMobileMenu(false)
              }
            >
              ABOUT
            </a>

            <a
              href="#experience"
              onClick={() =>
                setMobileMenu(false)
              }
            >
              EXPERIENCE
            </a>

            <a
              href="#journey"
              onClick={() =>
                setMobileMenu(false)
              }
            >
              JOURNEY
            </a>

            <Link
              href="/student/login"
              onClick={() =>
                setMobileMenu(false)
              }
            >
              STUDENT LOGIN
            </Link>

            <Link
              href="/register"
              onClick={() =>
                setMobileMenu(false)
              }
              className="mobile-started"
            >
              GET STARTED →
            </Link>
          </div>
        )}
      </header>

      {/* HERO */}

      <section className="hero">
        <div className="hero-inner">

          <div className="hero-kicker">
            <span />
            <p>MUN • DEBATE • LEADERSHIP</p>
          </div>

          <h1 className="hero-title">
            VIDWAN
          </h1>

          <p className="hero-description">
            A platform built for students who want to think
            deeper, communicate better and lead with purpose.
          </p>

          <div className="hero-actions">
            <Link
              href="/register"
              className="hero-primary"
            >
              GET STARTED →
            </Link>

            <a
              href="#journey"
              className="hero-secondary"
            >
              EXPLORE THE JOURNEY
            </a>
          </div>
        </div>

        <div className="hero-scroll">
          <span>SCROLL TO EXPLORE</span>
          <div>
            <i />
          </div>
        </div>
      </section>

      {/* ABOUT */}

      <section
        id="about"
        className="content-section"
      >
        <div className="two-column">

          <div>
            <p className="eyebrow">
              ABOUT VIDWAN
            </p>

            <h2 className="large-heading">
              THINK.
              <br />
              SPEAK.
              <br />
              LEAD.
            </h2>
          </div>

          <div>
            <p className="large-copy">
              Vidwan is a learning platform for students exploring
              Model United Nations, debate and leadership.
            </p>

            <p className="body-copy">
              We focus on the skills behind the performance:
              research, communication, argumentation, negotiation
              and leadership.
            </p>

            <div className="mini-grid">
              {[
                ["01", "RESEARCH"],
                ["02", "COMMUNICATE"],
                ["03", "LEAD"],
              ].map(([number, title]) => (
                <div
                  key={number}
                  className="mini-card"
                >
                  <span>{number}</span>
                  <strong>{title}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* JOURNEY */}

      <section
        id="journey"
        className="journey-section"
      >
        <div className="journey-sticky">

          <div className="journey-background">
            <div className="journey-grid" />

            <div
              className="journey-ring journey-ring-large"
              style={{
                transform: `
                  translate(-50%, -50%)
                  rotate(${journeyProgress * 360}deg)
                `,
              }}
            />

            <div
              className="journey-ring journey-ring-small"
              style={{
                transform: `
                  translate(-50%, -50%)
                  rotate(${-journeyProgress * 240}deg)
                `,
              }}
            />

            <div className="journey-glow" />

            <div
              className="journey-scan"
              style={{
                transform:
                  `translateY(${journeyProgress * 100}vh)`,
              }}
            />
          </div>

          <div className="journey-header">
            <p className="eyebrow">
              THE VIDWAN JOURNEY
            </p>

            <div className="journey-counter">
              <span>
                {String(
                  journeyState.currentIndex + 1
                ).padStart(2, "0")}
              </span>

              <i />

              <span>05</span>
            </div>
          </div>

          <div className="journey-center">

            {/* VISUAL SYSTEM */}

            <div className="visual-system">

              {/* RESEARCH */}

              <div
                className="research-visual"
                style={{
                  opacity:
                    visualStage === 0 ? 1 : 0,
                  transform: `
                    scale(
                      ${visualStage === 0
                        ? 1
                        : 0.72}
                    )
                  `,
                }}
              >
                <div
                  className="research-system"
                  style={{
                    transform:
                      `rotate(${researchRotation}deg)`,
                  }}
                >

                  <div className="research-signal">
                    <div className="signal-core">
                      <span />
                    </div>

                    <div className="signal-ring signal-ring-one" />
                    <div className="signal-ring signal-ring-two" />
                    <div className="signal-ring signal-ring-three" />

                    <div className="signal-cross horizontal" />
                    <div className="signal-cross vertical" />
                  </div>

                  {journey[0].keywords.map(
                    (keyword, index) => {
                      const angle =
                        index * 90;

                      return (
                        <div
                          key={keyword}
                          className="research-node"
                          style={{
                            transform: `
                              rotate(${angle}deg)
                              translateX(
                                min(31vw, 300px)
                              )
                            `,
                          }}
                        >
                          <i />
                          <span
                            style={{
                              transform:
                                `rotate(${-angle}deg)`,
                            }}
                          >
                            {keyword}
                          </span>
                        </div>
                      );
                    }
                  )}

                  <div
                    className="research-pulse"
                    style={{
                      transform:
                        `scale(${researchSignal})`,
                    }}
                  />
                </div>
              </div>

              {/* SPEAK */}

              <div
                className="speak-visual"
                style={{
                  opacity:
                    visualStage === 1 ? 1 : 0,
                }}
              >
                <div className="speak-system">

                  <div className="speak-axis" />

                  <div className="speak-pulse pulse-one" />
                  <div className="speak-pulse pulse-two" />
                  <div className="speak-pulse pulse-three" />

                  <div className="wave">
                    {Array.from({
                      length: 45,
                    }).map((_, index) => {
                      const value =
                        Math.sin(
                          index * 0.55 +
                            journeyProgress * 22
                        ) *
                        Math.cos(
                          index * 0.21 +
                            journeyProgress * 8
                        );

                      return (
                        <span
                          key={index}
                          style={{
                            height:
                              18 +
                              Math.abs(value) *
                                105 *
                                speakIntensity,
                            opacity:
                              0.35 +
                              Math.abs(value) *
                                0.65,
                          }}
                        />
                      );
                    })}
                  </div>

                  <div className="speak-label speak-label-left">
                    VOICE
                  </div>

                  <div className="speak-label speak-label-right">
                    IMPACT
                  </div>
                </div>
              </div>

              {/* DEBATE */}

              <div
                className="debate-visual"
                style={{
                  opacity:
                    visualStage === 2 ? 1 : 0,
                }}
              >
                <div className="debate-system">

                  <div
                    className="debate-side debate-left"
                    style={{
                      transform:
                        `translateX(${debateDistance}px)`,
                    }}
                  >
                    <span>POSITION</span>
                  </div>

                  <div
                    className="debate-side debate-right"
                    style={{
                      transform:
                        `translateX(${-debateDistance}px)`,
                    }}
                  >
                    <span>COUNTER</span>
                  </div>

                  <div className="debate-line debate-line-one" />
                  <div className="debate-line debate-line-two" />

                  <div
                    className="debate-tension"
                    style={{
                      transform: `
                        translate(-50%, -50%)
                        scale(
                          ${0.7 +
                            visualLocal * 0.6}
                        )
                      `,
                    }}
                  >
                    <span />
                  </div>

                  <div className="debate-cross" />
                </div>
              </div>

              {/* NEGOTIATE */}

              <div
                className="negotiate-visual"
                style={{
                  opacity:
                    visualStage === 3 ? 1 : 0,
                }}
              >
                <div className="negotiate-system">

                  <div
                    className="negotiation-orb negotiation-left"
                    style={{
                      transform:
                        `translateX(${negotiateDistance}px)`,
                    }}
                  >
                    <span>ONE POSITION</span>
                  </div>

                  <div
                    className="negotiation-orb negotiation-right"
                    style={{
                      transform:
                        `translateX(${-negotiateDistance}px)`,
                    }}
                  >
                    <span>ANOTHER POSITION</span>
                  </div>

                  <div
                    className="negotiation-connection"
                    style={{
                      width:
                        `${20 + visualLocal * 80}%`,
                    }}
                  />

                  <div
                    className="common-ground"
                    style={{
                      transform: `
                        translate(-50%, -50%)
                        scale(
                          ${0.55 +
                            visualLocal * 0.45}
                        )
                      `,
                    }}
                  >
                    <span>COMMON</span>
                    <strong>GROUND</strong>
                  </div>

                  <div className="negotiation-spark">
                    +
                  </div>
                </div>
              </div>

              {/* LEAD */}

              <div
                className="lead-visual"
                style={{
                  opacity:
                    visualStage === 4 ? 1 : 0,
                  transform: `
                    scale(
                      ${0.82 +
                        leadConvergence * 0.18}
                    )
                  `,
                }}
              >
                <div className="lead-system">

                  <div
                    className="lead-orbit lead-orbit-one"
                    style={{
                      transform:
                        `translate(-50%, -50%) rotate(${journeyProgress * 90}deg)`,
                    }}
                  />

                  <div
                    className="lead-orbit lead-orbit-two"
                    style={{
                      transform:
                        `translate(-50%, -50%) rotate(${-journeyProgress * 120}deg)`,
                    }}
                  />

                  <div
                    className="lead-orbit lead-orbit-three"
                    style={{
                      transform:
                        `translate(-50%, -50%) rotate(${journeyProgress * 180}deg)`,
                    }}
                  />

                  <div
                    className="lead-spoke lead-spoke-one"
                    style={{
                      transform:
                        `translate(-50%, -50%) rotate(${journeyProgress * 180}deg)`,
                    }}
                  />

                  <div
                    className="lead-spoke lead-spoke-two"
                    style={{
                      transform:
                        `translate(-50%, -50%) rotate(${-journeyProgress * 180}deg)`,
                    }}
                  />

                  {[
                    ["RESEARCH", "node-one"],
                    ["SPEAK", "node-two"],
                    ["DEBATE", "node-three"],
                    ["NEGOTIATE", "node-four"],
                  ].map(
                    ([label, className], index) => (
                      <div
                        key={label}
                        className={`lead-node ${className}`}
                        style={{
                          transform: `
                            translate(-50%, -50%)
                            scale(
                              ${
                                1 -
                                leadConvergence *
                                  0.35
                              }
                            )
                            translate(
                              ${
                                index === 0
                                  ? "0"
                                  : index === 1
                                  ? "0"
                                  : index === 2
                                  ? "0"
                                  : "0"
                              }
                            )
                          `,
                        }}
                      >
                        <i />
                        <span>{label}</span>
                      </div>
                    )
                  )}

                  <div
                    className="lead-core"
                    style={{
                      boxShadow: `
                        0 0 ${
                          55 +
                          leadConvergence * 55
                        }px
                        rgba(38,148,255,.5)
                      `,
                    }}
                  >
                    LEAD
                  </div>
                </div>
              </div>
            </div>

            {/* CURRENT TITLE */}

            <div
              className="journey-title current-title"
              style={{
                opacity:
                  currentOpacity,
                transform: `
                  translate(
                    -50%,
                    calc(
                      -50% +
                      ${currentY}px
                    )
                  )
                  scale(
                    ${currentScale}
                  )
                `,
              }}
            >
              <span>
                {journeyState.current.number}
              </span>

              <h2>
                {journeyState.current.title}
              </h2>

              <p>
                {journeyState.current.subtitle}
              </p>
            </div>

            {/* NEXT TITLE */}

            {journeyState.currentIndex <
              journey.length - 1 && (
              <div
                className="journey-title next-title"
                style={{
                  opacity:
                    nextOpacity,
                  transform: `
                    translate(
                      -50%,
                      calc(
                        -50% +
                        ${nextY}px
                      )
                    )
                    scale(
                      ${nextScale}
                    )
                  `,
                }}
              >
                <span>
                  {journeyState.next.number}
                </span>

                <h2>
                  {journeyState.next.title}
                </h2>

                <p>
                  {journeyState.next.subtitle}
                </p>
              </div>
            )}
          </div>

          <div className="journey-description">
            <p>
              {journeyState.current.description}
            </p>
          </div>

          <div className="journey-nav">
            {journey.map(
              (stage, index) => {
                const distance =
                  Math.abs(
                    index -
                      journeyState.position
                  );

                const opacity =
                  clamp(
                    1 -
                      distance *
                        0.65
                  );

                return (
                  <button
                    key={stage.number}
                    type="button"
                    onClick={() =>
                      goToStage(index)
                    }
                    aria-label={
                      `Go to ${stage.title}`
                    }
                    style={{
                      opacity,
                    }}
                  >
                    <span>
                      {stage.number}
                    </span>

                    <i
                      className={
                        index ===
                        journeyState.currentIndex
                          ? "active"
                          : ""
                      }
                    />
                  </button>
                );
              }
            )}
          </div>

          <div className="journey-progress">
            <p>SCROLL TO CONTINUE</p>

            <div>
              <span
                style={{
                  width:
                    `${journeyProgress * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}

      <section
        id="experience"
        className="content-section"
      >
        <div className="single-column">

          <p className="eyebrow">
            THE EXPERIENCE
          </p>

          <h2 className="large-heading">
            Built around
            <br />
            <span className="muted">
              real rooms.
            </span>
          </h2>

          <p className="body-copy experience-copy">
            Vidwan brings together the preparation, communication
            and leadership skills students need to participate
            confidently in MUNs, debates and other high-pressure
            environments.
          </p>

          <div className="experience-image">
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet="/images/vidwan-experience-mobile.png"
              />

              <Image
                src="/images/vidwan-experience.png"
                alt="Vidwan learning experience"
                fill
                className="object-cover"
              />
            </picture>

            <div className="experience-overlay">
              <p>MUN • DEBATE • LEADERSHIP</p>

              <strong>
                Learn the thinking behind
                the performance.
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* LEARNING */}

      <section className="content-section">
        <div className="two-column">

          <div>
            <p className="eyebrow">
              WHAT YOU ACTUALLY LEARN
            </p>

            <h2 className="large-heading">
              Skills that
              <br />
              <span className="muted">
                travel with you.
              </span>
            </h2>
          </div>

          <div className="learning-list">
            {[
              [
                "01",
                "Research",
                "Finding the information that actually matters.",
              ],
              [
                "02",
                "Structure",
                "Turning information into a clear argument.",
              ],
              [
                "03",
                "Speaking",
                "Communicating ideas with clarity and confidence.",
              ],
              [
                "04",
                "Debate",
                "Responding to ideas without losing your position.",
              ],
              [
                "05",
                "Negotiation",
                "Finding solutions when positions collide.",
              ],
              [
                "06",
                "Leadership",
                "Taking responsibility for moving the room forward.",
              ],
            ].map(
              ([number, title, text]) => (
                <div
                  key={number}
                  className="learning-item"
                >
                  <span>{number}</span>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* STANDARD */}

      <section className="content-section">
        <div className="standard-card">

          <p className="eyebrow">
            THE VIDWAN STANDARD
          </p>

          <div className="standard-grid">

            <h2>
              No shortcuts.
              <br />
              No empty confidence.
              <br />
              <span>
                Just preparation.
              </span>
            </h2>

            <div>
              <p>
                Strong performance starts long before the
                microphone turns on.
              </p>

              <p>
                Vidwan is designed around the preparation students
                can actually use: understanding the issue, building
                a position, communicating it clearly and adapting
                when the room changes.
              </p>

              <p>
                The goal is not simply to perform once. It is to
                build skills that remain useful beyond the
                conference room.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="cta-section">

        <p className="eyebrow">
          YOUR TURN
        </p>

        <h2>
          Ready to enter
          <span>{" "}the room?</span>
        </h2>

        <p>
          Start your Vidwan journey and build the skills that
          matter when the room gets difficult.
        </p>

        <div>
          <Link
            href="/register"
            className="hero-primary"
          >
            GET STARTED →
          </Link>

          <Link
            href="/student/login"
            className="hero-secondary"
          >
            STUDENT LOGIN
          </Link>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="site-footer">
        <div className="footer-inner">

          <div className="footer-brand">
            <Image
              src="/images/vidwan-logo.png"
              alt="Vidwan"
              width={40}
              height={40}
              className="logo-image"
            />

            <div>
              <strong>VIDWAN</strong>
              <span>
                MUN • DEBATE • LEADERSHIP
              </span>
            </div>
          </div>

          <div className="footer-links">
            <a href="#about">ABOUT</a>
            <a href="#experience">EXPERIENCE</a>
            <a href="#journey">JOURNEY</a>

            <Link href="/student/login">
              LOGIN
            </Link>

            {/* STAFF ACCESS */}
            <Link
              href="/staff"
              className="staff-access-button"
            >
              STAFF
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} VIDWAN.
          ALL RIGHTS RESERVED.
        </div>
      </footer>
      {/* STAFF ACCESS */}
      <Link
        href="/staff"
        className="staff-access-fixed"
      >
        STAFF
      </Link>
      <style jsx global>{`

        html {
          margin: 0;
          padding: 0;
          background: #030912;
          scroll-behavior: auto !important;
        }

        body {
          margin: 0;
          padding: 0;
          background: #030912;
          color: white;
        }

        .vidwan-page {
          position: relative;
          width: 100%;
          background: #030912;
        }

        .global-progress {
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
          height: 2px;
          background: #2694ff;
          box-shadow: 0 0 12px rgba(38,148,255,.9);
        }

        .global-background {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .global-grid {
          position: absolute;
          inset: 0;
          opacity: .1;
          background-image:
            linear-gradient(
              rgba(72,154,220,.15) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(72,154,220,.15) 1px,
              transparent 1px
            );
          background-size: 64px 64px;
        }

        .background-orb {
          position: absolute;
          border-radius: 9999px;
        }

        .background-orb-one {
          left: -240px;
          top: 100px;
          width: 650px;
          height: 650px;
          border: 1px solid rgba(38,148,255,.06);
        }

        .background-orb-two {
          right: -300px;
          top: 40%;
          width: 700px;
          height: 700px;
          background: rgba(8,101,184,.05);
          filter: blur(100px);
        }

        /* NAV */

        .site-header {
          position: fixed;
          left: 0;
          right: 0;
          top: 0;
          z-index: 900;
          padding: 16px 16px 0;
        }

        .site-nav {
          width: 100%;
          max-width: 1320px;
          height: 72px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 9999px;
          background: rgba(6,19,33,.9);
          backdrop-filter: blur(20px);
        }

        .logo-link {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .logo-image {
          width: 44px;
          height: 44px;
          object-fit: contain;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 36px;
        }

        .desktop-nav a,
        .footer-links a {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .28em;
          color: rgba(255,255,255,.45);
          text-decoration: none;
          transition: color .2s ease;
        }

        .desktop-nav a:hover,
        .footer-links a:hover {
          color: white;
        }

        .desktop-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-button {
          padding: 13px 20px;
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .18em;
          color: rgba(255,255,255,.7);
          text-decoration: none;
        }

        .started-button {
          padding: 14px 24px;
          border-radius: 9999px;
          background: white;
          color: #061321;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .18em;
          text-decoration: none;
        }

        .mobile-menu-button,
        .mobile-menu {
          display: none;
        }

        /* HERO */

        .hero {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 130px 20px 80px;
        }

        .hero-inner {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
        }

        .hero-kicker {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hero-kicker span {
          width: 48px;
          height: 1px;
          background: #2694ff;
        }

        .hero-kicker p {
          margin: 0;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .42em;
          color: #65b8ff;
        }

        .hero-title {
          margin: 28px 0 0;
          font-size: clamp(5rem,17vw,16rem);
          font-weight: 900;
          line-height: .75;
          letter-spacing: -.075em;
          color: white;
          opacity: 0;
          animation:
            heroIn
            1.1s
            cubic-bezier(.16,1,.3,1)
            forwards;
        }

        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-description {
          max-width: 720px;
          margin: 40px 0 0;
          font-size: 20px;
          line-height: 1.7;
          color: rgba(255,255,255,.5);
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          margin-top: 40px;
        }

        .hero-primary,
        .hero-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 28px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .18em;
          text-decoration: none;
        }

        .hero-primary {
          background: white;
          color: #061321;
        }

        .hero-secondary {
          border: 1px solid rgba(255,255,255,.15);
          color: rgba(255,255,255,.7);
        }

        .hero-scroll {
          position: absolute;
          left: 50%;
          bottom: 28px;
          transform: translateX(-50%);
          text-align: center;
        }

        .hero-scroll span {
          display: block;
          margin-bottom: 12px;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: .45em;
          color: rgba(255,255,255,.25);
        }

        .hero-scroll div {
          width: 1px;
          height: 40px;
          margin: 0 auto;
          overflow: hidden;
          background: rgba(255,255,255,.1);
        }

        .hero-scroll i {
          display: block;
          width: 100%;
          height: 50%;
          background: #2694ff;
        }

        /* CONTENT */

        .content-section {
          position: relative;
          z-index: 10;
          padding: 140px 20px;
          border-top: 1px solid rgba(255,255,255,.06);
        }

        .two-column {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: .8fr 1.2fr;
          gap: 80px;
        }

        .single-column {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .eyebrow {
          margin: 0;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .4em;
          color: #2694ff;
        }

        .large-heading {
          margin: 24px 0 0;
          font-size: clamp(2.7rem,5vw,5rem);
          font-weight: 600;
          line-height: 1;
          letter-spacing: -.05em;
        }

        .large-copy {
          margin: 0;
          font-size: 24px;
          line-height: 1.6;
          color: rgba(255,255,255,.7);
        }

        .body-copy {
          max-width: 700px;
          margin-top: 28px;
          font-size: 16px;
          line-height: 2;
          color: rgba(255,255,255,.4);
        }

        .muted {
          color: rgba(255,255,255,.35);
        }

        .mini-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 12px;
          margin-top: 32px;
        }

        .mini-card {
          min-height: 130px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 18px;
          background: rgba(255,255,255,.02);
        }

        .mini-card span {
          display: block;
          font-size: 9px;
          letter-spacing: .3em;
          color: #2694ff;
        }

        .mini-card strong {
          display: block;
          margin-top: 42px;
          font-size: 11px;
          letter-spacing: .18em;
          color: rgba(255,255,255,.7);
        }

        /* JOURNEY — DO NOT CHANGE THE SCROLL ARCHITECTURE */

        .journey-section {
          position: relative;
          z-index: 20;
          height: 500vh;
          background: #040d18;
        }

        .journey-sticky {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          min-height: 600px;
          overflow: hidden;
        }

        .journey-background {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .journey-grid {
          position: absolute;
          inset: 0;
          opacity: .12;
          background-image:
            linear-gradient(
              rgba(72,154,220,.15) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(72,154,220,.15) 1px,
              transparent 1px
            );
          background-size: 72px 72px;
        }

        .journey-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 9999px;
          transform-origin: center;
        }

        .journey-ring-large {
          width: min(76vw,900px);
          height: min(76vw,900px);
          border: 1px solid rgba(38,148,255,.07);
        }

        .journey-ring-small {
          width: min(53vw,650px);
          height: min(53vw,650px);
          border: 1px solid rgba(38,148,255,.055);
        }

        .journey-glow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 440px;
          height: 440px;
          transform: translate(-50%,-50%);
          border-radius: 9999px;
          background: rgba(8,117,209,.08);
          filter: blur(110px);
        }

        .journey-scan {
          position: absolute;
          left: 0;
          top: -1px;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(38,148,255,.45),
            transparent
          );
          box-shadow: 0 0 25px rgba(38,148,255,.4);
          opacity: .35;
        }

        .journey-header {
          position: absolute;
          left: 40px;
          top: 120px;
          z-index: 30;
        }

        .journey-counter {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          font-size: 9px;
          letter-spacing: .3em;
          color: rgba(255,255,255,.25);
        }

        .journey-counter i {
          width: 30px;
          height: 1px;
          background: rgba(255,255,255,.1);
        }

        .journey-center {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .visual-system {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 100%;
          height: 100%;
          transform: translate(-50%,-50%);
          pointer-events: none;
        }

        .research-visual,
        .speak-visual,
        .debate-visual,
        .negotiate-visual,
        .lead-visual {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            opacity .35s ease,
            transform .35s ease;
          pointer-events: none;
        }

        /* RESEARCH */

        .research-system {
          position: relative;
          width: min(42vw,520px);
          height: min(42vw,520px);
          border: 1px solid rgba(38,148,255,.11);
          border-radius: 50%;
        }

        .research-system::before {
          content: "";
          position: absolute;
          inset: 14%;
          border: 1px dashed rgba(38,148,255,.1);
          border-radius: 50%;
        }

        .research-system::after {
          content: "";
          position: absolute;
          inset: 29%;
          border: 1px solid rgba(38,148,255,.08);
          border-radius: 50%;
        }

        .research-signal {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 130px;
          height: 130px;
          transform: translate(-50%,-50%);
        }

        .signal-core {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 34px;
          height: 34px;
          transform: translate(-50%,-50%);
          border: 1px solid #2694ff;
          border-radius: 50%;
          background: rgba(38,148,255,.08);
          box-shadow:
            0 0 40px rgba(38,148,255,.5);
        }

        .signal-core span {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 7px;
          height: 7px;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          background: #2694ff;
          box-shadow: 0 0 18px #2694ff;
        }

        .signal-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);
          border: 1px solid rgba(38,148,255,.22);
          border-radius: 50%;
        }

        .signal-ring-one {
          width: 65px;
          height: 65px;
        }

        .signal-ring-two {
          width: 100px;
          height: 100px;
        }

        .signal-ring-three {
          width: 135px;
          height: 135px;
          border-style: dashed;
          opacity: .5;
        }

        .signal-cross {
          position: absolute;
          left: 50%;
          top: 50%;
          background: rgba(38,148,255,.2);
        }

        .signal-cross.horizontal {
          width: 180px;
          height: 1px;
          transform: translate(-50%,-50%);
        }

        .signal-cross.vertical {
          width: 1px;
          height: 180px;
          transform: translate(-50%,-50%);
        }

        .research-node {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 1px;
          height: 1px;
          transform-origin: 0 0;
        }

        .research-node i {
          position: absolute;
          width: 85px;
          height: 1px;
          right: 0;
          top: 0;
          transform: translateX(-50%);
          background: linear-gradient(
            90deg,
            rgba(38,148,255,.4),
            transparent
          );
        }

        .research-node span {
          position: absolute;
          left: 18px;
          top: -7px;
          width: 120px;
          text-align: left;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .25em;
          color: rgba(255,255,255,.48);
        }

        .research-pulse {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 280px;
          height: 280px;
          transform: translate(-50%,-50%);
          border: 1px solid rgba(38,148,255,.12);
          border-radius: 50%;
        }

        /* SPEAK */

        .speak-system {
          position: relative;
          width: min(900px,85vw);
          height: 280px;
        }

        .speak-axis {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 100%;
          height: 1px;
          transform: translate(-50%,-50%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(38,148,255,.3),
            transparent
          );
        }

        .wave {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 100%;
        }

        .wave span {
          display: block;
          width: 3px;
          min-height: 8px;
          border-radius: 9999px;
          background: #2694ff;
          box-shadow: 0 0 14px rgba(38,148,255,.4);
        }

        .speak-pulse {
          position: absolute;
          left: 50%;
          top: 50%;
          border: 1px solid rgba(38,148,255,.12);
          border-radius: 50%;
          transform: translate(-50%,-50%);
        }

        .pulse-one {
          width: 180px;
          height: 180px;
        }

        .pulse-two {
          width: 340px;
          height: 340px;
        }

        .pulse-three {
          width: 500px;
          height: 500px;
          opacity: .4;
        }

        .speak-label {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .35em;
          color: rgba(255,255,255,.3);
        }

        .speak-label-left {
          left: 0;
        }

        .speak-label-right {
          right: 0;
        }

        /* DEBATE */

        .debate-system {
          position: relative;
          width: min(850px,88vw);
          height: 430px;
        }

        .debate-side {
          position: absolute;
          top: 50%;
          width: 290px;
          height: 290px;
          margin-top: -145px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: transform .08s linear;
        }

        .debate-left {
          left: 4%;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.018);
        }

        .debate-right {
          right: 4%;
          border: 1px solid rgba(38,148,255,.25);
          background: rgba(38,148,255,.025);
        }

        .debate-side span {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .35em;
          color: rgba(255,255,255,.3);
        }

        .debate-side::after {
          content: "";
          position: absolute;
          inset: 18%;
          border: 1px dashed rgba(255,255,255,.08);
          border-radius: 50%;
        }

        .debate-line {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 360px;
          height: 1px;
          background: rgba(38,148,255,.18);
          transform-origin: center;
        }

        .debate-line-one {
          transform: translate(-50%,-50%) rotate(28deg);
        }

        .debate-line-two {
          transform: translate(-50%,-50%) rotate(-28deg);
        }

        .debate-tension {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 54px;
          height: 54px;
          border: 1px solid #2694ff;
          border-radius: 50%;
          background: #040d18;
          box-shadow: 0 0 45px rgba(38,148,255,.3);
          transition: transform .08s linear;
        }

        .debate-tension span {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 7px;
          height: 7px;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          background: #2694ff;
          box-shadow: 0 0 20px #2694ff;
        }

        .debate-cross {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 180px;
          height: 180px;
          transform: translate(-50%,-50%);
          border: 1px solid rgba(38,148,255,.1);
          border-radius: 50%;
        }

        /* NEGOTIATE */

        .negotiate-system {
          position: relative;
          width: min(850px,88vw);
          height: 430px;
        }

        .negotiation-orb {
          position: absolute;
          top: 50%;
          width: 310px;
          height: 310px;
          margin-top: -155px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: transform .08s linear;
        }

        .negotiation-left {
          left: 5%;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.015);
        }

        .negotiation-right {
          right: 5%;
          border: 1px solid rgba(38,148,255,.23);
          background: rgba(38,148,255,.025);
        }

        .negotiation-orb::before {
          content: "";
          position: absolute;
          inset: 18%;
          border: 1px dashed rgba(255,255,255,.07);
          border-radius: 50%;
        }

        .negotiation-orb span {
          font-size: 7px;
          font-weight: 700;
          letter-spacing: .3em;
          color: rgba(255,255,255,.25);
        }

        .negotiation-connection {
          position: absolute;
          left: 10%;
          top: 50%;
          height: 1px;
          transform: translateY(-50%);
          background: linear-gradient(
            90deg,
            transparent,
            #2694ff,
            transparent
          );
          transition: width .08s linear;
        }

        .common-ground {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 170px;
          height: 170px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: translate(-50%,-50%);
          border: 1px solid rgba(38,148,255,.4);
          border-radius: 50%;
          background: rgba(38,148,255,.07);
          box-shadow: 0 0 80px rgba(38,148,255,.16);
          transition: transform .08s linear;
        }

        .common-ground span {
          font-size: 7px;
          letter-spacing: .35em;
          color: #69bbff;
        }

        .common-ground strong {
          margin-top: 7px;
          font-size: 11px;
          letter-spacing: .3em;
          color: white;
        }

        .negotiation-spark {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);
          font-size: 16px;
          color: #69bbff;
          text-shadow: 0 0 20px #2694ff;
        }

        /* LEAD */

        .lead-system {
          position: relative;
          width: min(600px,70vw);
          height: min(600px,70vw);
        }

        .lead-orbit {
          position: absolute;
          left: 50%;
          top: 50%;
          border: 1px solid rgba(38,148,255,.17);
          border-radius: 50%;
          transform-origin: center;
        }

        .lead-orbit-one {
          width: 100%;
          height: 100%;
        }

        .lead-orbit-two {
          width: 75%;
          height: 75%;
        }

        .lead-orbit-three {
          width: 50%;
          height: 50%;
          border-style: dashed;
        }

        .lead-spoke {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 88%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(38,148,255,.2),
            transparent
          );
          transform-origin: center;
        }

        .lead-node {
          position: absolute;
          left: 50%;
          top: 50%;
          display: flex;
          align-items: center;
          gap: 8px;
          transform-origin: center;
          transition: transform .08s linear;
        }

        .lead-node i {
          display: block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2694ff;
          box-shadow: 0 0 15px rgba(38,148,255,.7);
        }

        .lead-node span {
          font-size: 7px;
          font-weight: 700;
          letter-spacing: .25em;
          color: rgba(255,255,255,.38);
        }

        .node-one {
          transform: translate(-50%,-50%) translateY(-250px);
        }

        .node-two {
          transform: translate(-50%,-50%) translateX(250px);
        }

        .node-three {
          transform: translate(-50%,-50%) translateY(250px);
        }

        .node-four {
          transform: translate(-50%,-50%) translateX(-250px);
        }

        .lead-core {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          background: #2694ff;
          color: #03101c;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .3em;
          transition: box-shadow .1s ease;
        }

        /* TITLES */

        .journey-title {
          position: absolute;
          left: 50%;
          top: 50%;
          width: calc(100% - 80px);
          max-width: 1500px;
          transform: translate(-50%,-50%);
          text-align: center;
          will-change: transform,opacity;
          pointer-events: none;
          overflow: visible;
        }

        .journey-title span {
          display: block;
          margin-bottom: 22px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .5em;
          color: #2694ff;
        }

        .journey-title h2 {
          margin: 0;
          font-size: clamp(3.2rem,10.5vw,10.5rem);
          font-weight: 900;
          line-height: .78;
          letter-spacing: -.075em;
          color: white;
          white-space: nowrap;
          max-width: 100%;
        }

        .journey-title p {
          margin: 28px 0 0;
          font-size: clamp(.55rem,1vw,.75rem);
          font-weight: 600;
          letter-spacing: .45em;
          color: rgba(255,255,255,.45);
        }

        .current-title {
          z-index: 20;
        }

        .next-title {
          z-index: 19;
        }

        .next-title h2 {
          color: rgba(255,255,255,.5);
        }

        /* JOURNEY INFO */

        .journey-description {
          position: absolute;
          left: 40px;
          bottom: 70px;
          z-index: 40;
          width: 420px;
          max-width: calc(100vw - 100px);
        }

        .journey-description p {
          margin: 0;
          font-size: 13px;
          line-height: 1.8;
          color: rgba(255,255,255,.35);
        }

        .journey-nav {
          position: absolute;
          right: 40px;
          top: 50%;
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 14px;
          transform: translateY(-50%);
        }

        .journey-nav button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .journey-nav button span {
          font-size: 9px;
          letter-spacing: .25em;
          color: rgba(255,255,255,.2);
        }

        .journey-nav button i {
          display: block;
          width: 3px;
          height: 8px;
          border-radius: 9999px;
          background: rgba(255,255,255,.15);
          transition:
            height .2s ease,
            background .2s ease;
        }

        .journey-nav button i.active {
          height: 36px;
          background: #2694ff;
          box-shadow: 0 0 14px rgba(38,148,255,.8);
        }

        .journey-progress {
          position: absolute;
          left: 50%;
          bottom: 28px;
          z-index: 50;
          width: min(300px,55vw);
          transform: translateX(-50%);
        }

        .journey-progress p {
          margin: 0 0 10px;
          text-align: center;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: .45em;
          color: rgba(255,255,255,.25);
        }

        .journey-progress div {
          width: 100%;
          height: 3px;
          overflow: hidden;
          border-radius: 9999px;
          background: rgba(255,255,255,.1);
        }

        .journey-progress span {
          display: block;
          height: 100%;
          border-radius: 9999px;
          background: #2694ff;
          box-shadow: 0 0 12px rgba(38,148,255,.8);
        }

        /* EXPERIENCE */

        .experience-copy {
          max-width: 650px;
        }

        .experience-image {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 8;
          margin-top: 60px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 28px;
        }

        .experience-overlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 40px;
          background: linear-gradient(
            transparent,
            rgba(3,9,18,.95)
          );
        }

        .experience-overlay p {
          margin: 0;
          font-size: 9px;
          letter-spacing: .35em;
          color: #69bbff;
        }

        .experience-overlay strong {
          display: block;
          max-width: 500px;
          margin-top: 12px;
          font-size: 28px;
          font-weight: 500;
        }

        /* LEARNING */

        .learning-list {
          display: grid;
          gap: 8px;
        }

        .learning-item {
          display: grid;
          grid-template-columns: 55px 150px 1fr;
          gap: 20px;
          align-items: center;
          padding: 20px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px;
          background: rgba(255,255,255,.018);
        }

        .learning-item span {
          font-size: 9px;
          letter-spacing: .25em;
          color: #2694ff;
        }

        .learning-item strong {
          font-size: 13px;
          color: rgba(255,255,255,.8);
        }

        .learning-item p {
          margin: 0;
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,.35);
        }

        /* STANDARD */

        .standard-card {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 32px;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,.045),
            transparent
          );
        }

        .standard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-top: 35px;
        }

        .standard-grid h2 {
          margin: 0;
          font-size: clamp(2.5rem,5vw,4.5rem);
          line-height: 1;
          letter-spacing: -.05em;
        }

        .standard-grid h2 span {
          color: rgba(255,255,255,.35);
        }

        .standard-grid p {
          font-size: 14px;
          line-height: 2;
          color: rgba(255,255,255,.4);
        }

        /* CTA */

        .cta-section {
          position: relative;
          z-index: 10;
          padding: 170px 20px;
          text-align: center;
        }

        .cta-section h2 {
          max-width: 900px;
          margin: 28px auto 0;
          font-size: clamp(3.2rem,8vw,8rem);
          font-weight: 600;
          line-height: .95;
          letter-spacing: -.06em;
        }

        .cta-section h2 span {
          color: rgba(255,255,255,.35);
        }

        .cta-section > p:not(.eyebrow) {
          max-width: 560px;
          margin: 28px auto 0;
          font-size: 15px;
          line-height: 1.8;
          color: rgba(255,255,255,.35);
        }

        .cta-section > div {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 40px;
        }

        /* FOOTER */

        .site-footer {
          position: relative;
          z-index: 10;
          padding: 40px 20px;
          border-top: 1px solid rgba(255,255,255,.07);
        }

        .footer-inner {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-brand strong {
          display: block;
          font-size: 12px;
          letter-spacing: .2em;
        }

        .footer-brand span {
          display: block;
          margin-top: 5px;
          font-size: 9px;
          letter-spacing: .25em;
          color: rgba(255,255,255,.25);
        }

        .footer-links {
          display: flex;
          gap: 25px;
          flex-wrap: wrap;
        }

        /* SMALL STAFF ACCESS BUTTON */

        .staff-access-button {
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 9999px;
          color: rgba(255,255,255,.22) !important;
          transition:
            color .2s ease,
            border-color .2s ease,
            background .2s ease;
        }

        .staff-access-button:hover {
          color: #69bbff !important;
          border-color: rgba(38,148,255,.3);
          background: rgba(38,148,255,.05);
        }

        .footer-bottom {
          width: 100%;
          max-width: 1200px;
          margin: 30px auto 0;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,.05);
          font-size: 9px;
          letter-spacing: .18em;
          color: rgba(255,255,255,.2);
        }

        /* MOBILE */

        @media (max-width: 767px) {

          .site-header {
            padding: 12px 12px 0;
          }

          .site-nav {
            height: 64px;
            padding: 0 16px;
          }

          .desktop-nav,
          .desktop-actions {
            display: none;
          }

          .mobile-menu-button {
            width: 40px;
            height: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 9999px;
            background: transparent;
          }

          .mobile-menu-button span {
            width: 15px;
            height: 1px;
            background: white;
          }

          .mobile-menu {
            display: flex;
            flex-direction: column;
            gap: 4px;
            width: 100%;
            max-width: 1320px;
            margin: 8px auto 0;
            padding: 12px;
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 24px;
            background: rgba(6,19,33,.96);
            backdrop-filter: blur(20px);
          }

          .mobile-menu a {
            padding: 15px;
            border-radius: 15px;
            color: rgba(255,255,255,.7);
            font-size: 14px;
            text-decoration: none;
          }

          .mobile-menu .mobile-started {
            text-align: center;
            background: white;
            color: #061321;
            font-weight: 700;
          }

          .hero {
            padding: 120px 20px 80px;
          }

          .hero-title {
            font-size: clamp(4rem,23vw,8rem);
          }

          .hero-description {
            font-size: 17px;
          }

          .hero-actions {
            flex-direction: column;
          }

          .hero-primary,
          .hero-secondary {
            width: 100%;
          }

          .content-section {
            padding: 100px 20px;
          }

          .two-column {
            grid-template-columns: 1fr;
            gap: 55px;
          }

          .mini-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }

          /* MOBILE JOURNEY */

          .journey-section {
            height: 500vh;
          }

          .journey-sticky {
            min-height: 0;
          }

          .journey-header {
            left: 20px;
            top: 105px;
          }

          .journey-title {
            width: calc(100% - 70px);
            max-width: calc(100% - 70px);
          }

          .journey-title h2 {
            font-size: clamp(2.9rem,13vw,6rem);
            letter-spacing: -.07em;
          }

          .journey-title p {
            font-size: 7px;
            letter-spacing: .3em;
          }

          .journey-title span {
            margin-bottom: 16px;
            font-size: 8px;
          }

          .journey-description {
            left: 20px;
            right: 20px;
            bottom: 80px;
            width: auto;
            max-width: none;
          }

          .journey-description p {
            font-size: 11px;
            line-height: 1.7;
          }

          .journey-nav {
            right: 16px;
          }

          .journey-nav button span {
            display: none;
          }

          .journey-ring-large {
            width: 105vw;
            height: 105vw;
          }

          .journey-ring-small {
            width: 75vw;
            height: 75vw;
          }

          /* RESEARCH MOBILE */

          .research-system {
            width: 260px;
            height: 260px;
          }

          .research-node span {
            width: 90px;
            font-size: 6px;
          }

          .research-node i {
            width: 55px;
          }

          .research-pulse {
            width: 150px;
            height: 150px;
          }

          /* SPEAK MOBILE */

          .speak-system {
            width: 94vw;
            height: 220px;
          }

          .wave {
            gap: 2px;
          }

          .wave span {
            width: 2px;
          }

          .speak-label {
            font-size: 6px;
          }

          .pulse-three {
            width: 350px;
            height: 350px;
          }

          /* DEBATE MOBILE */

          .debate-system {
            width: 100vw;
            height: 300px;
          }

          .debate-side {
            width: 170px;
            height: 170px;
            margin-top: -85px;
          }

          .debate-side span {
            font-size: 6px;
          }

          .debate-left {
            left: 0;
          }

          .debate-right {
            right: 0;
          }

          .debate-line {
            width: 230px;
          }

          /* NEGOTIATE MOBILE */

          .negotiate-system {
            width: 100vw;
            height: 300px;
          }

          .negotiation-orb {
            width: 190px;
            height: 190px;
            margin-top: -95px;
          }

          .negotiation-left {
            left: 0;
          }

          .negotiation-right {
            right: 0;
          }

          .negotiation-orb span {
            font-size: 5px;
          }

          .common-ground {
            width: 105px;
            height: 105px;
          }

          .common-ground span {
            font-size: 5px;
          }

          .common-ground strong {
            font-size: 8px;
          }

          /* LEAD MOBILE */

          .lead-system {
            width: 330px;
            height: 330px;
          }

          .lead-core {
            width: 72px;
            height: 72px;
            font-size: 8px;
          }

          .node-one {
            transform:
              translate(-50%,-50%)
              translateY(-135px);
          }

          .node-two {
            transform:
              translate(-50%,-50%)
              translateX(135px);
          }

          .node-three {
            transform:
              translate(-50%,-50%)
              translateY(135px);
          }

          .node-four {
            transform:
              translate(-50%,-50%)
              translateX(-135px);
          }

          .lead-node span {
            font-size: 5px;
          }

          /* REST */

          .experience-image {
            aspect-ratio: 1 / 1;
          }

          .experience-overlay {
            padding: 25px;
          }

          .experience-overlay strong {
            font-size: 21px;
          }

          .learning-item {
            grid-template-columns: 40px 1fr;
          }

          .learning-item p {
            grid-column: 2;
          }

          .standard-card {
            padding: 30px;
          }

          .standard-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .cta-section {
            padding: 120px 20px;
          }

          .cta-section > div {
            flex-direction: column;
          }

          .cta-section .hero-primary,
          .cta-section .hero-secondary {
            width: 100%;
          }

          .footer-inner {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }

          .hero-title {
            opacity: 1;
            transform: none;
          }
        }

      `}</style>
    </main>
  );
}