import { useEffect, useRef } from "react";

// About page bg — purple/cyan organic particle flow
// Palette: purple (#9B30FF), cyan (#00E5FF), neon pink (#FF1C8B)

const STREAM_COLORS = [
  "155,48,255",  // purple
  "0,229,255",   // cyan
  "255,28,139",  // pink
  "155,48,255",  // purple (weighted)
  "0,229,255",   // cyan (weighted)
];

export function CrimsonFlow() {
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

    const flowAngle = (x: number, y: number, t: number) => {
      return (
        Math.sin(x * 0.006 + t * 0.3) * Math.PI +
        Math.cos(y * 0.005 - t * 0.2) * Math.PI * 0.6 +
        Math.sin((x + y) * 0.003 + t * 0.15) * Math.PI * 0.4
      );
    };

    interface StreamParticle {
      x: number; y: number;
      size: number;
      alpha: number;
      speed: number;
      trail: { x: number; y: number }[];
      trailLen: number;
      life: number; maxLife: number;
      colorIdx: number;
    }

    const PARTICLE_COUNT = 55;
    const particles: StreamParticle[] = [];

    const W = () => canvas.width;
    const H = () => canvas.height;

    const spawn = (): StreamParticle => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      size: 1.2 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.5,
      speed: 0.6 + Math.random() * 1.2,
      trail: [],
      trailLen: 8 + Math.floor(Math.random() * 18),
      life: 0,
      maxLife: 200 + Math.floor(Math.random() * 300),
      colorIdx: Math.floor(Math.random() * STREAM_COLORS.length),
    });

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = spawn();
      p.life = Math.floor(Math.random() * p.maxLife);
      particles.push(p);
    }

    let t = 0;

    const draw = () => {
      t += 0.012;
      const w = W(), h = H();

      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, w, h);

      // Multi-color central glow
      const pulse = Math.sin(t * 0.4) * 0.06 + 0.94;

      const grd1 = ctx.createRadialGradient(w * 0.4, h * 0.42, 0, w * 0.4, h * 0.42, w * 0.45 * pulse);
      grd1.addColorStop(0, "rgba(155,48,255,0.09)");
      grd1.addColorStop(0.5, "rgba(155,48,255,0.03)");
      grd1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd1;
      ctx.fillRect(0, 0, w, h);

      const grd2 = ctx.createRadialGradient(w * 0.65, h * 0.55, 0, w * 0.65, h * 0.55, w * 0.35 * pulse);
      grd2.addColorStop(0, "rgba(0,229,255,0.07)");
      grd2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd2;
      ctx.fillRect(0, 0, w, h);

      // Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        const angle = flowAngle(p.x, p.y, t);
        p.x += Math.cos(angle) * p.speed;
        p.y += Math.sin(angle) * p.speed;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.trailLen) p.trail.shift();

        const col = STREAM_COLORS[p.colorIdx];

        if (p.trail.length > 1) {
          for (let j = 1; j < p.trail.length; j++) {
            const progress = j / p.trail.length;
            const lifeRatio = Math.min(p.life / 40, 1) * Math.min((p.maxLife - p.life) / 40, 1);
            const a = p.alpha * progress * progress * lifeRatio;
            ctx.beginPath();
            ctx.moveTo(p.trail[j - 1].x, p.trail[j - 1].y);
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
            ctx.strokeStyle = `rgba(${col},${a})`;
            ctx.lineWidth = p.size * progress;
            ctx.stroke();
          }
        }

        const lifeRatio = Math.min(p.life / 40, 1) * Math.min((p.maxLife - p.life) / 40, 1);
        if (lifeRatio > 0.05) {
          const glowR = p.size * 4;
          const glowGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          glowGrd.addColorStop(0, `rgba(${col},${p.alpha * 0.5 * lifeRatio})`);
          glowGrd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glowGrd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${col},${p.alpha * lifeRatio})`;
          ctx.fill();
        }

        if (p.life >= p.maxLife || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
          particles[i] = spawn();
        }
      }

      // Vignette
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, w * 0.75);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.68)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

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
