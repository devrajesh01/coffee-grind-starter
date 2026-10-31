'use client';
import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { grindContent as c } from '@/content/coffee';

gsap.registerPlugin(ScrollTrigger, useGSAP);
const beans = Array.from({ length: 16 }, (_, i) => ({ id: i, left: 24 + ((i * 37) % 52), delay: (i % 8) * .055, size: 19 + (i % 4) * 7, rotate: (i * 53) % 180 }));

export default function GrindScene() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top top', end: '+=260%', scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
      tl.fromTo('.grind-machine', { yPercent: 65, scale: .75, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: .65 }, 0)
        .fromTo('.grind-title', { yPercent: 20, opacity: .3 }, { yPercent: 0, opacity: 1, duration: .55 }, 0)
        .to('.grind-machine', { scale: 1.15, yPercent: 12, duration: .6 }, .65)
        .fromTo('.coffee-bean', { y: -350, opacity: 0, rotation: -90 }, { y: 280, opacity: 1, rotation: 420, stagger: .035, duration: .9 }, .75)
        .to('.coffee-bean', { opacity: 0, stagger: .02, duration: .22 }, 1.4)
        .to('.grind-machine', { yPercent: 115, opacity: 0, duration: .5 }, 1.65)
        .to('.grind-title', { yPercent: -55, opacity: 0, duration: .5 }, 1.65)
        .to('.grind-caption', { opacity: 0, duration: .3 }, 1.8);
    }, root);
    return () => ctx.revert();
  }, { scope: root });

  return <section ref={root} className="grind-section" aria-label="Grind coffee animation">
    <header className="grind-header"><a href="#top" className="brand">{c.brand}</a><nav aria-label="Main navigation">{c.nav.map((x: string) => <span key={x}>{x}</span>)}</nav><span className="sign-in">{c.signIn}</span></header>
    <div className="grind-stage"><div className="grind-copy"><p className="grind-eyebrow">{c.eyebrow}</p><h1 className="grind-title">{c.heading}</h1></div>
      <div className="grind-visual" aria-hidden="true"><div className="grind-machine"><Image src="/assets/grinder.svg" alt="" fill priority sizes="(max-width: 768px) 80vw, 480px" /></div>{beans.map(b => <div key={b.id} className="coffee-bean" style={{ left: `${b.left}%`, width: b.size, height: b.size * 1.4, transform: `rotate(${b.rotate}deg)` }}><Image src="/assets/bean.svg" alt="" fill sizes="40px" /></div>)}</div>
      <p className="grind-caption">{c.caption}</p></div><footer className="grind-footer"><span>{c.footer}</span><span>{c.next} ↓</span></footer>
  </section>;
}
