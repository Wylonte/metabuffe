import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { CrimsonFlow } from "@/components/CrimsonFlow";
import { Brain, Target, TrendingUp, Users, Zap, Shield } from "lucide-react";

const STATS = [
  { value: "600M+", label: "Competitive Gamers Worldwide" },
  { value: "<1%", label: "Have Access to Real Coaching" },
  { value: "10K+", label: "Hours of Meta Trained Weekly" },
  { value: "3", label: "Games and Growing" },
];

const PILLARS = [
  {
    icon: Brain,
    title: "Trained on the Meta",
    body: "Our AI doesn't guess. It's continuously trained on the latest patch notes, tournament VODs, and competitive play data. The advice you get reflects what's actually winning right now, not last season."
  },
  {
    icon: Target,
    title: "Finds Your Weaknesses",
    body: "Most players lose to the same three mistakes every game and never realize it. Metabuffed maps your patterns across every match, surfaces the gaps you can't see yourself, and tells you exactly what to fix first."
  },
  {
    icon: TrendingUp,
    title: "Tracks Your Growth",
    body: "Improvement is invisible without data. Every analysis builds your performance record. Watch your stamina management climb, your counter-defense tighten, your grade rise week over week."
  },
  {
    icon: Shield,
    title: "Built for Ranked Play",
    body: "Casual advice doesn't win ranked matches. Metabuffed is designed for players who play to win. The analysis is deep, the language is direct, and every recommendation is built around your specific rank and playstyle."
  },
  {
    icon: Zap,
    title: "Real-Time Meta Alerts",
    body: "When a patch drops and the meta shifts overnight, you'll know. Metabuffed monitors balance changes across all supported titles and flags when your go-to strategies are no longer optimal. Before your opponents even realize it."
  },
  {
    icon: Users,
    title: "Community Intelligence",
    body: "Every match uploaded makes the model smarter. As more players contribute gameplay across ranks and regions, the AI's understanding of what separates good from elite becomes sharper for everyone."
  }
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <div className="min-h-[100dvh] bg-black text-white font-sans overflow-x-hidden">
      <Nav />

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-black" />
        <CrimsonFlow />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,transparent_30%,black_100%)]" />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-mono text-primary uppercase tracking-[0.4em] mb-8 font-bold"
          >
            Our Mission
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-[clamp(44px,7vw,96px)] font-black leading-[1] tracking-tighter uppercase mb-8"
          >
            <span className="text-white block">600 Million</span>
            <span className="bg-gradient-to-r from-primary via-emerald-300 to-cyan-400 bg-clip-text text-transparent block">Competitive</span>
            <span className="text-zinc-500 block">Gamers</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-400 leading-relaxed max-w-3xl mx-auto font-medium"
          >
            Most of them are stuck. Grinding the same mistakes, hitting the same walls, with no real way to know why they keep losing. That has to change.
          </motion.p>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600"
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-zinc-600" />
        </motion.div>
      </section>

      {/* THE PROBLEM */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_50%,rgba(100,60,255,0.07)_0%,transparent_70%)]" />

        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-xs font-mono text-purple-400 uppercase tracking-[0.4em] mb-6 font-bold">The Problem</p>
              <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[1] mb-8">
                The Tools<br />
                <span className="text-zinc-600">Don't Exist</span>
              </h2>
              <div className="space-y-5 text-zinc-400 text-lg leading-relaxed">
                <p>
                  Professional athletes have coaches, film rooms, and analysts watching every move. Competitive gamers, hundreds of millions of them, have YouTube tutorials and trial and error.
                </p>
                <p>
                  There's no shortage of passion. There's a shortage of infrastructure. The gap between a player who grinds alone and one with real analytical support is enormous. And it grows every season as the meta evolves faster than any human can track.
                </p>
                <p className="text-white font-medium">
                  Most players will never close that gap. Not because they lack the drive. Because they were never given the tools.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 relative overflow-hidden group hover:border-white/15 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
                  <p className="text-4xl font-black text-primary mb-2 drop-shadow-[0_0_20px_rgba(255,28,139,0.4)]">{stat.value}</p>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider leading-tight">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* THE SOLUTION */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(155,48,255,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(0,200,255,0.04)_0%,transparent_60%)]" />

        <div className="container mx-auto px-6 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs font-mono text-cyan-400 uppercase tracking-[0.4em] mb-6 font-bold">What We Built</p>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[1] mb-12">
              <span className="text-white block">We Train AI</span>
              <span className="bg-gradient-to-r from-primary via-emerald-300 to-cyan-400 bg-clip-text text-transparent block">to Coach You</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto space-y-6 text-zinc-400 text-xl leading-relaxed mb-16"
          >
            <p>
              Metabuffed is a platform built from the ground up for competitive players. We take your gameplay footage, run it through AI models trained on thousands of hours of competitive play, and give you back exactly what a real coach would tell you: your weaknesses, the current meta, and a clear path forward.
            </p>
            <p className="text-white font-medium text-2xl">
              No guesswork. No generic tips. Game-specific intelligence built for ranked play.
            </p>
            <p>
              We're starting with the titles where the competitive gap is most brutal and coaching resources are most scarce. Every game we add, every match uploaded, every piece of feedback makes the model sharper. For you and every player who comes after you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative inline-flex items-center gap-4 bg-[#0a0a0a] border border-primary/20 rounded-2xl px-8 py-5 shadow-[0_0_60px_rgba(255,28,139,0.1)]"
          >
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(255,28,139,0.8)]" />
            <span className="text-sm font-mono text-zinc-300 uppercase tracking-widest">AI Model Active / Analyzing Meta</span>
            <div className="flex items-end gap-0.5 h-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: ["30%", `${Math.random() * 70 + 30}%`, "30%"] }}
                  transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                  className="w-1 bg-primary/60 rounded-t-sm"
                  style={{ height: "30%" }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.4em] mb-4">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Six Ways We Make<br />
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">You Better</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-7 hover:border-primary/20 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <pillar.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wide mb-3">{pillar.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{pillar.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_50%,rgba(0,229,255,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_30%_70%,rgba(100,60,255,0.06)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-70" />

        <div className="relative z-10 container mx-auto px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[1] mb-8">
              <span className="text-zinc-600 block">You've Put in</span>
              <span className="text-white block">The Hours</span>
              <span className="bg-gradient-to-r from-primary via-emerald-300 to-cyan-400 bg-clip-text text-transparent block">Now Put Them to Work</span>
            </h2>
            <p className="text-xl text-zinc-500 leading-relaxed mb-12 max-w-2xl mx-auto">
              Every competitive player deserves to know what they're doing wrong and how to fix it. That's not a privilege for the few with access to real coaches. That's a right for anyone willing to improve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button size="lg" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold border-0 text-sm h-14 px-12 uppercase tracking-widest w-full sm:w-auto rounded-[11px] shadow-[0_0_18px_rgba(59,130,246,0.45)] hover:shadow-[0_0_28px_rgba(59,130,246,0.65)] transition-all duration-200" data-testid="btn-about-upload">
                  Upload Your First Match
                </Button>
              </Link>
              <Link href="/coach">
                <Button size="lg" className="bg-transparent border border-white/25 hover:border-white/50 hover:bg-white/[0.07] text-white font-bold text-sm h-14 px-12 uppercase tracking-widest w-full sm:w-auto rounded-[11px] transition-all duration-200 backdrop-blur-sm" data-testid="btn-about-coach">
                  Talk to Coach Meta
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="border-t border-white/5 py-8">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-zinc-600 font-mono">© 2026 Metabuffed. All rights reserved.</p>
          <Link href="/" className="text-xs text-zinc-600 font-mono hover:text-zinc-400 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
