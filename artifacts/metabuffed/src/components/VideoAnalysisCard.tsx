import { useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Indicator = "zone" | "arc" | "impact" | "arrow-left" | "arrow-right" | "punch-line" | null;

interface Callout {
  at: number;         // seconds into 20s loop
  dur: number;        // display duration in seconds
  text: string;
  color: string;
  x: number;          // 0–1 normalized canvas position of the dot
  y: number;
  anchor: "left" | "right";
  indicator?: Indicator;
}

// ─── Timeline: Madden (0–4s) | NBA 2K (5–10s) | Fight Night (10–16s) ─────────

const CALLOUTS: Callout[] = [
  // ── MADDEN 0:00–0:04 ──────────────────────────────────────────────────
  { at: 0.2,  dur: 1.1, text: "Cover 2 Man",       color: "#60B8FF", x: 0.70, y: 0.22, anchor: "left",  indicator: "zone"       },
  { at: 1.4,  dur: 1.0, text: "Pressure Incoming", color: "#FF9B40", x: 0.64, y: 0.44, anchor: "right", indicator: "arrow-right" },
  { at: 2.6,  dur: 1.0, text: "No Open Read",      color: "#F87171", x: 0.58, y: 0.52, anchor: "right", indicator: null          },
  { at: 3.7,  dur: 1.0, text: "Sack",              color: "#FF5050", x: 0.60, y: 0.50, anchor: "right", indicator: "impact"      },

  // ── NBA 2K 0:05–0:09 ──────────────────────────────────────────────────
  // Shot 1
  { at: 5.1,  dur: 0.9, text: "Shot Analysis",     color: "#60B8FF", x: 0.66, y: 0.52, anchor: "right", indicator: null          },
  { at: 6.1,  dur: 1.0, text: "Slightly Early",    color: "#FFD432", x: 0.66, y: 0.32, anchor: "right", indicator: null          },
  { at: 7.2,  dur: 1.0, text: "Shot Arc",          color: "#A78BFA", x: 0.71, y: 0.16, anchor: "left",  indicator: "arc"         },
  // Shot 2
  { at: 8.4,  dur: 0.9, text: "Shot Analysis",     color: "#60B8FF", x: 0.69, y: 0.52, anchor: "left",  indicator: null          },
  { at: 9.2,  dur: 0.9, text: "Perfect Release",   color: "#50DC8C", x: 0.69, y: 0.30, anchor: "left",  indicator: null          },
  { at: 10.2, dur: 1.0, text: "Shot Arc",          color: "#A78BFA", x: 0.73, y: 0.14, anchor: "left",  indicator: "arc"         },

  // ── FIGHT NIGHT 0:10–0:15 ─────────────────────────────────────────────
  { at: 11.4, dur: 1.0, text: "Punch Blocked",     color: "#60B8FF", x: 0.62, y: 0.40, anchor: "right", indicator: "impact"      },
  { at: 12.5, dur: 1.0, text: "Counter Window",    color: "#FFD432", x: 0.70, y: 0.34, anchor: "left",  indicator: null          },
  { at: 13.5, dur: 1.0, text: "Counter Hook",      color: "#50DC8C", x: 0.76, y: 0.44, anchor: "left",  indicator: "impact"      },
  { at: 14.6, dur: 0.9, text: "Punch Blocked",     color: "#60B8FF", x: 0.63, y: 0.42, anchor: "right", indicator: null          },
  { at: 15.5, dur: 1.0, text: "Lateral Movement",  color: "#A78BFA", x: 0.62, y: 0.54, anchor: "right", indicator: "arrow-left"  },
  { at: 16.5, dur: 0.9, text: "Good Distance",     color: "#60B8FF", x: 0.69, y: 0.46, anchor: "right", indicator: null          },
  { at: 17.4, dur: 0.9, text: "Jab",               color: "#FF9B40", x: 0.74, y: 0.38, anchor: "left",  indicator: "punch-line"  },
];

const LOOP = 20;

// ─── Sport badge timing ───────────────────────────────────────────────────────
function sportLabel(phase: number): { label: string; color: string } | null {
  if (phase < 4.5)  return { label: "MADDEN",       color: "#60B8FF" };
  if (phase < 10.8) return { label: "NBA 2K",        color: "#A78BFA" };
  if (phase < 18.5) return { label: "FIGHT NIGHT",   color: "#FF9B40" };
  return null;
}

// ─── Easing ───────────────────────────────────────────────────────────────────
function ease(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function calloutAlpha(phase: number, at: number, dur: number): number {
  if (phase < at || phase > at + dur) return 0;
  const p = (phase - at) / dur;
  const f = 0.2;
  if (p < f) return ease(p / f);
  if (p > 1 - f) return ease((1 - p) / f);
  return 1;
}

// ─── Indicators ───────────────────────────────────────────────────────────────

function drawZone(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, color: string, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a * 0.10;
  ctx.fillStyle = color;
  ctx.fillRect(cx - w / 2, cy - 14, w, 28);
  ctx.globalAlpha = a * 0.45;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(cx - w / 2, cy - 14, w, 28);
  ctx.restore();
}

function drawArc(ctx: CanvasRenderingContext2D, W: number, H: number, cx: number, cy: number, color: string, a: number) {
  if (a <= 0) return;
  const startX = cx * W + W * 0.04;
  const startY = cy * H + H * 0.32;
  const endX = cx * W - W * 0.04;
  const endY = startY;
  const cpX = cx * W;
  const cpY = cy * H;
  ctx.save();
  ctx.globalAlpha = a * 0.75;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(cpX, cpY, endX, endY);
  ctx.stroke();
  ctx.restore();
}

function drawImpact(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, a: number, t: number) {
  if (a <= 0) return;
  const r = 16 + Math.sin(t * 8) * 3;
  ctx.save();
  ctx.globalAlpha = a * 0.8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = a * 0.15;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawArrow(ctx: CanvasRenderingContext2D, cx: number, cy: number, dir: number, color: string, a: number) {
  if (a <= 0) return;
  const len = 24;
  ctx.save();
  ctx.globalAlpha = a * 0.85;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - dir * len / 2, cy);
  ctx.lineTo(cx + dir * len / 2, cy);
  ctx.stroke();
  const hs = 7;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx + dir * len / 2, cy);
  ctx.lineTo(cx + dir * (len / 2 - hs), cy - hs * 0.55);
  ctx.lineTo(cx + dir * (len / 2 - hs), cy + hs * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPunchLine(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a * 0.7;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([6, 3]);
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(cx - 22, cy + 4);
  ctx.lineTo(cx + 10, cy - 2);
  ctx.stroke();
  ctx.restore();
}

// ─── Callout pill ─────────────────────────────────────────────────────────────

function drawCallout(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  c: Callout,
  alpha: number,
  t: number,
) {
  if (alpha <= 0) return;

  const cx = c.x * W;
  const cy = c.y * H;
  const dir = c.anchor === "left" ? -1 : 1;
  const lineLen = 26;

  // indicator behind the pill
  if (c.indicator === "zone")        drawZone(ctx, cx, cy, W * 0.18, c.color, alpha);
  if (c.indicator === "arc")         drawArc(ctx, W, H, c.x, c.y, c.color, alpha);
  if (c.indicator === "impact")      drawImpact(ctx, cx, cy, c.color, alpha, t);
  if (c.indicator === "arrow-left")  drawArrow(ctx, cx, cy, -1, c.color, alpha);
  if (c.indicator === "arrow-right") drawArrow(ctx, cx, cy, 1, c.color, alpha);
  if (c.indicator === "punch-line")  drawPunchLine(ctx, cx, cy, c.color, alpha);

  ctx.save();
  ctx.globalAlpha = alpha;

  // dot
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = c.color;
  ctx.shadowColor = c.color;
  ctx.shadowBlur = 9;
  ctx.fill();
  ctx.shadowBlur = 0;

  // connector
  const lineEndX = cx + dir * lineLen;
  ctx.beginPath();
  ctx.moveTo(cx + dir * 4, cy);
  ctx.lineTo(lineEndX, cy);
  ctx.strokeStyle = c.color;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = alpha * 0.55;
  ctx.stroke();

  // pill
  ctx.font = "600 9.5px 'SF Mono','Fira Code','Courier New',monospace";
  const tw = ctx.measureText(c.text).width;
  const pH = 20, pPad = 9;
  const pW = tw + pPad * 2;
  const px = c.anchor === "left" ? lineEndX - pW : lineEndX;
  const py = cy - pH / 2;

  ctx.globalAlpha = alpha * 0.92;
  ctx.fillStyle = "rgba(4,4,10,0.82)";
  ctx.shadowColor = c.color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.roundRect(px, py, pW, pH, 3);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = c.color;
  ctx.lineWidth = 0.6;
  ctx.globalAlpha = alpha * 0.5;
  ctx.stroke();

  ctx.globalAlpha = alpha;
  ctx.fillStyle = c.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(c.text, px + pPad, cy);

  ctx.restore();
}

// ─── Sport badge (top-right corner of canvas) ─────────────────────────────────

function drawSportBadge(ctx: CanvasRenderingContext2D, W: number, sport: { label: string; color: string }, phase: number) {
  const sectionStart = sport.label === "MADDEN" ? 0 : sport.label === "NBA 2K" ? 4.5 : 10.8;
  const a = Math.min(1, Math.min((phase - sectionStart) / 0.4, (phase < sectionStart + 0.6 ? 1 : 1)));
  if (a <= 0) return;

  ctx.save();
  ctx.font = "bold 8px 'SF Mono','Fira Code','Courier New',monospace";
  const tw = ctx.measureText(sport.label).width;
  const pH = 18, pPad = 8;
  const pW = tw + pPad * 2;
  const px = W - pW - 18;
  const py = 18;

  ctx.globalAlpha = a * 0.88;
  ctx.fillStyle = "rgba(4,4,10,0.80)";
  ctx.strokeStyle = sport.color;
  ctx.lineWidth = 0.6;
  ctx.shadowColor = sport.color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.roundRect(px, py, pW, pH, 3);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = sport.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(sport.label, px + pPad, py + pH / 2);
  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VideoAnalysisCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

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

      // sport badge
      const sport = sportLabel(phase);
      if (sport) drawSportBadge(ctx, W, sport, phase);

      // callouts
      for (const c of CALLOUTS) {
        const alpha = calloutAlpha(phase, c.at, c.dur);
        if (alpha > 0) drawCallout(ctx, W, H, c, alpha, t);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 8 }}
      />

      {/* AI badge */}
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
