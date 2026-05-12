import { useEffect, useRef } from "react";

const NEON = "220,20,60";
const BLUE = "0,180,255";
const WHITE = "255,255,255";

function rgba(rgb: string, a: number) {
  return `rgba(${rgb},${Math.max(0, Math.min(1, a))})`;
}

interface Ring {
  x: number;
  y: number;
  r: number;
  maxR: number;
  speed: number;
  width: number;
  color: string;
  opacity: number;
}

interface WaveFront {
  x: number;
  speed: number;
  color: string;
  opacity: number;
  width: number;
  height: number;
}

interface Arc {
  x1: number; y1: number;
  x2: number; y2: number;
  progress: number;
  speed: number;
  opacity: number;
  color: string;
  segments: { cx: number; cy: number }[];
}

interface Orb {
  x: number;
  y: number;
  r: number;
  pulsePhase: number;
  color: string;
}

export function ShockwaveAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const rings: Ring[] = [];
    const waveFronts: WaveFront[] = [];
    const arcs: Arc[] = [];
    const orbs: Orb[] = [];

    // Seed some permanent orbs (energy nodes)
    const seedOrbs = () => {
      orbs.length = 0;
      const W = canvas.width, H = canvas.height;
      const colors = [NEON, BLUE, WHITE];
      for (let i = 0; i < 8; i++) {
        orbs.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 3 + Math.random() * 4,
          pulsePhase: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };
    seedOrbs();
    window.addEventListener("resize", seedOrbs);

    function spawnRing(x?: number, y?: number) {
      const W = canvas.width, H = canvas.height;
      const colors = [NEON, NEON, BLUE, WHITE];
      const c = colors[Math.floor(Math.random() * colors.length)];
      const cx = x ?? Math.random() * W;
      const cy = y ?? Math.random() * H;
      const maxR = 120 + Math.random() * 250;
      // spawn 2-3 concentric rings with slight delays via different starting radii
      for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
        rings.push({
          x: cx, y: cy,
          r: i * 18,
          maxR: maxR + i * 30,
          speed: 2.5 + Math.random() * 2 - i * 0.3,
          width: 1.5 - i * 0.3,
          color: c,
          opacity: 0.8 - i * 0.15,
        });
      }
    }

    function spawnWaveFront() {
      const H = canvas.height;
      const colors = [NEON, BLUE];
      waveFronts.push({
        x: -60,
        speed: 2.5 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.35 + Math.random() * 0.25,
        width: 2 + Math.random() * 3,
        height: H,
      });
    }

    function spawnArc() {
      const W = canvas.width, H = canvas.height;
      const from = orbs[Math.floor(Math.random() * orbs.length)];
      const to = orbs[Math.floor(Math.random() * orbs.length)];
      if (!from || !to || from === to) return;
      // Generate jagged lightning path
      const segCount = 6 + Math.floor(Math.random() * 6);
      const segments = [];
      for (let i = 1; i < segCount; i++) {
        const t = i / segCount;
        const bx = from.x + (to.x - from.x) * t;
        const by = from.y + (to.y - from.y) * t;
        const jitter = (Math.random() - 0.5) * 80;
        const angle = Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 2;
        segments.push({ cx: bx + Math.cos(angle) * jitter, cy: by + Math.sin(angle) * jitter });
      }
      arcs.push({
        x1: from.x, y1: from.y,
        x2: to.x, y2: to.y,
        progress: 0,
        speed: 0.04 + Math.random() * 0.04,
        opacity: 0.7 + Math.random() * 0.3,
        color: Math.random() > 0.4 ? NEON : BLUE,
        segments,
      });
    }

    // Spawn schedule
    let frameCount = 0;
    let nextRing = 0;
    let nextWave = 0;
    let nextArc = 0;

    const draw = () => {
      frameCount++;
      const W = canvas.width;
      const H = canvas.height;

      // Spawn
      if (frameCount >= nextRing) {
        spawnRing();
        nextRing = frameCount + 40 + Math.floor(Math.random() * 60);
      }
      if (frameCount >= nextWave) {
        spawnWaveFront();
        nextWave = frameCount + 120 + Math.floor(Math.random() * 180);
      }
      if (frameCount >= nextArc) {
        spawnArc();
        nextArc = frameCount + 60 + Math.floor(Math.random() * 80);
      }

      // Fade trail
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, 0, W, H);

      // --- Rings ---
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.r += ring.speed;
        const progress = ring.r / ring.maxR;
        const a = ring.opacity * (1 - progress);

        ctx.save();
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, Math.max(0, ring.r), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ring.color, a);
        ctx.lineWidth = ring.width * (1 - progress * 0.5);
        ctx.shadowColor = rgba(ring.color, a * 0.8);
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.restore();

        if (ring.r >= ring.maxR) rings.splice(i, 1);
      }

      // --- Wave fronts ---
      for (let i = waveFronts.length - 1; i >= 0; i--) {
        const wf = waveFronts[i];
        wf.x += wf.speed;

        ctx.save();
        // Main line
        const grad = ctx.createLinearGradient(wf.x - 40, 0, wf.x + 40, 0);
        grad.addColorStop(0, rgba(wf.color, 0));
        grad.addColorStop(0.4, rgba(wf.color, wf.opacity * 0.4));
        grad.addColorStop(0.5, rgba(wf.color, wf.opacity));
        grad.addColorStop(0.6, rgba(wf.color, wf.opacity * 0.4));
        grad.addColorStop(1, rgba(wf.color, 0));
        ctx.fillStyle = grad;
        ctx.fillRect(wf.x - 40, 0, 80, H);

        // Leading edge glow
        ctx.beginPath();
        ctx.moveTo(wf.x, 0);
        ctx.lineTo(wf.x, H);
        ctx.strokeStyle = rgba(wf.color, wf.opacity * 0.9);
        ctx.lineWidth = wf.width;
        ctx.shadowColor = rgba(wf.color, 0.8);
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.restore();

        if (wf.x > W + 80) waveFronts.splice(i, 1);
      }

      // --- Lightning arcs ---
      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i];
        arc.progress += arc.speed;
        const a = arc.opacity * Math.sin(arc.progress * Math.PI);

        if (a > 0.05) {
          const pts = [
            { cx: arc.x1, cy: arc.y1 },
            ...arc.segments,
            { cx: arc.x2, cy: arc.y2 },
          ];
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pts[0].cx, pts[0].cy);
          for (let j = 1; j < pts.length; j++) {
            ctx.lineTo(pts[j].cx, pts[j].cy);
          }
          ctx.strokeStyle = rgba(arc.color, a);
          ctx.lineWidth = 1.5;
          ctx.shadowColor = rgba(arc.color, a);
          ctx.shadowBlur = 12;
          ctx.stroke();

          // White core
          ctx.beginPath();
          ctx.moveTo(pts[0].cx, pts[0].cy);
          for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j].cx, pts[j].cy);
          ctx.strokeStyle = rgba(WHITE, a * 0.4);
          ctx.lineWidth = 0.5;
          ctx.shadowBlur = 0;
          ctx.stroke();
          ctx.restore();
        }

        if (arc.progress >= 1) arcs.splice(i, 1);
      }

      // --- Orbs ---
      for (const orb of orbs) {
        orb.pulsePhase += 0.025;
        const pulse = Math.sin(orb.pulsePhase) * 0.5 + 0.5;
        const r = orb.r + pulse * 3;

        // Outer glow
        const grd = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 8);
        grd.addColorStop(0, rgba(orb.color, 0.25 * pulse));
        grd.addColorStop(1, rgba(orb.color, 0));
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 8, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, Math.max(0.1, r), 0, Math.PI * 2);
        ctx.fillStyle = rgba(orb.color, 0.7 + pulse * 0.3);
        ctx.shadowColor = rgba(orb.color, 0.9);
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Horizontal wave distortion lines (subtle)
      if (frameCount % 3 === 0) {
        const y = Math.random() * H;
        const lineW = 100 + Math.random() * 300;
        const startX = Math.random() * (W - lineW);
        ctx.save();
        const lg = ctx.createLinearGradient(startX, 0, startX + lineW, 0);
        lg.addColorStop(0, rgba(NEON, 0));
        lg.addColorStop(0.5, rgba(NEON, 0.08));
        lg.addColorStop(1, rgba(NEON, 0));
        ctx.fillStyle = lg;
        ctx.fillRect(startX, y, lineW, 1);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", seedOrbs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}
