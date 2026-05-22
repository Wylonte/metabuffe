import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send, User, Lock, MessageSquare } from "lucide-react";
import { useModals } from "@/hooks/use-modals";
import logoImg from "@assets/1000028977_1779456146886.png";
import fightNightImg from "@assets/f8jFkfr_1778467206855.jpg";
import ufc6Img from "@assets/maxresdefault_1778448217289.jpg";
import nba2kImg from "@assets/wp15758233_1778466521722.jpg";
import maddenImg from "@assets/G6IWhecWMAkaOiu_1778447744264.jpg";
import undisputedImg from "@assets/characters-from-undisputed-game_1778447744257.avif";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const ACTIVE_GAME = {
  id: "fight-night",
  name: "Fight Night",
  fullName: "Fight Night Champion",
  img: fightNightImg,
};

const LOCKED_NEARBY = {
  id: "ufc6",
  name: "UFC 6",
  img: ufc6Img,
};

const COMING_SOON = [
  { id: "nba", name: "NBA 2K26", img: nba2kImg },
  { id: "madden", name: "Madden 26", img: maddenImg },
  { id: "undisputed", name: "Undisputed 2", img: undisputedImg },
];

const QUICK_QUESTIONS = [
  "How do I beat Money Team style players?",
  "How do I counter lean-back players?",
  "How do elite players conserve stamina?",
  "What should I do if I'm winning rounds?",
  "How do I stop getting countered after combos?",
  "How do top players steal rounds late?",
  "Why does my stamina suddenly collapse?",
  "How do I pressure without draining stamina?",
];

const AI_RESPONSES: Record<string, string> = {
  "How do I beat Money Team style players?":
    "Money Team players rely on volume and forward pressure to dictate pace. Your best counter is disciplined footwork — circle away from their power hand and punish them on the way in. Wait for the second or third punch in their combo, not the first. Timing a check hook as they rush forces them to recalibrate, which breaks their rhythm for the entire exchange. Patience is the weapon.",
  "How do I counter lean-back players?":
    "Lean-back players bait you into overcommitting on single shots. Instead of reaching, use jabs to probe their timing and watch for the moment they reset their weight forward — that's your window. Body shots are exceptionally effective since they can't be avoided by leaning; they force engagement on your terms and slowly erode stamina.",
  "How do elite players conserve stamina?":
    "Elite players never throw full combos without purpose. They break exchanges down to 2–3 punch clusters with a reset step between each cluster. They also use the clinch strategically — not to stall, but to recover 3–5 seconds of stamina mid-round when it matters most. Footwork replaces punches whenever possible.",
  "What should I do if I'm winning rounds?":
    "If you're ahead on rounds, shift to a counter-fighting posture. Make them come to you. Every round they don't close the gap is a round in your column. Don't chase the knockout — let them get desperate and walk into your counters. Judge manipulation means winning clean rounds, not exciting ones.",
  "How do I stop getting countered after combos?":
    "The mistake is throwing a third or fourth punch when you've already landed the scoring shots. After 2 clean punches, reset your guard and step back. Train yourself to end every combo with movement, not another punch. The counter always hits fighters who are lunging into their last shot.",
  "How do top players steal rounds late?":
    "Late round theft comes from timing. Top players know exactly when the clock reaches the final 30 seconds and spike their activity — landing 4–6 clean punches in a burst when the opponent has mentally relaxed. End the round on your terms. The final 20 seconds often decide close rounds on the judge's card.",
  "Why does my stamina suddenly collapse?":
    "Stamina collapse usually means you've been throwing punches in bursts without full recovery between them. The game's stamina system is cumulative — each wasted punch costs more in the middle rounds than the first. Slow down in round 2 even when it feels wrong. The recovery investment always pays off in rounds 3 and 4.",
  "How do I pressure without draining stamina?":
    "Efficient pressure is footwork-led, not punch-led. Advance with steps and jabs — every jab costs less than half what a hook costs. Force your opponent to move and defend without you committing. When they slow down or stop moving, then you commit to a real combination. Pressure should be felt without being fueled by your stamina bar.",
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "ai",
    content:
      "Welcome to Metabuffed Coach. I'm ready to break down your Fight Night Champion performance. Upload a match for personalized analysis, or ask me anything about competitive meta.",
  },
];

export default function CoachPage() {
  const { openModal } = useModals();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const knownAnswer = AI_RESPONSES[text];
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content:
          knownAnswer ||
          `Based on current competitive meta for ${ACTIVE_GAME.fullName}, I'd need to see your gameplay footage to give you a truly precise breakdown. Upload a match and I'll analyze your stamina patterns, exchange timing, and round control in detail. If you have a specific situation in mind, describe it and I'll walk you through the meta read.`,
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    }, 1100);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex h-[100dvh] bg-black text-white font-sans overflow-hidden">

      {/* LEFT SIDEBAR */}
      <aside className="w-[240px] bg-[#080808] border-r border-white/5 flex-col hidden md:flex shrink-0">
        <div className="p-4 border-b border-white/5 flex items-center h-16">
          <Link href="/">
            <img src={logoImg} alt="Metabuffed" className="h-9 w-auto cursor-pointer" />
          </Link>
        </div>

        <div className="p-4">
          <Button
            className="w-full bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-wider text-xs h-9 flex gap-2"
            data-testid="btn-new-chat"
            onClick={() => setMessages(INITIAL_MESSAGES)}
          >
            <Plus className="w-3.5 h-3.5" /> New Session
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-7">
          {/* Recent Chats */}
          <div>
            <h3 className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold mb-3">Recent Chats</h3>
            <div className="flex flex-col items-center gap-2 py-5 px-2 text-center">
              <MessageSquare className="w-5 h-5 text-zinc-800" />
              <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">No recent analyses yet.</p>
              <p className="text-[10px] text-zinc-700 font-mono leading-relaxed">Upload gameplay or start a coaching session.</p>
            </div>
          </div>

          {/* Quick Questions */}
          <div>
            <h3 className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold mb-3">Quick Questions</h3>
            <div className="space-y-1">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-150 leading-snug"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-[#050505]">
          <div
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            onClick={() => openModal("signin")}
          >
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Guest User</p>
              <p className="text-[10px] text-primary font-medium truncate">Sign In to Save</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER — Chat */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Crimson ambient gradients */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(155,48,255,0.10)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.07)_0%,transparent_70%)]" />
        </div>

        {/* Chat header */}
        <header className="border-b border-white/5 bg-[#080808]/90 backdrop-blur-md px-6 py-3.5 shrink-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md overflow-hidden border border-primary/30 shrink-0 shadow-[0_0_8px_rgba(255,28,139,0.2)]">
              <img src={fightNightImg} alt="Fight Night Champion" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Fight Night Champion</p>
              <p className="text-[9px] font-mono text-primary uppercase tracking-widest">Active · Meta Analysis</p>
            </div>
          </div>
          <div className="md:hidden">
            <Link href="/">
              <img src={logoImg} alt="Metabuffed" className="h-8 w-auto cursor-pointer" />
            </Link>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8" ref={scrollRef}>
          <div className="max-w-2xl mx-auto space-y-7 pb-40">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30 shadow-[0_0_12px_rgba(255,28,139,0.2)] shrink-0 mt-0.5">
                    <img src={logoImg} alt="Metabuffed" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`max-w-[82%] ${msg.role === "user" ? "bg-zinc-900 text-white rounded-2xl rounded-tr-sm p-4 text-sm leading-relaxed" : ""}`}>
                  {msg.role === "ai" && (
                    <div className="bg-[#0f0f0f] border border-white/5 border-l-2 border-l-primary p-5 rounded-r-xl text-zinc-300 text-sm leading-relaxed shadow-lg">
                      {msg.content}
                    </div>
                  )}
                  {msg.role === "user" && msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30 shrink-0">
                  <img src={logoImg} alt="Metabuffed" className="w-full h-full object-cover" />
                </div>
                <div className="bg-[#0f0f0f] border border-white/5 border-l-2 border-l-primary px-5 py-4 rounded-r-xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-6 px-5 sm:px-8">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSend} className="relative flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the coach anything about Fight Night Champion..."
                className="w-full bg-[#111] border-white/10 text-white placeholder:text-zinc-600 h-13 pl-5 pr-14 rounded-xl focus-visible:ring-primary shadow-2xl text-sm"
                data-testid="input-chat"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1.5 bottom-1.5 h-auto w-10 bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:bg-zinc-800 rounded-lg"
                data-testid="btn-send-chat"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-center text-[9px] font-mono text-zinc-700 mt-3">Metabuffed · Coach Meta · Competitive Analysis AI</p>
          </div>
        </div>
      </main>

      {/* RIGHT PANEL — Select Game */}
      <aside className="w-[200px] bg-[#080808] border-l border-white/5 flex-col hidden lg:flex shrink-0">
        <div className="p-4 border-b border-white/5">
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold">Select Game</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Fight Night — Active */}
          <div className="relative rounded-xl overflow-hidden ring-2 ring-primary shadow-[0_0_18px_rgba(255,28,139,0.2)] cursor-default">
            <div className="h-24">
              <img src={ACTIVE_GAME.img} alt={ACTIVE_GAME.fullName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
              <p className="text-white font-bold text-[10px] uppercase leading-tight">{ACTIVE_GAME.fullName}</p>
              <p className="text-[8px] font-mono text-primary uppercase tracking-widest mt-0.5">● Active</p>
            </div>
          </div>

          {/* UFC 6 — Locked */}
          <div className="relative rounded-xl overflow-hidden ring-1 ring-white/5 opacity-50 grayscale cursor-not-allowed">
            <div className="h-24">
              <img src={LOCKED_NEARBY.img} alt={LOCKED_NEARBY.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/70 rounded-full p-1.5 border border-white/10">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
              <p className="text-white font-bold text-[10px] uppercase leading-tight">{LOCKED_NEARBY.name}</p>
              <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Locked</p>
            </div>
          </div>

          {/* Divider */}
          <div className="pt-2 pb-1">
            <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest px-1">Coming Soon</p>
          </div>

          {/* Coming soon games */}
          {COMING_SOON.map((game) => (
            <div
              key={game.id}
              className="relative rounded-xl overflow-hidden ring-1 ring-white/5 opacity-30 grayscale cursor-not-allowed"
            >
              <div className="h-16">
                <img src={game.img} alt={game.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-3 h-3 text-zinc-600" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-2 pb-1.5">
                <p className="text-zinc-400 font-bold text-[9px] uppercase leading-tight">{game.name}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
