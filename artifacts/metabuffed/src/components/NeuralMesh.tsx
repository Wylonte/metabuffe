import { useEffect, useRef } from "react";

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

    // Wave ribbon definitions — each has phase offset, amplitude, vertical anchor
    const RIBBONS = [
      { yFrac: 0.15, amp: 0.09, speed: 0.28, phase: 0.0, alpha: 0.18, thick: 120 },
      { yFrac: 0.32, amp: 0.11, speed: 0.22, phase: 1.4, alpha: 0.14, thick: 160 },
      { yFrac: 0.50, amp: 0.13, speed: 0.17, phase: 2.8, alpha: 0.20, thick: 200 },
      { yFrac: 0.68, amp: 0.10, speed: 0.24, phase: 4.1, alpha: 0.15, thick: 150 },
      { yFrac: 0.85, amp: 0.08, speed: 0.31, phase: 5.6, alpha: 0.12, thick: 110 },
    ];

    // Energy stream particles following the wave contour
    interface Particle {
      ribbonIdx: number;
      progress: number; // 0..1 across screen width
      speed: number;
      yJitter: number;
      size: number;
      alpha: number;
    }
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      ribbonIdx: Math.floor(Math.random() * RIBBONS.length),
      progress: Math.random(),
      speed: 0.0006 + Math.random() * 0.0012,
      yJitter: (Math.random() - 0.5) * 60,
      size: 1.2 + Math.random() * 2.2,
      alpha: 0.35 + Math.random() * 0.55,
    }));

    let t = 0;

    // Wave y-position at a given x for a ribbon
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

      // Clear with deep black
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      // Central deep crimson radial glow — pulses subtly
      const pulse = Math.sin(t * 0.4) * 0.08 + 0.92;
      const cx = W * 0.5, cy = H * 0.48;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.65 * pulse);
      grd.addColorStop(0, "rgba(160,5,20,0.18)");
      grd.addColorStop(0.4, "rgba(120,0,15,0.10)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Draw wave ribbons
      for (const rb of RIBBONS) {
        const steps = Math.ceil(W / 4);
        const dx = W / steps;

        // Build top and bottom path of the ribbon
        ctx.beginPath();
        let firstX = 0;
        let firstY = waveY(rb, 0, t);
        ctx.moveTo(firstX, firstY - rb.thick / 2);

        // Forward pass (top edge)
        for (let i = 1; i <= steps; i++) {
          const x = i * dx;
          const y = waveY(rb, x, t);
          ctx.lineTo(x, y - rb.thick / 2);
        }
        // Backward pass (bottom edge)
        for (let i = steps; i >= 0; i--) {
          const x = i * dx;
          const y = waveY(rb, x, t);
          ctx.lineTo(x, y + rb.thick / 2);
        }
        ctx.closePath();

        // Crimson gradient fill across ribbon height
        const sampleY = waveY(rb, W / 2, t);
        const ribbonGrad = ctx.createLinearGradient(0, sampleY - rb.thick / 2, 0, sampleY + rb.thick / 2);
        ribbonGrad.addColorStop(0, `rgba(150,5,18,0)`);
        ribbonGrad.addColorStop(0.35, `rgba(185,8,25,${rb.alpha})`);
        ribbonGrad.addColorStop(0.5, `rgba(210,14,35,${rb.alpha * 1.5})`);
        ribbonGrad.addColorStop(0.65, `rgba(185,8,25,${rb.alpha})`);
        ribbonGrad.addColorStop(1, `rgba(150,5,18,0)`);

        ctx.fillStyle = ribbonGrad;
        ctx.fill();

        // Bright core line along the wave crest
        ctx.beginPath();
        ctx.moveTo(0, waveY(rb, 0, t));
        for (let i = 1; i <= steps; i++) {
          const x = i * dx;
          ctx.lineTo(x, waveY(rb, x, t));
        }
        ctx.strokeStyle = `rgba(220,20,40,${rb.alpha * 1.8})`;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = "rgba(200,10,30,0.8)";
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Energy particles riding the waves
      for (const p of particles) {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const rb = RIBBONS[p.ribbonIdx];
        const x = p.progress * W;
        const y = waveY(rb, x, t) + p.yJitter;

        // Glow halo
        const glowR = p.size * 5;
        const glowGrd = ctx.createRadialGradient(x, y, 0, x, y, glowR);
        glowGrd.addColorStop(0, `rgba(220,20,40,${p.alpha * 0.5})`);
        glowGrd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glowGrd;
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,60,70,${p.alpha})`;
        ctx.fill();
      }

      // Horizontal scan energy line — slow drift
      const scanY = ((t * 28) % H);
      const scanGrad = ctx.createLinearGradient(0, scanY - 1, 0, scanY + 1);
      scanGrad.addColorStop(0, "rgba(0,0,0,0)");
      scanGrad.addColorStop(0.5, "rgba(200,15,30,0.07)");
      scanGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 40, W, 80);

      // Dark vignette overlay — keeps edges and text area dark
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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
