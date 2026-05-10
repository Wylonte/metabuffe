import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Crosshair, 
  Activity, 
  MessageSquare, 
  Gamepad2, 
  Target, 
  ShieldAlert, 
  TrendingUp,
  BrainCircuit,
  Swords,
  ChevronRight,
  Upload
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const GAME_DATA = [
  {
    id: "fight-night",
    name: "Fight Night Champion",
    description: "Stamina, pressure, counter timing, punch selection, defensive habits.",
    status: "active",
    preview: {
      game: "Fight Night Champion",
      status: "Meta Breakdown Ready",
      finding: "Stamina collapsed after aggressive exchanges.",
      archetype: "Pressure Counter Fighter",
      grade: "B+",
      details: "You threw the second hook before resetting your guard. Shorten the combo, step out after the first exchange."
    }
  },
  {
    id: "nba2k",
    name: "NBA 2K 26",
    description: "Shot quality, spacing, rotations, matchup abuse, offensive tendencies.",
    status: "active",
    preview: {
      game: "NBA 2K 26",
      status: "Meta Breakdown Ready",
      finding: "Opponent repeatedly forced weak-side corner rotations.",
      archetype: "Iso-Heavy Wing",
      grade: "A-",
      details: "Punished late help defense. Focus on pre-rotating before the drive commits."
    }
  },
  {
    id: "madden",
    name: "Madden 26",
    description: "Coverage reads, route abuse, defensive shells, playcalling patterns.",
    status: "active",
    preview: {
      game: "Madden 26",
      status: "Meta Breakdown Ready",
      finding: "Defensive shell became predictable against crossing routes.",
      archetype: "Zone Heavy Strategist",
      grade: "B",
      details: "Motion spacing exposed Cover 3 flats. Need to mix man-match concepts on key downs."
    }
  },
  {
    id: "gta6",
    name: "GTA 6",
    description: "Coming Soon / Pending",
    status: "pending"
  }
];

export default function Home() {
  const [selectedGame, setSelectedGame] = useState(GAME_DATA[0]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-primary/30 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">Metabuffed</span>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#games" className="hover:text-white transition-colors">Games</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#coach" className="hover:text-white transition-colors">Coach</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden sm:flex border-white/10 hover:bg-white/5" data-testid="btn-ask-coach-nav">
              Ask the Coach
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold" data-testid="btn-upload-nav">
              <Upload className="w-4 h-4 mr-2" />
              Upload Gameplay
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl"
            >
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
                Understand Why You Win. <br />
                <span className="text-muted-foreground">Fix Why You Lose.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Metabuffed analyzes your gameplay, breaks down your competitive patterns, and gives you game-specific solutions so you can actually improve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base h-14 px-8" data-testid="btn-hero-upload">
                  Upload Gameplay
                </Button>
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 text-base h-14 px-8" data-testid="btn-hero-ask">
                  Ask the Coach
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative relative-group"
            >
              {/* HUD Brackets */}
              <div className="hud-bracket hud-tl" />
              <div className="hud-bracket hud-tr" />
              <div className="hud-bracket hud-bl" />
              <div className="hud-bracket hud-br" />
              
              <Card className="bg-card/50 border-white/10 backdrop-blur-sm overflow-hidden relative">
                <div className="scan-line" />
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-sm font-mono text-muted-foreground mb-1">CURRENT ANALYSIS</p>
                      <h3 className="text-2xl font-bold tracking-tight">Fight Night Champion</h3>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Meta Breakdown Ready
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                      <p className="text-sm text-muted-foreground mb-1">Player Archetype</p>
                      <p className="font-semibold text-white">Pressure Counter Fighter</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-lg border border-white/5 flex flex-col justify-center items-center">
                      <p className="text-sm text-muted-foreground mb-1">Overall Grade</p>
                      <p className="text-4xl font-black text-primary">B+</p>
                    </div>
                  </div>

                  <div className="p-5 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex gap-3 mb-2">
                      <Target className="w-5 h-5 text-primary shrink-0" />
                      <p className="font-semibold">Key Finding</p>
                    </div>
                    <p className="text-muted-foreground pl-8">
                      "Stamina collapsed after aggressive exchanges."
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Game Selection */}
        <section id="games" className="py-24 bg-card/30 border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Choose Your Game</h2>
              <p className="text-muted-foreground">Supported titles for competitive breakdown.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 flex flex-col gap-4">
                {GAME_DATA.map((game) => (
                  <button
                    key={game.id}
                    disabled={game.status === 'pending'}
                    onClick={() => setSelectedGame(game)}
                    className={`text-left p-6 rounded-xl border transition-all duration-300 ${
                      game.status === 'pending' 
                        ? 'opacity-40 cursor-not-allowed border-white/5 bg-black/20' 
                        : selectedGame.id === game.id
                          ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(57,255,20,0.1)]'
                          : 'border-white/10 hover:border-white/20 bg-card/50 hover:bg-card'
                    }`}
                    data-testid={`game-card-${game.id}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg">{game.name}</h3>
                      {game.status === 'pending' && <Badge variant="secondary" className="text-xs">Coming Soon</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{game.description}</p>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedGame.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                  >
                    <Card className="h-full bg-black/40 border-white/10 backdrop-blur-sm flex flex-col">
                      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          <span className="text-sm font-mono text-muted-foreground">LIVE PREVIEW</span>
                        </div>
                        <span className="text-sm font-medium">{selectedGame.preview?.game}</span>
                      </div>
                      <CardContent className="p-8 flex-1 flex flex-col justify-center">
                        <div className="mb-8">
                          <p className="text-sm text-primary mb-2 font-medium tracking-wide uppercase">{selectedGame.preview?.status}</p>
                          <h4 className="text-2xl font-bold mb-4">{selectedGame.preview?.finding}</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {selectedGame.preview?.details}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                          <div className="p-4 bg-white/5 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Analyzed Archetype</p>
                            <p className="font-semibold">{selectedGame.preview?.archetype}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Calculated Grade</p>
                            <p className="font-semibold text-primary">{selectedGame.preview?.grade}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-32">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl font-bold tracking-tight mb-4">The First Three Features</h2>
              <p className="text-muted-foreground">Everything you need to stop guessing and start improving.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Upload,
                  title: "Upload Gameplay",
                  desc: "Upload match footage from supported games. Metabuffed turns your gameplay into a clear competitive review."
                },
                {
                  icon: BrainCircuit,
                  title: "AI Meta Breakdown",
                  desc: "Get the real reason you won or lost. Not generic tips — game-specific pattern recognition, mistakes, tendencies, and meta explanations."
                },
                {
                  icon: MessageSquare,
                  title: "Ask a Coach",
                  desc: "Ask game-specific questions and get answers based on your uploaded match. It works like ChatGPT for gaming, but focused on competitive improvement."
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-2xl bg-card border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Meta Breakdown Section */}
        <section className="py-32 bg-card/30 border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mb-16">
              <h2 className="text-4xl font-bold tracking-tight mb-6">Stop Guessing Why You Lost</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Most gamers know they lost, but not why. Metabuffed identifies the actual competitive reason behind the result, completely eliminating the guesswork.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  game: "Fight Night Champion",
                  icon: Swords,
                  finding: "You lost because your stamina collapsed after aggressive exchanges, letting your opponent counter late."
                },
                {
                  game: "NBA 2K 26",
                  icon: Target,
                  finding: "You lost because your opponent repeatedly forced weak-side corner rotations and punished late help defense."
                },
                {
                  game: "Madden 26",
                  icon: ShieldAlert,
                  finding: "You lost because your defensive shell became predictable against crossing routes and motion spacing."
                }
              ].map((item, i) => (
                <Card key={i} className="bg-black/60 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-muted-foreground font-mono text-sm">
                      <item.icon className="w-4 h-4" />
                      {item.game}
                    </div>
                    <p className="font-medium leading-relaxed">"{item.finding}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Player Card Section */}
        <section className="py-32">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-6">Your Competitive Identity</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Get a personalized, shareable player card generated from your match data. Understand your strengths, acknowledge your weaknesses, and know exactly what to focus on next.
                </p>
                <ul className="space-y-4">
                  {[
                    "Analyzed playstyle archetype",
                    "Core strengths and punishable weaknesses",
                    "Objective grading system",
                    "Actionable next focus"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative flex justify-center">
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                
                <Card className="w-full max-w-sm bg-[#0a0a0a] border-white/10 shadow-2xl relative z-10">
                  <CardContent className="p-0">
                    <div className="p-8 border-b border-white/5 text-center bg-gradient-to-b from-white/5 to-transparent">
                      <p className="text-sm font-mono text-muted-foreground mb-4 tracking-widest uppercase">Player Card</p>
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-primary/20 bg-primary/5 text-primary text-5xl font-black mb-4 shadow-[0_0_30px_rgba(57,255,20,0.15)]">
                        B+
                      </div>
                      <h3 className="text-xl font-bold">Pressure Counter Fighter</h3>
                    </div>
                    
                    <div className="p-8 space-y-6">
                      <div>
                        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">Strengths</p>
                        <div className="flex flex-wrap gap-2">
                          {["Pressure", "Timing", "Reads"].map(s => (
                            <Badge key={s} variant="secondary" className="bg-white/5 hover:bg-white/10">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">Weaknesses</p>
                        <div className="flex flex-wrap gap-2">
                          {["Stamina Control", "Predictability", "Late Defensive Resets"].map(w => (
                            <Badge key={w} variant="outline" className="border-red-500/20 text-red-400 bg-red-500/5">{w}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <p className="text-xs text-primary font-mono uppercase tracking-wider mb-2">Next Focus</p>
                        <p className="font-medium text-sm">Control exchanges before round 3.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Ask the Coach */}
        <section id="coach" className="py-32 bg-card/30 border-y border-white/5">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-4xl font-bold tracking-tight mb-6">ChatGPT for Competitive Gaming</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-16">
              Ask the coach anything about your match, your habits, the current meta, or how to fix a specific problem.
            </p>

            <div className="bg-black/60 rounded-2xl border border-white/10 p-6 text-left mb-8 max-w-2xl mx-auto shadow-xl">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold">U</span>
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed">
                    How do I stop getting countered after hooks?
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                    <BrainCircuit className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed text-foreground">
                    <p>In your uploaded Fight Night match, you threw the second hook before resetting your guard.</p>
                    <p className="mt-2 text-primary/90 font-medium">Shorten the combo, step out after the first exchange, and only re-enter once stamina recovers.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Why do I keep losing close games?",
                "What's my biggest weakness?",
                "How do I beat players who spam crossing routes?",
                "Why do I give up corner threes?"
              ].map((q, i) => (
                <button key={i} className="text-xs md:text-sm px-4 py-2 rounded-full border border-white/10 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-white" data-testid={`chip-question-${i}`}>
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Future Vision */}
        <section className="py-32">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Built to Become Your Live Gaming Coach</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              We're starting with upload-based analysis to ensure perfectly accurate insights. As we expand, Metabuffed will integrate into live feedback, matchup preparation, and long-term player progression tracking. The future of coaching is real-time.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm font-mono text-muted-foreground uppercase tracking-widest">
              <span>Uploads</span>
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Live Feedback</span>
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Progression</span>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 bg-primary/5 border-t border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.05),transparent_50%)]" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl font-bold tracking-tight mb-6 text-white">Upload the Match.<br/>Learn the Truth.</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Metabuffed helps gamers understand their losses, sharpen their strengths, and improve with real competitive feedback.
            </p>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg h-16 px-10 shadow-[0_0_30px_rgba(57,255,20,0.3)]" data-testid="btn-final-cta">
              Start With Your First Upload
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white/50">Metabuffed</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Metabuffed. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
