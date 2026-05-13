import { useEffect, useRef } from "react";

const CR = "220,20,60"; // crimson
const c = (a: number) => `rgba(${CR},${a})`;

export function NeuralMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;

    interface Node {
      bx: number; by: number; // base grid position
      ox: number; oy: number; // current offset
      size: number;
      pulsePhase: number;
      active: boolean;
    }

    let nodes: Node[] = [];

    const COLS = 22;
    const ROWS = 14;
    const MAX_DIST = 130;

    const build = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      nodes = [];
      const colW = W / (COLS - 1);
      const rowH = H / (ROWS - 1);
      for (let r = 0; r < ROWS; r++) {
        for (let col = 0; col < COLS; col++) {
          nodes.push({
            bx: col * colW,
            by: r * rowH,
            ox: 0, oy: 0,
            size: 1.2 + Math.random() * 1.8,
            pulsePhase: Math.random() * Math.PI * 2,
            active: Math.random() < 0.12,
          });
        }
      }
    };

    build();
    window.addEventListener("resize", build);

    // Mouse influence
    let mx = W / 2, my = H / 2;
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    };
    canvas.addEventListener("mousemove", onMove);

    let t = 0;

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, W, H);

      // Subtle dark background
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      ctx.fillRect(0, 0, W, H);

      // Update node positions — wave deformation
      for (const n of nodes) {
        const waveX = Math.sin(n.bx * 0.008 + t * 1.1) * 14;
        const waveY = Math.cos(n.by * 0.010 + t * 0.9 + n.bx * 0.004) * 12;

        // Mouse repulsion (subtle)
        const dx = n.bx - mx;
        const dy = n.by - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repel = Math.max(0, 1 - dist / 180) * 22;
        const angle = Math.atan2(dy, dx);

        n.ox = waveX + Math.cos(angle) * repel;
        n.oy = waveY + Math.sin(angle) * repel;
        n.pulsePhase += 0.018;
      }

      const px = (n: Node) => n.bx + n.ox;
      const py = (n: Node) => n.by + n.oy;

      // Draw edges
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const ax = px(a), ay = py(a);
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = ax - px(b);
          const dy = ay - py(b);
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const alpha = (1 - d / MAX_DIST) * 0.22;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(px(b), py(b));
            ctx.strokeStyle = c(alpha);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const x = px(n), y = py(n);
        const pulse = Math.sin(n.pulsePhase) * 0.5 + 0.5;
        const r = n.size + (n.active ? pulse * 2.5 : 0);
        const alpha = n.active ? 0.55 + pulse * 0.45 : 0.20 + pulse * 0.12;

        // Outer glow for active nodes
        if (n.active) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 7);
          glow.addColorStop(0, c(0.18 * pulse));
          glow.addColorStop(1, c(0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, r * 7, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2);
        ctx.fillStyle = c(alpha);
        ctx.fill();
      }

      // Traveling "signal" pulses along edges — pick a random active node pair each N frames
      if (Math.floor(t * 60) % 90 === 0) {
        const actives = nodes.filter(n => n.active);
        if (actives.length >= 2) {
          const from = actives[Math.floor(Math.random() * actives.length)];
          const to = actives[Math.floor(Math.random() * actives.length)];
          if (from !== to) {
            const grad = ctx.createLinearGradient(px(from), py(from), px(to), py(to));
            grad.addColorStop(0, c(0));
            grad.addColorStop(0.5, c(0.6));
            grad.addColorStop(1, c(0));
            ctx.beginPath();
            ctx.moveTo(px(from), py(from));
            ctx.lineTo(px(to), py(to));
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", build);
      canvas.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 1 }}
    />
  );
}
