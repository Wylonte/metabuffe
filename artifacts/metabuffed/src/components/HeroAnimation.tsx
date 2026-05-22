import { useEffect, useRef } from "react";

const G = "#DC143C";
const GDIM = (a: number) => `rgba(255,28,139,${a})`;

type Phase = "training" | "analyzing" | "levelup";

interface Spark {
  x: number; y: number; vx: number; vy: number; life: number; maxLife: number;
}

interface FloatText {
  x: number; y: number; text: string; opacity: number; vy: number;
}

interface SkillBar {
  label: string; fill: number; targetFill: number; color: string;
}

export function HeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    // --- State ---
    let frame = 0;
    let phase: Phase = "training";
    let phaseTimer = 0;
    const PHASE_TIMES: Record<Phase, number> = { training: 280, analyzing: 120, levelup: 100 };

    // Fighter pose state
    let punchArm = 0; // 0=guard, 1=jab, 2=cross
    let punchTimer = 0;
    let punchPhase = 0; // 0=1 1=extend 2=retract

    // Sparks
    const sparks: Spark[] = [];
    const floatTexts: FloatText[] = [];

    // Scan line
    let scanY = -1;
    let scanActive = false;
    let scanOpacity = 0;

    // Level up flash
    let flashOpacity = 0;

    // Skill bars
    const skillBars: SkillBar[] = [
      { label: "FOOTWORK", fill: 0.45, targetFill: 0.45, color: G },
      { label: "REACTION", fill: 0.60, targetFill: 0.60, color: G },
      { label: "POWER", fill: 0.52, targetFill: 0.52, color: G },
      { label: "STAMINA", fill: 0.38, targetFill: 0.38, color: G },
    ];

    const SKILL_LABELS = [
      "+12 FOOTWORK", "+8 REACTION", "+15 POWER", "+5 GUARD",
      "+10 STAMINA", "IQ BOOST", "META UPDATED", "EDGE FOUND",
    ];

    function spawnSparks(x: number, y: number, count: number, speed: number) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const v = speed * (0.5 + Math.random());
        sparks.push({ x, y, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v, life: 30 + Math.random() * 20, maxLife: 50 });
      }
    }

    function spawnText(x: number, y: number, text: string) {
      floatTexts.push({ x, y, text, opacity: 1, vy: -0.8 });
    }

    function drawFighter(cx: number, cy: number, t: number) {
      // --- Dimensions ---
      const scale = Math.min(canvas.width, canvas.height) * 0.0018;
      const headR = 22 * scale;
      const torsoH = 70 * scale;
      const torsoW = 28 * scale;
      const legH = 80 * scale;
      const armLen = 60 * scale;
      const legW = 18 * scale;

      // Position
      const hx = cx;
      const hy = cy - (headR + torsoH * 0.5 + 30 * scale);

      // Subtle bob
      const bob = Math.sin(t * 0.05) * 3;
      const bodyY = hy + bob;

      // Breathing/lean
      const lean = Math.sin(t * 0.03) * 4;

      ctx.save();
      ctx.translate(hx, bodyY);

      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 200 * scale);
      glow.addColorStop(0, GDIM(0.08));
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, torsoH * 0.5, 200 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = G;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = G;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";

      // HEAD
      ctx.beginPath();
      ctx.arc(lean * 0.3, 0, headR, 0, Math.PI * 2);
      ctx.strokeStyle = GDIM(0.9);
      ctx.stroke();
      // Face glow fill
      ctx.fillStyle = GDIM(0.04);
      ctx.fill();

      // NECK
      ctx.beginPath();
      ctx.moveTo(lean * 0.2, headR * 0.8);
      ctx.lineTo(lean * 0.1, headR + 12 * scale);
      ctx.strokeStyle = GDIM(0.7);
      ctx.stroke();

      // TORSO
      const tx = lean * 0.1;
      const ty = headR + 12 * scale;
      const bx = lean * -0.1;
      const by = ty + torsoH;

      ctx.beginPath();
      ctx.moveTo(tx - torsoW * 0.5, ty);
      ctx.lineTo(tx + torsoW * 0.5, ty);
      ctx.lineTo(bx + torsoW * 0.4, by);
      ctx.lineTo(bx - torsoW * 0.4, by);
      ctx.closePath();
      ctx.strokeStyle = GDIM(0.85);
      ctx.stroke();
      ctx.fillStyle = GDIM(0.04);
      ctx.fill();

      // LEGS - fighting stance (left foot fwd)
      // Left leg
      ctx.beginPath();
      ctx.moveTo(bx - legW * 0.3, by);
      ctx.lineTo(bx - legW * 1.2, by + legH * 0.55);
      ctx.lineTo(bx - legW * 0.8, by + legH);
      ctx.strokeStyle = GDIM(0.8);
      ctx.stroke();
      // Right leg
      ctx.beginPath();
      ctx.moveTo(bx + legW * 0.3, by);
      ctx.lineTo(bx + legW * 1.5, by + legH * 0.5);
      ctx.lineTo(bx + legW * 1.1, by + legH);
      ctx.stroke();

      // ARMS — animated punches
      // Guard position = arms bent at chest
      // Jab = right arm extends left, Cross = left arm extends right

      let leftArmEnd = { x: tx - torsoW * 0.5 - armLen * 0.5, y: ty + torsoH * 0.3 };
      let rightArmEnd = { x: tx + torsoW * 0.5 + armLen * 0.5, y: ty + torsoH * 0.3 };

      if (punchArm === 1) {
        // Jab (right arm extends forward-left)
        const ext = Math.sin(punchPhase * Math.PI) * armLen;
        rightArmEnd = { x: tx + torsoW * 0.5 + ext * 1.2, y: ty + torsoH * 0.2 };
        if (punchPhase > 0.4 && punchPhase < 0.6 && ext > armLen * 0.8) {
          spawnSparks(hx + rightArmEnd.x, bodyY + rightArmEnd.y, 3, 2.5);
        }
      } else if (punchArm === 2) {
        // Cross (left arm extends)
        const ext = Math.sin(punchPhase * Math.PI) * armLen;
        leftArmEnd = { x: tx - torsoW * 0.5 - ext * 1.4, y: ty + torsoH * 0.2 };
        if (punchPhase > 0.4 && punchPhase < 0.6 && ext > armLen * 0.9) {
          spawnSparks(hx + leftArmEnd.x, bodyY + leftArmEnd.y, 4, 3);
        }
      } else if (punchArm === 3) {
        // Hook (left arm wide)
        const ext = Math.sin(punchPhase * Math.PI);
        leftArmEnd = { x: tx - torsoW * 0.8 - armLen * ext * 0.7, y: ty + torsoH * 0.15 - armLen * ext * 0.3 };
        rightArmEnd = { x: tx + torsoW * 0.5 + armLen * 0.3, y: ty + torsoH * 0.4 };
      }

      // Draw left arm
      const leftShoulder = { x: tx - torsoW * 0.5, y: ty + 8 * scale };
      const leftElbow = { x: (leftShoulder.x + leftArmEnd.x) * 0.5 + 8 * scale, y: (leftShoulder.y + leftArmEnd.y) * 0.5 - 5 * scale };
      ctx.beginPath();
      ctx.moveTo(leftShoulder.x, leftShoulder.y);
      ctx.quadraticCurveTo(leftElbow.x, leftElbow.y, leftArmEnd.x, leftArmEnd.y);
      ctx.strokeStyle = GDIM(0.85);
      ctx.lineWidth = 3;
      ctx.stroke();
      // glove
      ctx.beginPath();
      ctx.arc(leftArmEnd.x, leftArmEnd.y, 6 * scale, 0, Math.PI * 2);
      ctx.fillStyle = GDIM(0.5);
      ctx.fill();

      // Draw right arm
      const rightShoulder = { x: tx + torsoW * 0.5, y: ty + 8 * scale };
      const rightElbow = { x: (rightShoulder.x + rightArmEnd.x) * 0.5 - 8 * scale, y: (rightShoulder.y + rightArmEnd.y) * 0.5 - 5 * scale };
      ctx.beginPath();
      ctx.moveTo(rightShoulder.x, rightShoulder.y);
      ctx.quadraticCurveTo(rightElbow.x, rightElbow.y, rightArmEnd.x, rightArmEnd.y);
      ctx.strokeStyle = GDIM(0.85);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rightArmEnd.x, rightArmEnd.y, 6 * scale, 0, Math.PI * 2);
      ctx.fillStyle = GDIM(0.5);
      ctx.fill();

      ctx.restore();

      // Ring/platform under fighter
      ctx.save();
      ctx.strokeStyle = GDIM(0.2);
      ctx.lineWidth = 1;
      for (let r = 0.5; r <= 1; r += 0.5) {
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10, 80 * scale * r, 15 * scale * r, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawSkillBars(x: number, y: number) {
      const barW = 130;
      const barH = 5;
      const gap = 22;

      ctx.save();
      ctx.font = "bold 9px monospace";

      skillBars.forEach((bar, i) => {
        const by = y + i * gap;
        // Approach target
        bar.fill += (bar.targetFill - bar.fill) * 0.03;

        // Label
        ctx.fillStyle = GDIM(0.5);
        ctx.fillText(bar.label, x, by - 3);

        // Track
        ctx.fillStyle = GDIM(0.12);
        ctx.fillRect(x, by, barW, barH);

        // Fill
        const fillGrd = ctx.createLinearGradient(x, by, x + barW * bar.fill, by);
        fillGrd.addColorStop(0, GDIM(0.5));
        fillGrd.addColorStop(1, GDIM(0.9));
        ctx.fillStyle = fillGrd;
        ctx.fillRect(x, by, barW * bar.fill, barH);

        // Glow tip
        ctx.shadowColor = G;
        ctx.shadowBlur = 8;
        ctx.fillStyle = G;
        ctx.fillRect(x + barW * bar.fill - 2, by - 1, 3, barH + 2);
        ctx.shadowBlur = 0;

        // Value %
        ctx.fillStyle = GDIM(0.6);
        ctx.fillText(Math.round(bar.fill * 100) + "%", x + barW + 6, by + 5);
      });
      ctx.restore();
    }

    function drawHUD(W: number, H: number) {
      const bS = 20;
      const bG = 14;
      ctx.save();
      ctx.strokeStyle = GDIM(0.35);
      ctx.lineWidth = 1.5;
      // TL
      ctx.beginPath(); ctx.moveTo(bG, bG + bS); ctx.lineTo(bG, bG); ctx.lineTo(bG + bS, bG); ctx.stroke();
      // TR
      ctx.beginPath(); ctx.moveTo(W - bG, bG + bS); ctx.lineTo(W - bG, bG); ctx.lineTo(W - bG - bS, bG); ctx.stroke();
      // BL
      ctx.beginPath(); ctx.moveTo(bG, H - bG - bS); ctx.lineTo(bG, H - bG); ctx.lineTo(bG + bS, H - bG); ctx.stroke();
      // BR
      ctx.beginPath(); ctx.moveTo(W - bG, H - bG - bS); ctx.lineTo(W - bG, H - bG); ctx.lineTo(W - bG - bS, H - bG); ctx.stroke();

      // Status bar top
      ctx.font = "bold 8px monospace";
      ctx.fillStyle = GDIM(0.35);
      ctx.fillText("METABUFFED TRAINING LAB v2.1", bG + 4, bG + bS + 12);
      ctx.fillText("SYS.ACTIVE", W - bG - 68, bG + bS + 12);

      ctx.restore();
    }

    function triggerLevelUp() {
      flashOpacity = 1;
      // Boost a random skill bar
      const idx = Math.floor(Math.random() * skillBars.length);
      const gain = 0.08 + Math.random() * 0.12;
      skillBars[idx].targetFill = Math.min(0.98, skillBars[idx].targetFill + gain);
      spawnText(canvas.width * 0.5, canvas.height * 0.3, SKILL_LABELS[Math.floor(Math.random() * SKILL_LABELS.length)]);
      spawnSparks(canvas.width * 0.5, canvas.height * 0.5, 20, 4);
    }

    const draw = () => {
      frame++;
      phaseTimer++;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W * 0.5;
      const cy = H * 0.62;

      // Phase transitions
      if (phaseTimer > PHASE_TIMES[phase]) {
        phaseTimer = 0;
        if (phase === "training") {
          phase = "analyzing";
          scanY = 0;
          scanActive = true;
          scanOpacity = 1;
        } else if (phase === "analyzing") {
          phase = "levelup";
          triggerLevelUp();
        } else {
          phase = "training";
        }
      }

      // Punch timing during training
      if (phase === "training") {
        punchTimer++;
        if (punchArm === 0 && punchTimer > 30) {
          punchTimer = 0;
          punchArm = [1, 2, 3][Math.floor(Math.random() * 3)];
          punchPhase = 0;
        }
        if (punchArm !== 0) {
          punchPhase += 0.04;
          if (punchPhase >= 1) {
            punchArm = 0;
            punchPhase = 0;
            punchTimer = 0;
          }
        }
      }

      // Clear
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(0, 0, W, H);

      // Background grid
      ctx.save();
      ctx.strokeStyle = GDIM(0.04);
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let gx = 0; gx < W; gx += gridSize) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }
      ctx.restore();

      // Draw fighter
      drawFighter(cx, cy, frame);

      // Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08;
        s.life--;
        const a = (s.life / s.maxLife);
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2 * a, 0, Math.PI * 2);
        ctx.fillStyle = GDIM(a * 0.9);
        ctx.shadowColor = G;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (s.life <= 0) sparks.splice(i, 1);
      }

      // Floating texts
      for (let i = floatTexts.length - 1; i >= 0; i--) {
        const ft = floatTexts[i];
        ft.y += ft.vy;
        ft.opacity -= 0.008;
        ctx.save();
        ctx.font = "bold 13px monospace";
        ctx.fillStyle = GDIM(ft.opacity);
        ctx.shadowColor = G;
        ctx.shadowBlur = 10;
        ctx.fillText(ft.text, ft.x - ctx.measureText(ft.text).width / 2, ft.y);
        ctx.restore();
        if (ft.opacity <= 0) floatTexts.splice(i, 1);
      }

      // Skill bars (right side)
      const barX = W * 0.72;
      const barY = H * 0.25;
      ctx.save();
      ctx.font = "bold 10px monospace";
      ctx.fillStyle = GDIM(0.5);
      ctx.fillText("SKILL ANALYSIS", barX, barY - 14);
      ctx.restore();
      drawSkillBars(barX, barY);

      // Phase label (left side)
      ctx.save();
      ctx.font = "bold 9px monospace";
      const phaseLabels: Record<Phase, string> = {
        training: "● TRAINING MODE",
        analyzing: "● ANALYZING...",
        levelup: "● SKILL ACQUIRED",
      };
      ctx.fillStyle = phase === "levelup" ? GDIM(0.9) : GDIM(0.45);
      ctx.shadowColor = G;
      ctx.shadowBlur = phase === "levelup" ? 14 : 0;
      ctx.fillText(phaseLabels[phase], W * 0.06, H * 0.25);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Analyze scan line
      if (scanActive) {
        scanY += 3.5;
        if (scanY > H) {
          scanActive = false;
          scanOpacity = 0;
          scanY = -1;
        }
        if (scanOpacity > 0) {
          const sg = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
          sg.addColorStop(0, "transparent");
          sg.addColorStop(0.5, GDIM(0.18 * scanOpacity));
          sg.addColorStop(1, "transparent");
          ctx.fillStyle = sg;
          ctx.fillRect(0, scanY - 30, W, 60);
          // scan line
          ctx.strokeStyle = GDIM(0.5 * scanOpacity);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, scanY);
          ctx.lineTo(W, scanY);
          ctx.stroke();
        }
      }

      // Level up flash
      if (flashOpacity > 0) {
        ctx.fillStyle = GDIM(flashOpacity * 0.12);
        ctx.fillRect(0, 0, W, H);
        // Big text
        if (flashOpacity > 0.5) {
          ctx.save();
          ctx.font = `bold ${Math.floor(32 * flashOpacity)}px monospace`;
          ctx.fillStyle = GDIM(flashOpacity);
          ctx.shadowColor = G;
          ctx.shadowBlur = 30;
          const txt = "SKILL IMPROVED";
          ctx.fillText(txt, W / 2 - ctx.measureText(txt).width / 2, H * 0.18);
          ctx.restore();
        }
        flashOpacity -= 0.015;
      }

      // HUD overlay
      drawHUD(W, H);

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
      style={{ opacity: 0.9 }}
    />
  );
}
