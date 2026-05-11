import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import fightNightImg from "@assets/f8jFkfr_1778467206855.jpg";

const EBOOKS = [
  {
    id: 1,
    title: "The Counter Fighter's Playbook",
    subtitle: "How to read, bait, and punish every opponent archetype in Fight Night Champion",
    pages: "48 pages",
    tag: "Offense",
  },
  {
    id: 2,
    title: "Stamina Wins Fights",
    subtitle: "A full breakdown of the stamina system and how to exploit it in long bouts",
    pages: "36 pages",
    tag: "Advanced",
  },
  {
    id: 3,
    title: "Pressure Fighter Masterclass",
    subtitle: "Cut the ring, smother defense, and break your opponent's timing with relentless forward pressure",
    pages: "52 pages",
    tag: "Playstyle",
  },
  {
    id: 4,
    title: "Body Shot Bible",
    subtitle: "Why body shots win championships — and the exact combos to land them consistently",
    pages: "30 pages",
    tag: "Technique",
  },
  {
    id: 5,
    title: "Guard Breaks and Dirty Boxing",
    subtitle: "Inside clinch work, uppercut setups, and how to wear down any guard over 12 rounds",
    pages: "44 pages",
    tag: "Clinch",
  },
  {
    id: 6,
    title: "Late Round Finishing",
    subtitle: "Reading fatigue signals, switching targets, and closing out fights when it matters most",
    pages: "38 pages",
    tag: "Finishing",
  },
];

export default function EbooksPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      {/* Hero */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={fightNightImg} alt="Fight Night Champion" className="w-full h-full object-cover object-[40%_top] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>
        <div className="relative container mx-auto px-6">
          <p className="text-xs font-mono text-primary uppercase tracking-[0.3em] mb-4 font-bold">Metabuffed Ebooks</p>
          <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-none">
            Fight Night<br />
            <span className="text-zinc-500">Champion</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
            AI-generated strategy guides built from competitive gameplay data. Each ebook breaks down one system, one concept, one edge — so you stop guessing and start winning.
          </p>
        </div>
      </section>

      {/* Ebooks Grid */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em] mb-2">Available Now</h2>
              <p className="text-3xl font-black text-white uppercase tracking-tight">Fight Night Champion Library</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-600 uppercase tracking-widest">
              <BookOpen className="w-4 h-4" />
              <span>{EBOOKS.length} Guides</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EBOOKS.map((book) => (
              <div
                key={book.id}
                className="group relative bg-zinc-900 border border-white/5 rounded-2xl p-8 hover:border-white/15 hover:bg-zinc-900/80 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    {book.tag}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{book.pages}</span>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3 leading-tight group-hover:text-primary transition-colors duration-300">
                    {book.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{book.subtitle}</p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <Button className="w-full bg-white text-black hover:bg-zinc-200 uppercase font-bold text-xs tracking-widest rounded-none">
                    Download Free
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-zinc-600 font-mono uppercase tracking-widest">More titles dropping as new games launch</p>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <footer className="border-t border-white/5 py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600 font-mono">© 2026 Metabuffed. All rights reserved.</p>
          <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">Metabuffed · Coach Meta · Powered by AI trained on competitive gameplay</p>
        </div>
      </footer>
    </div>
  );
}
