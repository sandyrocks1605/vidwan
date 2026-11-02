"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import styles from "./page.module.css";

const journey = [
  {
    number: "01",
    title: "Research",
    subtitle: "Know what matters.",
    description:
      "Start with the issue, the evidence and the people affected. Learn how to separate strong sources from noise and build a position you can stand behind.",
    actions: ["Frame the issue", "Test the evidence", "Shape a position"],
  },
  {
    number: "02",
    title: "Speak",
    subtitle: "Make the point land.",
    description:
      "Turn preparation into presence. Shape a clear opening, choose the right detail and communicate your thinking so others can follow it.",
    actions: ["Find the central idea", "Structure your speech", "Speak with intent"],
  },
  {
    number: "03",
    title: "Debate",
    subtitle: "Challenge ideas, with purpose.",
    description:
      "Listen closely, spot the logic and respond to the argument in front of you. Strong debate makes room for better thinking.",
    actions: ["Listen for the claim", "Build a reasoned response", "Defend your position"],
  },
  {
    number: "04",
    title: "Negotiate",
    subtitle: "Move toward common ground.",
    description:
      "Understand what different people need, build trust and turn competing positions into practical ways forward.",
    actions: ["Read the room", "Find shared interests", "Work toward resolution"],
  },
  {
    number: "05",
    title: "Lead",
    subtitle: "Help the room move forward.",
    description:
      "Bring research, communication and judgment together. Leadership is the work of giving a group direction and helping people act.",
    actions: ["Set a clear direction", "Invite perspectives", "Move the work forward"],
  },
];

const skillCards = [
  { number: "01", icon: "research", title: "Research", text: "Find the evidence and context behind an issue." },
  { number: "02", icon: "structure", title: "Structured thinking", text: "Turn a complicated topic into a clear position." },
  { number: "03", icon: "voice", title: "Public speaking", text: "Communicate with clarity when people are listening." },
  { number: "04", icon: "debate", title: "Critical listening", text: "Respond to ideas thoughtfully, not automatically." },
  { number: "05", icon: "negotiate", title: "Negotiation", text: "Find workable solutions across different viewpoints." },
  { number: "06", icon: "lead", title: "Leadership", text: "Help a team make decisions and move together." },
];

const programCards = [
  {
    number: "01",
    icon: "committee",
    title: "Model United Nations",
    text: "Research global issues, represent a position and work with other delegates toward resolution.",
    tag: "UNDERSTAND · REPRESENT · RESOLVE",
  },
  {
    number: "02",
    icon: "debate",
    title: "Debate",
    text: "Build arguments, examine opposing ideas and make a reasoned case with confidence.",
    tag: "LISTEN · REASON · RESPOND",
  },
  {
    number: "03",
    icon: "lead",
    title: "Leadership",
    text: "Practice the communication, collaboration and judgment that help groups move forward.",
    tag: "CONNECT · DECIDE · LEAD",
  },
];

const questions = [
  {
    question: "What is Model United Nations?",
    answer:
      "Model United Nations is a learning simulation where students represent countries, research international issues, debate different approaches and work together on resolutions.",
  },
  {
    question: "Do I need experience to get started?",
    answer:
      "No. Vidwan offers beginner, intermediate and advanced MUN tracks. If you are not sure which one fits, choose “I’m not sure yet” when you register.",
  },
  {
    question: "What does Vidwan help students learn?",
    answer:
      "The focus is on research, structured thinking, public speaking, debate, negotiation and leadership—the skills behind a strong performance.",
  },
  {
    question: "Is Vidwan only for MUN?",
    answer:
      "No. The learning experience also covers debate and leadership, with skills that are useful well beyond a conference room.",
  },
];

const storyBeats = [
  {
    number: "01",
    kicker: "START WITH THE WORLD",
    title: "Every position begins with a question.",
    description:
      "Look past the headline. Find the people, interests and history shaping the issue before deciding what you believe.",
    note: "THE ISSUE / IN CONTEXT",
    sceneLabel: "RESEARCH · 01",
    artifact: "DELEGATE BRIEF / 01",
    artifactTitle: "Start with the issue.",
    artifactLines: ["People affected", "Evidence to test", "Position to shape"],
  },
  {
    number: "02",
    kicker: "FOLLOW THE EVIDENCE",
    title: "Turn noise into a point of view.",
    description:
      "Compare sources, notice what is missing and build a position that can hold up when someone asks the next question.",
    note: "THE POSITION / WITH EVIDENCE",
    sceneLabel: "RESEARCH · 02",
    artifact: "SOURCE NOTES / 02",
    artifactTitle: "Follow the evidence.",
    artifactLines: ["Compare sources", "Find what's missing", "Keep what holds up"],
  },
  {
    number: "03",
    kicker: "ENTER THE ROOM",
    title: "Preparation gives your voice direction.",
    description:
      "The first speech is only a beginning. Listen, make your case and stay open to the idea that shifts the room.",
    note: "THE FLOOR / YOUR VOICE",
    sceneLabel: "DEBATE · 03",
    artifact: "SPEAKING NOTES / 03",
    artifactTitle: "Make the point land.",
    artifactLines: ["One clear claim", "A detail that matters", "Room for response"],
  },
  {
    number: "04",
    kicker: "MOVE IDEAS FORWARD",
    title: "Good leadership leaves room for others.",
    description:
      "Bring different perspectives into the work and turn discussion into a way forward that more people can stand behind.",
    note: "THE ROOM / A WAY FORWARD",
    sceneLabel: "RESOLUTION · 04",
    artifact: "WORKING PAPER / 04",
    artifactTitle: "Build the next step.",
    artifactLines: ["Shared interests", "Language everyone owns", "A way forward"],
  },
];

type IconName = "research" | "structure" | "voice" | "debate" | "negotiate" | "lead" | "committee" | "arrow";

function Icon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, string> = {
    research: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Zm0 0V19a2 2 0 0 1 2-2h14M8 7h8M8 11h7",
    structure: "M12 3 14.3 9.7 21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3Zm7 13v5m2.5-2.5h-5",
    voice: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 8v1a7 7 0 0 0 14 0v-1m-7 8v4m-4 0h8",
    debate: "M4 5h16v11H9l-5 4V5Zm4 4h8m-8 4h5",
    negotiate: "M3 8h6l3 3-3 3-3-3H3m18-3h-6l-3 3 3 3 3-3h3m-9 0v10",
    lead: "M12 3v18m0-18 7 4-7 4M5 13h5m-5 4h8m-8 4h6",
    committee: "M3 9h18L12 4 3 9Zm2 2v8m4-8v8m6-8v8m4-8v8M3 21h18",
    arrow: "M4 12h15m-6-6 6 6-6 6",
  };

  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}

function ProgramArtwork({ icon, number }: { icon: IconName; number: string }) {
  const labels: Record<string, string> = {
    committee: "ASSEMBLY",
    debate: "ARGUMENT",
    lead: "DIRECTION",
  };

  return (
    <div className={styles.programArtwork} data-program-art={icon} aria-hidden="true">
      <div className={styles.programArtworkHeader}><span>VIDWAN / FIELD GUIDE</span><span>{number}</span></div>
      <div className={styles.programArtworkStage}>
        <span className={styles.programArtworkRule} />
        <Icon name={icon} className={styles.programArtworkIcon} />
        <span className={styles.programArtworkWord}>{labels[icon]}</span>
        <span className={styles.programArtworkAccent} />
      </div>
      <div className={styles.programArtworkFooter}><span>{labels[icon]} SERIES</span><span>01—03</span></div>
    </div>
  );
}

function ScrollytellingExperience() {
  const [activeStory, setActiveStory] = useState(0);
  const activeStoryRef = useRef(0);
  const runwayRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const runway = runwayRef.current;
    const frame = frameRef.current;
    if (!runway || !frame) return;

    let frameRequest = 0;
    const updateProgress = () => {
      frameRequest = 0;
      const bounds = runway.getBoundingClientRect();
      const scrollDistance = Math.max(1, runway.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -bounds.top / scrollDistance));
      const storyPosition = progress * storyBeats.length;
      const storyIndex = Math.min(storyBeats.length - 1, Math.floor(storyPosition));
      const drift = Math.sin(progress * Math.PI * 1.5);

      frame.style.setProperty("--journey-progress", progress.toFixed(4));
      frame.style.setProperty("--scene-drift", `${(drift * 1.8).toFixed(2)}%`);
      frame.style.setProperty("--scene-turn", `${(-1 + progress * 2.5).toFixed(2)}deg`);

      if (storyIndex !== activeStoryRef.current) {
        activeStoryRef.current = storyIndex;
        setActiveStory(storyIndex);
      }
    };
    const scheduleProgress = () => {
      if (!frameRequest) frameRequest = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress);

    return () => {
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
      if (frameRequest) window.cancelAnimationFrame(frameRequest);
    };
  }, []);

  const activeBeat = storyBeats[activeStory];

  return (
    <section className={styles.scrolly} id="journey-3d" aria-labelledby="scrolly-title">
      <div className={[styles.container, styles.experienceHeader].join(" ")} data-scroll-reveal>
        <div>
          <p className={styles.lightEyebrow}><span>05</span> INSIDE A DELEGATE&apos;S DAY</p>
          <h2 id="scrolly-title">Ideas change <em>in the room.</em></h2>
        </div>
        <p>One issue. Four moments. Stay with the work as it moves from the page into the room.</p>
      </div>

      <div className={styles.experienceRunway} ref={runwayRef}>
        <div className={styles.experienceSticky}>
          <div className={styles.experienceFrame} ref={frameRef} data-active-story={activeStory} role="group" aria-label="A delegate's journey from research to resolution">
            <div className={styles.experienceGraphicStage} aria-hidden="true">
              <svg className={styles.experienceRoomPlan} viewBox="0 0 1000 620" fill="none">
                <path className={styles.planOuter} d="M92 84h816v452H92z" />
                <path className={styles.planInner} d="M132 124h736v372H132z" />
                <path className={styles.planDesk} d="M285 315c0-68 96-123 215-123s215 55 215 123v30H285v-30Z" />
                <path className={styles.planWalk} d="M500 490V364" />
                <path className={styles.planSpeaker} d="M457 168h86v30h-86z" />
                <circle className={styles.planNode} cx="500" cy="407" r="10" />
                <circle className={styles.planSeat} cx="335" cy="268" r="11" />
                <circle className={styles.planSeat} cx="414" cy="224" r="11" />
                <circle className={styles.planSeat} cx="500" cy="208" r="11" />
                <circle className={styles.planSeat} cx="586" cy="224" r="11" />
                <circle className={styles.planSeat} cx="665" cy="268" r="11" />
                <path className={styles.planTick} d="M92 70v-20h20m796 20v-20h-20M92 550v20h20m796-20v20h-20" />
              </svg>
              <div className={styles.experienceRoomLabel}><span>THE FLOOR PLAN</span><strong>{activeBeat.note}</strong></div>
              <div className={styles.experienceRoomIndex}>ROOM 04 <i /> OPEN SESSION</div>
            </div>
            <div className={styles.experienceShade} aria-hidden="true" />
            <div className={styles.experienceTopline} aria-hidden="true">
              <span>VIDWAN / FIELD NOTES</span>
              <span>{activeBeat.sceneLabel}</span>
            </div>
            <div className={styles.experienceNarrative} key={activeBeat.number}>
              <p><span>{activeBeat.number}</span> / 04 <i /> {activeBeat.kicker}</p>
              <h3>{activeBeat.title}</h3>
              <div className={styles.experienceNarrativeBottom}>
                <p>{activeBeat.description}</p>
                <span>{activeBeat.note}</span>
              </div>
            </div>
            <div className={styles.experienceBrief} key={`brief-${activeBeat.number}`} aria-hidden="true">
              <div className={styles.experienceBriefTop}><span>{activeBeat.artifact}</span><i>↗</i></div>
              <h4>{activeBeat.artifactTitle}</h4>
              <div className={styles.experienceBriefLines}>
                {activeBeat.artifactLines.map((line, index) => (
                  <p key={line}><span>0{index + 1}</span>{line}<i /></p>
                ))}
              </div>
              <div className={styles.experienceBriefFooter}><span>VIDWAN / PRACTICE</span><span>{activeBeat.number}</span></div>
            </div>
            <div className={styles.experienceProgress} aria-hidden="true">
              {storyBeats.map((beat, index) => <span key={beat.number} className={index <= activeStory ? styles.experienceProgressActive : ""} />)}
            </div>
            <div className={styles.experienceScrollHint} aria-hidden="true">KEEP SCROLLING <span>↓</span></div>
          </div>
        </div>
        <div className={styles.experienceSteps} aria-hidden="true">
          {storyBeats.map((beat) => <div className={styles.experienceStep} key={beat.number} />)}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [activeStage, setActiveStage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const siteRef = useRef<HTMLElement>(null);
  const activeJourney = journey[activeStage];

  useEffect(() => {
    const root = siteRef.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.setAttribute("data-revealed", "true"));
      return;
    }

    root.setAttribute("data-motion-ready", "true");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <main ref={siteRef} className={styles.site}>
      <div className={styles.announcement}>
        <span className={styles.announcementDot} />
        <p>Model UN and debate begin with the work behind the speech.</p>
        <a href="#journey-3d">See the process <span aria-hidden="true">↗</span></a>
      </div>

      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/" className={styles.brand} aria-label="Vidwan home">
            <Image src="/images/vidwan-logo.png" alt="" width={60} height={60} priority className={styles.brandLogo} />
            <span className={styles.brandWords}><strong>VIDWAN</strong><small>THINK · SPEAK · LEAD</small></span>
          </Link>
          <div className={styles.desktopLinks}>
            <a href="#journey-3d">The journey</a>
            <a href="#method">The method</a>
            <a href="#programs">Programs</a>
            <a href="#skills">Skills</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className={styles.navActions}>
            <Link className={styles.loginLink} href="/student/login">Student sign in</Link>
            <Link className={styles.navCta} href="/register">Get started <span aria-hidden="true">↗</span></Link>
          </div>
          <button
            className={styles.menuButton}
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span /><span />
          </button>
        </nav>
        {menuOpen && (
          <div className={styles.mobileMenu} id="mobile-navigation">
            {[
              ["The journey", "#journey-3d"],
              ["The method", "#method"],
              ["Programs", "#programs"],
              ["Skills", "#skills"],
              ["Frequently asked questions", "#faq"],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label}<span aria-hidden="true">↗</span>
              </a>
            ))}
            <Link href="/student/login" onClick={() => setMenuOpen(false)}>Student sign in</Link>
            <Link className={styles.mobileMenuCta} href="/register" onClick={() => setMenuOpen(false)}>
              Get started <span aria-hidden="true">↗</span>
            </Link>
          </div>
        )}
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={[styles.container, styles.heroGrid].join(" ")}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span className={styles.eyebrowLine} />MODEL UNITED NATIONS · DEBATE · LEADERSHIP</p>
            <h1 id="hero-title" className={styles.heroTitle}>Take the floor.<br /><em>Be ready.</em></h1>
            <p className={styles.heroText}>
              Learn to research an issue, represent a position and make a clear case—in a Model UN committee, a debate round and beyond.
            </p>
            <div className={styles.heroActions}>
              <Link href="/register" className={styles.primaryButton}>Find your starting point <span aria-hidden="true">↗</span></Link>
              <a href="#method" className={styles.textButton}>See how it works <span aria-hidden="true">↓</span></a>
            </div>
            <div className={styles.heroPrinciples} aria-label="Read the brief, make your case, listen well">
              <span>READ THE BRIEF</span><i aria-hidden="true" /><span>MAKE YOUR CASE</span><i aria-hidden="true" /><span>LISTEN WELL</span>
            </div>
          </div>

          <figure className={styles.heroVisual} aria-label="An illustrated plan of a debate room">
            <div className={styles.heroGraphicHeader}><span>VIDWAN / FIELD GUIDE</span><span>01—05</span></div>
            <svg className={styles.heroRoomPlan} viewBox="0 0 680 650" fill="none" aria-hidden="true">
              <path className={styles.heroRoomBoundary} d="M78 95h524v428H78z" />
              <path className={styles.heroRoomInset} d="M110 127h460v364H110z" />
              <path className={styles.heroRoomDesk} d="M201 330c0-70 63-127 139-127s139 57 139 127v27H201v-27Z" />
              <path className={styles.heroRoomAisle} d="M340 470V357" />
              <path className={styles.heroRoomLectern} d="M312 171h56v28h-56z" />
              <circle className={styles.heroRoomSpeaker} cx="340" cy="420" r="9" />
              <circle className={styles.heroRoomSeat} cx="236" cy="282" r="9" />
              <circle className={styles.heroRoomSeat} cx="282" cy="232" r="9" />
              <circle className={styles.heroRoomSeat} cx="340" cy="218" r="9" />
              <circle className={styles.heroRoomSeat} cx="398" cy="232" r="9" />
              <circle className={styles.heroRoomSeat} cx="444" cy="282" r="9" />
              <path className={styles.heroRoomTicks} d="M78 78V59h19m505 19V59h-19M78 540v19h19m505-19v19h-19" />
            </svg>
            <div className={styles.heroGraphicNote}><span>THE DEBATE FLOOR</span><strong>Ideas need<br />room to move.</strong></div>
            <div className={styles.heroGraphicSide}><span>01</span>RESEARCH<i />02 SPEAK<i />03 LISTEN</div>
            <figcaption className={styles.heroGraphicCaption}><span /> MODEL UNITED NATIONS · DEBATE · LEADERSHIP</figcaption>
          </figure>
        </div>
      </section>

      <div className={styles.wordBand} aria-label="Vidwan learning principles">
        <div className={styles.wordBandInner}>
          <span>PREPARE THE CASE</span><i /><span>REPRESENT A POSITION</span><i />
          <span>LISTEN BEFORE YOU RESPOND</span><i /><span>WRITE THE RESOLUTION</span>
        </div>
      </div>

      <section className={styles.manifesto} id="about" aria-labelledby="manifesto-title">
        <div className={[styles.container, styles.manifestoGrid].join(" ")} data-scroll-reveal>
          <div className={styles.manifestoLead}>
            <p className={styles.darkEyebrow}><span>01</span> WHY VIDWAN</p>
            <h2 id="manifesto-title">The work starts <em>before</em> you speak.</h2>
          </div>
          <div className={styles.manifestoCopy}>
            <p className={styles.manifestoLede}>Vidwan helps students practise the parts of Model UN and debate that happen before the speech.</p>
            <p>Read closely. Build a position you can explain. Take questions seriously. Then work with other people to find a way forward.</p>
            <a className={styles.lightTextLink} href="#method">See how the journey works <Icon name="arrow" /></a>
          </div>
        </div>
        <div className={[styles.container, styles.principleCards].join(" ")} data-scroll-reveal>
          {[
            ["A", "Ask a better question", "Look past the headline and find the facts that shape the issue."],
            ["B", "Make your case", "Give people a clear reason to understand—and challenge—your position."],
            ["C", "Move the discussion", "Bring different views into the work and help a group take its next step."],
          ].map(([mark, title, text]) => (
            <article className={styles.principleCard} key={mark}>
              <span>{mark}</span><div><h3>{title}</h3><p>{text}</p></div><span className={styles.cardCorner} aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.method} id="method" aria-labelledby="method-title">
        <div className={[styles.container, styles.methodHead].join(" ")} data-scroll-reveal>
          <div>
            <p className={styles.eyebrow}><span className={styles.eyebrowLine} />THE VIDWAN METHOD</p>
            <h2 id="method-title">Five skills. <em>One step at a time.</em></h2>
          </div>
          <p>Start with research, then move from an initial position to speaking, negotiation and leadership.</p>
        </div>
        <div className={[styles.container, styles.journeyCard].join(" ")} data-active-stage={activeStage} data-scroll-reveal>
          <div className={styles.stageRail} role="group" aria-label="Five stages of the Vidwan journey">
            {journey.map((stage, index) => (
              <button
                aria-pressed={index === activeStage}
                className={[styles.stageButton, index === activeStage ? styles.stageButtonActive : ""].filter(Boolean).join(" ")}
                key={stage.number}
                onClick={() => setActiveStage(index)}
                type="button"
              >
                <span>{stage.number}</span><strong>{stage.title}</strong><i aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className={styles.stageContent} key={activeStage}>
            <div className={styles.stageText}>
              <p className={styles.stageKicker}>STAGE {activeJourney.number} · THE DELEGATE JOURNEY</p>
              <h3>{activeJourney.title}<br /><em>{activeJourney.subtitle}</em></h3>
              <p className={styles.stageDescription}>{activeJourney.description}</p>
              <div className={styles.stageActions}>
                {activeJourney.actions.map((action, index) => <span key={action}><b>0{index + 1}</b>{action}</span>)}
              </div>
            </div>
            <div className={styles.stageArtwork} data-stage-art={activeJourney.number} aria-hidden="true">
              <div className={styles.stageArtworkHeader}><span>THE DELEGATE JOURNEY</span><span>{activeJourney.number} / 05</span></div>
              <div className={styles.stageRoute}>
                <span className={styles.stageRouteTrack} />
                {journey.map((stage, index) => (
                  <span className={styles.stageRouteNode} data-current={index === activeStage} key={stage.number}>
                    <i>{stage.number}</i><b>{stage.title}</b>
                  </span>
                ))}
              </div>
              <div className={styles.stageArtworkNote}><span>NOW PRACTISING</span><strong>{activeJourney.title}</strong><i>{activeJourney.subtitle}</i></div>
              <div className={styles.artLabel}>A POSITION TAKES SHAPE</div>
            </div>
          </div>
          <div className={styles.journeyFooter}><span>Move through the stages</span><span>{activeJourney.number} <i>/</i> 05</span></div>
        </div>
      </section>

      <section className={styles.programs} id="programs" aria-labelledby="programs-title">
        <div className={[styles.container, styles.sectionHeader].join(" ")} data-scroll-reveal>
          <div>
            <p className={styles.darkEyebrow}><span>02</span> WHERE YOU PRACTISE</p>
            <h2 id="programs-title">Choose your <em>starting point.</em></h2>
          </div>
          <p>Model UN, debate and leadership ask different things of you. The preparation travels between them.</p>
        </div>
        <div className={[styles.container, styles.programGrid].join(" ")} data-scroll-reveal>
          {programCards.map((program) => (
            <article className={styles.programCard} key={program.number}>
              <ProgramArtwork icon={program.icon as IconName} number={program.number} />
              <div className={styles.programCardTop}><span>{program.number}</span><Icon name={program.icon as IconName} /></div>
              <h3>{program.title}</h3><p>{program.text}</p><div className={styles.programTag}>{program.tag}</div>
              <Link href="/register" aria-label={"Explore " + program.title + " with Vidwan"}><Icon name="arrow" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.skills} id="skills" aria-labelledby="skills-title">
        <div className={[styles.container, styles.skillsLayout].join(" ")} data-scroll-reveal>
          <div className={styles.skillsIntro}>
            <p className={styles.lightEyebrow}><span>03</span> WHAT YOU BUILD</p>
            <h2 id="skills-title">What you learn <em>travels with you.</em></h2>
            <p>Use these habits in class, at a conference, in a team or the next time you need to make a case.</p>
            <Link href="/register" className={styles.outlineButton}>Start building your toolkit <span aria-hidden="true">↗</span></Link>
          </div>
          <div className={styles.skillGrid}>
            {skillCards.map((skill) => (
              <article className={styles.skillCard} key={skill.number}>
                <div className={styles.skillCardTop}><span>{skill.number}</span><Icon name={skill.icon as IconName} /></div>
                <h3>{skill.title}</h3><p>{skill.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.feature} aria-labelledby="feature-title">
        <div className={[styles.container, styles.featureLayout].join(" ")} data-scroll-reveal>
          <figure className={styles.featureVisual} aria-label="An illustrated path from research to resolution">
            <div className={styles.featureVisualHeader}><span>FIELD NOTE / 04</span><span>FROM QUESTION TO RESOLUTION</span></div>
            <svg className={styles.featureArgumentMap} viewBox="0 0 720 470" fill="none" aria-hidden="true">
              <path className={styles.argumentPath} d="M78 353C157 347 150 143 267 143s88 200 205 200 97-133 172-133" />
              <path className={styles.argumentGuide} d="M79 390h566M80 80v310" />
              <circle className={styles.argumentPoint} cx="78" cy="353" r="13" />
              <circle className={styles.argumentPoint} cx="267" cy="143" r="13" />
              <circle className={styles.argumentPoint} cx="472" cy="343" r="13" />
              <circle className={styles.argumentPoint} cx="644" cy="210" r="13" />
            </svg>
            <div className={styles.argumentLabels}><span><b>01</b> QUESTION</span><span><b>02</b> EVIDENCE</span><span><b>03</b> POSITION</span><span><b>04</b> RESPONSE</span></div>
            <div className={styles.featureVisualFooter}><strong>Good ideas have a route.</strong><span>VIDWAN / PRACTICE</span></div>
          </figure>
          <div className={styles.featureCopy}>
            <p className={styles.darkEyebrow}><span>04</span> THE WORK BEHIND THE MOMENT</p>
            <h2 id="feature-title">The speech is the moment. <em>Preparation is the work.</em></h2>
            <p>Understand the issue before taking a position. Practise explaining it. Learn to keep working when another delegate sees things differently.</p>
            <ul className={styles.featureList}>
              <li><span>01</span>Understand the issue before taking a position</li>
              <li><span>02</span>Practice expressing and defending your ideas</li>
              <li><span>03</span>Learn to collaborate when perspectives differ</li>
            </ul>
            <a className={styles.darkTextLink} href="#faq">Questions about getting started? <Icon name="arrow" /></a>
          </div>
        </div>
      </section>

      <ScrollytellingExperience />

      <section className={styles.faq} id="faq" aria-labelledby="faq-title">
        <div className={[styles.container, styles.faqLayout].join(" ")} data-scroll-reveal>
          <div className={styles.faqIntro}>
            <p className={styles.eyebrow}><span className={styles.eyebrowLine} />GOOD QUESTIONS</p>
            <h2 id="faq-title">Before you <em>step in.</em></h2>
            <p>Start with the basics. Your next step can be simple.</p>
            <Link href="/register" className={styles.primaryButton}>Choose a starting point <span aria-hidden="true">↗</span></Link>
          </div>
          <div className={styles.faqList}>
            {questions.map(({ question, answer }, index) => (
              <details className={styles.faqItem} key={question}>
                <summary><span><i>0{index + 1}</i>{question}</span><b aria-hidden="true">+</b></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="cta-title">
        <div className={[styles.container, styles.finalCtaInner].join(" ")} data-scroll-reveal>
          <p className={styles.lightEyebrow}><span>YOUR NEXT STEP</span></p>
          <h2 id="cta-title">Your next speech<br /><em>starts here.</em></h2>
          <p>Pick a starting point, build your first position and practise how to explain it.</p>
          <div className={styles.ctaActions}>
            <Link href="/register" className={styles.ctaButton}>Get started with Vidwan <span aria-hidden="true">↗</span></Link>
            <Link href="/student/login" className={styles.ctaLogin}>Already a student? Sign in</Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={[styles.container, styles.footerMain].join(" ")}>
          <Link href="/" className={styles.footerBrand} aria-label="Vidwan home">
            <Image src="/images/vidwan-logo.png" alt="" width={52} height={52} />
            <span><strong>VIDWAN</strong><small>THINK · SPEAK · LEAD</small></span>
          </Link>
          <p>Model UN, debate and leadership for students learning to research, represent and make their case.</p>
          <nav className={styles.footerLinks} aria-label="Footer navigation">
            <a href="#method">The method</a><a href="#programs">Programs</a><a href="#faq">FAQ</a>
            <Link href="/student/login">Student sign in</Link>
          </nav>
        </div>
        <div className={[styles.container, styles.footerBottom].join(" ")}>
          <span>© {new Date().getFullYear()} VIDWAN. ALL RIGHTS RESERVED.</span>
          <span>MUN · DEBATE · YOUTH LEADERSHIP</span>
          <Link href="/staff" className={styles.staffAccessLink}>Staff login</Link>
        </div>
      </footer>
    </main>
  );
}
