import { useEffect, useRef, useState } from "react";

const CYCLE = 20; // seconds per coaching loop

// ─── broadcast-style drawing helpers ─────────────────────────────────────────

function coachArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  color: string, alpha: number, dashOff: number, width = 2.2,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash([10, 5]);
  ctx.lineDashOffset = -dashOff;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // clean arrowhead
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hs = 12;
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hs * Math.cos(ang - 0.4), y2 - hs * Math.sin(ang - 0.4));
  ctx.lineTo(x2 - hs * Math.cos(ang + 0.4), y2 - hs * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function zone(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number,
  color: string, alpha: number,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha * 0.12;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = alpha * 0.55;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.restore();
}

function ring(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  color: string, alpha: number, t: number,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.lineWidth = 1.8;
  ctx.globalAlpha = alpha * 0.85;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  // pulse ring
  const pr = r + 5 + Math.sin(t * 4.5) * 4;
  ctx.globalAlpha = alpha * (0.28 + Math.sin(t * 4.5) * 0.18);
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(cx, cy, pr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function coachLabel(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  text: string, color: string, alpha: number,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.font = "600 10px 'SF Mono','Fira Code','Courier New',monospace";
  const tw = ctx.measureText(text).width;
  const px = 8, h = 19;
  ctx.globalAlpha = alpha * 0.88;
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.beginPath();
  ctx.roundRect(x - tw / 2 - px, y - h / 2, tw + px * 2, h, 3);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function hudCorners(ctx: CanvasRenderingContext2D, W: number, H: number, alpha: number) {
  if (alpha <= 0) return;
  const s = 16, m = 12;
  ctx.save();
  ctx.globalAlpha = alpha * 0.5;
  ctx.strokeStyle = "rgba(0,200,255,0.7)";
  ctx.lineWidth = 1.2;
  const pts: [number, number, number, number, number, number][] = [
    [m, m + s, m, m, m + s, m],
    [W - m - s, m, W - m, m, W - m, m + s],
    [m, H - m - s, m, H - m, m + s, H - m],
    [W - m - s, H - m, W - m, H - m, W - m, H - m - s],
  ];
  for (const [x1, y1, x2, y2, x3, y3] of pts) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.stroke();
  }
  ctx.restore();
}

function fade(phase: number, start: number, end: number, eIn = 0.2, eOut = 0.2) {
  if (phase < start || phase > end) return 0;
  const d = end - start, p = phase - start;
  if (p < d * eIn) return p / (d * eIn);
  if (p > d * (1 - eOut)) return (d - p) / (d * eOut);
  return 1;
}

// ─── component ────────────────────────────────────────────────────────────────

interface LabelState { text: string; color: string }

export function VideoAnalysisCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastLabel = useRef("");
  const [coachHint, setCoachHint] = useState<LabelState>({ text: "AI COACH ANALYZING...", color: "#60B8FF" });

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

    const setHint = (text: string, color: string) => {
      if (lastLabel.current === text) return;
      lastLabel.current = text;
      setCoachHint({ text, color });
    };

    const draw = () => {
      t += 1 / 60;
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      ctx.clearRect(0, 0, W, H);

      const phase = t % CYCLE;
      const dashOff = t * 22;

      // Fighter positions (right portion — where gameplay sits in a landscape frame)
      const pX = W * 0.60;   // player
      const oX = W * 0.78;   // opponent
      const mY = H * 0.48;

      hudCorners(ctx, W, H, 0.9);

      // ── PHASE 1 (0–3s): LIGHT SCAN + TRACKER LOCK ──────────────────────────
      {
        const a = fade(phase, 0, 3.0, 0.1, 0.3);
        if (a > 0) {
          // subtle scan beam
          const scanY = ((t * 48) % H);
          const sg = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
          sg.addColorStop(0, "rgba(0,180,255,0)");
          sg.addColorStop(0.5, `rgba(0,180,255,${a * 0.22})`);
          sg.addColorStop(1, "rgba(0,180,255,0)");
          ctx.fillStyle = sg; ctx.fillRect(0, scanY - 20, W, 40);
          // fighter lock rings
          ring(ctx, pX, mY, 20, "rgba(80,180,255,1)", a * 0.65, t);
          ring(ctx, oX, mY, 20, "rgba(255,140,50,1)", a * 0.65, t);
          coachLabel(ctx, pX, mY - H * 0.16, "PLAYER", "rgba(80,180,255,1)", a);
          coachLabel(ctx, oX, mY - H * 0.16, "OPPONENT", "rgba(255,140,50,1)", a);
          setHint("TRACKING FIGHTERS", "#60B8FF");
        }
      }

      // ── PHASE 2 (3–6.5s): INCOMING ATTACK PATH ──────────────────────────────
      {
        const a = fade(phase, 3.0, 6.5, 0.18, 0.22);
        if (a > 0) {
          // punch trajectory — dashed orange line
          coachArrow(ctx, oX - W * 0.01, mY - H * 0.04, pX + W * 0.05, mY, "rgba(255,140,50,1)", a, dashOff);
          ring(ctx, oX, mY - H * 0.05, 20, "rgba(255,140,50,1)", a * 0.8, t);
          coachLabel(ctx, oX, mY - H * 0.21, "ATTACK PATH", "rgba(255,140,50,1)", a);
          setHint("ATTACK TRAJECTORY MAPPED", "#FF9632");
        }
      }

      // ── PHASE 3 (6.5–10s): COUNTER ZONE ─────────────────────────────────────
      {
        const a = fade(phase, 6.5, 10.0, 0.15, 0.2);
        if (a > 0) {
          zone(ctx, oX, mY, W * 0.09, H * 0.15, "rgba(255,210,50,1)", a);
          coachLabel(ctx, oX, mY - H * 0.24, "COUNTER ZONE", "rgba(255,210,50,1)", a);
          // suggested path — lighter, no "OPEN WINDOW" label
          coachArrow(ctx, pX + W * 0.025, mY - H * 0.015, oX - W * 0.06, mY - H * 0.05,
            "rgba(80,200,255,0.7)", a * 0.6, dashOff, 1.8);
          setHint("COUNTER WINDOW OPEN", "#FFD432");
        }
      }

      // ── PHASE 4 (10–13s): CLEAN COUNTER LANDS ────────────────────────────────
      // No flash — just a soft ring + subtle badge
      {
        const a = fade(phase, 10.0, 13.0, 0.1, 0.25);
        if (a > 0) {
          const impX = oX - W * 0.04, impY = mY - H * 0.025;
          ring(ctx, impX, impY, 22, "rgba(80,220,140,1)", a, t * 2);
          // impact dot (no X, no flash)
          ctx.save();
          ctx.globalAlpha = a * 0.7;
          ctx.fillStyle = "rgba(80,220,140,1)";
          ctx.shadowColor = "rgba(80,220,140,1)";
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(impX, impY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          coachLabel(ctx, impX, mY - H * 0.22, "CLEAN COUNTER", "rgba(80,220,140,1)", a);
          coachLabel(ctx, (pX + oX) * 0.5, mY + H * 0.25, "EXCELLENT TIMING", "rgba(80,220,140,1)", a * 0.75);
          setHint("COUNTER LANDED — EXCELLENT TIMING", "#50DC8C");
        }
      }

      // ── PHASE 5 (13–17s): DEFENSE + EXCHANGE SUMMARY ─────────────────────────
      {
        const a = fade(phase, 13.0, 17.0, 0.18, 0.3);
        if (a > 0) {
          // defensive arc — green, softer
          ctx.save();
          ctx.globalAlpha = a * 0.7;
          ctx.strokeStyle = "rgba(80,220,140,1)";
          ctx.lineWidth = 1.8;
          ctx.setLineDash([5, 3]);
          ctx.lineDashOffset = -dashOff * 0.35;
          ctx.shadowColor = "rgba(80,220,140,0.6)";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pX, mY, H * 0.17, -Math.PI * 0.7, Math.PI * 0.18);
          ctx.stroke();
          ctx.restore();
          coachLabel(ctx, pX, mY - H * 0.26, "DEFENSE HELD", "rgba(80,220,140,1)", a);

          // clean summary panel
          const bW = 162, bH = 66;
          const bx = (pX + oX) * 0.5 - bW / 2;
          const by = mY + H * 0.27;
          ctx.save();
          ctx.globalAlpha = a * 0.92;
          ctx.fillStyle = "rgba(0,0,0,0.78)";
          ctx.strokeStyle = "rgba(80,220,140,0.5)";
          ctx.lineWidth = 0.8;
          ctx.shadowColor = "rgba(80,220,140,0.35)";
          ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.roundRect(bx, by, bW, bH, 4); ctx.fill(); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.font = "bold 9.5px monospace";
          ctx.fillStyle = "rgba(255,205,50,1)";
          ctx.fillText("EXCHANGE WON", bx + bW / 2, by + 13);
          const lines = ["Counter Landed  ✓", "Defense Held  ✓", "Exchange Won  ✓"];
          lines.forEach((ln, i) => {
            ctx.font = "8px monospace";
            ctx.fillStyle = "rgba(80,220,140,0.9)";
            ctx.fillText(ln, bx + bW / 2, by + 30 + i * 13);
          });
          ctx.restore();
          setHint("EXCHANGE WON — GREAT DECISION", "#50DC8C");
        }
      }

      // ── PHASE 6 (17–20s): FADE / RESET ───────────────────────────────────────
      if (phase > 17 && phase < 18.5) setHint("AI COACH ANALYZING...", "#60B8FF");

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <>
      {/* Full-section telestration canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 8 }}
      />

      {/* Top-left AI badge */}
      <div
        className="absolute top-[88px] left-6 flex items-center gap-2 bg-black/55 backdrop-blur-sm border border-white/[0.08] rounded-md px-3 py-1.5"
        style={{ zIndex: 9 }}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#60B8FF] opacity-55" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#60B8FF] shadow-[0_0_5px_rgba(96,184,255,0.9)]" />
        </span>
        <span className="text-[9px] font-mono text-zinc-300 tracking-[0.18em] uppercase">AI Coaching Active</span>
      </div>

      {/* Bottom-right coaching hint */}
      <div
        className="absolute bottom-8 right-8 flex items-center gap-2.5 bg-black/65 backdrop-blur-sm border border-white/[0.07] rounded-md px-4 py-2"
        style={{ zIndex: 9 }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
          style={{ background: coachHint.color, boxShadow: `0 0 5px ${coachHint.color}` }}
        />
        <span
          className="text-[10px] font-mono font-semibold tracking-[0.15em] uppercase"
          style={{ color: coachHint.color }}
        >
          {coachHint.text}
        </span>
      </div>
    </>
  );
}
