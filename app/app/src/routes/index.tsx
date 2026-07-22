import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import CosmicCanvas from "../components/CosmicCanvas";

export const Route = createFileRoute("/")({
  component: CosmicPortal,
});

/* ───────────────────────────────────────────────
   Lenis / GSAP loader (SSR-safe)
   ─────────────────────────────────────────────── */
function useLenisGsap() {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    (async () => {
      const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.8,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.8,
        touchMultiplier: 1.5,
      });

      // Bridge Lenis → GSAP
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time: number) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      // ── Scroll-triggered animations ──

      // Hero parallax
      gsap.to(".hero-stars", {
        scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 1.5 },
        y: 200, scale: 1.1, ease: "none",
      });
      gsap.to(".hero-nebula", {
        scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 1 },
        y: 100, opacity: 0.6, ease: "none",
      });
      gsap.to(".hero-ring", {
        scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 0.8 },
        scale: 0.8, opacity: 0.3, ease: "none",
      });

      // Section reveals
      const revealSections = document.querySelectorAll(".reveal-section");
      revealSections.forEach((section, i) => {
        const children = section.querySelectorAll(".reveal-child");
        gsap.fromTo(
          section,
          { opacity: 0, y: 80 },
          {
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 40%",
              scrub: 1.2,
            },
            opacity: 1, y: 0, ease: "power2.out",
          }
        );
        if (children.length) {
          gsap.fromTo(
            children,
            { opacity: 0, y: 40 },
            {
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "top 30%",
                scrub: 1.5,
              },
              opacity: 1, y: 0, stagger: 0.1, ease: "power2.out",
            }
          );
        }
      });

      // Metrics counter
      const metrics = document.querySelectorAll(".metric-numeral");
      metrics.forEach((el) => {
        const finalText = el.textContent || "";
        const finalNum = parseInt(finalText.replace(/[^0-9]/g, ""), 10);
        if (isNaN(finalNum)) return;
        gsap.fromTo(
          el,
          { textContent: "0" },
          {
            scrollTrigger: {
              trigger: el.closest(".metrics-section"),
              start: "top 85%",
              end: "top 30%",
              scrub: 1.5,
            },
            textContent: finalNum,
            snap: { textContent: 1 },
            ease: "none",
            duration: 2,
          }
        );
      });

      // Timeline steps stagger
      gsap.fromTo(".timeline-step", {
        opacity: 0, x: -60, scale: 0.9,
      }, {
        scrollTrigger: {
          trigger: ".timeline-section",
          start: "top 80%",
          end: "bottom 40%",
          scrub: 1.5,
        },
        opacity: 1, x: 0, scale: 1, stagger: 0.2, ease: "power3.out",
      });

      // CTA hover effects
      document.querySelectorAll(".cta-gateway, .cta-bracket, .cta-orbit").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          gsap.to(el, { scale: 1.03, duration: 0.3, ease: "power2.out" });
        });
        el.addEventListener("mouseleave", () => {
          gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" });
        });
      });

      // Refresh ScrollTrigger after layout settles
      setTimeout(() => ScrollTrigger.refresh(), 500);
    })();
  }, []);
}

/* ───────────────────────────────────────────────
   Particle background (static CSS particles)
   ─────────────────────────────────────────────── */
function ParticleBackground() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${4 + Math.random() * 4}s`,
    size: `${1 + Math.random() * 2}px`,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle-dot"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Main Portal Page
   ─────────────────────────────────────────────── */
function CosmicPortal() {
  useLenisGsap();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true); }, []);

  return (
    <main className="relative min-h-screen bg-cosmos-bg text-cosmos-text overflow-hidden">
      {/* ─── Canvas star field ─── */}
      <CosmicCanvas starCount={500} shootingStarRate={0.004} />
      {loaded && <ParticleBackground />}

      {/* ─── SECTION 1: HERO ─── */}
      <section className="hero-section relative z-10">
        {/* Parallax layers */}
        <div className="hero-stars absolute inset-0">
          <div className="absolute inset-0 opacity-30"
            style={{
              background: "radial-gradient(ellipse at 30% 40%, rgba(0,212,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(99,102,241,0.06) 0%, transparent 50%)",
            }}
          />
        </div>
        <div className="hero-nebula absolute inset-0 flex items-center justify-center opacity-40">
          <div className="w-[600px] h-[600px] rounded-full bg-gradient-radial from-cosmos-accent/10 via-cosmos-violet/5 to-transparent blur-3xl" />
        </div>
        <div className="hero-ring absolute inset-0 flex items-center justify-center">
          <div className="relative w-[400px] h-[400px]">
            <div className="portal-ring" />
            <div className="portal-ring" />
            <div className="portal-ring" />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-medium tracking-[0.2em] uppercase text-cosmos-accent border border-cosmos-accent/30 rounded-full">
              District Robotics
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none mb-6">
            <span className="text-gradient">Digital</span>
            <br />
            <span className="text-white">Cosmos</span>
          </h1>
          <p className="text-lg sm:text-xl text-cosmos-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            A living universe. Powered by{" "}
            <span className="text-cosmos-accent">District Robotics</span>.
            <br />
            <span className="text-sm sm:text-base">Explore, learn, and build across 80+ STEM missions.</span>
          </p>
          <a
            href="https://drev.space"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-gateway"
          >
            Enter the Digital Cosmos
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <span className="text-xs text-cosmos-text-muted/50 tracking-widest uppercase">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-cosmos-accent/50 to-transparent" />
        </div>
      </section>

      {/* ─── SECTION 2: WHAT IS ─── */}
      <section className="cosmos-section relative z-10 py-32 reveal-section">
        <div className="section-inner">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-cosmos-accent mb-4 block reveal-child">
                Explore the Unknown
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6 reveal-child">
                What is the{" "}
                <span className="text-gradient">Digital Cosmos</span>?
              </h2>
              <p className="text-cosmos-text-muted text-base sm:text-lg leading-relaxed mb-6 reveal-child">
                The Digital Cosmos is District Robotics' immersive STEM universe — an interactive space where students and explorers navigate a digital solar system, complete 80+ missions, and earn real ranks.
              </p>
              <p className="text-cosmos-text-muted text-base leading-relaxed reveal-child">
                Powered by real satellite data, neural rendering, and Web7 infrastructure — every planet you visit, every beacon you unlock advances your journey through the cosmos.
              </p>
            </div>
            {/* Cosmic scene plate */}
            <div className="relative reveal-child">
              <div className="glass-card p-8 aspect-[4/3] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                  style={{
                    background: "radial-gradient(circle at 30% 50%, rgba(0,212,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(99,102,241,0.15) 0%, transparent 50%)",
                  }}
                />
                {/* Solar system mini */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cosmos-accent to-cosmos-accent-dim shadow-lg glow-cyan" />
                  <div className="absolute w-32 h-32 rounded-full border border-cosmos-accent/20 animate-[spin_20s_linear_infinite]" />
                  <div className="absolute w-48 h-48 rounded-full border border-cosmos-violet/15 animate-[spin_35s_linear_infinite]" />
                  <div className="absolute w-64 h-64 rounded-full border border-cosmos-accent/10 animate-[spin_50s_linear_infinite_reverse]" />
                  {/* Orbiting dots */}
                  <div className="absolute w-32 h-32 animate-[spin_20s_linear_infinite]">
                    <div className="w-3 h-3 rounded-full bg-cosmos-green absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg" />
                  </div>
                  <div className="absolute w-48 h-48 animate-[spin_35s_linear_infinite]">
                    <div className="w-4 h-4 rounded-full bg-cosmos-accent absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg" />
                  </div>
                  <div className="absolute w-64 h-64 animate-[spin_50s_linear_infinite_reverse]">
                    <div className="w-2 h-2 rounded-full bg-cosmos-violet absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: MISSIONS ─── */}
      <section className="cosmos-section relative z-10 py-32 reveal-section">
        <div className="section-inner">
          <div className="text-center mb-16">
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-cosmos-accent mb-4 block reveal-child">
              Your Journey
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight reveal-child">
              Choose Your{" "}
              <span className="text-gradient">Mission</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Explore */}
            <div className="glass-card p-8 reveal-child group cursor-pointer transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_0_40px_rgba(0,212,255,0.1)]">
              <div className="w-14 h-14 rounded-full bg-cosmos-accent/10 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-cosmos-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Explore</h3>
              <p className="text-cosmos-text-muted text-sm leading-relaxed mb-6">
                Navigate the digital solar system. Click a planet or gold beacon — missions open on an interactive glass card with AI video and instant enrollment.
              </p>
              <a href="https://drev.space/cosmos.html" target="_blank" rel="noopener noreferrer" className="cta-bracket text-sm">
                Explore Missions
              </a>
            </div>

            {/* Card 2: Learn */}
            <div className="glass-card p-8 reveal-child group cursor-pointer transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_0_40px_rgba(99,102,241,0.1)]">
              <div className="w-14 h-14 rounded-full bg-cosmos-violet/10 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-cosmos-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-white">Learn</h3>
              <p className="text-cosmos-text-muted text-sm leading-relaxed mb-6">
                Real STEM curriculum woven into every mission. From orbital mechanics to neural rendering — earn certificates and advance through academy ranks.
              </p>
              <a href="https://drev.space/stem-academy.html" target="_blank" rel="noopener noreferrer" className="cta-bracket text-sm">
                Launch Academy
              </a>
            </div>

            {/* Card 3: Build */}
            <div className="glass-card p-8 reveal-child group cursor-pointer transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_0_40px_rgba(34,197,94,0.1)]">
              <div className="w-14 h-14 rounded-full bg-cosmos-green/10 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-cosmos-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-white">Build</h3>
              <p className="text-cosmos-text-muted text-sm leading-relaxed mb-6">
                Create your path. Build simulations, contribute to open-source space tools, and design your own missions in the Web7 Command OS environment.
              </p>
              <a href="https://drev.space" target="_blank" rel="noopener noreferrer" className="cta-bracket text-sm">
                Build Your Path
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: BY THE NUMBERS ─── */}
      <section className="cosmos-section relative z-10 py-32 metrics-section reveal-section">
        <div className="section-inner text-center">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-cosmos-accent mb-4 block reveal-child">
            By the Numbers
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl mx-auto mt-12">
            <div className="reveal-child">
              <div className="metric-numeral text-gradient">80</div>
              <div className="text-sm text-cosmos-text-muted mt-2 font-body font-medium tracking-wide">Missions</div>
            </div>
            <div className="reveal-child">
              <div className="metric-numeral text-gradient">7</div>
              <div className="text-sm text-cosmos-text-muted mt-2 font-body font-medium tracking-wide">Planets</div>
            </div>
            <div className="reveal-child">
              <div className="metric-numeral text-gradient">1</div>
              <div className="text-sm text-cosmos-text-muted mt-2 font-body font-medium tracking-wide">Universe</div>
            </div>
            <div className="reveal-child">
              <div className="metric-numeral text-gradient">
                <span className="text-4xl sm:text-5xl md:text-6xl">&#8734;</span>
              </div>
              <div className="text-sm text-cosmos-text-muted mt-2 font-body font-medium tracking-wide">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: HOW IT WORKS ─── */}
      <section className="cosmos-section relative z-10 py-32 timeline-section reveal-section">
        <div className="section-inner">
          <div className="text-center mb-20">
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-cosmos-accent mb-4 block reveal-child">
              The Path
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight reveal-child">
              How It <span className="text-gradient">Works</span>
            </h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line (hidden on mobile) */}
            <div className="hidden md:block timeline-line" />

            {/* Step 1 */}
            <div className="timeline-step relative flex flex-col md:flex-row items-start gap-6 md:gap-12 mb-16 md:mb-24">
              <div className="md:w-1/2 md:text-right">
                <div className="glass-card p-6 md:p-8 inline-block w-full md:max-w-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-cosmos-accent/20 flex items-center justify-center font-display font-bold text-cosmos-accent text-sm">01</span>
                    <h3 className="font-display text-lg font-bold">Choose Your Mission</h3>
                  </div>
                  <p className="text-cosmos-text-muted text-sm leading-relaxed">
                    Browse 80+ missions across 7 planets. Each mission is a gateway to new skills, ranks, and cosmic discoveries.
                  </p>
                </div>
              </div>
              <div className="hidden md:flex md:w-12 justify-center">
                <div className="w-4 h-4 rounded-full bg-cosmos-accent shadow-[0_0_15px_rgba(0,212,255,0.5)] shrink-0" />
              </div>
              <div className="md:w-1/2" />
            </div>

            {/* Step 2 */}
            <div className="timeline-step relative flex flex-col md:flex-row items-start gap-6 md:gap-12 mb-16 md:mb-24">
              <div className="hidden md:block md:w-1/2" />
              <div className="hidden md:flex md:w-12 justify-center">
                <div className="w-4 h-4 rounded-full bg-cosmos-violet shadow-[0_0_15px_rgba(99,102,241,0.5)] shrink-0" />
              </div>
              <div className="md:w-1/2">
                <div className="glass-card p-6 md:p-8 inline-block w-full md:max-w-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-cosmos-violet/20 flex items-center justify-center font-display font-bold text-cosmos-violet text-sm">02</span>
                    <h3 className="font-display text-lg font-bold">Launch Into Space</h3>
                  </div>
                  <p className="text-cosmos-text-muted text-sm leading-relaxed">
                    Click a planet or gold beacon. Watch missions open on an interactive glass card with AI video, satellite data, and one-click enrollment.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="timeline-step relative flex flex-col md:flex-row items-start gap-6 md:gap-12">
              <div className="md:w-1/2 md:text-right">
                <div className="glass-card p-6 md:p-8 inline-block w-full md:max-w-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-cosmos-green/20 flex items-center justify-center font-display font-bold text-cosmos-green text-sm">03</span>
                    <h3 className="font-display text-lg font-bold">Earn Your Rank</h3>
                  </div>
                  <p className="text-cosmos-text-muted text-sm leading-relaxed">
                    Complete missions, earn certificates, and advance through ranks — from Cadet to Commander. Your rank opens new missions and tools.
                  </p>
                </div>
              </div>
              <div className="hidden md:flex md:w-12 justify-center">
                <div className="w-4 h-4 rounded-full bg-cosmos-green shadow-[0_0_15px_rgba(34,197,94,0.5)] shrink-0" />
              </div>
              <div className="md:w-1/2" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: LAUNCH PORTAL (CTA) ─── */}
      <section className="cosmos-section relative z-10 py-32 min-h-screen flex items-center reveal-section">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0,212,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.04) 0%, transparent 50%)",
            }}
          />
          {/* Portal rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[500px] h-[500px] sm:w-[600px] sm:h-[600px]">
              <div className="portal-ring" style={{ width: "60%", height: "60%", top: "20%", left: "20%" }} />
              <div className="portal-ring" style={{ width: "80%", height: "80%", top: "10%", left: "10%", animationDelay: "1s" }} />
              <div className="portal-ring" style={{ width: "100%", height: "100%", animationDelay: "2s" }} />
            </div>
          </div>
        </div>

        <div className="relative z-20 text-center px-6 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 reveal-child">
            Step Into the{" "}
            <span className="text-gradient">Digital Cosmos</span>
          </h2>
          <p className="text-cosmos-text-muted text-lg max-w-xl mx-auto mb-12 leading-relaxed reveal-child">
            The universe is waiting. Launch into the full District Robotics platform — explore the cosmos, enroll in missions, and start your journey.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 reveal-child">
            <a
              href="https://drev.space/cosmos.html"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-orbit"
            >
              <span>Enter the Cosmos</span>
              <span className="orbit-ring" />
            </a>
            <a
              href="https://drev.space"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-gateway"
            >
              Visit drev.space
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 py-12 border-t border-cosmos-border">
        <div className="section-inner flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-cosmos-text-muted">
            <span className="font-display font-bold text-white">Digital Cosmos</span> by{" "}
            <a href="https://drev.space" target="_blank" rel="noopener noreferrer" className="text-cosmos-accent hover:text-white transition-colors">
              District Robotics
            </a>
          </div>
          <div className="flex items-center gap-6 text-xs text-cosmos-text-muted">
            <a href="https://drev.space/services.html" target="_blank" rel="noopener noreferrer" className="hover:text-cosmos-accent transition-colors">Services</a>
            <a href="https://drev.space/stem-academy.html" target="_blank" rel="noopener noreferrer" className="hover:text-cosmos-accent transition-colors">STEM Academy</a>
            <a href="https://github.com/DistrictRobotics" target="_blank" rel="noopener noreferrer" className="hover:text-cosmos-accent transition-colors">GitHub</a>
          </div>
          <div className="text-xs text-cosmos-text-muted">
            &copy; {new Date().getFullYear()} District Robotics. Web7 Command OS.
          </div>
        </div>
      </footer>
    </main>
  );
}
