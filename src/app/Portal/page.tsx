import Image from "next/image";
import Link from "next/link";

import styles from "./page.module.css";

export default function StaffPortalPage() {
  return (
    <main className={styles.portal}>
      <div className={styles.grid} aria-hidden="true" />
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Vidwan home">
          <Image src="/images/vidwan-logo.png" alt="" width={48} height={48} priority />
          <span><strong>VIDWAN</strong><small>STAFF PORTAL</small></span>
        </Link>
        <Link href="/" className={styles.backLink}>← Back to Vidwan</Link>
      </header>

      <section className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}><span /> Private staff access</p>
          <h1>Good work<br /><em>starts here.</em></h1>
          <p>Choose your workspace and get back to helping students find their voice.</p>
          <div className={styles.trust}><span>01</span><i /> Secure access for the Vidwan team</div>
        </div>

        <div className={styles.options}>
          <Link href="/teacher/login" className={styles.card}>
            <div className={styles.cardTop}><span>01 / TEACHING TEAM</span><span className={styles.cardIcon} aria-hidden="true">↗</span></div>
            <div className={styles.cardBody}>
              <span className={styles.cardLabel}>For teachers</span>
              <h2>Teacher portal</h2>
              <p>Keep classes, student progress, meetings and announcements moving.</p>
              <span className={styles.cardAction}>Open teacher workspace <b>→</b></span>
            </div>
            <div className={styles.cardIndex}>TEACH · GUIDE · GROW</div>
          </Link>

          <Link href="/admin/login" className={`${styles.card} ${styles.ownerCard}`}>
            <div className={styles.cardTop}><span>02 / OWNER ACCESS</span><span className={styles.cardIcon} aria-hidden="true">↗</span></div>
            <div className={styles.cardBody}>
              <span className={styles.cardLabel}>For the Vidwan owner</span>
              <h2>Owner workspace</h2>
              <p>See the whole learning community and manage the people behind it.</p>
              <span className={styles.cardAction}>Open owner workspace <b>→</b></span>
            </div>
            <div className={styles.cardIndex}>PEOPLE · PROGRAMS · PROGRESS</div>
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>VIDWAN <i>·</i> MUN <i>·</i> DEBATE <i>·</i> LEADERSHIP</span>
        <span>Thoughtful voices. Better futures.</span>
      </footer>
    </main>
  );
}
