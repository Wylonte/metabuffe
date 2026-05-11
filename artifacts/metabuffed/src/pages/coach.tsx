import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send, User, MessageSquare } from "lucide-react";
import { useModals } from "@/hooks/use-modals";
import logoImg from "@assets/Metabuffed_Official_Logo-removebg-preview_1778448740498.png";
import fightNightImg from "@assets/f8jFkfr_1778467206855.jpg";
import nba2kImg from "@assets/wp15758233_1778466521722.jpg";
import maddenImg from "@assets/G6IWhecWMAkaOiu_1778447744264.jpg";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const GAMES = [
  { id: "fight-night", name: "Fight Night", fullName: "Fight Night Champion", img: fightNightImg },
  { id: "nba", name: "NBA 2K26", fullName: "NBA 2K26", img: nba2kImg },
  { id: "madden", name: "Madden 26", fullName: "Madden 26", img: maddenImg },
];

const GAME_MESSAGES: Record<string, Message[]> = {
  "fight-night": [
    { id: "1", role: "ai", content: "Welcome to Metabuffed Coach. I'm ready to analyze your Fight Night Champion performance. Upload a match first for personalized breakdowns, or ask me anything." },
    { id: "2", role: "user", content: "How do I stop getting countered after hooks?" },
    { id: "3", role: "ai", content: "In Fight Night Champion, throwing a second hook before resetting your guard leaves you vulnerable to counters. Shorten your combo to a single hook, step back after the first exchange, and only re-enter once your stamina bar recovers. This is especially critical in rounds 2 and 3 when fatigue compounds the timing gap." }
  ],
  "nba": [
    { id: "1", role: "ai", content: "Welcome to Metabuffed Coach. Ready to break down your NBA 2K26 game. Upload a match for a full breakdown, or ask me anything about your playstyle." },
    { id: "2", role: "user", content: "My defense keeps breaking down in the 4th quarter." },
    { id: "3", role: "ai", content: "Late-game defensive breakdowns in 2K26 are almost always a stamina or rotation issue. If your players' stamina is below 60%, their lateral speed drops significantly — press rotations become impossible to execute. Sub in your bench defenders during the 3rd quarter to keep starters fresh. Also check if you're gambling on steals — every failed steal attempt is a blown assignment." }
  ],
  "madden": [
    { id: "1", role: "ai", content: "Welcome to Metabuffed Coach. Let's break down your Madden 26 film. Upload a match for deep analysis, or shoot me a question about your game." },
    { id: "2", role: "user", content: "I keep losing to Cover 2 defenses." },
    { id: "3", role: "ai", content: "Cover 2 shells the flat and drops two deep safeties — the weaknesses are the middle seam and corner routes behind the flat defenders. Run your TE up the seam while flooding one side with a flat and a corner route. The flat defender has to choose, and the corner route behind him comes open. Mesh concepts also shred Cover 2 consistently." }
  ]
};

const SUGGESTIONS: Record<string, string[]> = {
  "fight-night": ["What's my biggest weakness?", "How do I handle pressure fighters?", "When should I clinch?", "Best combo to finish a round?"],
  "nba": ["How do I stop pick and roll?", "Best plays in the half court?", "Why do I lose late games?", "How do I improve my defense?"],
  "madden": ["How do I beat zone coverage?", "Best run plays to call?", "How do I stop the pass rush?", "What defensive scheme should I run?"],
};

export default function CoachPage() {
  const { openModal } = useModals();
  const [activeGame, setActiveGame] = useState("fight-night");
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(GAME_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = allMessages[activeGame] ?? [];
  const currentGame = GAMES.find(g => g.id === activeGame)!;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeGame]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setAllMessages(prev => ({ ...prev, [activeGame]: [...(prev[activeGame] ?? []), newMsg] }));
    setInput("");

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I'm analyzing your request based on current meta data for " + currentGame.fullName + ". To give you the most accurate advice, I'd need to see a recent match. Would you like to upload one now?"
      };
      setAllMessages(prev => ({ ...prev, [activeGame]: [...(prev[activeGame] ?? []), aiResponse] }));
    }, 1000);
  };

  return (
    <div className="flex h-[100dvh] bg-black text-white font-sans overflow-hidden">

      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0a0a0a] border-r border-white/5 flex-col hidden md:flex shrink-0">
        <div className="p-4 border-b border-white/5 flex items-center h-16">
          <Link href="/">
            <img src={logoImg} alt="Metabuffed" className="h-10 w-auto cursor-pointer" />
          </Link>
        </div>

        <div className="p-4">
          <Button className="w-full bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider text-xs h-10 flex gap-2" data-testid="btn-new-chat">
            <Plus className="w-4 h-4" /> New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-3 px-2">Recent Chats</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-lg text-left text-sm text-white group hover:bg-white/10 transition-colors">
                <MessageSquare className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                <span className="truncate font-medium">Fight Night — Stamina Issues</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4 text-zinc-500" />
                <span className="truncate">NBA 2K — Defense Help</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4 text-zinc-500" />
                <span className="truncate">Madden — 4th Quarter Collapse</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-[#050505]">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors" onClick={() => openModal("signin")}>
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Guest User</p>
              <p className="text-xs text-primary font-medium truncate">Sign In to Save</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Header — Game Context Switcher */}
        <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-3 shrink-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold hidden sm:inline-block">Game Context</span>
              <div className="flex items-center gap-2">
                {GAMES.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setActiveGame(game.id)}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      activeGame === game.id
                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(57,255,20,0.2)]"
                        : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white hover:bg-white/10"
                    }`}
                    data-testid={`context-${game.id}`}
                  >
                    <img src={game.img} alt={game.name} className="w-5 h-5 rounded-sm object-cover shrink-0" />
                    <span className="hidden sm:inline">{game.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="md:hidden">
              <Link href="/">
                <img src={logoImg} alt="Metabuffed" className="h-8 w-auto cursor-pointer" />
              </Link>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-8 pb-36">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                    <span className="text-primary font-black text-xs">AI</span>
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === "user" ? "bg-zinc-800 text-white rounded-2xl rounded-tr-sm" : "text-zinc-300"} p-0 sm:p-2`}>
                  {msg.role === "user" ? (
                    <div className="p-4">{msg.content}</div>
                  ) : (
                    <div className="bg-[#111] border-l-2 border-primary p-5 rounded-r-xl shadow-lg leading-relaxed font-medium">
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-10 pb-6 px-4 sm:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 overflow-x-auto mb-4 no-scrollbar pb-2">
              {(SUGGESTIONS[activeGame] ?? []).map(sugg => (
                <button
                  key={sugg}
                  onClick={() => setInput(sugg)}
                  className="shrink-0 bg-[#111] hover:bg-[#1a1a1a] border border-white/10 text-zinc-300 hover:text-white text-xs font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap"
                  data-testid={`btn-suggestion-${sugg.slice(0, 10)}`}
                >
                  {sugg}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} className="relative flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask the coach anything about ${currentGame.fullName}...`}
                className="w-full bg-[#111] border-white/20 text-white placeholder:text-zinc-500 h-14 pl-6 pr-16 rounded-xl focus-visible:ring-primary shadow-2xl"
                data-testid="input-chat"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                className="absolute right-2 top-2 bottom-2 h-10 w-10 bg-primary text-black hover:bg-primary/90 disabled:opacity-50 disabled:bg-zinc-700"
                data-testid="btn-send-chat"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-center text-[10px] font-mono text-zinc-600 mt-3">Metabuffed · Coach Meta · Powered by AI trained on competitive gameplay</p>
          </div>
        </div>
      </main>
    </div>
  );
}
