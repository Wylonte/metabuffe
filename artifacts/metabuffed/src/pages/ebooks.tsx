import { Nav } from "@/components/Nav";
import { Download } from "lucide-react";
import { CrimsonPulse } from "@/components/CrimsonPulse";
import fightNightImg from "@assets/f8jFkfr_1778467206855.jpg";
import defensiveMasteryImg from "@assets/1000028424_1778543400486.png";
import offensiveMasteryImg from "@assets/1000028425_1778543400490.png";
import finalFormImg from "@assets/1000028427_1778543411627.png";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const EBOOKS = [
  {
    id: "defensive",
    title: "Defensive Mastery",
    subtitle: "By Malky Pablo",
    description: "Stamina fraud, lean-back science, rhythm warfare, and the Fear Loop.",
    tag: "Defense",
    chapters: "10 Chapters",
    cover: defensiveMasteryImg,
    pdf: `${BASE}/ebooks/defensive-mastery.pdf`,
    filename: "FNC-Defensive-Mastery.pdf",
    tagColor: "text-yellow-400",
    glow: "hover:shadow-[0_0_40px_rgba(255,28,139,0.35)]",
    border: "hover:border-pink-700/60",
  },
  {
    id: "offensive",
    title: "Offensive Mastery",
    subtitle: "By Malky Pablo",
    description: "Push straights, Money Team shells, sidestep uppercuts, and rhythm manipulation.",
    tag: "Offense",
    chapters: "12 Chapters",
    cover: offensiveMasteryImg,
    pdf: `${BASE}/ebooks/offensive-mastery.pdf`,
    filename: "FNC-Offensive-Mastery.pdf",
    tagColor: "text-zinc-300",
    glow: "hover:shadow-[0_0_40px_rgba(255,28,139,0.35)]",
    border: "hover:border-pink-700/60",
  },
  {
    id: "finalform",
    title: "The Final Form",
    subtitle: "By Malky Pablo",
    description: "Foot positioning, ring generalship, counter punching, and the philosophy of mastery.",
    tag: "Complete Guide",
    chapters: "34 Chapters",
    cover: finalFormImg,
    pdf: `${BASE}/ebooks/fnc-final-form.pdf`,
    filename: "FNC-The-Final-Form.pdf",
    tagColor: "text-purple-400",
    glow: "hover:shadow-[0_0_40px_rgba(255,28,139,0.45)]",
    border: "hover:border-pink-700/60",
  },
];

export default function EbooksPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      {/* Hero */}
      <section className="relative pt-40 pb-20 overflow-hidden min-h-[52vh] flex items-end">
        <div className="absolute inset-0 bg-black" />
        <CrimsonPulse />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
        <div className="relative container mx-auto px-6 pb-4">
          <p className="text-xs font-mono text-primary uppercase tracking-[0.3em] mb-4 font-bold">Metabuffed Ebooks</p>
          <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
            Fight Night<br />
            <span className="text-zinc-500">Champion</span>
          </h1>
          <p className="text-base text-zinc-400 max-w-lg leading-relaxed">
            AI strategy guides built from competitive gameplay data.
          </p>
        </div>
      </section>

      {/* Ebooks Grid */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.2em] mb-1">Available Now</p>
              <p className="text-2xl font-black text-white uppercase tracking-tight">Fight Night Champion Library</p>
            </div>
            <p className="hidden md:block text-xs font-mono text-zinc-600 uppercase tracking-widest">3 Guides · Free</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {EBOOKS.map((book) => (
              <div
                key={book.id}
                className={`group relative bg-zinc-950 border border-white/8 rounded-xl overflow-hidden transition-all duration-400 ${book.glow} ${book.border} cursor-pointer`}
              >
                {/* Cover — main focus */}
                <div className="relative aspect-[3/4] overflow-hidden bg-black">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-106"
                  />
                  {/* Bottom overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  {/* Top tag */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/70 border border-white/10 ${book.tagColor}`}>
                      {book.tag}
                    </span>
                  </div>
                  {/* Crimson hover border glow */}
                  <div className="absolute inset-0 border border-transparent group-hover:border-pink-700/30 rounded-xl transition-all duration-400 pointer-events-none" />

                  {/* Info overlaid at bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{book.subtitle}</p>
                    <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight mb-1.5">{book.title}</h3>
                    <p className="text-xs text-zinc-400 leading-snug line-clamp-2 mb-3">{book.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{book.chapters}</span>
                      <a
                        href={book.pdf}
                        download={book.filename}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white bg-[#3B82F6] hover:bg-[#2563EB] border-0 px-3 py-1.5 rounded-[8px] shadow-[0_0_10px_rgba(59,130,246,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] transition-all duration-200"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-zinc-700 font-mono uppercase tracking-widest">More titles dropping as new games launch</p>
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
