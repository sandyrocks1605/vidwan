"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    icon: "globe",
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
  },
  {
    number: "02",
    kicker: "FOLLOW THE EVIDENCE",
    title: "Turn noise into a point of view.",
    description:
      "Compare sources, notice what is missing and build a position that can hold up when someone asks the next question.",
    note: "THE POSITION / WITH EVIDENCE",
    sceneLabel: "RESEARCH · 02",
  },
  {
    number: "03",
    kicker: "ENTER THE ROOM",
    title: "Preparation gives your voice direction.",
    description:
      "The first speech is only a beginning. Listen, make your case and stay open to the idea that shifts the room.",
    note: "THE FLOOR / YOUR VOICE",
    sceneLabel: "DEBATE · 03",
  },
  {
    number: "04",
    kicker: "MOVE IDEAS FORWARD",
    title: "Good leadership leaves room for others.",
    description:
      "Bring different perspectives into the work and turn discussion into a way forward that more people can stand behind.",
    note: "THE ROOM / A WAY FORWARD",
    sceneLabel: "RESOLUTION · 04",
  },
];

type IconName = "research" | "structure" | "voice" | "debate" | "negotiate" | "lead" | "globe" | "arrow";

function Icon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, string> = {
    research: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Zm0 0V19a2 2 0 0 1 2-2h14M8 7h8M8 11h7",
    structure: "M12 3 14.3 9.7 21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3Zm7 13v5m2.5-2.5h-5",
    voice: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 8v1a7 7 0 0 0 14 0v-1m-7 8v4m-4 0h8",
    debate: "M4 5h16v11H9l-5 4V5Zm4 4h8m-8 4h5",
    negotiate: "M3 8h6l3 3-3 3-3-3H3m18-3h-6l-3 3 3 3 3-3h3m-9 0v10",
    lead: "M12 3v18m0-18 7 4-7 4M5 13h5m-5 4h8m-8 4h6",
    globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-20c2.5 2.7 3.8 6 3.8 10S14.5 19.3 12 22c-2.5-2.7-3.8-6-3.8-10S9.5 4.7 12 2ZM2 12h20",
    arrow: "M4 12h15m-6-6 6 6-6 6",
  };

  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}

function ProgramArtwork({ icon, number }: { icon: string; number: string }) {
  const artworkClass = icon === "globe"
    ? styles.programArtworkGlobe
    : icon === "debate"
      ? styles.programArtworkDebate
      : styles.programArtworkLeadership;

  return (
    <div className={`${styles.programArtwork} ${artworkClass}`} aria-hidden="true">
      <div className={styles.programArtworkObject}><span>{number}</span></div>
      <i className={styles.programArtworkOrbitOne} />
      <i className={styles.programArtworkOrbitTwo} />
      <b className={styles.programArtworkSignal} />
    </div>
  );
}

function ScrollytellingExperience() {
  const [activeStory, setActiveStory] = useState(0);

  useEffect(() => {
    const steps = document.querySelectorAll<HTMLElement>("[data-story-index]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveStory(Number((entry.target as HTMLElement).dataset.storyIndex ?? 0));
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  const activeBeat = storyBeats[activeStory];

  return (
    <section className={styles.scrolly} id="journey-3d" aria-labelledby="scrolly-title">
      <div className={[styles.container, styles.scrollyHeader].join(" ")}>
        <div>
          <p className={styles.lightEyebrow}><span>05</span> A JOURNEY IN MOTION</p>
          <h2 id="scrolly-title">One idea can change <em>the room.</em></h2>
        </div>
        <p>Follow the path from first question to shared progress. Scroll to move through the story.</p>
      </div>

      <div className={[styles.container, styles.scrollyLayout].join(" ")}>
        <div className={styles.sceneSticky}>
          <div className={styles.sceneFrame} data-active-story={activeStory} aria-hidden="true">
            <div className={styles.sceneStars} />
            <div className={styles.sceneGrid} />
            <div className={styles.sceneCoordinates}>VIDWAN FIELD NOTES <span>·</span> {activeBeat.number} / 04</div>
            <div className={styles.sceneCamera}>
              <Image
                src="/images/vidwan-stage.png"
                alt=""
                fill
                sizes="100vw"
                className={styles.sceneArtwork}
              />
            </div>
            <div className={styles.sceneReadout}>
              <span>{activeBeat.sceneLabel}</span>
              <strong>{activeBeat.note}</strong>
              <i><b style={{ width: `${(activeStory + 1) * 25}%` }} /></i>
            </div>
            <div className={styles.sceneStoryCopy} key={activeStory} aria-hidden="true">
              <p className={styles.storyStepIndex}><span>{activeBeat.number}</span> / 04</p>
              <p className={styles.storyKicker}>{activeBeat.kicker}</p>
              <h3>{activeBeat.title}</h3>
              <p className={styles.storyDescription}>{activeBeat.description}</p>
              <span className={styles.storyRule}><i /> {activeBeat.note}</span>
            </div>
            <div className={styles.sceneCaption}>
              <span>SCROLL TO MOVE THROUGH THE ROOM</span>
              <strong>0{activeStory + 1} <i>/</i> 04</strong>
            </div>
          </div>
        </div>

        <div className={styles.storySteps}>
          {storyBeats.map((beat, index) => (
            <article
              aria-current={activeStory === index ? "step" : undefined}
              className={`${styles.storyStep} ${activeStory === index ? styles.storyStepActive : ""}`}
              data-story-index={index}
              key={beat.number}
            >
              <div className={styles.storyStepCopy}>
                <p className={styles.storyStepIndex}><span>{beat.number}</span> / 04</p>
                <p className={styles.storyKicker}>{beat.kicker}</p>
                <h3>{beat.title}</h3>
                <p className={styles.storyDescription}>{beat.description}</p>
                <span className={styles.storyRule}><i /> {beat.note}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [activeStage, setActiveStage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeJourney = journey[activeStage];

  return (
    <main className={styles.site}>
      <div className={styles.announcement}>
        <span className={styles.announcementDot} />
        <p>Ideas worth hearing deserve a voice prepared to lead.</p>
        <a href="#journey-3d">Discover the journey <span aria-hidden="true">↗</span></a>
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
        <div className={styles.heroHalo} aria-hidden="true" />
        <div className={[styles.container, styles.heroGrid].join(" ")}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span className={styles.eyebrowLine} />MUN · DEBATE · YOUTH LEADERSHIP</p>
            <h1 id="hero-title" className={styles.heroTitle}>Make your<br /><em>voice matter.</em></h1>
            <p className={styles.heroText}>
              Build the research, communication and leadership skills to contribute with confidence—in the room and beyond it.
            </p>
            <div className={styles.heroActions}>
              <Link href="/register" className={styles.primaryButton}>Find your starting point <span aria-hidden="true">↗</span></Link>
              <a href="#method" className={styles.textButton}>Explore the Vidwan method <span aria-hidden="true">↓</span></a>
            </div>
            <div className={styles.heroPrinciples} aria-label="Research, speak and lead">
              <span>RESEARCH</span><i aria-hidden="true" /><span>SPEAK</span><i aria-hidden="true" /><span>LEAD</span>
            </div>
          </div>

          <figure className={styles.heroVisual}>
            <Image
              src="/images/vidwan-stage.png"
              alt="A sculptural 3D globe, research pages and microphone above a delegate podium"
              fill
              priority
              sizes="(max-width: 920px) 100vw, 52vw"
              className={styles.heroImage}
            />
            <div className={styles.heroShade} />
            <div className={styles.photoTopline}><span>VIDWAN · IDEAS INTO IMPACT</span><span aria-hidden="true">01 / 05</span></div>
            <figcaption className={styles.photoCaption}>
              <span>THE WORLD IS ALREADY IN THE ROOM</span>
              <strong>Prepare your voice to move it.</strong>
            </figcaption>
            <div className={styles.imageOrbit} aria-hidden="true"><span>V</span></div>
          </figure>
          <div className={styles.heroIndex}>
            <span>01</span><span>05</span><div><i /></div><span className={styles.heroIndexLabel}>A clearer way to grow</span>
          </div>
        </div>
      </section>

      <div className={styles.wordBand} aria-label="Vidwan learning principles">
        <div className={styles.wordBandInner}>
          <span>CURIOUS MINDS</span><i /><span>STRONGER VOICES</span><i />
          <span>BETTER CONVERSATIONS</span><i /><span>THOUGHTFUL LEADERS</span>
        </div>
      </div>

      <section className={styles.manifesto} id="about" aria-labelledby="manifesto-title">
        <div className={[styles.container, styles.manifestoGrid].join(" ")}>
          <div className={styles.manifestoLead}>
            <p className={styles.darkEyebrow}><span>01</span> WHY VIDWAN</p>
            <h2 id="manifesto-title">Confidence is built <em>before</em> the microphone.</h2>
          </div>
          <div className={styles.manifestoCopy}>
            <p className={styles.manifestoLede}>Vidwan is a learning platform for students exploring Model United Nations, debate and leadership.</p>
            <p>We focus on the work behind the performance: understanding an issue, shaping a position, expressing it clearly and finding a way forward with others.</p>
            <a className={styles.lightTextLink} href="#method">See how the journey works <Icon name="arrow" /></a>
          </div>
        </div>
        <div className={[styles.container, styles.principleCards].join(" ")}>
          {[
            ["A", "Think with depth", "Question the first answer. Find the facts that change the conversation."],
            ["B", "Speak with clarity", "Shape your ideas so people can understand them, challenge them and build on them."],
            ["C", "Lead with purpose", "Bring different perspectives together and help a group take its next step."],
          ].map(([mark, title, text]) => (
            <article className={styles.principleCard} key={mark}>
              <span>{mark}</span><div><h3>{title}</h3><p>{text}</p></div><span className={styles.cardCorner} aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.method} id="method" aria-labelledby="method-title">
        <div className={[styles.container, styles.methodHead].join(" ")}>
          <div>
            <p className={styles.eyebrow}><span className={styles.eyebrowLine} />THE VIDWAN METHOD</p>
            <h2 id="method-title">A strong delegate is <em>made in stages.</em></h2>
          </div>
          <p>Every room asks for more than a speech. Move through the skills that make research, debate and collaboration work together.</p>
        </div>
        <div className={[styles.container, styles.journeyCard].join(" ")}>
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
            <div className={styles.stageNumber}>{activeJourney.number}</div>
            <div className={styles.stageText}>
              <p className={styles.stageKicker}>STAGE {activeJourney.number} · THE DELEGATE JOURNEY</p>
              <h3>{activeJourney.title}<br /><em>{activeJourney.subtitle}</em></h3>
              <p className={styles.stageDescription}>{activeJourney.description}</p>
              <div className={styles.stageActions}>
                {activeJourney.actions.map((action, index) => <span key={action}><b>0{index + 1}</b>{action}</span>)}
              </div>
            </div>
            <div className={styles.stageArtwork} aria-hidden="true">
              <div className={styles.stageOrb}><span>{activeJourney.number}</span></div>
              <div className={[styles.orbit, styles.orbitOne].join(" ")} />
              <div className={[styles.orbit, styles.orbitTwo].join(" ")} />
              <div className={[styles.orbit, styles.orbitThree].join(" ")} />
              <span className={styles.artLabel}>{activeJourney.title.toUpperCase()}</span>
              <span className={styles.artCoordinate}>VIDWAN / 05</span>
            </div>
          </div>
          <div className={styles.journeyFooter}><span>Move through the stages</span><span>{activeJourney.number} <i>/</i> 05</span></div>
        </div>
      </section>

      <section className={styles.programs} id="programs" aria-labelledby="programs-title">
        <div className={[styles.container, styles.sectionHeader].join(" ")}>
          <div>
            <p className={styles.darkEyebrow}><span>02</span> WHERE YOU PRACTISE</p>
            <h2 id="programs-title">Skills for more than <em>one room.</em></h2>
          </div>
          <p>Start with the format that excites you. Carry the skills into every conversation that comes after.</p>
        </div>
        <div className={[styles.container, styles.programGrid].join(" ")}>
          {programCards.map((program) => (
            <article className={styles.programCard} key={program.number}>
              <ProgramArtwork icon={program.icon} number={program.number} />
              <div className={styles.programCardTop}><span>{program.number}</span><Icon name={program.icon as IconName} /></div>
              <h3>{program.title}</h3><p>{program.text}</p><div className={styles.programTag}>{program.tag}</div>
              <Link href="/register" aria-label={"Explore " + program.title + " with Vidwan"}><Icon name="arrow" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.skills} id="skills" aria-labelledby="skills-title">
        <div className={[styles.container, styles.skillsLayout].join(" ")}>
          <div className={styles.skillsIntro}>
            <p className={styles.lightEyebrow}><span>03</span> WHAT YOU BUILD</p>
            <h2 id="skills-title">A toolkit that travels <em>with you.</em></h2>
            <p>Great moments matter. So do the habits you carry into the next meeting, classroom, team and decision.</p>
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
        <div className={[styles.container, styles.featureLayout].join(" ")}>
          <figure className={styles.featureVisual}>
            <Image
              src="/images/vidwan-collaboration.jpg"
              alt="Student delegates working together on research and debate notes"
              fill
              sizes="(max-width: 900px) 100vw, 52vw"
              className={styles.featureImage}
            />
            <div className={styles.featureImageShade} />
            <figcaption>BETTER THINKING HAPPENS TOGETHER</figcaption>
            <div className={styles.featureStamp} aria-hidden="true">V.</div>
          </figure>
          <div className={styles.featureCopy}>
            <p className={styles.darkEyebrow}><span>04</span> THE WORK BEHIND THE MOMENT</p>
            <h2 id="feature-title">Prepared for the <em>conversation.</em></h2>
            <p>Strong performance starts long before the microphone turns on. Vidwan brings research, communication and leadership into one practical learning experience.</p>
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
        <div className={[styles.container, styles.faqLayout].join(" ")}>
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
        <div className={[styles.container, styles.finalCtaInner].join(" ")}>
          <div className={styles.ctaOrbit} aria-hidden="true"><span>V</span></div>
          <p className={styles.lightEyebrow}><span>YOUR NEXT STEP</span></p>
          <h2 id="cta-title">The room is waiting.<br /><em>Come prepared.</em></h2>
          <p>Choose your starting point and begin building a voice that moves ideas forward.</p>
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
          <p>Helping students think deeper, communicate better and lead with purpose.</p>
          <nav className={styles.footerLinks} aria-label="Footer navigation">
            <a href="#method">The method</a><a href="#programs">Programs</a><a href="#faq">FAQ</a>
            <Link href="/student/login">Student sign in</Link>
          </nav>
        </div>
        <div className={[styles.container, styles.footerBottom].join(" ")}>
          <span>© {new Date().getFullYear()} VIDWAN. ALL RIGHTS RESERVED.</span>
          <span>MUN · DEBATE · YOUTH LEADERSHIP</span>
        </div>
      </footer>
    </main>
  );
}
