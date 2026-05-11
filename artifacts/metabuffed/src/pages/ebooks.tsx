import { Nav } from "@/components/Nav";
import { Download } from "lucide-react";
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
    description: "The underground Fight Night Champion defensive meta explained from the perspective of elite competitive players. Stamina fraud, lean-back science, rhythm warfare, and the Fear Loop.",
    tag: "Defense",
    pages: "10 chapters",
    cover: defensiveMasteryImg,
    pdf: `${BASE}/ebooks/defensive-mastery.pdf`,
    filename: "FNC-Defensive-Mastery.pdf",
    accent: "text-yellow-400",
    border: "border-yellow-400/20 hover:border-yellow-400/50",
  },
  {
    id: "offensive",
    title: "Offensive Mastery",
    subtitle: "By Malky Pablo",
    description: "The underground offensive science of Fight Night Champion. Push straights, Money Team shells, sidestep uppercuts, round stealing, rhythm manipulation, and elite controlled cheese.",
    tag: "Offense",
    pages: "12 chapters",
    cover: offensiveMasteryImg,
    pdf: `${BASE}/ebooks/offensive-mastery.pdf`,
    filename: "FNC-Offensive-Mastery.pdf",
    accent: "text-zinc-300",
    border: "border-zinc-400/20 hover:border-zinc-400/50",
  },
  {
    id: "finalform",
    title: "The Final Form",
    subtitle: "By Malky Pablo",
    description: "A full competitive combat intelligence manual. Foot positioning, distance management, patience, timing, ring generalship, counter punching, and the philosophy of mastery.",
    tag: "Complete Guide",
    pages: "34 chapters",
    cover: finalFormImg,
    pdf: `${BASE}/ebooks/fnc-final-form.pdf`,
    filename: "FNC-The-Final-Form.pdf",
    accent: "text-purple-400",
    border: "border-purple-400/20 hover:border-purple-400/50",
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
            <p className="hidden md:block text-xs font-mono text-zinc-600 uppercase tracking-widest">3 Guides · Free Download</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {EBOOKS.map((book) => (
              <div
                key={book.id}
                className={`group relative bg-zinc-950 border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${book.border}`}
              >
                {/* Cover Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-black" style={{maxHeight: '280px'}}>
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-black/60 border border-white/10 ${book.accent}`}>
                      {book.tag}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-1">
                    <p className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${book.accent}`}>{book.subtitle}</p>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{book.title}</h3>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed mt-3 flex-1">{book.description}</p>
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-4">{book.pages}</p>

                  <a
                    href={book.pdf}
                    download={book.filename}
                    className={`mt-5 flex items-center justify-center gap-2 w-full py-3 border font-bold text-xs uppercase tracking-widest transition-all duration-300 rounded-none ${book.border} text-white hover:bg-white/5`}
                  >
                    <Download className="w-4 h-4" />
                    Download Free
                  </a>
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
