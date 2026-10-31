// Lightweight high-performance 2D Canvas particle systems for cinematic coffee rituals

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  rotation?: number;
  vRot?: number;
}

// ──────────────────────────────────────────────────────────
// 1. SECTION 1: GRIND PARTICLES (Cascading Beans & Grounds Shower)
// ──────────────────────────────────────────────────────────
export function createGrindParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setScrubProgress: (_p: number) => {}, destroy: () => {} };

  let animId: number;
  let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
  let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

  // Showering grounds particles
  const grounds: Particle[] = [];
  const maxGrounds = 180;
  for (let i = 0; i < maxGrounds; i++) {
    grounds.push({
      x: width * 0.5 + (Math.random() - 0.5) * 140,
      y: height * 0.52 + Math.random() * (height * 0.35),
      vx: (Math.random() - 0.5) * 1.2,
      vy: 2.5 + Math.random() * 4.5,
      size: 1.2 + Math.random() * 2.4,
      alpha: 0.2 + Math.random() * 0.7,
      color: Math.random() > 0.4 ? '#381c10' : '#4d2817',
    });
  }

  // Tumbling roasted coffee beans
  const beans: Particle[] = [];
  const maxBeans = 14;
  for (let i = 0; i < maxBeans; i++) {
    beans.push({
      x: width * 0.5 + (Math.random() - 0.5) * 120,
      y: height * 0.08 + Math.random() * (height * 0.25),
      vx: (Math.random() - 0.5) * 0.8,
      vy: 1.2 + Math.random() * 2.0,
      size: 10 + Math.random() * 8,
      alpha: 0.85 + Math.random() * 0.15,
      color: '#3d2015',
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.05,
    });
  }

  let scrubProgress = 0;

  function drawBean(b: Particle) {
    if (!ctx) return;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation || 0);
    ctx.globalAlpha = b.alpha;

    // Bean outer oval
    ctx.fillStyle = '#3a1f14';
    ctx.beginPath();
    ctx.ellipse(0, 0, b.size * 0.55, b.size * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Center crease
    ctx.strokeStyle = '#6e3f2b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, -b.size * 0.7);
    ctx.quadraticCurveTo(b.size * 0.2, 0, 0, b.size * 0.7);
    ctx.stroke();

    ctx.restore();
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Grounds shower (active when scrubProgress > 0.3)
    if (scrubProgress > 0.25) {
      const activeIntensity = Math.min(1, (scrubProgress - 0.25) * 2.2);
      grounds.forEach((g) => {
        g.y += g.vy * (0.6 + activeIntensity * 0.8);
        g.x += g.vx;

        // Reset to burr exit point
        if (g.y > height * 0.88) {
          g.y = height * 0.55 + Math.random() * 20;
          g.x = width * 0.5 + (Math.random() - 0.5) * (70 + activeIntensity * 50);
        }

        ctx.fillStyle = g.color;
        ctx.globalAlpha = g.alpha * activeIntensity;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Tumbling beans into hopper (active mainly in first half)
    const beanIntensity = Math.max(0.2, 1 - scrubProgress * 0.7);
    beans.forEach((b) => {
      b.y += b.vy;
      b.x += b.vx;
      if (b.rotation !== undefined && b.vRot !== undefined) {
        b.rotation += b.vRot;
      }

      if (b.y > height * 0.36) {
        b.y = height * 0.05 + Math.random() * 20;
        b.x = width * 0.5 + (Math.random() - 0.5) * 100;
      }

      b.alpha = beanIntensity;
      drawBean(b);
    });

    animId = requestAnimationFrame(render);
  }

  animId = requestAnimationFrame(render);

  const handleResize = () => {
    width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  return {
    setScrubProgress: (p: number) => {
      scrubProgress = p;
    },
    destroy: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    },
  };
}

// ──────────────────────────────────────────────────────────
// 2. SECTION 2: POUR PARTICLES (Stream, Drip, Steam & Ripples)
// ──────────────────────────────────────────────────────────
export function createPourParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setScrubProgress: (_p: number) => {}, destroy: () => {} };

  let animId: number;
  let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
  let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

  // Rising steam wisps
  const steam: Particle[] = [];
  const maxSteam = 40;
  for (let i = 0; i < maxSteam; i++) {
    steam.push({
      x: width * 0.5 + (Math.random() - 0.5) * 160,
      y: height * 0.44 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.5 + Math.random() * 0.9),
      size: 16 + Math.random() * 28,
      alpha: 0.05 + Math.random() * 0.18,
      color: '#ffffff',
    });
  }

  // Liquid drops falling from cone into carafe
  const drops: Particle[] = [];
  for (let i = 0; i < 18; i++) {
    drops.push({
      x: width * 0.5 + (Math.random() - 0.5) * 12,
      y: height * 0.65 + Math.random() * (height * 0.16),
      vx: 0,
      vy: 3.5 + Math.random() * 3.5,
      size: 2.2 + Math.random() * 1.5,
      alpha: 0.75 + Math.random() * 0.25,
      color: '#8b4513',
    });
  }

  let scrubProgress = 0;

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Steam wisps rising
    steam.forEach((s) => {
      s.y += s.vy;
      s.x += s.vx + Math.sin(s.y * 0.02) * 0.3;
      s.size += 0.12;

      if (s.y < height * 0.22 || s.size > 55) {
        s.y = height * 0.46 + Math.random() * 40;
        s.x = width * 0.5 + (Math.random() - 0.5) * 140;
        s.size = 14 + Math.random() * 18;
      }

      ctx.save();
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
      grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha * 0.45})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Dripping coffee drops into carafe
    drops.forEach((d) => {
      d.y += d.vy;
      if (d.y > height * 0.84) {
        d.y = height * 0.64;
        d.x = width * 0.5 + (Math.random() - 0.5) * 10;
      }

      ctx.save();
      ctx.fillStyle = '#6a2d12';
      ctx.globalAlpha = d.alpha;
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.size * 0.6, d.size * 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    animId = requestAnimationFrame(render);
  }

  animId = requestAnimationFrame(render);

  const handleResize = () => {
    width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  return {
    setScrubProgress: (p: number) => {
      scrubProgress = p;
    },
    destroy: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    },
  };
}

// ──────────────────────────────────────────────────────────
// 3. SECTION 3: SIP PARTICLES (Rising Cup Steam & Floating Beans)
// ──────────────────────────────────────────────────────────
export function createSipParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { destroy: () => {} };

  let animId: number;
  let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
  let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

  // Soft translucent steam drifting from the hot cup
  const steam: Particle[] = [];
  const maxSteam = 30;
  for (let i = 0; i < maxSteam; i++) {
    steam.push({
      x: width * 0.5 + (Math.random() - 0.5) * 120,
      y: height * 0.42 + Math.random() * 80,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.4 + Math.random() * 0.7),
      size: 16 + Math.random() * 26,
      alpha: 0.04 + Math.random() * 0.14,
      color: '#ffffff',
    });
  }

  // Floating ambient beans
  const floatingBeans: Particle[] = [
    { x: width * 0.68, y: height * 0.36, vx: 0.15, vy: -0.1, size: 14, alpha: 0.95, color: '#381c10', rotation: 0.4, vRot: 0.005 },
    { x: width * 0.72, y: height * 0.44, vx: -0.1, vy: 0.12, size: 12, alpha: 0.9, color: '#381c10', rotation: -0.3, vRot: -0.004 },
    { x: width * 0.65, y: height * 0.52, vx: 0.12, vy: 0.15, size: 15, alpha: 0.92, color: '#381c10', rotation: 0.6, vRot: 0.003 },
  ];

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Steam wisps
    steam.forEach((s) => {
      s.y += s.vy;
      s.x += s.vx + Math.sin(s.y * 0.015) * 0.25;
      s.size += 0.1;

      if (s.y < height * 0.20 || s.size > 52) {
        s.y = height * 0.44 + Math.random() * 30;
        s.x = width * 0.5 + (Math.random() - 0.5) * 100;
        s.size = 14 + Math.random() * 16;
      }

      ctx.save();
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
      grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    animId = requestAnimationFrame(render);
  }

  animId = requestAnimationFrame(render);

  const handleResize = () => {
    width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  return {
    destroy: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    },
  };
}
