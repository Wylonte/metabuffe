import { useEffect, useRef } from "react";

// Ebooks page bg — neon pink/cyan radar rings + scan beam
// Color palette: neon pink primary, cyan secondary, orange embers

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

    interface Ring { r: number; maxR: number; alpha: number; speed: number; colorIdx: number }
    const rings: Ring[] = [];
    // Alternating ring colors: pink and cyan
    const RING_COLORS = ["255,28,139", "0,229,255", "155,48,255", "255,122,0"];
    let ringCount = 0;
    let t = 0;
    let nextRing = 0;

    const embers = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: -0.0002 - Math.random() * 0.0004,
      size: 1 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      colorIdx: Math.floor(Math.random() * RING_COLORS.length),
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

      // Multi-color central glow
      const pulse = Math.sin(t * 0.5) * 0.08 + 0.92;
      const bg1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.45 * pulse);
      bg1.addColorStop(0, "rgba(255,28,139,0.12)");
      bg1.addColorStop(0.5, "rgba(155,48,255,0.06)");
      bg1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg1;
      ctx.fillRect(0, 0, W, H);

      const bg2 = ctx.createRadialGradient(cx * 0.4, cy * 1.3, 0, cx * 0.4, cy * 1.3, W * 0.3 * pulse);
      bg2.addColorStop(0, "rgba(0,229,255,0.08)");
      bg2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg2;
      ctx.fillRect(0, 0, W, H);

      // Spawn ring
      if (t > nextRing) {
        rings.push({ r: 0, maxR: Math.min(W, H) * (0.35 + Math.random() * 0.3), alpha: 0.5, speed: 1.2 + Math.random() * 1.4, colorIdx: ringCount % RING_COLORS.length });
        ringCount++;
        nextRing = t + 1.2 + Math.random() * 0.8;
      }

      // Draw rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const rg = rings[i];
        rg.r += rg.speed;
        const prog = rg.r / rg.maxR;
        const a = rg.alpha * (1 - prog) * (1 - prog);
        const col = RING_COLORS[rg.colorIdx];

        ctx.beginPath();
        ctx.arc(cx, cy, rg.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${col},${a})`;
        ctx.lineWidth = 1.5 * (1 - prog * 0.7);
        ctx.shadowColor = `rgba(${col},${a * 0.6})`;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (rg.r < rg.maxR * 0.3) {
          ctx.beginPath();
          ctx.arc(cx, cy, rg.r * 0.4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${col},${a * 0.45})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        if (rg.r >= rg.maxR) rings.splice(i, 1);
      }

      // Rotating scan beam — pink to cyan gradient
      const beamAngle = t * 0.6;
      const beamLen = Math.min(W, H) * 0.45;
      const beamEnd = {
        x: cx + Math.cos(beamAngle) * beamLen,
        y: cy + Math.sin(beamAngle) * beamLen,
      };
      const beamGrad = ctx.createLinearGradient(cx, cy, beamEnd.x, beamEnd.y);
      beamGrad.addColorStop(0, "rgba(255,28,139,0.22)");
      beamGrad.addColorStop(0.5, "rgba(155,48,255,0.10)");
      beamGrad.addColorStop(1, "rgba(0,229,255,0.02)");

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, beamLen, beamAngle - 0.35, beamAngle, false);
      ctx.closePath();
      ctx.fillStyle = beamGrad;
      ctx.fill();
      ctx.restore();

      // Tick marks
      const tickR = Math.min(W, H) * 0.28;
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + t * 0.08;
        const inner = tickR - (i % 3 === 0 ? 10 : 5);
        const col = i % 2 === 0 ? "255,28,139" : "0,229,255";
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner);
        ctx.lineTo(cx + Math.cos(ang) * tickR, cy + Math.sin(ang) * tickR);
        ctx.strokeStyle = `rgba(${col},0.15)`;
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
        const col = RING_COLORS[e.colorIdx];

        ctx.beginPath();
        ctx.arc(px, py, e.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${e.alpha * flicker})`;
        ctx.fill();
      }

      // Vignette
      const vig = ctx.createLinearGradient(0, 0, W, 0);
      vig.addColorStop(0, "rgba(0,0,0,0.75)");
      vig.addColorStop(0.35, "rgba(0,0,0,0.3)");
      vig.addColorStop(0.65, "rgba(0,0,0,0.1)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

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
