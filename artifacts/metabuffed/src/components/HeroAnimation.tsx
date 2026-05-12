import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  opacity: number;
  size: number;
  fromNode: number;
  toNode: number;
  progress: number;
}

interface DataStream {
  x: number;
  y: number;
  value: string;
  speed: number;
  opacity: number;
  size: number;
}

const NEON = "#39FF14";
const NEON_DIM = "rgba(57,255,20,";

const LABELS = ["IQ", "ATK", "DEF", "SPD", "RNG", "META", "LAG", "KD", "WR%", "ELO", "MMR", "STA"];

export function HeroAnimation() {
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

    const nodeCount = 18;
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 3 + 2,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.02,
    }));

    const particles: Particle[] = Array.from({ length: 25 }, () => {
      const from = Math.floor(Math.random() * nodeCount);
      let to = Math.floor(Math.random() * nodeCount);
      while (to === from) to = Math.floor(Math.random() * nodeCount);
      return { x: 0, y: 0, speed: 0.004 + Math.random() * 0.008, opacity: 0.6 + Math.random() * 0.4, size: 2 + Math.random() * 2, fromNode: from, toNode: to, progress: Math.random() };
    });

    const streams: DataStream[] = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      value: LABELS[Math.floor(Math.random() * LABELS.length)],
      speed: 0.3 + Math.random() * 0.5,
      opacity: 0.15 + Math.random() * 0.25,
      size: 9 + Math.random() * 5,
    }));

    let scanY = 0;
    let frame = 0;

    const draw = () => {
      frame++;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Dark base
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, W, H);

      // Moving scan line
      scanY = (scanY + 0.6) % H;
      const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      scanGrad.addColorStop(0, "transparent");
      scanGrad.addColorStop(0.5, NEON_DIM + "0.06)");
      scanGrad.addColorStop(1, "transparent");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 40, W, 80);

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulsePhase += n.pulseSpeed;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      // Draw edges between close nodes
      const maxDist = W * 0.28;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = NEON_DIM + alpha + ")";
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particles along edges
      for (const p of particles) {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.fromNode = p.toNode;
          p.toNode = Math.floor(Math.random() * nodeCount);
          while (p.toNode === p.fromNode) p.toNode = Math.floor(Math.random() * nodeCount);
        }
        const from = nodes[p.fromNode];
        const to = nodes[p.toNode];
        p.x = from.x + (to.x - from.x) * p.progress;
        p.y = from.y + (to.y - from.y) * p.progress;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = NEON_DIM + p.opacity + ")";
        ctx.fill();

        // Glow trail
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        grd.addColorStop(0, NEON_DIM + (p.opacity * 0.4) + ")");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw nodes
      for (const n of nodes) {
        const pulse = Math.sin(n.pulsePhase) * 0.5 + 0.5;
        const r = n.radius + pulse * 2;

        // Glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 6);
        grd.addColorStop(0, NEON_DIM + (0.3 + pulse * 0.2) + ")");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 6, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = NEON_DIM + (0.6 + pulse * 0.4) + ")";
        ctx.fill();
      }

      // Floating data labels
      for (const s of streams) {
        s.y -= s.speed;
        if (s.y < -20) {
          s.y = H + 20;
          s.x = Math.random() * W;
          s.value = LABELS[Math.floor(Math.random() * LABELS.length)];
        }
        ctx.font = `bold ${s.size}px monospace`;
        ctx.fillStyle = NEON_DIM + s.opacity + ")";
        ctx.fillText(s.value, s.x, s.y);
      }

      // Corner HUD brackets
      const bSize = 24;
      const bGap = 18;
      ctx.strokeStyle = NEON_DIM + "0.4)";
      ctx.lineWidth = 1.5;
      // Top-left
      ctx.beginPath(); ctx.moveTo(bGap, bGap + bSize); ctx.lineTo(bGap, bGap); ctx.lineTo(bGap + bSize, bGap); ctx.stroke();
      // Top-right
      ctx.beginPath(); ctx.moveTo(W - bGap, bGap + bSize); ctx.lineTo(W - bGap, bGap); ctx.lineTo(W - bGap - bSize, bGap); ctx.stroke();
      // Bottom-left
      ctx.beginPath(); ctx.moveTo(bGap, H - bGap - bSize); ctx.lineTo(bGap, H - bGap); ctx.lineTo(bGap + bSize, H - bGap); ctx.stroke();
      // Bottom-right
      ctx.beginPath(); ctx.moveTo(W - bGap, H - bGap - bSize); ctx.lineTo(W - bGap, H - bGap); ctx.lineTo(W - bGap - bSize, H - bGap); ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.85 }}
    />
  );
}
