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
    "What is the current striking meta?",
    "How do I improve my head movement?",
    "How do I stop pressure fighters?",
    "How do I win the stamina battle?",
    "How do I become better on the ground?",
    "How do I stop takedowns?",
    "How do I escape bad ground positions?",
    "How do I beat counter strikers?",
    "How do elite players think?",
    "What should Metabuffed analyze?",
    "How do I become unpredictable?",
    "How do I cut off runners?",
    "How do I defend body attacks?",
    "How do I land more counters?",
    "When should I wrestle?",
    "How do I dominate from top position?",
    "How do I survive when rocked?",
    "What separates Division 20 players?",
    "Why do I lose close fights?",
    "How do I improve the fastest?",
  ],
};

const AI_RESPONSES: Record<GameId, Record<string, string>> = {
  "fight-night": {
    "How do I beat the Money Team block?":
      "The biggest mistake players make is attacking the guard instead of attacking the rhythm.\n\nThe Money Team system is not just holding block. Good players are tapping block, releasing, weaving slightly, resetting, and waiting for your commitment. The moment you overextend, they fire the power straight, sidestep uppercut, or reset behind the shell again.\n\nTo beat it, slow the fight down. Use lateral movement to close distance without committing. Step into range without throwing. Make them refresh block early. Attack the body during the reset. Do not throw long emotional combos at the shell. That is exactly what they want.\n\nYou beat Money Team by making them uncomfortable first.",
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
    "What is the current striking meta?":
      "META OVERVIEW\nThe current meta rewards efficiency over volume. Elite players don't throw the most punches — they land the cleanest punches while preserving stamina. They pressure safely, mix head and body attacks, and punish mistakes instead of forcing knockouts.\n\nHOW TO EXECUTE\n• Start with jabs and straight punches.\n• Mix body attacks into every exchange.\n• Stop combinations when the first strike misses.\n• Pressure only after forcing the opponent backward.\n• Leave exchanges before your stamina drops.\n\nCOMMON MISTAKES\nThrowing long combinations, chasing opponents, and swinging wildly after missing.\n\nMETABUFFED VERDICT\nWinning striking is about controlling exchanges, not winning every exchange.",
    "How do I improve my head movement?":
      "META OVERVIEW\nHead movement is prediction, not reaction.\n\nHOW TO EXECUTE\n• Slip straight punches.\n• Pull predictable hooks.\n• Duck wide hooks.\n• Reset immediately after every successful evade.\n• Counter with one clean strike.\n\nCOMMON MISTAKES\nRandom slipping, repeated pulling, moving your head while exhausted.\n\nMETABUFFED VERDICT\nRead habits first. Move your head second.",
    "How do I stop pressure fighters?":
      "META OVERVIEW\nPressure only works if you panic.\n\nHOW TO EXECUTE\n• Interrupt entries with straights.\n• Attack the body.\n• Circle away from the cage.\n• Keep combinations short.\n• Force resets after every exchange.\n\nCOMMON MISTAKES\nBacking straight up, throwing hooks while pressured, fighting emotionally.\n\nMETABUFFED VERDICT\nMake aggressive players restart their offense over and over.",
    "How do I win the stamina battle?":
      "META OVERVIEW\nStamina is often more important than health.\n\nHOW TO EXECUTE\n• Throw fewer strikes.\n• Make opponents miss.\n• Attack the body.\n• Don't waste energy chasing knockouts.\n• Stay composed when hurt.\n\nCOMMON MISTAKES\nSpamming combinations and throwing while exhausted.\n\nMETABUFFED VERDICT\nProtect your stamina like a second health bar.",
    "How do I become better on the ground?":
      "META OVERVIEW\nPosition comes before damage.\n\nHOW TO EXECUTE\n• Secure control first.\n• Deny transitions.\n• Advance position patiently.\n• Attack submissions after draining stamina.\n\nCOMMON MISTAKES\nRushing submissions and constantly transitioning.\n\nMETABUFFED VERDICT\nControl wins fights. Damage finishes them.",
    "How do I stop takedowns?":
      "META OVERVIEW\nGood defense starts before the shot.\n\nHOW TO EXECUTE\n• Stay off the cage.\n• Punish level changes.\n• Expect takedowns after combinations.\n• Make failed shots expensive.\n\nCOMMON MISTAKES\nStanding still and backing into the fence.\n\nMETABUFFED VERDICT\nFootwork prevents more takedowns than reactions.",
    "How do I escape bad ground positions?":
      "META OVERVIEW\nPatience creates escapes.\n\nHOW TO EXECUTE\n• Stay calm.\n• Protect stamina.\n• Defend first.\n• Escape after creating an opening.\n\nCOMMON MISTAKES\nSpamming transitions.\n\nMETABUFFED VERDICT\nDon't rush your escape. Earn it.",
    "How do I beat counter strikers?":
      "META OVERVIEW\nCounter fighters punish predictable offense.\n\nHOW TO EXECUTE\n• Use level changes and body threats to create openings.\n• Attack the body.\n• Delay your timing.\n• Mix in wrestling threats.\n\nCOMMON MISTAKES\nRepeating the same combinations.\n\nMETABUFFED VERDICT\nIf you're predictable, you're already losing.",
    "How do elite players think?":
      "META OVERVIEW\nElite players spend Round 1 collecting information.\n\nHOW TO EXECUTE\nWatch for:\n• Favorite combinations\n• Defensive habits\n• Cage movement\n• Takedown timing\n• Stamina usage\n\nAdjust every round.\n\nCOMMON MISTAKES\nUsing the same strategy all fight.\n\nMETABUFFED VERDICT\nThe best players adapt faster than their opponents.",
    "What should Metabuffed analyze?":
      "META OVERVIEW\nThe goal is identifying why you won or lost.\n\nANALYZE\n• Accuracy\n• Stamina\n• Defense\n• Head movement\n• Cage control\n• Counter timing\n• Ground control\n• Transition defense\n• Predictable habits\n\nMETABUFFED VERDICT\nWinning starts with understanding your patterns.",
    "How do I become unpredictable?":
      "META OVERVIEW\nPredictability is one of the biggest reasons good players lose. Elite opponents quickly recognize repeated entries, favorite combinations, and defensive habits.\n\nHOW TO EXECUTE\n• Change your opening strikes.\n• Alternate between head, body, and legs.\n• Vary your combination timing.\n• Use level changes before committing.\n• Occasionally do nothing and force reactions.\n\nCOMMON MISTAKES\nStarting every exchange the same way.\n\nMETABUFFED VERDICT\nIf your opponent knows what's coming, your offense is already compromised.",
    "How do I cut off runners?":
      "META OVERVIEW\nDon't chase opponents. Trap them.\n\nHOW TO EXECUTE\n• Walk them toward the fence.\n• Step diagonally instead of following.\n• Use jabs to stop movement.\n• Attack legs when they circle.\n• Force exchanges with smart positioning.\n\nCOMMON MISTAKES\nRunning directly after opponents.\n\nMETABUFFED VERDICT\nGood pressure is about positioning, not speed.",
    "How do I defend body attacks?":
      "META OVERVIEW\nBody damage destroys stamina and limits your offense.\n\nHOW TO EXECUTE\n• Recognize body attack patterns.\n• Punish repeated body punches.\n• Step outside after blocking.\n• Make body hunters pay with counters.\n\nCOMMON MISTAKES\nOnly protecting your head.\n\nMETABUFFED VERDICT\nIgnoring body damage costs fights before you realize it.",
    "How do I land more counters?":
      "META OVERVIEW\nCounters come from anticipation, not reflexes.\n\nHOW TO EXECUTE\n• Learn opponent patterns.\n• Wait for missed strikes.\n• Throw one clean counter.\n• Reset immediately afterward.\n\nCOMMON MISTAKES\nTrying to counter every punch.\n\nMETABUFFED VERDICT\nPatience creates better counters than speed.",
    "When should I wrestle?":
      "META OVERVIEW\nThe best wrestlers strike first to earn takedowns.\n\nHOW TO EXECUTE\nShoot after:\n• Missed combinations.\n• Body attacks.\n• Opponent fatigue.\n• Cage pressure.\n• Successful level change entries.\n\nCOMMON MISTAKES\nShooting from long range without setup.\n\nMETABUFFED VERDICT\nSetup wins takedowns. Desperation loses them.",
    "How do I dominate from top position?":
      "META OVERVIEW\nTop control is about forcing mistakes.\n\nHOW TO EXECUTE\n• Maintain position.\n• Deny transitions.\n• Drain stamina.\n• Advance patiently.\n• Strike only when safe.\n\nCOMMON MISTAKES\nConstantly posturing up.\n\nMETABUFFED VERDICT\nEvery denied transition makes your next attack stronger.",
    "How do I survive when rocked?":
      "META OVERVIEW\nMost finishes happen because players panic.\n\nHOW TO EXECUTE\n• Stop throwing.\n• Recover while defending.\n• Circle away safely.\n• Avoid reckless exchanges.\n• Slow the pace.\n\nCOMMON MISTAKES\nSwinging wildly while stunned.\n\nMETABUFFED VERDICT\nSurvival wins more fights than desperation.",
    "What separates Division 20 players?":
      "META OVERVIEW\nHigh-ranked players consistently make better decisions under pressure.\n\nHOW TO EXECUTE\nThey:\n• Waste less stamina.\n• Defend before attacking.\n• Adapt every round.\n• Punish habits.\n• Stay emotionally controlled.\n\nCOMMON MISTAKES\nTrying to force finishes instead of building advantages.\n\nMETABUFFED VERDICT\nElite players win with discipline, not highlight reels.",
    "Why do I lose close fights?":
      "META OVERVIEW\nClose fights are usually decided by small mistakes repeated throughout the match.\n\nHOW TO EXECUTE\nReview:\n• Missed strikes.\n• Block efficiency.\n• Cage control.\n• Stamina management.\n• Predictable offense.\n• Defensive habits.\n\nCOMMON MISTAKES\nBlaming judges instead of reviewing decisions.\n\nMETABUFFED VERDICT\nSmall mistakes repeated become championship losses.",
    "How do I improve the fastest?":
      "META OVERVIEW\nImprovement comes from correcting recurring mistakes, not learning hundreds of new techniques.\n\nHOW TO EXECUTE\nAfter every fight identify:\n• One offensive mistake.\n• One defensive mistake.\n• One stamina mistake.\n• One positioning mistake.\n• One successful habit to keep.\n\nImprove those before learning anything new.\n\nCOMMON MISTAKES\nTrying to fix everything at once.\n\nMETABUFFED VERDICT\nThe fastest climbers don't learn more — they repeat fewer mistakes.",
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
