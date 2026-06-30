import { useEffect, useRef, useState } from "react";

const CYCLE = 18; // seconds per coaching loop

// ─── drawing helpers ─────────────────────────────────────────────────────────

function arrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  color: string, alpha: number, dashOff: number,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([9, 5]);
  ctx.lineDashOffset = -dashOff;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hs = 14;
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hs * Math.cos(ang - 0.45), y2 - hs * Math.sin(ang - 0.45));
  ctx.lineTo(x2 - hs * Math.cos(ang + 0.45), y2 - hs * Math.sin(ang + 0.45));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function pulseCircle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  color: string, alpha: number, t: number,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.lineWidth = 2;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  const pr = r + 8 + Math.sin(t * 5) * 6;
  ctx.globalAlpha = alpha * (0.35 + Math.sin(t * 5) * 0.22);
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(cx, cy, pr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function label(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  text: string, color: string, alpha: number,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.font = "bold 11px 'SF Mono','Fira Code','Courier New',monospace";
  const tw = ctx.measureText(text).width;
  const px = 10, h = 22;
  const bx = x - tw / 2 - px, by = y - h / 2;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(0,0,0,0.80)";
  ctx.beginPath();
  ctx.roundRect(bx, by, tw + px * 2, h, 3);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
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
  const s = 18, m = 14;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "rgba(0,229,255,0.65)";
  ctx.lineWidth = 1.5;
  ctx.shadowColor = "rgba(0,229,255,0.5)";
  ctx.shadowBlur = 6;
  const pts: [number, number, number, number, number, number][] = [
    [m, m + s, m, m, m + s, m],
    [W - m - s, m, W - m, m, W - m, m + s],
    [m, H - m - s, m, H - m, m + s, H - m],
    [W - m - s, H - m, W - m, H - m, W - m, H - m - s],
  ];
  for (const [x1, y1, x2, y2, x3, y3] of pts) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.stroke();
  }
  ctx.restore();
}

function fade(phase: number, start: number, end: number, eIn = 0.25, eOut = 0.25) {
  if (phase < start || phase > end) return 0;
  const d = end - start, p = phase - start;
  if (p < d * eIn) return p / (d * eIn);
  if (p > d * (1 - eOut)) return (d - p) / (d * eOut);
  return 1;
}

// ─── component ───────────────────────────────────────────────────────────────
// Pure overlay: canvas telestration + coaching label.
// Position this absolute over the video background in the parent.

interface LabelState { text: string; color: string }

export function VideoAnalysisCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastLabel = useRef("");
  const [coachLabel, setCoachLabel] = useState<LabelState>({
    text: "AI COACHING ACTIVE",
    color: "#00E5FF",
  });

  // keep canvas buffer in sync with display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // telestration RAF loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;

    const setLabel = (text: string, color: string) => {
      if (lastLabel.current === text) return;
      lastLabel.current = text;
      setCoachLabel({ text, color });
    };

    const draw = () => {
      t += 1 / 60;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      ctx.clearRect(0, 0, W, H);

      const phase = t % CYCLE;
      const dashOff = t * 28;

      // Fighters sit in the right portion of the hero where the gameplay is visible
      const pX = W * 0.61;  // player (left fighter, right half of screen)
      const oX = W * 0.79;  // opponent (right fighter)
      const mY = H * 0.50;

      hudCorners(ctx, W, H, 0.55);

      // ─ PHASE 1 (0–2.8s): SCANNER ─
      {
        const a = fade(phase, 0, 2.8, 0.15, 0.35);
        if (a > 0) {
          const scanY = ((t * 55) % H);
          const sg = ctx.createLinearGradient(0, scanY - 24, 0, scanY + 24);
          sg.addColorStop(0, "rgba(0,229,255,0)");
          sg.addColorStop(0.5, `rgba(0,229,255,${a * 0.35})`);
          sg.addColorStop(1, "rgba(0,229,255,0)");
          ctx.fillStyle = sg;
          ctx.fillRect(0, scanY - 24, W, 48);

          pulseCircle(ctx, pX, mY, 22, "rgba(0,229,255,1)", a * 0.7, t);
          pulseCircle(ctx, oX, mY, 22, "rgba(255,122,0,1)", a * 0.7, t);
          label(ctx, pX, mY - H * 0.18, "PLAYER", "rgba(0,229,255,1)", a);
          label(ctx, oX, mY - H * 0.18, "OPPONENT", "rgba(255,122,0,1)", a);
          setLabel("TRACKING FIGHTERS", "#00E5FF");
        }
      }

      // ─ PHASE 2 (2.8–5.8s): OPPONENT ATTACK TRAJECTORY ─
      {
        const a = fade(phase, 2.8, 5.8, 0.2, 0.25);
        if (a > 0) {
          arrow(ctx, oX - W * 0.015, mY - H * 0.04, pX + W * 0.05, mY + H * 0.01,
            "rgba(255,80,0,1)", a, dashOff);
          pulseCircle(ctx, oX, mY - H * 0.06, 24, "rgba(255,80,0,1)", a * 0.85, t);
          label(ctx, oX, mY - H * 0.22, "OPPONENT ATTACK", "rgba(255,80,0,1)", a);
          ctx.save();
          ctx.globalAlpha = a * 0.14;
          ctx.fillStyle = "rgba(255,80,0,1)";
          ctx.beginPath();
          ctx.ellipse(oX - W * 0.04, mY, W * 0.08, H * 0.14, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          setLabel("PUNCH TRAJECTORY DETECTED", "#FF5000");
        }
      }

      // ─ PHASE 3 (5.8–8.5s): COUNTER OPPORTUNITY ─
      {
        const a = fade(phase, 5.8, 8.5, 0.15, 0.2);
        if (a > 0) {
          ctx.save();
          ctx.globalAlpha = a * 0.2;
          ctx.fillStyle = "rgba(255,220,0,1)";
          ctx.beginPath();
          ctx.ellipse(oX, mY, W * 0.09, H * 0.16, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          pulseCircle(ctx, oX, mY, 32, "rgba(255,220,0,1)", a, t * 1.6);
          label(ctx, oX, mY - H * 0.26, "COUNTER OPPORTUNITY", "rgba(255,220,0,1)", a);
          arrow(ctx, pX + W * 0.03, mY - H * 0.02, oX - W * 0.06, mY - H * 0.06,
            "rgba(0,229,255,1)", a * 0.8, dashOff);
          label(ctx, (pX + oX) * 0.5, mY - H * 0.14, "OPEN WINDOW", "rgba(0,229,255,1)", a * 0.85);
          setLabel("COUNTER OPPORTUNITY DETECTED", "#FFE000");
        }
      }

      // ─ PHASE 4 (8.5–11s): COUNTER LANDS ─
      {
        const a = fade(phase, 8.5, 11.0, 0.1, 0.28);
        if (a > 0) {
          const flashA = fade(phase, 8.5, 9.0, 0.05, 0.6) * 0.38;
          if (flashA > 0) {
            ctx.save(); ctx.globalAlpha = flashA;
            ctx.fillStyle = "rgba(0,229,255,1)";
            ctx.fillRect(0, 0, W, H);
            ctx.restore();
          }
          const impX = oX - W * 0.045, impY = mY - H * 0.03;
          pulseCircle(ctx, impX, impY, 26, "rgba(0,229,255,1)", a, t * 2.2);
          ctx.save();
          ctx.globalAlpha = a;
          ctx.strokeStyle = "rgba(0,229,255,1)";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "rgba(0,229,255,1)";
          ctx.shadowBlur = 16;
          const xs = 9;
          ctx.beginPath();
          ctx.moveTo(impX - xs, impY - xs); ctx.lineTo(impX + xs, impY + xs);
          ctx.moveTo(impX + xs, impY - xs); ctx.lineTo(impX - xs, impY + xs);
          ctx.stroke();
          ctx.restore();
          label(ctx, impX, mY - H * 0.24, "COUNTER LANDED", "rgba(0,229,255,1)", a);
          label(ctx, (pX + oX) * 0.5, mY + H * 0.26, "SUCCESSFUL TIMING", "rgba(120,255,120,1)", a);
          setLabel("COUNTER LANDED · SUCCESSFUL TIMING", "#00E5FF");
        }
      }

      // ─ PHASE 5 (11–14.5s): DEFENSE HOLD + EXCHANGE SUMMARY ─
      {
        const a = fade(phase, 11.0, 14.5, 0.2, 0.35);
        if (a > 0) {
          ctx.save();
          ctx.globalAlpha = a;
          ctx.strokeStyle = "rgba(120,255,120,1)";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 3]);
          ctx.lineDashOffset = -dashOff * 0.4;
          ctx.shadowColor = "rgba(120,255,120,0.8)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(pX, mY, H * 0.18, -Math.PI * 0.75, Math.PI * 0.22);
          ctx.stroke();
          ctx.restore();
          label(ctx, pX, mY - H * 0.28, "FOLLOW-UP DEFENDED", "rgba(120,255,120,1)", a);

          // summary box
          const bW = 178, bH = 74;
          const bx = (pX + oX) * 0.5 - bW / 2;
          const by = mY + H * 0.28;
          ctx.save();
          ctx.globalAlpha = a;
          ctx.fillStyle = "rgba(0,0,0,0.86)";
          ctx.strokeStyle = "rgba(0,229,255,0.65)";
          ctx.lineWidth = 1;
          ctx.shadowColor = "rgba(0,229,255,0.5)";
          ctx.shadowBlur = 14;
          ctx.beginPath(); ctx.roundRect(bx, by, bW, bH, 4); ctx.fill(); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.font = "bold 10px monospace";
          ctx.fillStyle = "rgba(255,220,0,1)";
          ctx.fillText("EXCHANGE WON", bx + bW / 2, by + 15);
          const lines = ["Counter Landed  ✓", "Defense Held  ✓", "Exchange Won  ✓"];
          lines.forEach((ln, i) => {
            ctx.font = "9px monospace";
            ctx.fillStyle = "rgba(120,255,120,1)";
            ctx.fillText(ln, bx + bW / 2, by + 33 + i * 14);
          });
          ctx.restore();
          setLabel("EXCHANGE WON", "#78FF78");
        }
      }

      // ─ PHASE 6 (14.5–18s): RESET ─
      if (phase > 14.5 && phase < 16.5) {
        setLabel("ANALYZING FOOTAGE...", "#00E5FF");
      }

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
        className="absolute top-[88px] left-6 flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-md px-3 py-1.5"
        style={{ zIndex: 9 }}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary shadow-[0_0_5px_rgba(0,229,255,0.9)]" />
        </span>
        <span className="text-[9px] font-mono text-zinc-300 tracking-[0.2em] uppercase">AI Coaching Active</span>
      </div>

      {/* Bottom-right coaching label */}
      <div
        className="absolute bottom-8 right-8 flex items-center gap-2.5 bg-black/70 backdrop-blur-sm border border-white/10 rounded-md px-4 py-2"
        style={{ zIndex: 9 }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
          style={{ background: coachLabel.color, boxShadow: `0 0 6px ${coachLabel.color}` }}
        />
        <span
          className="text-[10px] font-mono font-bold tracking-[0.18em] uppercase"
          style={{ color: coachLabel.color, textShadow: `0 0 10px ${coachLabel.color}60` }}
        >
          {coachLabel.text}
        </span>
      </div>
    </>
  );
}
