import { useRef, useState } from "react";
import { siteConfig } from "./siteConfig";

const hats = [
  { name: "Salt", description: "Cool light grey", image: "/assets/hat-silver-belly.png" },
  { name: "Bone", description: "Warm natural beige", image: "/assets/hat-fawn.png" },
  { name: "Fossil", description: "Warm taupe", image: "/assets/hat-camel.png" },
  { name: "Canyon", description: "Deep brown", image: "/assets/hat-dark-brown.png" },
  { name: "Wheat", description: "Golden tan", image: "/assets/hat-tan.png" },
  { name: "Juniper", description: "Moss olive", image: "/assets/hat-dark-green.png" },
  { name: "Black", description: "Soft black", image: "/assets/hat-black.png" },
] as const;

function Arrow({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className={direction === "left" ? "arrow arrow--left" : "arrow"}
      viewBox="0 0 36 18"
    >
      <path d="M1 9h32M26 2l7 7-7 7" />
    </svg>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Salt City Hat Co. home">
        <img src="/assets/salt-city-logo.svg" alt="Salt City Hat Co." />
      </a>

      <nav className={menuOpen ? "site-nav site-nav--open" : "site-nav"} aria-label="Primary">
        {siteConfig.navigation.map((item) => (
          <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-contact">
        <a href={`tel:${siteConfig.phoneNumber}`}>{siteConfig.phoneDisplay}</a>
        <span>Call or text</span>
      </div>

      <button
        className={menuOpen ? "menu-toggle menu-toggle--open" : "menu-toggle"}
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <img
        className="hero__image"
        src="/assets/hero-clean.png"
        alt="A man in a dark Western hat and modern streetwear seated against concrete architecture with the Wasatch mountains behind him"
        fetchPriority="high"
      />
      <div className="hero__wash" />
      <Header />

      <div className="hero__content">
        <h1 id="hero-title" className="hero__title">
          <span>The New</span>
          <span className="accent">Wild West.</span>
        </h1>
        <p className="hero__support">
          Custom Western hats.
          <br />
          Shaped by hand in Utah.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href={`sms:${siteConfig.phoneNumber}`}>
            Make a hat <Arrow />
          </a>
          <a className="button button--secondary" href="#story">
            Our story <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}

function HatColors() {
  const railRef = useRef<HTMLDivElement>(null);

  function scrollRail(direction: number) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.72, behavior: "smooth" });
  }

  return (
    <section className="colors" id="hats" aria-labelledby="colors-title">
      <div className="colors__heading">
        <div>
          <p className="eyebrow">The hats <span aria-hidden="true">—</span> 01</p>
          <h2 id="colors-title">
            Pick your
            <span className="accent">color.</span>
          </h2>
        </div>

        <div className="colors__controls" aria-label="Hat color carousel controls">
          <button type="button" onClick={() => scrollRail(-1)} aria-label="Previous hat colors">
            <Arrow direction="left" />
          </button>
          <button className="colors__next" type="button" onClick={() => scrollRail(1)} aria-label="Next hat colors">
            <Arrow />
          </button>
        </div>
      </div>

      <div className="hat-rail" ref={railRef} tabIndex={0} aria-label="Seven available hat colors">
        {hats.map((hat, index) => {
          const number = String(index + 1).padStart(2, "0");
          return (
            <article className="hat-card" key={hat.name}>
              <span className="hat-card__number" aria-hidden="true">{number}</span>
              <img src={hat.image} alt={`${hat.name} Western felt hat`} loading={index > 2 ? "lazy" : "eager"} />
              <div className="hat-card__meta">
                <h3>{hat.name}</h3>
                <span className="hat-card__rule" />
                <span className="hat-card__description">{hat.description}</span>
              </div>
            </article>
          );
        })}
      </div>

    </section>
  );
}

function Story() {
  return (
    <section className="story" id="story" aria-labelledby="story-title">
      <div className="story__intro">
        <p className="eyebrow">Salt Lake City <span aria-hidden="true">—</span> Utah</p>
        <h2 id="story-title">Born along<br /><span className="accent">the Wasatch.</span></h2>
        <p className="story__copy">
          From the mountains above us to the streets below, the Wasatch Front shapes how we see the West. Every hat is shaped by hand here in Utah—one at a time, for the person who’ll wear it.
        </p>
      </div>
      <figure className="story__image">
        <img src="/assets/story-wasatch.png" alt="The Wasatch Front rising above Salt Lake City and modern concrete architecture" loading="lazy" />
      </figure>
    </section>
  );
}

export default function App() {
  return (
    <main>
      <Hero />
      <Story />
      <HatColors />
    </main>
  );
}
