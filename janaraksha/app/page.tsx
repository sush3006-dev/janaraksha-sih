import Image from "next/image";
import Link from "next/link";

const purposeCards = [
  {
    icon: "/images/purpose-icon.png",
    title: "Our Purpose",
    description:
      "To ensure every citizen has access to justice, guidance and support with dignity.",
  },
  {
    icon: "/images/vision-icon.png",
    title: "Our Vision",
    description:
      "A society where rights are respected, voices are heard and justice is within reach for all.",
  },
  {
    icon: "/images/mission-icon.png",
    title: "Our Mission",
    description:
      "To bridge the gap between citizens and the legal system through technology, transparency and trust.",
  },
  {
    icon: "/images/values-icon.png",
    title: "Our Values",
    description:
      "Empathy, integrity, fairness and commitment drive everything we do.",
  },
];

const aboutFeatures = [
  {
    icon: "/images/citizen-centric.png",
    title: "Citizen Centric",
    description:
      "Built for citizens, by understanding real needs.",
  },
  {
    icon: "/images/transparent.png",
    title: "Transparent",
    description:
      "Every process is designed to be clear, traceable and honest.",
  },
  {
    icon: "/images/accessible.png",
    title: "Accessible",
    description:
      "Reaching people everywhere, without barriers.",
  },
  {
    icon: "/images/secure.png",
    title: "Secure",
    description:
      "Protecting your data and ensuring complete confidentiality.",
  },
];

export default function LandingPage() {
  return (
    <main className="landing-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="landing-header">

        <Link
          href="/"
          className="landing-brand"
          aria-label="JanaRaksha Home"
        >
          <img
            src="/images/JanaRaksha-logo.svg"
            alt="JanaRaksha"
            className="landing-brand-mark"
          />

          <div className="landing-brand-text">
            <span className="landing-brand-name">
              JANARAKSHA
            </span>

            <span className="landing-brand-tagline">
              JUSTICE. GUIDANCE. PROTECTION.
            </span>
          </div>
        </Link>

        <nav className="landing-nav">

          <a
            href="#home"
            className="landing-nav-link active"
          >
            Home
          </a>

          <a
            href="#about"
            className="landing-nav-link"
          >
            About
          </a>

          <a
            href="#how-it-works"
            className="landing-nav-link"
          >
            How It Works
          </a>

          <a
            href="#faq"
            className="landing-nav-link"
          >
            FAQ
          </a>

        </nav>

        <div className="landing-header-actions">

          <Link
            href="/auth/login"
            className="landing-signin"
          >
            Sign In
          </Link>

          <Link
            href="/auth/register"
            className="landing-register"
          >
            Register
            <span>→</span>
          </Link>

        </div>

      </header>


      {/* =========================
          HERO
      ========================= */}

      <section
        id="home"
        className="landing-hero"
      >

        <div className="landing-hero-background" />

        <div className="landing-hero-content">

          <div className="landing-hero-copy">

            <p className="landing-eyebrow">
              WELCOME TO JANARAKSHA
            </p>

            <h1>
              Justice.
              <br />
              Guidance.
              <br />
              <span>Protection.</span>
            </h1>

            <div className="landing-title-line" />

            <p className="landing-hero-description">
              JanaRaksha is a unified digital platform
              dedicated to empowering citizens with
              guidance, support and a transparent way
              to raise their concerns and seek justice.
            </p>

          </div>


          <div className="landing-hero-visual">

            <Image
              src="/images/shield.png"
              alt="JanaRaksha Shield"
              width={700}
              height={700}
              priority
              className="landing-shield"
            />

          </div>

        </div>

      </section>


      {/* =========================
          PURPOSE / VISION /
          MISSION / VALUES
      ========================= */}

      <section className="landing-purpose-section">

        <div className="landing-purpose-grid">

          {purposeCards.map((item) => (
            <article
              key={item.title}
              className="landing-purpose-card"
            >

              <div className="landing-purpose-icon">

                <Image
                  src={item.icon}
                  alt=""
                  width={60}
                  height={60}
                />

              </div>

              <h2>{item.title}</h2>

              <p>
                {item.description}
              </p>

            </article>
          ))}

        </div>

      </section>


      {/* =========================
          ABOUT
      ========================= */}

      <section
        id="about"
        className="landing-about-section"
      >

        <div className="landing-about-heading">

          <p className="landing-eyebrow">
            ABOUT JANARAKSHA
          </p>

          <h2>
            A step towards a fairer
            and more just society.
          </h2>

          <div className="landing-title-line center" />

          <p>
            JanaRaksha brings together people,
            processes and technology to make
            the path to justice simpler, clearer
            and more accessible for every citizen.
          </p>

        </div>


        <div className="landing-about-features">

          {aboutFeatures.map((item) => (
            <article
              key={item.title}
              className="landing-about-feature"
            >

              <div className="landing-about-icon">

                <Image
                  src={item.icon}
                  alt=""
                  width={50}
                  height={50}
                />

              </div>

              <div>

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.description}
                </p>

              </div>

            </article>
          ))}

        </div>

      </section>


      {/* =========================
          HOW IT WORKS
      ========================= */}

      <section
        id="how-it-works"
        className="landing-how-section"
      >

        <div className="landing-section-heading">

          <p className="landing-eyebrow">
            HOW IT WORKS
          </p>

          <h2>
            Simple. Transparent. Accessible.
          </h2>

          <div className="landing-title-line center" />

          <p>
            JanaRaksha makes it easier for citizens
            to raise concerns and follow their progress.
          </p>

        </div>


        <div className="landing-how-grid">

          <article className="landing-how-card">

            <span>01</span>

            <h3>
              Register
            </h3>

            <p>
              Create your JanaRaksha account
              and access your citizen dashboard.
            </p>

          </article>


          <article className="landing-how-card">

            <span>02</span>

            <h3>
              Raise Your Concern
            </h3>

            <p>
              Submit your complaint with the
              relevant incident and supporting
              information.
            </p>

          </article>


          <article className="landing-how-card">

            <span>03</span>

            <h3>
              Track Progress
            </h3>

            <p>
              Follow the status of your complaint
              through a transparent tracking system.
            </p>

          </article>

        </div>

      </section>


      {/* =========================
          FAQ
      ========================= */}

      <section
        id="faq"
        className="landing-faq-section"
      >

        <div className="landing-section-heading">

          <p className="landing-eyebrow">
            FAQ
          </p>

          <h2>
            Frequently Asked Questions
          </h2>

          <div className="landing-title-line center" />

        </div>


        <div className="landing-faq-list">

          <details>

            <summary>
              What is JanaRaksha?
            </summary>

            <p>
              JanaRaksha is a digital platform
              that helps citizens raise concerns,
              receive guidance and track their
              complaints transparently.
            </p>

          </details>


          <details>

            <summary>
              How do I register a complaint?
            </summary>

            <p>
              Create an account, sign in to your
              citizen dashboard and use the
              Register Complaint section to submit
              your concern.
            </p>

          </details>


          <details>

            <summary>
              Can I track my complaint?
            </summary>

            <p>
              Yes. Submitted complaints can be
              monitored through the Complaint Track
              section of your dashboard.
            </p>

          </details>

        </div>

      </section>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="landing-footer">

        <div className="landing-footer-main">


          {/* BRAND */}

          <div className="landing-footer-brand">

            <Link
              href="/"
              className="landing-brand"
              aria-label="JanaRaksha Home"
            >

              <Image
                src="/images/JanaRaksha-logo.svg"
                alt="JanaRaksha"
                width={260}
                height={70}
                className="landing-logo landing-footer-logo"
              />

            </Link>

            <p>
              A unified digital platform for
              guidance, complaints, tracking
              and support. Empowering citizens.
              Strengthening justice.
            </p>

          </div>


          {/* PLATFORM */}

          <div className="landing-footer-column">

            <h3>
              PLATFORM
            </h3>

            <a href="#about">
              About JanaRaksha
            </a>

            <a href="#how-it-works">
              How It Works
            </a>

            <a href="#about">
              Our Approach
            </a>

            <a href="#home">
              Citizen Charter
            </a>

          </div>


          {/* RESOURCES */}

          <div className="landing-footer-column">

            <h3>
              RESOURCES
            </h3>

            <a href="#faq">
              FAQ
            </a>

            <a href="#faq">
              Help & Support
            </a>

            <a href="#faq">
              Safety Tips
            </a>

            <a href="#faq">
              Guidelines
            </a>

          </div>


          {/* COMPANY */}

          <div className="landing-footer-column">

            <h3>
              COMPANY
            </h3>

            <a href="#about">
              About Us
            </a>

            <a href="#about">
              Our Team
            </a>

            <a href="#faq">
              Contact Us
            </a>

            <a href="#faq">
              Careers
            </a>

          </div>


          {/* LEGAL */}

          <div className="landing-footer-column">

            <h3>
              LEGAL
            </h3>

            <a href="#faq">
              Privacy Policy
            </a>

            <a href="#faq">
              Terms of Service
            </a>

            <a href="#faq">
              Disclaimer
            </a>

            <a href="#faq">
              Refund Policy
            </a>

          </div>

        </div>


        {/* FOOTER BOTTOM */}

        <div className="landing-footer-bottom">

          <span>
            © 2026 JanaRaksha. All rights reserved.
          </span>

          <span>
            Made with <b>♥</b> in India 🇮🇳
          </span>

        </div>

      </footer>

    </main>
  );
}