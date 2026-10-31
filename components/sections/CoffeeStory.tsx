'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { coffeeProfiles, siteContent } from '@/content/coffee';
import AudioToggle, { audioController } from '@/components/ui/AudioToggle';
import Modals from '@/components/ui/Modals';
import {
  createGrindParticles,
  createPourParticles,
  createSipParticles,
} from '@/components/canvas/ritualEffects';
import { MessageSquare, ChevronRight, ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function CoffeeStory() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Section Refs
  const grindSectionRef = useRef<HTMLElement>(null);
  const pourSectionRef = useRef<HTMLElement>(null);
  const sipSectionRef = useRef<HTMLElement>(null);

  // Canvas Refs for Real-time Particle Physics
  const grindCanvasRef = useRef<HTMLCanvasElement>(null);
  const pourCanvasRef = useRef<HTMLCanvasElement>(null);
  const sipCanvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState(0); // 0 = GRIND, 1 = POUR, 2 = SIP
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  // Mouse parallax state
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const activeProfile = coffeeProfiles[activeProfileIndex];

  // Mouse movement parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      setMouseOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle Profile Selection
  const handleSelectProfile = (index: number) => {
    setActiveProfileIndex(index);
    if (audioController) {
      audioController.playChime();
    }
  };

  // Smooth scroll directly to a section
  const scrollToSection = (sectionIndex: number) => {
    const targetRef =
      sectionIndex === 0
        ? grindSectionRef.current
        : sectionIndex === 1
        ? pourSectionRef.current
        : sipSectionRef.current;

    if (targetRef) {
      const top = targetRef.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top,
        behavior: 'smooth',
      });
    }
  };

  // GSAP Animations and Particle Systems
  useGSAP(
    () => {
      // 1. Initialize Canvas Particle Systems
      let grindCleanup = () => {};
      let pourCleanup = () => {};
      let sipCleanup = () => {};

      if (grindCanvasRef.current) {
        const gp = createGrindParticles(grindCanvasRef.current);
        grindCleanup = () => gp.destroy();
      }
      if (pourCanvasRef.current) {
        const pp = createPourParticles(pourCanvasRef.current);
        pourCleanup = () => pp.destroy();
      }
      if (sipCanvasRef.current) {
        const sp = createSipParticles(sipCanvasRef.current);
        sipCleanup = () => sp.destroy();
      }

      // ──────────────────────────────────────────
      // SECTION 1: GRIND ANIMATION SCRUB
      // ──────────────────────────────────────────
      if (grindSectionRef.current) {
        const tlGrind = gsap.timeline({
          scrollTrigger: {
            trigger: grindSectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            onEnter: () => setCurrentSection(0),
            onEnterBack: () => setCurrentSection(0),
            onUpdate: (self) => {
              if (self.progress > 0.4 && audioController && Math.random() < 0.05) {
                audioController.playGrind();
              }
            },
          },
        });

        // Exploded view cross-fade and scale expansion
        tlGrind
          .to('.grinder-view--assembled', { opacity: 0, scale: 0.94, duration: 1.2 }, 0.2)
          .fromTo(
            '.grinder-view--exploded',
            { opacity: 0, scale: 0.92 },
            { opacity: 1, scale: 1.04, duration: 1.2 },
            0.2
          )
          .to('.grind-powder-shower', { opacity: 1, y: 15, duration: 0.8 }, 0.5)
          .to('.display-title--grind', { letterSpacing: '0.04em', y: -20, duration: 1.5 }, 0.1);
      }

      // ──────────────────────────────────────────
      // SECTION 2: POUR ANIMATION SCRUB
      // ──────────────────────────────────────────
      if (pourSectionRef.current) {
        const tlPour = gsap.timeline({
          scrollTrigger: {
            trigger: pourSectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            onEnter: () => setCurrentSection(1),
            onEnterBack: () => setCurrentSection(1),
            onUpdate: (self) => {
              if (self.progress > 0.2 && audioController && Math.random() < 0.04) {
                audioController.playPour();
              }
            },
          },
        });

        tlPour
          .fromTo(
            '.pourover-visual-stage',
            { scale: 0.94, y: 30, opacity: 0.8 },
            { scale: 1.02, y: 0, opacity: 1, duration: 1.2 },
            0
          )
          .to('.display-title--pour', { letterSpacing: '0.02em', y: -15, duration: 1.5 }, 0.1);
      }

      // ──────────────────────────────────────────
      // SECTION 3: SIP / FIND YOUR CUP ANIMATION
      // ──────────────────────────────────────────
      if (sipSectionRef.current) {
        const tlSip = gsap.timeline({
          scrollTrigger: {
            trigger: sipSectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            onEnter: () => setCurrentSection(2),
            onEnterBack: () => setCurrentSection(2),
          },
        });

        tlSip
          .fromTo(
            '.ceramic-mug-stage',
            { scale: 0.9, y: 25 },
            { scale: 1.04, y: 0, duration: 1.2, ease: 'power2.out' },
            0
          )
          .fromTo(
            '.find-your-cup-header',
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.8 },
            0.2
          )
          .fromTo(
            '.floating-card--origin',
            { opacity: 0, x: -35, y: -10 },
            { opacity: 1, x: 0, y: 0, duration: 0.9, ease: 'power2.out' },
            0.3
          )
          .fromTo(
            '.floating-card--roast',
            { opacity: 0, x: -35, y: 15 },
            { opacity: 1, x: 0, y: 0, duration: 0.9, ease: 'power2.out' },
            0.4
          )
          .fromTo(
            '.floating-card--flavor',
            { opacity: 0, x: 35, y: 10 },
            { opacity: 1, x: 0, y: 0, duration: 0.9, ease: 'power2.out' },
            0.4
          )
          .fromTo(
            '.cup-pagination',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.7 },
            0.5
          );
      }

      // Global Scroll Progress Listener
      const updateProgress = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          setScrollProgress(Math.min(1, Math.max(0, window.scrollY / totalHeight)));
        }
      };
      window.addEventListener('scroll', updateProgress, { passive: true });

      // Keyboard navigation
      const handleKeyDown = (e: KeyboardEvent) => {
        if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
          e.preventDefault();
          window.scrollBy({ top: window.innerHeight * 0.65, behavior: 'smooth' });
        } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
          e.preventDefault();
          window.scrollBy({ top: -window.innerHeight * 0.65, behavior: 'smooth' });
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        grindCleanup();
        pourCleanup();
        sipCleanup();
        window.removeEventListener('scroll', updateProgress);
        window.removeEventListener('keydown', handleKeyDown);
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="cinematic-ritual-site" id="story-root">
      {/* 1. TOP REAL-TIME SCROLL PROGRESS BAR */}
      <div
        className="coffee-scroll-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* 2. FIXED CINEMATIC NAVIGATION HEADER */}
      <header className="cinematic-header">
        <div className="header-left">
          <button
            onClick={() => scrollToSection(0)}
            className="site-brand brand-btn"
            aria-label="Back to top"
          >
            {siteContent.brand}
          </button>
        </div>

        <nav className="header-center">
          <button
            onClick={() => scrollToSection(0)}
            className={`nav-link-btn ${currentSection === 0 ? 'active' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection(0)}
            className={`nav-link-btn ${currentSection === 0 ? 'active' : ''}`}
          >
            Ritual
          </button>
          <button
            onClick={() => scrollToSection(1)}
            className={`nav-link-btn ${currentSection === 1 ? 'active' : ''}`}
          >
            Pour Station
          </button>
          <button
            onClick={() => scrollToSection(2)}
            className={`nav-link-btn ${currentSection === 2 ? 'active' : ''}`}
          >
            Origins
          </button>
          <button onClick={() => setIsChatOpen(true)} className="nav-link-btn">
            Guide
          </button>
        </nav>

        <div className="header-right">
          <AudioToggle />
          <button
            onClick={() => setIsSignUpOpen(true)}
            className="signup-pill-btn"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
          SECTION 1: GRIND (Tumbling Beans -> Mechanical Exploded Burr & Powder)
      ────────────────────────────────────────────────────────── */}
      <section
        ref={grindSectionRef}
        id="grind"
        className="ritual-section ritual-section--grind"
        data-index="0"
        aria-label="Section 1 Grind"
      >
        <div className="section-sticky-viewport">
          {/* Background Typography */}
          <div className="display-typography-container" aria-hidden="true">
            <h1 className="display-title display-title--grind">
              <span className="char">G</span>
              <span className="char">R</span>
              <span className="char-spacer" aria-hidden="true" />
              <span className="char">I</span>
              <span className="char">N</span>
              <span className="char">D</span>
            </h1>
          </div>

          {/* Section Eyebrow Label */}
          <div className="scene-label scene-label--grind">
            <span className="eyebrow-text">SECTION 1 — GRIND</span>
            <h2 className="scene-micro-title">GRIND</h2>
          </div>

          {/* Grinder Center Visual Stage */}
          <div
            className="grinder-visual-stage"
            style={{
              transform: `translate3d(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.3}px, 0)`,
            }}
          >
            {/* Layer 1: Assembled Precision Grinder with cascading beans */}
            <div className="grinder-view grinder-view--assembled">
              <Image
                src="/assets/grinder-assembled.jpg"
                alt="Precision coffee grinder assembled with whole beans tumbling into hopper"
                fill
                priority
                className="ritual-stage-image"
                sizes="(max-width: 1200px) 90vw, 750px"
              />
            </div>

            {/* Layer 2: Exploded Grinder with conical burrs and grounds shower */}
            <div className="grinder-view grinder-view--exploded">
              <Image
                src="/assets/grinder-exploded.jpg"
                alt="Exploded precision coffee burr grinder with conical burrs and showering fresh coffee powder"
                fill
                className="ritual-stage-image"
                sizes="(max-width: 1200px) 90vw, 750px"
              />
            </div>

            {/* Particle Canvas for Dynamic Falling Beans and Fine Powder */}
            <canvas ref={grindCanvasRef} className="ritual-particle-canvas" aria-hidden="true" />
          </div>

          {/* Scroll Cue Hint */}
          <div className="scroll-hint-pill">
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown size={14} className="bounce-arrow" />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 2: POUR (Steaming Gooseneck Kettle -> V60 Bloom & Carafe Stream)
      ────────────────────────────────────────────────────────── */}
      <section
        ref={pourSectionRef}
        id="pour"
        className="ritual-section ritual-section--pour"
        data-index="1"
        aria-label="Section 2 Pour"
      >
        <div className="section-sticky-viewport">
          {/* Background Typography */}
          <div className="display-typography-container" aria-hidden="true">
            <h2 className="display-title display-title--pour">
              <span className="char">P</span>
              <span className="char">O</span>
              <span className="char-spacer pour-spacer" aria-hidden="true" />
              <span className="char">U</span>
              <span className="char">R</span>
            </h2>
          </div>

          {/* Section Eyebrow Label */}
          <div className="scene-label scene-label--pour">
            <span className="eyebrow-text">SECTION 2 — POUR</span>
            <h3 className="scene-micro-title">POUR</h3>
          </div>

          {/* Pour-Over Station Center Visual Stage */}
          <div
            className="pourover-visual-stage"
            style={{
              transform: `translate3d(${mouseOffset.x * 0.35}px, ${mouseOffset.y * 0.25}px, 0)`,
            }}
          >
            <div className="pourover-image-wrapper">
              <Image
                src="/assets/pourover-station.jpg"
                alt="Artisanal pour over coffee brewing with gooseneck kettle pouring hot water into V60 dripper"
                fill
                className="ritual-stage-image"
                sizes="(max-width: 1200px) 92vw, 850px"
              />
            </div>

            {/* Particle Canvas for Rising Steam Wisps and Coffee Droplets */}
            <canvas ref={pourCanvasRef} className="ritual-particle-canvas" aria-hidden="true" />
          </div>

          <div className="section-status-caption">
            <span>WATER AT 204°F · GENTLE CONCENTRIC POUR</span>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 3: SIP / FIND YOUR CUP (Natural Artisan Mug & Floating Cards)
      ────────────────────────────────────────────────────────── */}
      <section
        ref={sipSectionRef}
        id="sip"
        className="ritual-section ritual-section--sip"
        data-index="2"
        aria-label="Section 3 Sip"
      >
        <div className="section-sticky-viewport">
          {/* Top Header: FIND YOUR CUP */}
          <div className="find-your-cup-header">
            <h2 className="cup-title">FIND YOUR CUP</h2>
            <div className="title-underline" />
          </div>

          {/* Background Typography: GR on left, SIP on right */}
          <div className="display-typography-container" aria-hidden="true">
            <div className="display-title display-title--sip">
              <span className="char">G</span>
              <span className="char">R</span>
              <span className="char-spacer" aria-hidden="true" />
              <span className="char">S</span>
              <span className="char">I</span>
              <span className="char">P</span>
            </div>
          </div>

          {/* Section Eyebrow Label */}
          <div className="scene-label scene-label--sip">
            <span className="eyebrow-text">SECTION 3 — SIP</span>
          </div>

          {/* Natural Artisan Ceramic Mug Centerpiece */}
          <div
            className="ceramic-mug-stage"
            style={{
              transform: `translate3d(${mouseOffset.x * 0.3}px, ${mouseOffset.y * 0.2}px, 0)`,
            }}
          >
            <div className="ceramic-mug-image-wrapper">
              <Image
                src="/assets/ceramic-mug-natural.jpg"
                alt="Natural handcrafted two-tone ceramic coffee mug with hazelnut crema and delicate steam"
                fill
                className="ritual-stage-image mug-main-image"
                sizes="(max-width: 1200px) 85vw, 680px"
              />
              {/* Subtle dynamic profile glaze tint */}
              <div
                className="cup-profile-tint-overlay"
                style={{
                  backgroundColor: `#${activeProfile.cupColor.toString(16).padStart(6, '0')}`,
                }}
              />
            </div>

            {/* Particle Canvas for Rising Steam Wisps from Mug */}
            <canvas ref={sipCanvasRef} className="ritual-particle-canvas" aria-hidden="true" />
          </div>

          {/* Floating Glassmorphic Cards Layer */}
          <div className="floating-cards-layer">
            {/* Card 1: ORIGIN */}
            <aside className="floating-card floating-card--origin" aria-label="Coffee Origin">
              <div className="card-top-row">
                <span className="card-category">ORIGIN</span>
                <div className="card-micro-icon">✓</div>
              </div>
              <strong className="card-main-title">{activeProfile.name}</strong>
              <span className="card-detail">{activeProfile.origin.region}</span>
              <div className="card-origin-footer">
                <div className="mini-bag-icon">
                  <div className="bag-crease" />
                </div>
                <div className="origin-specs">
                  <small>{activeProfile.origin.altitude}</small>
                  <small>{activeProfile.origin.process}</small>
                </div>
              </div>
            </aside>

            {/* Card 2: ROAST */}
            <aside className="floating-card floating-card--roast" aria-label="Roast Profile">
              <div className="card-top-row">
                <span className="card-category">ROAST</span>
                <span className="temp-badge">{activeProfile.roast.temp}</span>
              </div>
              <strong className="card-main-title">{activeProfile.roast.level}</strong>
              <p className="card-desc">{activeProfile.roast.description}</p>
              <div className="roast-action-row">
                <button onClick={() => setIsChatOpen(true)} className="roast-pill-btn">
                  See Profile
                </button>
                <div className="intensity-meter">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <span
                      key={lvl}
                      className={`meter-bar ${lvl <= activeProfile.roast.intensity ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </aside>

            {/* Card 3: FLAVOR NOTES */}
            <aside className="floating-card floating-card--flavor" aria-label="Flavor Notes">
              <div className="card-top-row">
                <span className="card-category">FLAVOR NOTES</span>
              </div>
              <strong className="card-main-title">{activeProfile.flavor.primary}</strong>
              <div className="flavor-chips">
                {activeProfile.flavor.notes.map((note) => (
                  <span key={note} className="flavor-chip">
                    {note}
                  </span>
                ))}
              </div>
              <div className="taste-attributes">
                <div className="attribute-line">
                  <span>Acidity:</span>
                  <strong>{activeProfile.flavor.acidity}</strong>
                </div>
                <div className="attribute-line">
                  <span>Body:</span>
                  <strong>{activeProfile.flavor.body}</strong>
                </div>
              </div>
            </aside>

            {/* 4-Dot Interactive Cup Selector */}
            <div className="cup-pagination" aria-label="Choose coffee profile">
              {coffeeProfiles.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProfile(idx)}
                  className={`pagination-dot ${idx === activeProfileIndex ? 'active' : ''}`}
                  title={p.name}
                  aria-label={`Select ${p.name}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          GLOBAL CHROME (FLOATING CONTROLS & FOOTER STATUS)
      ────────────────────────────────────────────────────────── */}
      {/* Right Floating Skip Arrow Button */}
      <button
        onClick={() => scrollToSection((currentSection + 1) % 3)}
        className="section-next-arrow-btn"
        aria-label="Next Section"
        title="Next ritual step"
      >
        <ChevronRight size={18} />
      </button>

      {/* Bottom Corner Floating Barista Assistant Trigger */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="floating-chat-trigger"
        aria-label="Open Barista Tasting Guide"
        title="Barista Tasting Guide"
      >
        <div className="chat-icon-wrapper">
          <MessageSquare size={19} className="chat-svg" />
          <span className="notification-badge">1</span>
        </div>
      </button>

      {/* Fixed Footer Status Bar */}
      <footer className="cinematic-footer">
        <div className="footer-left">
          <div className="section-step-indicator">
            <button
              onClick={() => scrollToSection(0)}
              className={`indicator-btn ${currentSection === 0 ? 'active' : ''}`}
            >
              01 GRIND
            </button>
            <span className="indicator-sep">·</span>
            <button
              onClick={() => scrollToSection(1)}
              className={`indicator-btn ${currentSection === 1 ? 'active' : ''}`}
            >
              02 POUR
            </button>
            <span className="indicator-sep">·</span>
            <button
              onClick={() => scrollToSection(2)}
              className={`indicator-btn ${currentSection === 2 ? 'active' : ''}`}
            >
              03 SIP
            </button>
          </div>
        </div>

        <div className="footer-center">
          <span className="footer-status-text">CRAFTED FOR THE MORNING RITUAL</span>
        </div>

        <div className="footer-right">
          <span className="scroll-guide-label">
            {currentSection === 0
              ? 'BEANS TUMBLE · BURRS EXPLODE'
              : currentSection === 1
              ? 'WATER STREAMS · AMBER BLOOM'
              : 'HANDCRAFTED MUG · SAVOR NOTES'}
          </span>
        </div>
      </footer>

      {/* Interactive Modals (Barista Drawer & Sign Up) */}
      <Modals
        activeProfileIndex={activeProfileIndex}
        onSelectProfile={handleSelectProfile}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        isSignUpOpen={isSignUpOpen}
        setIsSignUpOpen={setIsSignUpOpen}
      />
    </div>
  );
}
