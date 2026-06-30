import { useEffect, useRef } from "react";

// ─── Coaching callout definitions ─────────────────────────────────────────────
// Each fires at `at` seconds within the 20s loop, lasts `dur` seconds.
// x/y are 0–1 normalized over the canvas (right half = gameplay area).
// anchor: which side the pill appears on relative to the dot.

interface Callout {
  at: number;
  dur: number;
  text: string;
  color: string;
  x: number;
  y: number;
  anchor: "left" | "right";
}

const CALLOUTS: Callout[] = [
  // Fight Night Champion moments
  { at: 0.8,  dur: 1.6, text: "Counter Window",   color: "#FFD432", x: 0.72, y: 0.36, anchor: "left"  },
  { at: 3.2,  dur: 1.5, text: "Good Distance",    color: "#60B8FF", x: 0.65, y: 0.50, anchor: "right" },
  { at: 5.5,  dur: 1.4, text: "Pressure Incoming",color: "#FF9B40", x: 0.78, y: 0.42, anchor: "left"  },
  { at: 7.6,  dur: 1.6, text: "Good Timing",      color: "#FFD432", x: 0.68, y: 0.32, anchor: "right" },
  { at: 9.8,  dur: 1.5, text: "Counter Landed",   color: "#50DC8C", x: 0.73, y: 0.46, anchor: "left"  },
  { at: 11.8, dur: 1.4, text: "Clean Counter",    color: "#50DC8C", x: 0.63, y: 0.40, anchor: "right" },
  { at: 13.5, dur: 1.6, text: "Successful Slip",  color: "#A78BFA", x: 0.76, y: 0.54, anchor: "left"  },
  { at: 15.4, dur: 1.5, text: "Well Defended",    color: "#60B8FF", x: 0.66, y: 0.44, anchor: "right" },
  { at: 17.6, dur: 1.4, text: "Good Decision",    color: "#FFD432", x: 0.71, y: 0.38, anchor: "left"  },
];

const LOOP = 20; // seconds

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function calloutAlpha(phase: number, at: number, dur: number): number {
  if (phase < at || phase > at + dur) return 0;
  const p = (phase - at) / dur;
  const fadeT = 0.18;
  if (p < fadeT) return easeInOut(p / fadeT);
  if (p > 1 - fadeT) return easeInOut((1 - p) / fadeT);
  return 1;
}

// ─── Draw a single callout ────────────────────────────────────────────────────
function drawCallout(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  c: Callout,
  alpha: number,
) {
  if (alpha <= 0) return;

  const cx = c.x * W;
  const cy = c.y * H;
  const dotR = 4;
  const lineLen = 28;
  const dir = c.anchor === "left" ? -1 : 1;

  ctx.save();
  ctx.globalAlpha = alpha;

  // ── glow dot
  ctx.beginPath();
  ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
  ctx.fillStyle = c.color;
  ctx.shadowColor = c.color;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  // ── connector line
  const lineEndX = cx + dir * lineLen;
  ctx.beginPath();
  ctx.moveTo(cx + dir * dotR, cy);
  ctx.lineTo(lineEndX, cy);
  ctx.strokeStyle = c.color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = alpha * 0.6;
  ctx.stroke();

  // ── text pill
  ctx.font = "600 10px 'SF Mono','Fira Code','Courier New',monospace";
  const tw = ctx.measureText(c.text).width;
  const pH = 22, pPad = 10;
  const pW = tw + pPad * 2;
  const px = c.anchor === "left" ? lineEndX - pW : lineEndX;
  const py = cy - pH / 2;

  // background
  ctx.globalAlpha = alpha * 0.93;
  ctx.fillStyle = "rgba(5,5,10,0.80)";
  ctx.shadowColor = c.color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.roundRect(px, py, pW, pH, 3);
  ctx.fill();
  ctx.shadowBlur = 0;

  // border
  ctx.strokeStyle = c.color;
  ctx.lineWidth = 0.7;
  ctx.globalAlpha = alpha * 0.55;
  ctx.stroke();

  // text
  ctx.globalAlpha = alpha;
  ctx.fillStyle = c.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.shadowColor = c.color;
  ctx.shadowBlur = 4;
  ctx.fillText(c.text, px + pPad, cy);

  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────
export function VideoAnalysisCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Sync canvas resolution on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;

    const draw = () => {
      t += 1 / 60;
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      ctx.clearRect(0, 0, W, H);

      const phase = t % LOOP;

      for (const c of CALLOUTS) {
        const alpha = calloutAlpha(phase, c.at, c.dur);
        if (alpha > 0) drawCallout(ctx, W, H, c, alpha);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <>
      {/* Telestration canvas — covers the full hero section */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 8 }}
      />

      {/* AI badge — top left */}
      <div
        className="absolute top-[88px] left-6 flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/[0.07] rounded-md px-3 py-1.5"
        style={{ zIndex: 9 }}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#60B8FF] opacity-50" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#60B8FF] shadow-[0_0_5px_rgba(96,184,255,0.8)]" />
        </span>
        <span className="text-[9px] font-mono text-zinc-400 tracking-[0.18em] uppercase">AI Coaching Active</span>
      </div>
    </>
  );
}
