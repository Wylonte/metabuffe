import { useEffect, useRef } from "react";

// Home hero bg — multi-color wave ribbons matching MB logo palette
// Colors: orange → pink → magenta → purple → cyan

const RIBBON_COLORS = [
  { r: "255,122,0",   glow: "255,122,0"   }, // orange
  { r: "255,28,139",  glow: "255,28,139"  }, // neon pink
  { r: "255,0,200",   glow: "255,0,200"   }, // magenta
  { r: "155,48,255",  glow: "155,48,255"  }, // purple
  { r: "0,229,255",   glow: "0,229,255"   }, // cyan
];

export function NeuralMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize);

    const RIBBONS = [
      { yFrac: 0.15, amp: 0.09, speed: 0.28, phase: 0.0, alpha: 0.16, thick: 120, colorIdx: 0 },
      { yFrac: 0.32, amp: 0.11, speed: 0.22, phase: 1.4, alpha: 0.13, thick: 160, colorIdx: 1 },
      { yFrac: 0.50, amp: 0.13, speed: 0.17, phase: 2.8, alpha: 0.18, thick: 200, colorIdx: 2 },
      { yFrac: 0.68, amp: 0.10, speed: 0.24, phase: 4.1, alpha: 0.14, thick: 150, colorIdx: 3 },
      { yFrac: 0.85, amp: 0.08, speed: 0.31, phase: 5.6, alpha: 0.12, thick: 110, colorIdx: 4 },
    ];

    interface Particle {
      ribbonIdx: number;
      progress: number;
      speed: number;
      yJitter: number;
      size: number;
      alpha: number;
    }
    const particles: Particle[] = Array.from({ length: 65 }, () => ({
      ribbonIdx: Math.floor(Math.random() * RIBBONS.length),
      progress: Math.random(),
      speed: 0.0006 + Math.random() * 0.0012,
      yJitter: (Math.random() - 0.5) * 60,
      size: 1.2 + Math.random() * 2.2,
      alpha: 0.35 + Math.random() * 0.55,
    }));

    let t = 0;

    const waveY = (rb: typeof RIBBONS[0], x: number, time: number) => {
      const base = rb.yFrac * H;
      return (
        base +
        Math.sin(x * 0.004 + time * rb.speed + rb.phase) * rb.amp * H +
        Math.sin(x * 0.007 - time * rb.speed * 0.6 + rb.phase * 1.3) * rb.amp * H * 0.45 +
        Math.cos(x * 0.0025 + time * rb.speed * 0.4 + rb.phase * 0.7) * rb.amp * H * 0.3
      );
    };

    const draw = () => {
      t += 0.016;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      // Multi-color central glow — pink + purple + cyan
      const pulse = Math.sin(t * 0.4) * 0.08 + 0.92;
      const cx = W * 0.5, cy = H * 0.48;

      const grd1 = ctx.createRadialGradient(cx * 0.6, cy, 0, cx * 0.6, cy, W * 0.5 * pulse);
      grd1.addColorStop(0, "rgba(255,28,139,0.14)");
      grd1.addColorStop(0.5, "rgba(155,48,255,0.07)");
      grd1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd1;
      ctx.fillRect(0, 0, W, H);

      const grd2 = ctx.createRadialGradient(cx * 1.4, cy * 0.6, 0, cx * 1.4, cy * 0.6, W * 0.4 * pulse);
      grd2.addColorStop(0, "rgba(255,122,0,0.10)");
      grd2.addColorStop(0.5, "rgba(255,28,139,0.05)");
      grd2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd2;
      ctx.fillRect(0, 0, W, H);

      const grd3 = ctx.createRadialGradient(cx * 0.3, cy * 1.3, 0, cx * 0.3, cy * 1.3, W * 0.35 * pulse);
      grd3.addColorStop(0, "rgba(0,229,255,0.09)");
      grd3.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd3;
      ctx.fillRect(0, 0, W, H);

      // Wave ribbons
      for (const rb of RIBBONS) {
        const col = RIBBON_COLORS[rb.colorIdx];
        const steps = Math.ceil(W / 4);
        const dx = W / steps;

        ctx.beginPath();
        ctx.moveTo(0, waveY(rb, 0, t) - rb.thick / 2);
        for (let i = 1; i <= steps; i++) ctx.lineTo(i * dx, waveY(rb, i * dx, t) - rb.thick / 2);
        for (let i = steps; i >= 0; i--) ctx.lineTo(i * dx, waveY(rb, i * dx, t) + rb.thick / 2);
        ctx.closePath();

        const sampleY = waveY(rb, W / 2, t);
        const ribbonGrad = ctx.createLinearGradient(0, sampleY - rb.thick / 2, 0, sampleY + rb.thick / 2);
        ribbonGrad.addColorStop(0, `rgba(${col.r},0)`);
        ribbonGrad.addColorStop(0.35, `rgba(${col.r},${rb.alpha})`);
        ribbonGrad.addColorStop(0.5, `rgba(${col.r},${rb.alpha * 1.6})`);
        ribbonGrad.addColorStop(0.65, `rgba(${col.r},${rb.alpha})`);
        ribbonGrad.addColorStop(1, `rgba(${col.r},0)`);

        ctx.fillStyle = ribbonGrad;
        ctx.fill();

        // Bright core line
        ctx.beginPath();
        ctx.moveTo(0, waveY(rb, 0, t));
        for (let i = 1; i <= steps; i++) ctx.lineTo(i * dx, waveY(rb, i * dx, t));
        ctx.strokeStyle = `rgba(${col.r},${rb.alpha * 2})`;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = `rgba(${col.glow},0.9)`;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Particles
      for (const p of particles) {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const rb = RIBBONS[p.ribbonIdx];
        const col = RIBBON_COLORS[rb.colorIdx];
        const x = p.progress * W;
        const y = waveY(rb, x, t) + p.yJitter;

        const glowR = p.size * 5;
        const glowGrd = ctx.createRadialGradient(x, y, 0, x, y, glowR);
        glowGrd.addColorStop(0, `rgba(${col.r},${p.alpha * 0.6})`);
        glowGrd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glowGrd;
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col.r},${p.alpha})`;
        ctx.fill();
      }

      // Cyan scan line
      const scanY = ((t * 28) % H);
      const scanGrad = ctx.createLinearGradient(0, scanY - 1, 0, scanY + 1);
      scanGrad.addColorStop(0, "rgba(0,0,0,0)");
      scanGrad.addColorStop(0.5, "rgba(0,229,255,0.06)");
      scanGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 40, W, 80);

      // Vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, W * 0.75);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.72)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

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
