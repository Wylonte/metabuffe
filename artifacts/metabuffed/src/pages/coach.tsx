import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send, User, Lock, MessageSquare } from "lucide-react";
import { useModals } from "@/hooks/use-modals";
import { useCoachChat } from "@workspace/api-client-react";
import {
  getCoachWelcome,
  getQuickQuestions,
  sendCoachMessage,
} from "@/lib/coach-client";
import {
  listComingSoonGamesWithImages,
  listGamesForCoach,
  type CoachGameId,
  isCoachGameId,
} from "@/lib/games";
import logoImg from "@assets/1000028977_1779456146886.png";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const COACH_GAMES = listGamesForCoach();
const COMING_SOON = listComingSoonGamesWithImages();

export default function CoachPage() {
  const { openModal } = useModals();
  const coachChat = useCoachChat();
  const searchParams = new URLSearchParams(window.location.search);
  const initialGameParam = searchParams.get("game");
  const initialGame: CoachGameId =
    initialGameParam && isCoachGameId(initialGameParam) ? initialGameParam : "fight-night";
  const [selectedGame, setSelectedGame] = useState<CoachGameId>(initialGame);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "ai", content: getCoachWelcome(initialGame) },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const switchGame = (gameId: CoachGameId) => {
    if (gameId === selectedGame) return;
    setSelectedGame(gameId);
    setInput("");
    setIsTyping(false);
    setMessages([{ id: "welcome-" + gameId, role: "ai", content: getCoachWelcome(gameId) }]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const history = messages
      .filter((m) => m.id !== "welcome" && !m.id.startsWith("welcome-"))
      .map((m) => ({
        role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));

    try {
      let reply: string;
      try {
        const result = await coachChat.mutateAsync({
          data: { gameId: selectedGame, message: text, history },
        });
        reply = result.reply;
      } catch {
        const offline = await sendCoachMessage({
          gameId: selectedGame,
          message: text,
          history,
        });
        reply = offline.reply;
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", content: reply },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    void sendMessage(input);
  };

  const game = COACH_GAMES.find((g) => g.id === selectedGame)!;
  const quickQuestions = getQuickQuestions(selectedGame);

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
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold border-0 uppercase tracking-wider text-xs h-9 flex gap-2 rounded-[8px] shadow-[0_0_12px_rgba(59,130,246,0.35)] hover:shadow-[0_0_18px_rgba(59,130,246,0.55)] transition-all duration-200"
            data-testid="btn-new-chat"
            onClick={() => setMessages([{ id: "welcome-reset", role: "ai", content: getCoachWelcome(selectedGame) }])}
          >
            <Plus className="w-3.5 h-3.5" /> New Session
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-7">
          <div>
            <h3 className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold mb-3">Recent Chats</h3>
            <div className="flex flex-col items-center gap-2 py-5 px-2 text-center">
              <MessageSquare className="w-5 h-5 text-zinc-800" />
              <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">No recent analyses yet.</p>
              <p className="text-[10px] text-zinc-700 font-mono leading-relaxed">Ask freeform or tap a suggested question.</p>
            </div>
          </div>

          <div>
            <h3 className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold mb-3">Suggested Questions</h3>
            <div className="space-y-1">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => void sendMessage(q)}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-150 leading-snug"
                  data-testid={`quick-q-${q.slice(0, 24)}`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[9px] font-mono text-zinc-700 leading-relaxed">
              Or type anything below — situations, matchups, counters, stamina, scoring.
            </p>
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
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(155,48,255,0.10)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.07)_0%,transparent_70%)]" />
        </div>

        <header className="border-b border-white/5 bg-[#080808]/90 backdrop-blur-md px-6 py-3.5 shrink-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md overflow-hidden border border-primary/30 shrink-0 shadow-[0_0_8px_rgba(255,28,139,0.2)]">
              <img src={game.img} alt={game.fullName} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">{game.fullName}</p>
              <p className="text-[9px] font-mono text-primary uppercase tracking-widest">Active · Freeform Meta Coach</p>
            </div>
          </div>
          <div className="md:hidden">
            <Link href="/">
              <img src={logoImg} alt="Metabuffed" className="h-8 w-auto cursor-pointer" />
            </Link>
          </div>
        </header>

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
                    <div className="bg-[#0f0f0f] border border-white/5 border-l-2 border-l-primary p-5 rounded-r-xl text-zinc-300 text-sm leading-relaxed shadow-lg whitespace-pre-line">
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

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-6 px-5 sm:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="md:hidden mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {quickQuestions.slice(0, 4).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void sendMessage(q)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-zinc-300 hover:text-white hover:bg-white/10 transition-colors max-w-[220px] truncate"
                >
                  {q}
                </button>
              ))}
            </div>
            <form onSubmit={handleSend} className="relative flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  game.id === "fight-night"
                    ? "Ask anything — Money Team, counters, stamina, matchups, or describe your situation..."
                    : "Ask anything about UFC 6 meta, or describe your situation..."
                }
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
            <p className="text-center text-[9px] font-mono text-zinc-700 mt-3">
              Suggested questions + freeform · Not a basic FAQ · Metabuffed Coach
            </p>
          </div>
        </div>
      </main>

      {/* RIGHT PANEL — Select Game */}
      <aside className="w-[200px] bg-[#080808] border-l border-white/5 flex-col hidden lg:flex shrink-0">
        <div className="p-4 border-b border-white/5">
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold">Select Game</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {COACH_GAMES.map((g) => (
          <div
              key={g.id}
            className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                selectedGame === g.id
                ? "ring-2 ring-primary shadow-[0_0_18px_rgba(255,28,139,0.2)]"
                : "ring-1 ring-[#3B82F6]/30 hover:ring-[#3B82F6]/60"
            }`}
              onClick={() => isCoachGameId(g.id) && switchGame(g.id)}
          >
            <div className="h-24">
                <img src={g.img} alt={g.fullName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
                <p className="text-white font-bold text-[10px] uppercase leading-tight">{g.fullName}</p>
                <p className={`text-[8px] font-mono uppercase tracking-widest mt-0.5 ${selectedGame === g.id ? "text-primary" : "text-[#60B8FF]"}`}>
                  {selectedGame === g.id ? "● Active" : "● Available"}
              </p>
            </div>
            </div>
          ))}

          <div className="pt-2 pb-1">
            <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest px-1">Coming Soon</p>
          </div>

          {COMING_SOON.map((g) => (
            <div
              key={g.id}
              className="relative rounded-xl overflow-hidden ring-1 ring-white/5 opacity-30 grayscale cursor-not-allowed"
            >
              <div className="h-16">
                <img src={g.img} alt={g.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-3 h-3 text-zinc-600" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-2 pb-1.5">
                <p className="text-zinc-400 font-bold text-[9px] uppercase leading-tight">{g.name}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
