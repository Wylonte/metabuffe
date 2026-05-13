import { useEffect, useRef } from "react";

// Ebooks page bg: concentric radar rings + scanning beam + scattered sparks
// Feels like: AI scanning/targeting gameplay footage

const R = "220,20,40";
const c = (a: number) => `rgba(${R},${a})`;

export function CrimsonPulse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

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

    interface Ring { r: number; maxR: number; alpha: number; speed: number }
    const rings: Ring[] = [];
    let t = 0;

    // Spawn rings periodically
    let nextRing = 0;

    // Floating ember particles
    const embers = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: -0.0002 - Math.random() * 0.0004,
      size: 1 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      t += 0.014;
      const W = canvas.width;
      const H = canvas.height;
      const cx = W * 0.62;
      const cy = H * 0.48;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      // Deep glow origin
      const pulse = Math.sin(t * 0.5) * 0.08 + 0.92;
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.55 * pulse);
      bg.addColorStop(0, c(0.14));
      bg.addColorStop(0.45, c(0.05));
      bg.addColorStop(1, c(0));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Spawn ring
      if (t > nextRing) {
        rings.push({ r: 0, maxR: Math.min(W, H) * (0.35 + Math.random() * 0.3), alpha: 0.55, speed: 1.2 + Math.random() * 1.4 });
        nextRing = t + 1.2 + Math.random() * 0.8;
      }

      // Draw and update rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const rg = rings[i];
        rg.r += rg.speed;
        const prog = rg.r / rg.maxR;
        const a = rg.alpha * (1 - prog) * (1 - prog);

        ctx.beginPath();
        ctx.arc(cx, cy, rg.r, 0, Math.PI * 2);
        ctx.strokeStyle = c(a);
        ctx.lineWidth = 1.5 * (1 - prog * 0.7);
        ctx.shadowColor = c(a * 0.6);
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner bright ring at 30% radius
        if (rg.r < rg.maxR * 0.3) {
          ctx.beginPath();
          ctx.arc(cx, cy, rg.r * 0.4, 0, Math.PI * 2);
          ctx.strokeStyle = c(a * 0.5);
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        if (rg.r >= rg.maxR) rings.splice(i, 1);
      }

      // Rotating scan beam (like radar)
      const beamAngle = t * 0.6;
      const beamLen = Math.min(W, H) * 0.45;
      const beamGrad = ctx.createLinearGradient(
        cx, cy,
        cx + Math.cos(beamAngle) * beamLen,
        cy + Math.sin(beamAngle) * beamLen
      );
      beamGrad.addColorStop(0, c(0.25));
      beamGrad.addColorStop(0.6, c(0.08));
      beamGrad.addColorStop(1, c(0));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, beamLen, beamAngle - 0.35, beamAngle, false);
      ctx.closePath();
      ctx.fillStyle = beamGrad;
      ctx.fill();
      ctx.restore();

      // Cross-hair tick marks on the largest ring
      const tickR = Math.min(W, H) * 0.28;
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + t * 0.08;
        const inner = tickR - (i % 3 === 0 ? 10 : 5);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner);
        ctx.lineTo(cx + Math.cos(ang) * tickR, cy + Math.sin(ang) * tickR);
        ctx.strokeStyle = c(0.18);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Ember particles
      for (const e of embers) {
        e.x += e.vx;
        e.y += e.vy;
        e.phase += 0.02;
        if (e.y < -0.05) { e.y = 1.05; e.x = Math.random(); }
        if (e.x < 0 || e.x > 1) e.vx *= -1;

        const px = e.x * W;
        const py = e.y * H + Math.sin(e.phase) * 8;
        const flicker = Math.sin(e.phase * 1.7) * 0.15 + 0.85;

        ctx.beginPath();
        ctx.arc(px, py, e.size, 0, Math.PI * 2);
        ctx.fillStyle = c(e.alpha * flicker);
        ctx.fill();
      }

      // Dark left vignette so text stays readable
      const vig = ctx.createLinearGradient(0, 0, W, 0);
      vig.addColorStop(0, "rgba(0,0,0,0.75)");
      vig.addColorStop(0.35, "rgba(0,0,0,0.3)");
      vig.addColorStop(0.65, "rgba(0,0,0,0.1)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // Top/bottom fade
      const topFade = ctx.createLinearGradient(0, 0, 0, H * 0.3);
      topFade.addColorStop(0, "rgba(0,0,0,0.8)");
      topFade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topFade;
      ctx.fillRect(0, 0, W, H * 0.3);

      const botFade = ctx.createLinearGradient(0, H * 0.7, 0, H);
      botFade.addColorStop(0, "rgba(0,0,0,0)");
      botFade.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = botFade;
      ctx.fillRect(0, H * 0.7, W, H * 0.3);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
