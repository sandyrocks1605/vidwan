"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function StaffPortalPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "auto";

    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <main className="staff-portal">

      {/* Background */}

      <div className="portal-grid" />
      <div className="portal-glow portal-glow-one" />
      <div className="portal-glow portal-glow-two" />

      {/* Header */}

      <header className="portal-header">

        <Link
          href="/"
          className="portal-logo"
          aria-label="Back to Vidwan"
        >
          <Image
            src="/images/vidwan-logo.png"
            alt="Vidwan"
            width={48}
            height={48}
            priority
          />

          <div>
            <strong>VIDWAN</strong>
            <span>STAFF PORTAL</span>
          </div>
        </Link>

        <Link
          href="/"
          className="back-link"
        >
          ← BACK TO VIDWAN
        </Link>

      </header>

      {/* Main */}

      <section className="portal-main">

        <div className="portal-intro">

          <p className="portal-eyebrow">
            PRIVATE ACCESS
          </p>

          <h1>
            Staff
            <br />
            <span>Portal.</span>
          </h1>

          <p>
            Internal access for Vidwan teachers and administrators.
          </p>

        </div>

        <div className="portal-options">

          {/* Teacher */}

          <Link
            href="/teacher/login"
            className="portal-card"
          >

            <div className="card-number">
              01
            </div>

            <div className="card-content">

              <p>
                TEACHER
              </p>

              <h2>
                Teacher Portal
              </h2>

              <span>
                Manage students, meetings,
                announcements and classes.
              </span>

            </div>

            <div className="card-arrow">
              →
            </div>

          </Link>

          {/* Admin */}

          <Link
            href="/admin/login"
            className="portal-card admin-card"
          >

            <div className="card-number">
              02
            </div>

            <div className="card-content">

              <p>
                ADMINISTRATION
              </p>

              <h2>
                Admin Portal
              </h2>

              <span>
                Manage the Vidwan platform,
                teachers and students.
              </span>

            </div>

            <div className="card-arrow">
              →
            </div>

          </Link>

        </div>

        <div className="portal-security">

          <span className="security-dot" />

          <p>
            AUTHORIZED VIDWAN STAFF ONLY
          </p>

        </div>

      </section>

      {/* Footer */}

      <footer className="portal-footer">

        <span>
          VIDWAN • MUN • DEBATE • LEADERSHIP
        </span>

        <Link href="/">
          RETURN TO MAIN SITE
        </Link>

      </footer>

      <style jsx global>{`

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #030912;
        }

        .staff-portal {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 40%,
              rgba(13, 74, 130, .12),
              transparent 45%
            ),
            #030912;
          color: white;
        }

        /* -----------------------------------------
           BACKGROUND
        ----------------------------------------- */

        .portal-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .12;

          background-image:
            linear-gradient(
              rgba(38,148,255,.14) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(38,148,255,.14) 1px,
              transparent 1px
            );

          background-size: 70px 70px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 90%
            );
        }

        .portal-glow {
          position: absolute;
          border-radius: 9999px;
          pointer-events: none;
          filter: blur(100px);
        }

        .portal-glow-one {
          width: 500px;
          height: 500px;
          left: -250px;
          top: 20%;
          background:
            rgba(0,100,210,.08);
        }

        .portal-glow-two {
          width: 500px;
          height: 500px;
          right: -250px;
          bottom: 10%;
          background:
            rgba(0,130,255,.06);
        }

        /* -----------------------------------------
           HEADER
        ----------------------------------------- */

        .portal-header {
          position: relative;
          z-index: 10;

          width: calc(100% - 40px);
          max-width: 1280px;

          margin: 20px auto 0;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .portal-logo {
          display: flex;
          align-items: center;
          gap: 12px;

          color: white;
          text-decoration: none;
        }

        .portal-logo img {
          object-fit: contain;
        }

        .portal-logo strong {
          display: block;

          font-size: 13px;
          letter-spacing: .25em;
        }

        .portal-logo span {
          display: block;

          margin-top: 4px;

          font-size: 8px;
          letter-spacing: .35em;

          color:
            rgba(255,255,255,.35);
        }

        .back-link {
          padding: 11px 17px;

          border:
            1px solid
            rgba(255,255,255,.1);

          border-radius: 999px;

          font-size: 9px;
          font-weight: 600;
          letter-spacing: .2em;

          color:
            rgba(255,255,255,.45);

          text-decoration: none;

          transition:
            color .2s ease,
            border-color .2s ease,
            background .2s ease;
        }

        .back-link:hover {
          color: white;

          border-color:
            rgba(38,148,255,.35);

          background:
            rgba(38,148,255,.05);
        }

        /* -----------------------------------------
           MAIN
        ----------------------------------------- */

        .portal-main {
          position: relative;
          z-index: 5;

          width: calc(100% - 40px);
          max-width: 1100px;

          margin: 0 auto;

          min-height:
            calc(100vh - 120px);

          display: flex;
          flex-direction: column;
          justify-content: center;

          padding:
            100px 0 70px;
        }

        .portal-intro {
          margin-bottom: 55px;
        }

        .portal-eyebrow {
          margin: 0 0 20px;

          font-size: 9px;
          font-weight: 600;
          letter-spacing: .45em;

          color: #2694ff;
        }

        .portal-intro h1 {
          margin: 0;

          font-size:
            clamp(
              4rem,
              9vw,
              8rem
            );

          font-weight: 700;
          line-height: .85;

          letter-spacing: -.07em;
        }

        .portal-intro h1 span {
          color:
            rgba(255,255,255,.28);
        }

        .portal-intro > p:last-child {
          max-width: 500px;

          margin: 30px 0 0;

          font-size: 15px;
          line-height: 1.7;

          color:
            rgba(255,255,255,.38);
        }

        /* -----------------------------------------
           CARDS
        ----------------------------------------- */

        .portal-options {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 14px;
        }

        .portal-card {
          position: relative;

          min-height: 280px;

          padding: 30px;

          overflow: hidden;

          border:
            1px solid
            rgba(255,255,255,.09);

          border-radius: 26px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.045),
              rgba(255,255,255,.012)
            );

          color: white;
          text-decoration: none;

          transition:
            transform .3s ease,
            border-color .3s ease,
            background .3s ease;
        }

        .portal-card::before {
          content: "";

          position: absolute;

          width: 240px;
          height: 240px;

          right: -100px;
          bottom: -130px;

          border-radius: 9999px;

          background:
            rgba(38,148,255,.09);

          filter: blur(45px);

          transition:
            transform .4s ease;
        }

        .portal-card:hover {
          transform:
            translateY(-5px);

          border-color:
            rgba(38,148,255,.32);

          background:
            linear-gradient(
              135deg,
              rgba(38,148,255,.08),
              rgba(255,255,255,.018)
            );
        }

        .portal-card:hover::before {
          transform:
            scale(1.4);
        }

        .card-number {
          position: absolute;

          top: 28px;
          right: 30px;

          font-size: 9px;
          letter-spacing: .3em;

          color:
            rgba(255,255,255,.22);
        }

        .card-content {
          position: absolute;

          left: 30px;
          right: 30px;
          bottom: 30px;
        }

        .card-content p {
          margin: 0 0 12px;

          font-size: 9px;
          font-weight: 600;
          letter-spacing: .35em;

          color: #2694ff;
        }

        .card-content h2 {
          margin: 0;

          font-size: 31px;
          font-weight: 500;
          letter-spacing: -.04em;
        }

        .card-content span {
          display: block;

          max-width: 360px;

          margin-top: 12px;

          font-size: 12px;
          line-height: 1.7;

          color:
            rgba(255,255,255,.35);
        }

        .card-arrow {
          position: absolute;

          right: 30px;
          bottom: 27px;

          font-size: 20px;

          color:
            rgba(255,255,255,.4);

          transition:
            transform .25s ease,
            color .25s ease;
        }

        .portal-card:hover .card-arrow {
          transform:
            translateX(5px);

          color: white;
        }

        /* -----------------------------------------
           SECURITY
        ----------------------------------------- */

        .portal-security {
          display: flex;
          align-items: center;
          gap: 9px;

          margin-top: 25px;
        }

        .security-dot {
          width: 5px;
          height: 5px;

          border-radius: 9999px;

          background: #2694ff;

          box-shadow:
            0 0 10px
            rgba(38,148,255,.8);
        }

        .portal-security p {
          margin: 0;

          font-size: 8px;
          font-weight: 600;
          letter-spacing: .3em;

          color:
            rgba(255,255,255,.22);
        }

        /* -----------------------------------------
           FOOTER
        ----------------------------------------- */

        .portal-footer {
          position: relative;
          z-index: 10;

          width: calc(100% - 40px);
          max-width: 1280px;

          margin: 0 auto;

          padding:
            20px 0 25px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-top:
            1px solid
            rgba(255,255,255,.05);
        }

        .portal-footer span,
        .portal-footer a {
          font-size: 8px;
          letter-spacing: .25em;

          color:
            rgba(255,255,255,.2);

          text-decoration: none;
        }

        .portal-footer a:hover {
          color: white;
        }

        /* -----------------------------------------
           MOBILE
        ----------------------------------------- */

        @media (max-width: 700px) {

          .portal-header {
            width: calc(100% - 28px);
            margin-top: 14px;
          }

          .back-link {
            font-size: 8px;
            padding: 9px 12px;
          }

          .portal-main {
            width: calc(100% - 28px);

            padding:
              80px 0 45px;
          }

          .portal-intro {
            margin-bottom: 35px;
          }

          .portal-intro h1 {
            font-size:
              clamp(
                4rem,
                20vw,
                6rem
              );
          }

          .portal-options {
            grid-template-columns: 1fr;
          }

          .portal-card {
            min-height: 230px;
          }

          .card-content h2 {
            font-size: 27px;
          }

          .portal-footer {
            width: calc(100% - 28px);

            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

        }

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            transition: none !important;
          }

        }

      `}</style>

    </main>
  );
}