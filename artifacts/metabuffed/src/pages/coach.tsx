import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send, ChevronDown, User, MessageSquare } from "lucide-react";
import { useModals } from "@/hooks/use-modals";
import logoImg from "@assets/Metabuffed_Official_Logo-removebg-preview_1778448740498.png";
import fightNightImg from "@assets/portada-fight-night-champion_1778448217282.jpg";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    content: "Welcome to Metabuffed Coach. I'm ready to analyze your competitive performance. Upload a match first for personalized breakdowns, or ask me anything about your game."
  },
  {
    id: "2",
    role: "user",
    content: "How do I stop getting countered after hooks?"
  },
  {
    id: "3",
    role: "ai",
    content: "In Fight Night Champion, throwing a second hook before resetting your guard leaves you vulnerable to counters. Shorten your combo to a single hook, step back after the first exchange, and only re-enter once your stamina bar recovers. This is especially critical in rounds 2 and 3 when fatigue compounds the timing gap."
  }
];

const SUGGESTIONS = [
  "What's my biggest weakness?",
  "How do I handle pressure fighters?",
  "Why do I lose close games?",
  "What should I practice today?"
];

export default function CoachPage() {
  const { openModal } = useModals();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { id: Date.now().toString(), role: "user", content: input }]);
    setInput("");
    
    // Simulate AI thinking then responding
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I'm analyzing your request based on current meta data. To give you the most accurate advice, I'd need to see a recent match. Would you like to upload one now?"
      }]);
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
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold hidden sm:inline-block">Context:</span>
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
              <img src={fightNightImg} alt="Game" className="w-5 h-5 rounded-sm object-cover" />
              <span className="text-sm font-bold uppercase tracking-wider">Fight Night Champion</span>
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
          <div className="md:hidden">
            {/* Mobile Nav Trigger placeholder if needed, skipping for brevity as wouter links in nav usually handle mobile */}
            <Link href="/">
              <img src={logoImg} alt="Metabuffed" className="h-8 w-auto cursor-pointer" />
            </Link>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-8 pb-32">
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
            {/* Suggestions */}
            <div className="flex gap-2 overflow-x-auto mb-4 no-scrollbar pb-2">
              {SUGGESTIONS.map(sugg => (
                <button 
                  key={sugg}
                  onClick={() => setInput(sugg)}
                  className="shrink-0 bg-[#111] hover:bg-[#1a1a1a] border border-white/10 text-zinc-300 hover:text-white text-xs font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap"
                  data-testid={`btn-suggestion-${sugg.slice(0,10)}`}
                >
                  {sugg}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="relative flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the coach anything..."
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
            <p className="text-center text-[10px] font-mono text-zinc-600 mt-3">Metabuffed Coach can make mistakes. Always review gameplay manually.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
