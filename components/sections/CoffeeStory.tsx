'use client';

import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  coffeeProfiles,
  siteContent
} from '@/content/coffee';
import {
  createGrinderModel,
  createBeansAndGrounds,
  createPourModel,
  createCupModel,
} from '@/components/canvas/models';
import AudioToggle, { audioController } from '@/components/ui/AudioToggle';
import Modals from '@/components/ui/Modals';
import { MessageSquare, ChevronRight, Menu, ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function CoffeeStory() {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active coffee profile state
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState(0); // 0 = GRIND, 1 = POUR, 2 = SIP
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  // References for dynamic 3D updates
  const cupMaterialsRef = useRef<{
    clayMat: THREE.MeshStandardMaterial;
    glazeMat: THREE.MeshStandardMaterial;
  } | null>(null);

  // Parallax target angles
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });

  const activeProfile = coffeeProfiles[activeProfileIndex];

  // Handle Profile Switch
  const handleSelectProfile = (index: number) => {
    setActiveProfileIndex(index);
    const profile = coffeeProfiles[index];
    if (cupMaterialsRef.current) {
      gsap.to(cupMaterialsRef.current.clayMat.color, {
        r: ((profile.cupColor >> 16) & 255) / 255,
        g: ((profile.cupColor >> 8) & 255) / 255,
        b: (profile.cupColor & 255) / 255,
        duration: 0.6,
        ease: 'power2.out',
      });
      gsap.to(cupMaterialsRef.current.glazeMat.color, {
        r: ((profile.lipColor >> 16) & 255) / 255,
        g: ((profile.lipColor >> 8) & 255) / 255,
        b: (profile.lipColor & 255) / 255,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
    if (audioController) {
      audioController.playChime();
    }
  };

  // Scroll to chapter helper (maps 0, 1, 2 directly to track position)
  const scrollToChapter = (chapterIndex: number) => {
    if (!trackRef.current) return;
    const trackTop = trackRef.current.offsetTop;
    const trackHeight = trackRef.current.offsetHeight - window.innerHeight;
    const targetRatio = chapterIndex === 0 ? 0.0 : chapterIndex === 1 ? 0.50 : 0.90;
    const targetY = trackTop + trackHeight * targetRatio;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  // Mouse move parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseTarget.current = { x: x * 0.08, y: y * 0.06 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useGSAP(() => {
    const canvasElement = canvasRef.current;
    const rootElement = containerRef.current;
    const trackElement = trackRef.current;
    if (!canvasElement || !rootElement || !trackElement) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasElement,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      rootElement.classList.add('webgl-fallback');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.05, 11.2);

    // Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xfffbf2, 0x8a7a6c, 1.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3e2, 3.4);
    keyLight.position.set(-3.5, 6.5, 7.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe5f0ff, 1.8);
    rimLight.position.set(5.5, 2.0, 4.0);
    scene.add(rimLight);

    const warmFill = new THREE.PointLight(0xffd1a4, 1.2, 14);
    warmFill.position.set(0, -2, 4);
    scene.add(warmFill);

    // 1. Grinder Assembly
    const grinderData = createGrinderModel();
    scene.add(grinderData.group);

    // Beans and Grounds Shower
    const { beansGroup, beans, groundsParticles } = createBeansAndGrounds();
    scene.add(beansGroup);
    scene.add(groundsParticles);

    // 2. Pour-over Set
    const pourData = createPourModel();
    pourData.group.scale.setScalar(0.001);
    pourData.group.position.set(0, 0, 0);
    scene.add(pourData.group);

    // 3. Ceramic Cup
    const cupData = createCupModel(activeProfile.cupColor, activeProfile.lipColor);
    cupMaterialsRef.current = {
      clayMat: cupData.clayMat,
      glazeMat: cupData.glazeMat,
    };
    cupData.group.scale.setScalar(0.001);
    cupData.group.position.set(0, -0.22, 0);
    scene.add(cupData.group);

    // Responsive camera framing
    const handleResize = () => {
      const width = rootElement.clientWidth;
      const height = rootElement.clientHeight;
      camera.aspect = width / height;
      camera.position.z = width < 768 ? 13.8 : 11.2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      ScrollTrigger.refresh();
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation & Parallax Render Loop
    let animId = 0;
    let clock = new THREE.Clock();

    const render = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.06;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.06;
      camera.position.x = mouseCurrent.current.x * 2.5;
      camera.position.y = 0.05 + mouseCurrent.current.y * 2.0;
      camera.lookAt(0, 0, 0);

      // Idle rotations & subtle alive motions
      if (groundsParticles.visible && (groundsParticles.material as THREE.PointsMaterial).opacity > 0.01) {
        groundsParticles.rotation.y += delta * 0.4;
      }

      // Steam gentle drift
      pourData.steamParticles.forEach((sp, i) => {
        sp.position.y += delta * (0.2 + (i % 3) * 0.1);
        sp.position.x += Math.sin(elapsedTime * 2 + i) * 0.002;
        if (sp.position.y > 1.6) {
          sp.position.y = 0.65;
        }
      });

      // Liquid surface ripple rotation in cup
      cupData.liquidMesh.rotation.z += delta * 0.15;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };
    render();

    // GSAP ScrollTrigger Timeline (normalized across 10 seconds of scrub)
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power1.inOut' } });

    // ───────────────────────────────────────────
    // SCENE 1: GRIND (0.0 -> 3.5s)
    // ───────────────────────────────────────────
    tl
      // Initial state
      .fromTo('.display-title--grind', { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 1.0 }, 0)
      .fromTo('.scene-label--grind', { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0)

      // Whole beans cascade down into hopper
      .to(beans.map((b) => b.position), {
        y: (i) => 1.35 + (i % 4) * 0.08,
        x: (i) => Math.cos(i) * 0.14,
        z: (i) => Math.sin(i) * 0.14,
        stagger: 0.04,
        duration: 1.8,
        ease: 'power2.in',
      }, 0.2)

      // Exploded View: Outer shells separate outwards (matching frame_02.8s.jpg)
      .to(grinderData.leftShell.position, { x: -1.5, z: -0.15, duration: 1.5 }, 1.8)
      .to(grinderData.leftShell.rotation, { y: 0.28, duration: 1.5 }, 1.8)
      .to(grinderData.rightShell.position, { x: 1.5, z: -0.15, duration: 1.5 }, 1.8)
      .to(grinderData.rightShell.rotation, { y: -0.28, duration: 1.5 }, 1.8)

      // Hopper lifts upward
      .to(grinderData.hopperGroup.position, { y: 1.95, duration: 1.5 }, 1.8)

      // Conical burr spins and reveals cutting flutes
      .to(grinderData.burrCore.rotation, { y: Math.PI * 4, duration: 1.6 }, 1.9)
      .to(grinderData.burrCore.position, { y: -0.05, duration: 1.5 }, 1.8)

      // Grounds particle shower activates
      .to(groundsParticles.material as THREE.PointsMaterial, { opacity: 0.95, duration: 0.6 }, 2.2)
      .to(groundsParticles.position, { y: -0.85, duration: 1.4 }, 2.2)

      // ───────────────────────────────────────────
      // TRANSITION 1 -> 2: GRIND TO POUR (3.5 -> 7.0s)
      // ───────────────────────────────────────────
      // Grinder exploded parts fly upward out of view
      .to(grinderData.group.position, { y: 5.2, duration: 1.4, ease: 'power2.in' }, 3.5)
      .to(grinderData.group.scale, { x: 0.55, y: 0.55, z: 0.55, duration: 1.4 }, 3.5)
      .to(beansGroup.position, { y: 5.5, duration: 1.2 }, 3.5)
      .to(groundsParticles.position, { y: -1.8, duration: 1.0 }, 3.5)
      .to(groundsParticles.material as THREE.PointsMaterial, { opacity: 0, duration: 0.6 }, 4.0)

      // Text transition: GRIND fades, POUR arrives
      .to('.display-title--grind', { autoAlpha: 0, y: -50, duration: 0.8 }, 3.5)
      .to('.scene-label--grind', { autoAlpha: 0, duration: 0.6 }, 3.5)
      .fromTo('.display-title--pour', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 4.0)
      .fromTo('.scene-label--pour', { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 4.0)

      // Pour Set enters center stage
      .fromTo(pourData.group.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: 1.4, ease: 'power2.out' }, 3.8)
      .fromTo(pourData.kettle.position, { x: 3.8, y: 1.9 }, { x: 1.65, y: 0.75, duration: 1.4, ease: 'power2.out' }, 4.0)

      // Kettle tilts into pouring angle
      .to(pourData.kettle.rotation, { z: -0.28, duration: 1.1 }, 4.8)

      // Water stream arcs into coffee bed
      .fromTo(pourData.waterStream.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: 0.8, ease: 'power2.out' }, 5.2)

      // Coffee bed blooms and expands
      .to(pourData.bloomMesh.scale, { x: 1.18, z: 1.18, duration: 1.0 }, 5.4)

      // Amber drip flows into carafe; carafe coffee level rises
      .to(pourData.coffeeDrip.scale, { y: 1, duration: 0.8 }, 5.6)
      .to(pourData.liquidFill.scale, { y: 1, duration: 1.2 }, 5.8)

      // Steam wisps drift up
      .to(pourData.steamParticles.map((sp) => (sp.material as THREE.SpriteMaterial)), { opacity: 0.55, stagger: 0.02, duration: 0.8 }, 5.8)

      // ───────────────────────────────────────────
      // TRANSITION 2 -> 3: POUR TO SIP (7.0 -> 10.0s)
      // ───────────────────────────────────────────
      // Pour set finishes and glides out to the left
      .to(pourData.waterStream.scale, { y: 0.001, duration: 0.5 }, 6.8)
      .to(pourData.kettle.rotation, { z: 0, duration: 0.6 }, 6.9)
      .to(pourData.group.position, { x: -4.5, duration: 1.3, ease: 'power2.in' }, 7.1)
      .to(pourData.group.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 1.3 }, 7.1)

      // Text transition: POUR fades, SIP and FIND YOUR CUP arrive
      .to('.display-title--pour', { autoAlpha: 0, y: -50, duration: 0.7 }, 7.0)
      .to('.scene-label--pour', { autoAlpha: 0, duration: 0.5 }, 7.0)
      .fromTo('.display-title--sip', { autoAlpha: 0, scale: 0.88 }, { autoAlpha: 1, scale: 1, duration: 0.9 }, 7.4)
      .fromTo('.find-your-cup-header', { autoAlpha: 0, y: -25 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 7.4)
      .fromTo('.scene-label--sip', { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 7.4)

      // Artisan Ceramic Cup enters center stage
      .fromTo(cupData.group.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1.15, y: 1.15, z: 1.15, duration: 1.4, ease: 'back.out(1.2)' }, 7.3)
      .to(cupData.ripplePlane.material as THREE.MeshStandardMaterial, { opacity: 0.65, duration: 0.7 }, 7.6)
      .to(cupData.ripplePlane.scale, { x: 1.4, y: 1.4, duration: 1.1 }, 7.6)

      // 3 Floating Interactive Cards spring into view
      .fromTo('.floating-card--origin', { autoAlpha: 0, x: -40, y: -15 }, { autoAlpha: 1, x: 0, y: 0, duration: 0.9, ease: 'power2.out' }, 8.0)
      .fromTo('.floating-card--roast', { autoAlpha: 0, x: -40, y: 20 }, { autoAlpha: 1, x: 0, y: 0, duration: 0.9, ease: 'power2.out' }, 8.2)
      .fromTo('.floating-card--flavor', { autoAlpha: 0, x: 40, y: 10 }, { autoAlpha: 1, x: 0, y: 0, duration: 0.9, ease: 'power2.out' }, 8.4)

      // Pagination dots reveal
      .fromTo('.cup-pagination', { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 8.6);

    // ScrollTrigger connected to trackElement
    const st = ScrollTrigger.create({
      trigger: trackElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      onUpdate: (self) => {
        const p = self.progress;
        tl.progress(p);
        setScrollProgress(p);

        if (p < 0.35) {
          setCurrentSection(0);
        } else if (p < 0.70) {
          setCurrentSection(1);
        } else {
          setCurrentSection(2);
        }
      },
    });

    // Keyboard navigation listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.45, behavior: 'smooth' });
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        window.scrollBy({ top: -window.innerHeight * 0.45, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animId);
      st.kill();
      tl.kill();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={trackRef} className="coffee-scroll-track" id="story-track">
      {/* Top Real-time Scroll Progress Bar */}
      <div
        className="coffee-scroll-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* Main Sticky Cinematic Viewport */}
      <section ref={containerRef} className="coffee-cinematic-stage" aria-label="Pour Play Coffee Story">
        {/* 1. TOP NAVIGATION BAR */}
        <header className="cinematic-header">
          <div className="header-left">
            <a href="#story-track" className="site-brand">
              {siteContent.brand}
            </a>
          </div>

          <nav className="header-nav" aria-label="Main Navigation">
            {siteContent.nav.map((item, index) => (
              <button
                key={item.label}
                onClick={() => scrollToChapter(Math.min(index, 2))}
                className={`nav-link ${currentSection === index ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="header-right">
            <AudioToggle />
            <button
              onClick={() => setIsSignUpOpen(true)}
              className="signup-pill-btn"
            >
              {siteContent.signIn}
            </button>
            <button
              className="menu-icon-btn"
              onClick={() => setIsChatOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* 2. THREE.JS WEBGL CANVAS */}
        <canvas ref={canvasRef} className="three-scene-canvas" aria-hidden="true" />

        {/* 3. GIGANTIC DISPLAY TYPOGRAPHY LAYERS */}
        <div className="display-typography-container" aria-hidden="true">
          {/* GRIND Display Title */}
          <div className="display-title display-title--grind">
            <span className="char">G</span>
            <span className="char">R</span>
            <span className="char">I</span>
            <span className="char">N</span>
            <span className="char">D</span>
          </div>

          {/* POUR Display Title */}
          <div className="display-title display-title--pour">
            <span className="char">P</span>
            <span className="char">O</span>
            <span className="char">U</span>
            <span className="char">R</span>
          </div>

          {/* SIP Display Title */}
          <div className="display-title display-title--sip">
            <span className="char">S</span>
            <span className="char">I</span>
            <span className="char">P</span>
          </div>
        </div>

        {/* 4. SECTION METADATA & EYEBROWS */}
        <div className="scene-labels-layer">
          {/* Section 1 Grind */}
          <div className="scene-label scene-label--grind">
            <span className="eyebrow-text">SECTION 1 — GRIND</span>
            <h2 className="scene-micro-title">GRIND</h2>
          </div>

          {/* Section 2 Pour */}
          <div className="scene-label scene-label--pour">
            <span className="eyebrow-text">SECTION 2 — POUR</span>
            <h2 className="scene-micro-title">POUR</h2>
          </div>

          {/* Section 3 Sip / Find Your Cup */}
          <div className="scene-label scene-label--sip">
            <span className="eyebrow-text">SECTION 3 — SIP</span>
          </div>

          <div className="find-your-cup-header">
            <h2 className="cup-title">FIND YOUR CUP</h2>
            <div className="title-underline" />
          </div>
        </div>

        {/* 5. FLOATING INTERACTIVE CARDS IN SCENE 3 (FIND YOUR CUP) */}
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
              <button
                onClick={() => setIsChatOpen(true)}
                className="roast-pill-btn"
              >
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

          {/* Card 3: FLAVOR */}
          <aside className="floating-card floating-card--flavor" aria-label="Flavor Notes">
            <div className="card-top-row">
              <span className="card-category">FLAVOR NOTES</span>
            </div>
            <strong className="card-main-title">{activeProfile.flavor.primary}</strong>
            <div className="flavor-chips">
              {activeProfile.flavor.notes.map((note) => (
                <span key={note} className="flavor-chip">{note}</span>
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

          {/* Cup Pagination Dots */}
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

        {/* 6. RIGHT SKIP ARROW BUTTON */}
        <button
          onClick={() => scrollToChapter((currentSection + 1) % 3)}
          className="section-next-arrow-btn"
          aria-label="Next Section"
          title="Next ritual step"
        >
          <ChevronRight size={18} />
        </button>

        {/* 7. BOTTOM CORNER FLOATING BARISTA CHAT BADGE */}
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

        {/* 8. FOOTER STATUS BAR */}
        <footer className="cinematic-footer">
          <div className="footer-left">
            <div className="section-step-indicator">
              <button
                onClick={() => scrollToChapter(0)}
                className={`indicator-btn ${currentSection === 0 ? 'active' : ''}`}
              >
                01 GRIND
              </button>
              <span className="divider">·</span>
              <button
                onClick={() => scrollToChapter(1)}
                className={`indicator-btn ${currentSection === 1 ? 'active' : ''}`}
              >
                02 POUR
              </button>
              <span className="divider">·</span>
              <button
                onClick={() => scrollToChapter(2)}
                className={`indicator-btn ${currentSection === 2 ? 'active' : ''}`}
              >
                03 SIP
              </button>
            </div>
          </div>

          <div className="footer-center">
            <span className="crafted-text">CRAFTED FOR THE MORNING RITUAL</span>
          </div>

          <div className="footer-right">
            <button
              onClick={() => scrollToChapter((currentSection + 1) % 3)}
              className="scroll-hint-btn"
            >
              <span>SCROLL TO EXPLORE</span>
              <ArrowDown size={13} className="bounce-arrow" />
            </button>
          </div>
        </footer>

        {/* 9. MODALS & DRAWERS */}
        <Modals
          activeProfileIndex={activeProfileIndex}
          onSelectProfile={handleSelectProfile}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          isSignUpOpen={isSignUpOpen}
          setIsSignUpOpen={setIsSignUpOpen}
        />
      </section>
    </div>
  );
}
