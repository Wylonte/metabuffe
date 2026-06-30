import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/Nav";
import { BreakdownModal } from "@/components/BreakdownModal";
import { 
  Upload, 
  Play, 
  Activity, 
  Share2,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Lock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NeuralMesh } from "@/components/NeuralMesh";
import fightNightImg from "@assets/f8jFkfr_1778467206855.jpg";
import maddenImg from "@assets/G6IWhecWMAkaOiu_1778447744264.jpg";
import gta6Img from "@assets/GTA6_1778447744267.webp";
import nba2kImg from "@assets/wp15758233_1778466521722.jpg";
import undisputedImg from "@assets/characters-from-undisputed-game_1778447744257.avif";
import ufc6Img from "@assets/maxresdefault_1778448217289.jpg";
import logoImg from "@assets/1000028977_1779456146886.png";

const Particles = ({ count = 20 }: { count?: number }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            '--tx': `${(Math.random() - 0.5) * 200}px`,
            '--ty': `${(Math.random() - 0.5) * 200}px`,
            '--s': Math.random() * 2,
            '--duration': `${Math.random() * 10 + 10}s`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: '0 0 10px 2px rgba(255,28,139,0.5)',
            background: 'rgba(255,28,139,0.8)'
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[100dvh] bg-black text-foreground selection:bg-primary/30 font-sans overflow-x-hidden">
      <Nav />

      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden">
          {/* Full-bleed video background */}
          <div className="absolute inset-0 bg-black z-0" />
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-[1]"
            src="/trailer.mp4"
          />

          {/* Readability overlays — dark on left where text lives */}
          <div className="absolute inset-0 z-[2] bg-black/40" />
          <div className="absolute inset-0 z-[3] bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0.1)_100%)]" />
          <div className="absolute inset-0 z-[3] bg-[linear-gradient(to_bottom,black_0%,transparent_12%,transparent_86%,black_100%)]" />


          <div className="container mx-auto px-6 relative z-10">
            {/* Left text content only — video fills the right */}
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h1 className="text-[clamp(40px,4.5vw,64px)] font-black leading-[1.05] tracking-tighter mb-6 uppercase">
                  <span className="text-white block drop-shadow-lg">Built for</span>
                  <span className="text-white block drop-shadow-lg">Competitive</span>
                  <span className="text-zinc-500 block mt-1">Players</span>
                </h1>

                <p className="text-xl text-zinc-400 mb-10 leading-relaxed max-w-lg font-medium">
                  Metabuffed breaks down your gameplay, exposes mistakes, and helps you improve through real competitive analysis.
                </p>

                <div className="flex flex-col sm:flex-row gap-5">
                  <Button
                    size="lg"
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-sm h-14 px-10 uppercase tracking-widest w-full sm:w-auto rounded-[11px] border-0 transition-all duration-200 shadow-[0_0_18px_rgba(59,130,246,0.45)] hover:shadow-[0_0_28px_rgba(59,130,246,0.65)]"
                    data-testid="btn-hero-upload"
                    onClick={() => setLocation('/upload')}
                  >
                    Analyze Gameplay
                  </Button>
                  <Button
                    size="lg"
                    className="bg-transparent border border-white/25 hover:border-white/50 hover:bg-white/[0.07] text-white font-bold text-sm h-14 px-10 uppercase tracking-widest rounded-[11px] transition-all duration-200 backdrop-blur-sm"
                    data-testid="btn-hero-explore"
                    onClick={() => { document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    Explore Games
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 2: FEATURED GAMES */}
        <section id="games" className="py-32 bg-black relative z-10">
          <div className="container mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em] mb-4">Featured Games</h2>
              <p className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">Choose Your Game</p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Fight Night */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative h-[240px] rounded-2xl overflow-hidden bg-zinc-900 cursor-pointer border border-white/5"
                data-testid="game-tile-fight-night"
                onClick={() => setLocation('/upload?game=fight-night')}
              >
                <img src={fightNightImg} alt="Fight Night Champion" className="absolute inset-0 w-full h-full object-cover object-[40%_top] opacity-80 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">Fight Night Champion</h3>
                  <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Pressure. Counters. Stamina. Timing.</p>
                </div>
              </motion.div>

              {/* NBA 2K26 — Locked */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative h-[240px] rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/5"
                data-testid="game-tile-nba"
              >
                <img src={nba2kImg} alt="NBA 2K26" className="absolute inset-0 w-full h-full object-cover object-[30%_top] opacity-40" />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="bg-black/70 rounded-full p-3 border border-white/10">
                    <Lock className="w-5 h-5 text-zinc-400" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Coming Soon</span>
                </div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="text-2xl font-black text-zinc-500 uppercase tracking-tight mb-1">NBA 2K26</h3>
                </div>
              </motion.div>

              {/* Madden 26 — Locked */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative h-[240px] rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/5"
                data-testid="game-tile-madden"
              >
                <img src={maddenImg} alt="Madden 26" className="absolute inset-0 w-full h-full object-cover object-center opacity-40" />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="bg-black/70 rounded-full p-3 border border-white/10">
                    <Lock className="w-5 h-5 text-zinc-400" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Coming Soon</span>
                </div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="text-2xl font-black text-zinc-500 uppercase tracking-tight mb-1">Madden 26</h3>
                </div>
              </motion.div>
            </div>

            {/* Coming Soon Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* GTA 6 — Locked */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative h-[240px] rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/5"
                data-testid="game-tile-gta6"
              >
                <img src={gta6Img} alt="GTA 6" className="absolute inset-0 w-full h-full object-cover object-center opacity-40" />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="bg-black/70 rounded-full p-3 border border-white/10">
                    <Lock className="w-5 h-5 text-zinc-400" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Coming Soon</span>
                </div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="text-2xl font-black text-zinc-500 uppercase tracking-tight mb-1">GTA 6</h3>
                </div>
              </motion.div>

              {/* Undisputed 2 — Locked */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative h-[240px] rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/5"
                data-testid="game-tile-undisputed2"
              >
                <img src={undisputedImg} alt="Undisputed 2" className="absolute inset-0 w-full h-full object-cover object-center opacity-40" />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="bg-black/70 rounded-full p-3 border border-white/10">
                    <Lock className="w-5 h-5 text-zinc-400" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Coming Soon</span>
                </div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="text-2xl font-black text-zinc-500 uppercase tracking-tight mb-1">Undisputed 2</h3>
                </div>
              </motion.div>

              {/* UFC 6 — Active */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group relative h-[240px] rounded-2xl overflow-hidden bg-zinc-900 cursor-pointer border border-white/5"
                data-testid="game-tile-ufc6"
                onClick={() => setLocation('/upload?game=ufc6')}
              >
                <img src={ufc6Img} alt="UFC 6" className="absolute inset-0 w-full h-full object-cover object-center opacity-80 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">UFC 6</h3>
                  <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Striking. Grappling. Cage IQ.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 3: LIVE ANALYSIS */}
        <section id="analysis" className="py-32 bg-[#050505] border-y border-white/5 relative">
          <div className="container mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-sm font-mono text-primary uppercase tracking-[0.2em] mb-4 font-bold">Live Analysis</h2>
              <p className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Stop Guessing Why You Lost</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              {/* Gameplay Frame */}
              <div className="lg:col-span-7 bg-zinc-950 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl h-[600px]">
                <div className="absolute top-0 inset-x-0 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between z-20">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Fight Night Champion</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">SRC: UPLOAD_094</span>
                </div>

                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(100,20,180,0.25)_0%,rgba(0,0,0,1)_100%)] mt-12" />
                
                {/* Annotations */}
                <div className="absolute inset-0 z-10 p-8 pt-24">
                  <div className="relative h-full w-full">
                    {/* Box 1 */}
                    <div className="absolute top-[20%] left-[10%] group">
                      <div className="border border-pink-500/50 bg-pink-500/10 backdrop-blur-sm p-3 max-w-[200px]">
                        <p className="text-[10px] text-pink-400 font-mono uppercase tracking-widest font-bold">Stamina Collapse</p>
                      </div>
                      <div className="absolute top-full left-1/2 w-[1px] h-32 bg-pink-500/50" />
                    </div>

                    {/* Box 2 */}
                    <div className="absolute top-[40%] right-[15%] group">
                      <div className="border border-yellow-500/50 bg-yellow-500/10 backdrop-blur-sm p-3 max-w-[200px]">
                        <p className="text-[10px] text-yellow-400 font-mono uppercase tracking-widest font-bold">Counter Timing</p>
                      </div>
                      <div className="absolute top-1/2 right-full w-16 h-[1px] bg-yellow-500/50" />
                    </div>

                    {/* Box 3 */}
                    <div className="absolute bottom-[30%] left-[30%] group">
                      <div className="border border-orange-500/50 bg-orange-500/10 backdrop-blur-sm p-3 max-w-[200px]">
                        <p className="text-[10px] text-orange-400 font-mono uppercase tracking-widest font-bold">Guard Reset Missed</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black to-transparent p-6 z-20">
                  <p className="text-center font-mono text-white text-lg font-bold tracking-widest">ROUND 3 — 1:47 REMAINING</p>
                </div>
              </div>

              {/* Analysis Panel */}
              <div className="lg:col-span-5 bg-[#0a0a0a] rounded-2xl border border-white/5 p-8 flex flex-col">
                <h3 className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-8 font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Key Findings
                </h3>

                <div className="space-y-6 flex-1">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-xs">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-lg leading-snug">Stamina collapsed after aggressive exchanges.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <span className="text-zinc-400 font-bold text-xs">2</span>
                    </div>
                    <div>
                      <p className="text-zinc-400 font-medium">Second hook thrown before guard reset.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <span className="text-zinc-400 font-bold text-xs">3</span>
                    </div>
                    <div>
                      <p className="text-zinc-400 font-medium">Late counter window — 3 missed opportunities.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3">Coach Recommendation</p>
                  <p className="text-white bg-white/5 p-5 rounded-xl border border-white/5 leading-relaxed font-medium">
                    Shorten the combo. Step out after the first exchange. Only re-enter once stamina recovers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: PLAYER IDENTITY */}
        <section id="identity" className="py-32 bg-black relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em] mb-4">Player Profile</h2>
              <p className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Your Competitive Identity</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <motion.div 
                whileHover="hover"
                className="group relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl sweep-hover"
              >
                <div className="h-32 bg-gradient-to-r from-[rgba(10,50,20,0.8)] to-black border-b border-white/5 flex items-end px-8 pb-6">
                  <div className="flex items-end justify-between w-full">
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Pressure Counter Fighter</h3>
                      <p className="text-sm font-mono text-zinc-400">Fight Night Champion</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Global Grade</p>
                      <p className="text-5xl font-black text-primary leading-none drop-shadow-[0_0_15px_rgba(255,28,139,0.5)]">B+</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 grid md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-4">Strengths</h4>
                    <ul className="space-y-3">
                      {["Pressure", "Timing", "Counter Reads"].map(s => (
                        <li key={s} className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-4">Weaknesses</h4>
                    <ul className="space-y-3">
                      {["Stamina Control", "Predictability", "Late Resets"].map(w => (
                        <li key={w} className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-pink-500" /> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-4">Tendencies</h4>
                    <ul className="space-y-3">
                      {["Aggressive Opener", "Round 2 Rush", "Guard Drop"].map(t => (
                        <li key={t} className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white/5 px-8 py-5 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold mb-1">Next Focus</p>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">Control exchanges before round 3.</p>
                  </div>
                  <div className="flex gap-4">
                    <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold border-0 uppercase tracking-widest text-xs h-10 px-6 rounded-[10px] shadow-[0_0_14px_rgba(59,130,246,0.4)] hover:shadow-[0_0_22px_rgba(59,130,246,0.6)] transition-all duration-200" onClick={() => setIsBreakdownOpen(true)} data-testid="btn-view-breakdown">
                      View Full Breakdown
                    </Button>
                    <Share2 className="w-5 h-5 text-zinc-500 hover:text-white cursor-pointer transition-colors mt-2.5" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Breakdown Modal */}
        <BreakdownModal isOpen={isBreakdownOpen} onClose={() => setIsBreakdownOpen(false)} />

        {/* SECTION 5: FUTURE VISION */}
        <section className="py-32 bg-[#050505] border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Built to Become<br/>Your Live Gaming Coach</h2>
            </div>

            <div className="max-w-4xl mx-auto relative">
              <div className="absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-white/10" />
              <div className="absolute top-[28px] left-[10%] w-[40%] h-[2px] bg-primary shadow-[0_0_10px_rgba(255,28,139,0.5)]" />

              <div className="flex justify-between relative z-10">
                <div className="flex flex-col items-center w-1/3">
                  <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,28,139,0.3)]">
                    <span className="font-bold text-primary">01</span>
                  </div>
                  <h4 className="text-white font-bold uppercase tracking-wider mb-2">Upload & Analyze</h4>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 uppercase tracking-widest text-[10px]">Now</Badge>
                </div>
                
                <div className="flex flex-col items-center w-1/3">
                  <div className="w-14 h-14 rounded-full bg-black border-2 border-white/20 flex items-center justify-center mb-6">
                    <span className="font-bold text-zinc-500">02</span>
                  </div>
                  <h4 className="text-zinc-400 font-bold uppercase tracking-wider mb-2">Live Match Feedback</h4>
                  <Badge variant="outline" className="bg-white/5 text-zinc-400 border-white/10 uppercase tracking-widest text-[10px]">Next</Badge>
                </div>

                <div className="flex flex-col items-center w-1/3">
                  <div className="w-14 h-14 rounded-full bg-black border-2 border-white/20 flex items-center justify-center mb-6">
                    <span className="font-bold text-zinc-500">03</span>
                  </div>
                  <h4 className="text-zinc-500 font-bold uppercase tracking-wider mb-2">Full Coaching System</h4>
                  <Badge variant="outline" className="bg-white/5 text-zinc-500 border-white/10 uppercase tracking-widest text-[10px]">Future</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: FINAL CTA */}
        <section className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden bg-black">
          {/* Rotating Soft Glows */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glow-orb w-[800px] h-[800px] bg-[rgba(255,28,139,0.09)]" style={{ animationDelay: '0s' }} />
            <div className="glow-orb w-[600px] h-[600px] bg-[rgba(0,229,255,0.09)]" style={{ animationDelay: '-5s' }} />
            <div className="glow-orb w-[700px] h-[700px] bg-[rgba(155,48,255,0.09)]" style={{ animationDelay: '-10s' }} />
          </div>

          <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-[clamp(48px,8vw,120px)] font-black text-white uppercase tracking-tighter leading-none mb-6">
                Your Match.<br/>Decoded.
              </h2>
              <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto mb-12">
                Metabuffed helps gamers understand losses, improve intelligently, and compete at a higher level.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                <Button size="lg" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold border-0 text-sm h-16 px-12 uppercase tracking-widest rounded-[11px] shadow-[0_0_18px_rgba(59,130,246,0.45)] hover:shadow-[0_0_28px_rgba(59,130,246,0.65)] transition-all duration-200" onClick={() => setLocation('/upload')}>
                  Analyze Gameplay
                </Button>
                <Button size="lg" className="bg-transparent border border-white/25 hover:border-white/50 hover:bg-white/[0.07] text-white font-bold text-sm h-16 px-12 uppercase tracking-widest rounded-[11px] transition-all duration-200 backdrop-blur-sm" onClick={() => setLocation('/coach')}>
                  Enter the Platform
                </Button>
              </div>

              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Fight Night</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">NBA 2K</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Madden</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-black border-t border-white/5 pt-16 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="mb-4">
                <img src={logoImg} alt="Metabuffed" className="h-[88px] w-auto" />
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                AI-powered gameplay analysis for competitive gamers. Upload. Analyze. Improve.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://twitter.com/Metabuffed" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all" data-testid="link-twitter">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://instagram.com/Metabuffed" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all" data-testid="link-instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://facebook.com/Metabuffed" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all" data-testid="link-facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://youtube.com/@Metabuffed" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all" data-testid="link-youtube">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-5 font-bold">Platform</h4>
              <ul className="space-y-3">
                {["Upload Gameplay", "AI Meta Breakdown", "Ask the Coach", "Player Card"].map(item => (
                  <li key={item}><a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">{item}</a></li>
                ))}
                <li><a href="/ebooks" className="text-sm text-zinc-400 hover:text-white transition-colors">Ebooks</a></li>
              </ul>
            </div>

            {/* Games */}
            <div>
              <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-5 font-bold">Games</h4>
              <ul className="space-y-3">
                {["Fight Night Champion", "UFC 6", "NBA 2K26", "Madden 26", "GTA 6 (Coming Soon)", "Undisputed 2 (Coming Soon)"].map(item => (
                  <li key={item}><a href="#games" className="text-sm text-zinc-400 hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600 font-mono">© 2026 Metabuffed. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
              <span>Follow us</span>
              <span className="text-primary font-bold">@Metabuffed</span>
              <span>on all platforms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
