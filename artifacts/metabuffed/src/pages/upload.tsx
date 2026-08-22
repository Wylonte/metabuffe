import { Link } from "wouter";
import { motion } from "framer-motion";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Lock, MessageSquare, ChevronRight } from "lucide-react";

/**
 * Video match analysis is intentionally locked for launch.
 * Ask the Coach is the primary product surface until temporal analysis returns.
 */
export default function UploadPage() {
  return (
    <div className="min-h-[100dvh] bg-black text-foreground selection:bg-primary/30 pt-20 relative">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,28,139,0.10)_0%,transparent_70%)]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,122,0,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.06)_0%,transparent_70%)]" />
      </div>
      <Nav />

      <main className="relative z-10 container mx-auto px-6 py-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-zinc-950/90 overflow-hidden shadow-2xl"
        >
          <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] font-bold">
                Match Upload
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mt-1">
                Video Analysis
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Locked
              </span>
            </div>
          </div>

          <div className="relative px-6 py-16 md:py-20 flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,28,139,0.06)_0%,transparent_65%)] pointer-events-none" />

            <div className="relative z-10 w-20 h-20 rounded-2xl border border-white/15 bg-black/70 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,28,139,0.15)]">
              <Lock className="w-9 h-9 text-primary" />
            </div>

            <p className="relative z-10 text-[10px] font-mono text-primary uppercase tracking-[0.35em] font-bold mb-3">
              Coming Soon
            </p>
            <h2 className="relative z-10 text-xl md:text-2xl font-black text-white uppercase tracking-tight max-w-lg">
              Match upload is locked while we finalize Ask the Coach
            </h2>
            <p className="relative z-10 mt-4 text-sm text-zinc-400 leading-relaxed max-w-md">
              Video analysis will return later with full temporal gameplay watching.
              Right now the priority is{" "}
              <span className="text-white font-semibold">Ask the Coach</span> —
              suggested questions plus freeform meta questions in your own words.
            </p>

            <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Link href="/coach">
                <Button
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black border-0 uppercase tracking-widest text-xs h-12 px-8 rounded-[10px] shadow-[0_0_16px_rgba(59,130,246,0.45)] hover:shadow-[0_0_24px_rgba(59,130,246,0.65)] transition-all duration-200 flex items-center gap-2"
                  data-testid="btn-locked-go-coach"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask the Coach
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs h-12 px-6 rounded-[10px]"
                  data-testid="btn-locked-home"
                >
                  Back Home
                </Button>
              </Link>
            </div>

            <p className="relative z-10 mt-8 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              Upload Match · Locked for launch · Revisit later
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
