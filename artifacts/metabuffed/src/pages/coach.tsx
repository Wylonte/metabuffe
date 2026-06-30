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

type GameId = "fight-night" | "ufc6";

const GAMES: Record<GameId, { id: GameId; name: string; fullName: string; img: string }> = {
  "fight-night": {
    id: "fight-night",
    name: "Fight Night",
    fullName: "Fight Night Champion",
    img: fightNightImg,
  },
  ufc6: {
    id: "ufc6",
    name: "UFC 6",
    fullName: "UFC 6",
    img: ufc6Img,
  },
};

const COMING_SOON = [
  { id: "nba", name: "NBA 2K26", img: nba2kImg },
  { id: "madden", name: "Madden 26", img: maddenImg },
  { id: "undisputed", name: "Undisputed 2", img: undisputedImg },
];

const QUICK_QUESTIONS: Record<GameId, string[]> = {
  "fight-night": [
    "How do I beat the Money Team block?",
    "How do I actually do the Money Team block?",
    "Why do I keep losing rounds after landing more punches?",
    "Should I hold block or tap block?",
    "Why is the power straight so broken?",
    "When should I use the sidestep uppercut?",
    "What is push straight spam and how do I beat it?",
    "Why do elite players barely throw combinations?",
    "What is the best OWC style?",
    "Why are fighters without power punches at a disadvantage?",
    "What is rhythm manipulation?",
    "What is the Fear Loop?",
    "How do I preserve stamina for later rounds?",
    "How do I know when my opponent is tired?",
    "What is controlled cheese?",
    "What is scorecard manipulation?",
    "How do I beat pressure fighters?",
    "How do I beat body spam?",
    "How do I know when my opponent is mentally breaking?",
    "What separates top players from world-class players?",
  ],
  ufc6: [
    "What's the best counter to a southpaw in UFC 6?",
    "How do I defend takedowns from cage pressure?",
    "What's the meta striking style right now?",
    "How do I set up the body triangle from back control?",
    "When should I shoot vs stay on the feet?",
    "How do I get out of full mount?",
    "What's the most effective combo to the body in UFC 6?",
    "How do I time the slip to counter straight punches?",
    "How do I stop getting leg kicked to death?",
    "What's the best way to finish from back control?",
    "How do I defend against a ground and pound specialist?",
    "When should I clinch instead of boxing at range?",
  ],
};

const AI_RESPONSES: Record<GameId, Record<string, string>> = {
  "fight-night": {
    "How do I beat the Money Team block?":
      "The biggest mistake players make is attacking the guard instead of attacking the rhythm.\n\nThe Money Team system is not just holding block. Good players are tapping block, releasing, weaving slightly, resetting, and waiting for your commitment. The moment you overextend, they fire the power straight, sidestep uppercut, or reset behind the shell again.\n\nTo beat it, slow the fight down. Feint entries. Step into range without throwing. Make them refresh block early. Attack the body during the reset. Do not throw long emotional combos at the shell. That is exactly what they want.\n\nYou beat Money Team by making them uncomfortable first.",
    "How do I actually do the Money Team block?":
      "The basic rhythm is: block tap, slight weave, release, reset, power straight.\n\nYou are not supposed to hold block like a statue. You tap block, refresh guard, move slightly off centerline, then reset into offense.\n\nThe goal is to stay protected while always being ready to fire back. The power straight is usually the main weapon because it interrupts pressure, scores well, and creates space.\n\nThe shell works because it makes opponents impatient.",
    "Why do I keep losing rounds after landing more punches?":
      "Fight Night Champion does not score like real boxing.\n\nThe game rewards impact moments, power shots, clean counters, stuns, and momentum swings. You can outland someone badly with jabs and light punches, but if they land two or three clean power straights late, the game may give them the round.\n\nThat is why elite players do not only chase punch totals. They chase meaningful moments.\n\nIf the round is close, win the final 20 to 30 seconds with clean power offense or counters.",
    "Should I hold block or tap block?":
      "Tap block.\n\nHolding block forever makes you predictable and lets your guard get broken down. Elite defense is rhythmic. Tap, release, move, reset.\n\nYou want your defense to feel alive. The goal is not to block every punch. The goal is to avoid clean impact, preserve stamina, stay balanced, and be ready to counter.\n\nStatic defense eventually dies.",
    "Why is the power straight so broken?":
      "Because it fits everything the game rewards.\n\nIt is fast, direct, scores hard, interrupts offense, and creates visible impact. When it lands while someone is stepping in or recovering from a punch, it can completely swing a round.\n\nThe best players do not just spam it randomly. They wait until you commit, then throw it through your recovery.\n\nThe power straight is dangerous because of timing, not just power.",
    "When should I use the sidestep uppercut?":
      "Use it when your opponent enters predictably.\n\nIf they keep walking straight in, throwing the same jab straight, or pressuring on the same rhythm, a small sidestep breaks their alignment. The uppercut then lands from an awkward angle.\n\nDo not throw sidestep uppercuts just because you want a stun. Throw them when your opponent gives you the entry pattern.\n\nRandom sidestep uppercuts are spam. Timed sidestep uppercuts are meta.",
    "What is push straight spam and how do I beat it?":
      "Push straight spam works because people stand directly where the straight wants their head to be.\n\nTo beat it, stop living on the centerline. Take small angles. Make the straight miss slightly. Do not chase forward emotionally. Bait the straight, step outside, then counter during the recovery.\n\nThe answer is not simply blocking. The answer is positioning.\n\nStraight spam becomes weaker when you stop giving it a straight line.",
    "Why do elite players barely throw combinations?":
      "Because every extra punch adds risk.\n\nAt high level, a clean two-punch sequence and reset is often better than a six-punch combo that gets countered. Fight Night rewards efficiency, not just volume.\n\nElite players are not trying to look busy. They are trying to land what matters, avoid damage, and conserve stamina.\n\nThe best offense is often short, sharp, and safe.",
    "What is the best OWC style?":
      "Brawler and Inside Fighter are usually the safest meta choices.\n\nThey give you power, toughness, pressure tools, and better ability to survive ugly exchanges. Other styles can win, but they usually require cleaner execution.\n\nOutside Fighter, Counter Puncher, and Boxer Puncher can be fun, but you are often giving up power and toughness in a game that heavily rewards impact.\n\nIf two players are equal skill, the stronger meta build usually has the advantage.",
    "Why are fighters without power punches at a disadvantage?":
      "Because Fight Night Champion rewards impact.\n\nA speed fighter can land more shots and still lose if those shots do not create visible damage or momentum. A power puncher can steal a round with fewer punches because the engine values the heavier moments.\n\nIf your fighter lacks power, you must win rounds clearly. Do not trade. Do not let rounds stay close. Use the jab for positioning, move well, attack the body, and avoid giving up big moments.\n\nTechnical fighters must be cleaner because the scorecards do not always protect them.",
    "What is rhythm manipulation?":
      "Rhythm manipulation is making your opponent fight on your timing.\n\nIf someone always throws jab straight at the same speed, you can step back on the jab and counter the straight. If they always block after your jab, delay the second punch and catch them releasing guard.\n\nElite players do not just react. They study rhythm, break rhythm, and force reactions.\n\nOnce you control timing, you control the fight.",
    "What is the Fear Loop?":
      "The Fear Loop starts when your opponent stops trusting their offense.\n\nThey throw, miss, and get countered. Then they hesitate. That hesitation makes them slower. Slower offense becomes easier to read. Then they get countered again.\n\nThat cycle breaks confidence.\n\nElite defenders make opponents afraid to throw. Once a player is scared to attack, they are no longer fighting freely.",
    "How do I preserve stamina for later rounds?":
      "Stop wasting movement early.\n\nMost stamina problems begin in rounds one through four. Missed power punches, unnecessary stepping, emotional combinations, and chasing all drain you.\n\nElite players make opponents miss, throw short combos, attack the body, and reset calmly.\n\nIf you are exhausted in round eight, the mistake probably happened in round two.",
    "How do I know when my opponent is tired?":
      "Watch their reactions.\n\nTired players recover slower, block late, move too much, stop throwing combinations, miss wider, and panic when pressured. Their counters come late and their footwork gets sloppy.\n\nWhen you see fatigue, do not rush. Make them work. Touch the body. Force them to reset. Let their stamina collapse before you force the finish.",
    "What is controlled cheese?":
      "Controlled cheese is using strong mechanics intelligently instead of spamming blindly.\n\nPower straight after a read is controlled cheese. Sidestep uppercut after predictable pressure is controlled cheese. Money Team block into reset straight is controlled cheese.\n\nMindless spam becomes readable. Controlled cheese stays dangerous because it has timing and purpose.\n\nThe best players weaponize the meta without becoming predictable.",
    "What is scorecard manipulation?":
      "Scorecard manipulation means understanding what the judges actually reward.\n\nFight Night often values impact, counters, power shots, and late momentum more than clean volume. That means elite players try to land the biggest shots near the end of close rounds.\n\nYou do not always need to dominate the whole round. Sometimes you need to win the moments the game remembers.\n\nThat is why final 20 seconds matter so much.",
    "How do I beat pressure fighters?":
      "Do not run in straight lines.\n\nPressure fighters want you backing up predictably. Instead, take small angles, pivot out, jab to interrupt, and make them reset their feet.\n\nAttack the body when they enter. Do not throw long combos unless they are tired or out of position.\n\nThe goal is to make pressure expensive. If they spend stamina every time they come forward, the fight turns in your favor later.",
    "How do I beat body spam?":
      "Body spam only works when you allow close range for free.\n\nControl distance first. Do not stand chest to chest unless you are ready to counter. Short uppercuts, step backs, pivots, and straights can punish body entries.\n\nIf they throw body combinations, they are exposed upstairs and through the middle. Time the uppercut or straight as they enter.\n\nBody spam is dangerous, but it needs range. Deny the range.",
    "How do I know when my opponent is mentally breaking?":
      "Look for emotional decisions.\n\nThey stop jabbing. They chase. They throw power shots first. They move too much. They repeat the same punch. They abandon their plan.\n\nWhen you see that, stay calm. Do not rush the finish. Emotional players usually create their own opening.\n\nYour job is to stay disciplined while they unravel.",
    "What separates top players from world-class players?":
      "Top players have mechanics.\n\nWorld-class players have reads.\n\nA world-class player studies your habits within the first two rounds. They learn your favorite punch, your panic option, your escape direction, when you block, when you throw, and when you get emotional.\n\nAfter that, they are not guessing anymore. They are predicting.\n\nThe highest level of Fight Night Champion is not hand speed. It is seeing the fight before it happens.",
  },
  ufc6: {
    "What's the best counter to a southpaw in UFC 6?":
      "Against southpaws, your lead foot position is everything — keep your right foot outside their left foot so they can't land their power left hand clean. Use your jab to disrupt their rhythm and watch for the right hook counter the moment they throw their left straight. Circling to your right (their weak side) forces them to reset constantly and kills their offensive flow. Patience wins the stance battle.",
    "How do I defend takedowns from cage pressure?":
      "Cage pressure takedowns are won before the shot — not during it. When your back hits the cage, immediately underhook one arm and use your hips to create lateral movement. Sprawling straight back against the cage gives them the angle; spinning to the open mat breaks it. The moment they drop for the level change, time your sprawl and throw your hips back hard. Getting comfortable at the cage wall is 80% of the battle.",
    "What's the meta striking style right now?":
      "The current UFC 6 meta rewards length fighters who work behind the jab and use the lateral step to create angles after each combination. Volume boxers who spam single strikes are getting picked apart by counter specialists. The most effective style right now is a disciplined pressure game — two-punch combos to the body to bring the guard down, then the straight or overhand upstairs. Don't chase KOs; let the combinations set them up.",
    "How do I set up the body triangle from back control?":
      "From back control, the body triangle is earned through distraction, not force. Work your hooks first — throw the rear hook to make them defend their head, then slide your leg over and lock the triangle while their arms are occupied. If they're defending the choke well, their body is exposed. Release hand pressure briefly to fully lock the triangle, then return to the choke. The triangle drains their stamina every time they try to stand or roll.",
    "When should I shoot vs stay on the feet?":
      "Shoot when you've disrupted their rhythm with combinations — a fighter who just ate a jab-cross combo has their weight distribution wrong and their reaction time is 15–20% slower. Never shoot from distance without setup; it gets you hit. Wrestlers win by mixing strikes until the striking defense opens a lane, then committing fully to the level change. If they're circling actively, reset and re-establish the jab before shooting.",
    "How do I get out of full mount?":
      "Full mount escapes require you to control the pace, not panic. Bridge and roll is most effective against opponents who post wide — wait for them to throw a punch, use their forward momentum to bridge hard to one side. If they're tight and compact, frame against their hips and create space for the elbow-knee escape. Never give up your back trying to escape mount — taking the rear clinch position is usually worse than working from mount patiently.",
    "What's the most effective combo to the body in UFC 6?":
      "The double jab to the body followed by a right hook upstairs is the highest-percentage body attack in the current meta. Two body jabs drag their guard down and teach their defensive reflex to dip — then the hook catches them mid-adjustment. Follow up with another jab to the body to reset the pattern. After 3–4 repetitions you'll see them hesitate, which is your window for heavier shots. Body work compounds; it doesn't pay off immediately.",
    "How do I time the slip to counter straight punches?":
      "Slipping punches is about reading the shoulder, not the hand. The shoulder begins rotating before the punch extends — once you key on that tell, you'll slip early instead of late. Move outside the punch line (slip to the outside of a right straight by moving your head left), which positions you perfectly for the counter left hook. Practice the slip-counter as a single fluid motion, not two separate actions. Timing beats speed every time.",
    "How do I stop getting leg kicked to death?":
      "Leg kick defense starts with checking — lift your lead shin at a 45-degree angle to meet their kick. The check transfers all the damage back to their shin, and after 2–3 clean checks most opponents abandon the leg kick entirely. When you're not checking, keep your lead leg from being a static target — small weight shifts and footwork deny them a clean angle. Don't load up single counter punches after the kick; step outside and return a body jab instead.",
    "What's the best way to finish from back control?":
      "The rear naked choke is the primary threat, but don't burn stamina forcing it against active hands. Use your hooks to control their hips and prevent the standup, then work on breaking their grip with a seatbelt. Once the seatbelt is locked, slide your choking arm under their chin during any moment they reach to defend — a short neck, a dropped chin, or a failed roll attempt. The choke should feel like it appears, not like it's forced.",
    "How do I defend against a ground and pound specialist?":
      "From the bottom, your immediate priority is frame creation — put both forearms against their hips or chest to keep them from posting and loading heavy shots. Framing buys you time to work your guard recovery or create space for a hip escape. The biggest mistake is covering your face and going passive; passive bottom position is a GnP specialist's dream. Keep moving your hips, constantly threaten submissions to disrupt their posture, and look for half guard transitions.",
    "When should I clinch instead of boxing at range?":
      "Clinch when you're hurt, when they're loading up single big shots, or when you're winning on the inside and they want to reset. Closing distance against a big puncher removes their power advantage — most KO artists lose their threat in the clinch. Don't clinch when you're gassing, as it often accelerates the stamina drain. Use the clinch as a tool to dictate pacing, not as a place to rest. Effective clinch work means you're landing knees and maintaining position, not just holding on.",
  },
};

const WELCOME: Record<GameId, string> = {
  "fight-night": "Welcome to Metabuffed Coach. I analyze Fight Night Champion at a competitive level — stamina management, pressure defense, body work, and combo timing. Upload a match for a personalized breakdown, or ask me anything.",
  ufc6: "Welcome to Metabuffed Coach. I analyze UFC 6 at a competitive level — striking meta, grappling setups, cage IQ, and ground game. Upload a match for a personalized breakdown, or ask me anything.",
};

const FALLBACK: Record<GameId, string> = {
  "fight-night": "Based on the current Fight Night Champion meta, I'd need to see your gameplay footage to give you a precise breakdown. Upload a match and I'll analyze your stamina patterns, exchange timing, and punch selection in detail. If you have a specific situation in mind, describe it and I'll walk you through the read.",
  ufc6: "Based on current competitive meta for UFC 6, I'd need to see your gameplay footage to give you a truly precise breakdown. Upload a match and I'll analyze your stamina patterns, exchange timing, and round control in detail. If you have a specific situation in mind, describe it and I'll walk you through the meta read.",
};

const PLACEHOLDER: Record<GameId, string> = {
  "fight-night": "Ask the coach anything about Fight Night Champion...",
  ufc6: "Ask the coach anything about UFC 6...",
};

export default function CoachPage() {
  const { openModal } = useModals();
  const [selectedGame, setSelectedGame] = useState<GameId>("fight-night");
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "ai", content: WELCOME["fight-night"] },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const switchGame = (gameId: GameId) => {
    if (gameId === selectedGame) return;
    setSelectedGame(gameId);
    setInput("");
    setIsTyping(false);
    setMessages([{ id: "welcome-" + gameId, role: "ai", content: WELCOME[gameId] }]);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const knownAnswer = AI_RESPONSES[selectedGame][text];
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: knownAnswer || FALLBACK[selectedGame],
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    }, 1100);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const game = GAMES[selectedGame];

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
            onClick={() => setMessages([{ id: "welcome-reset", role: "ai", content: WELCOME[selectedGame] }])}
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
              {QUICK_QUESTIONS[selectedGame].map((q) => (
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
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(155,48,255,0.10)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.07)_0%,transparent_70%)]" />
        </div>

        {/* Chat header */}
        <header className="border-b border-white/5 bg-[#080808]/90 backdrop-blur-md px-6 py-3.5 shrink-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md overflow-hidden border border-primary/30 shrink-0 shadow-[0_0_8px_rgba(255,28,139,0.2)]">
              <img src={game.img} alt={game.fullName} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">{game.fullName}</p>
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

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-6 px-5 sm:px-8">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSend} className="relative flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={PLACEHOLDER[selectedGame]}
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
          {/* Fight Night */}
          <div
            className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
              selectedGame === "fight-night"
                ? "ring-2 ring-primary shadow-[0_0_18px_rgba(255,28,139,0.2)]"
                : "ring-1 ring-[#3B82F6]/30 hover:ring-[#3B82F6]/60"
            }`}
            onClick={() => switchGame("fight-night")}
          >
            <div className="h-24">
              <img src={fightNightImg} alt="Fight Night Champion" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
              <p className="text-white font-bold text-[10px] uppercase leading-tight">Fight Night Champion</p>
              <p className={`text-[8px] font-mono uppercase tracking-widest mt-0.5 ${selectedGame === "fight-night" ? "text-primary" : "text-[#60B8FF]"}`}>
                {selectedGame === "fight-night" ? "● Active" : "● Available"}
              </p>
            </div>
          </div>

          {/* UFC 6 */}
          <div
            className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
              selectedGame === "ufc6"
                ? "ring-2 ring-primary shadow-[0_0_18px_rgba(255,28,139,0.2)]"
                : "ring-1 ring-[#3B82F6]/30 hover:ring-[#3B82F6]/60"
            }`}
            onClick={() => switchGame("ufc6")}
          >
            <div className="h-24">
              <img src={ufc6Img} alt="UFC 6" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
              <p className="text-white font-bold text-[10px] uppercase leading-tight">UFC 6</p>
              <p className={`text-[8px] font-mono uppercase tracking-widest mt-0.5 ${selectedGame === "ufc6" ? "text-primary" : "text-[#60B8FF]"}`}>
                {selectedGame === "ufc6" ? "● Active" : "● Available"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="pt-2 pb-1">
            <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest px-1">Coming Soon</p>
          </div>

          {/* Coming soon games */}
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
