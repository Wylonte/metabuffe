import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileVideo, CheckCircle2, Clock, Loader2 } from "lucide-react";
import fightNightImg from "@assets/portada-fight-night-champion_1778448217282.jpg";
import maddenImg from "@assets/G6IWhecWMAkaOiu_1778447744264.jpg";
import gta6Img from "@assets/GTA6_1778447744267.webp";
import nba2kImg from "@assets/nba-2k26-standard-edition_1778447744265.avif";
import undisputedImg from "@assets/characters-from-undisputed-game_1778447744257.avif";
import ufc6Img from "@assets/maxresdefault_1778448217289.jpg";
import { Badge } from "@/components/ui/badge";

const GAMES = [
  { id: "fight-night", name: "Fight Night Champion", img: fightNightImg, available: true, color: "hover:border-primary", activeColor: "border-primary shadow-[0_0_20px_rgba(57,255,20,0.3)]" },
  { id: "nba", name: "NBA 2K26", img: nba2kImg, available: true, color: "hover:border-blue-500", activeColor: "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]" },
  { id: "madden", name: "Madden 26", img: maddenImg, available: true, color: "hover:border-green-500", activeColor: "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" },
  { id: "gta6", name: "GTA 6", img: gta6Img, available: false, color: "", activeColor: "" },
  { id: "undisputed2", name: "Undisputed 2", img: undisputedImg, available: false, color: "", activeColor: "" },
  { id: "ufc6", name: "UFC 6", img: ufc6Img, available: false, color: "", activeColor: "" },
];

export default function UploadPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialGame = searchParams.get("game");
  
  const [selectedGame, setSelectedGame] = useState<string | null>(initialGame || null);
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const selectedGameData = GAMES.find(g => g.id === selectedGame);

  return (
    <div className="min-h-[100dvh] bg-black text-foreground selection:bg-primary/30 pt-20">
      <Nav />
      
      <main className="container mx-auto px-6 py-16 max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Upload Your Match</h1>
          <p className="text-zinc-400 font-medium">Select your game, upload the footage, and get your AI breakdown.</p>
        </div>

        {/* Step 1: Game Selection */}
        <div className="mb-12">
          <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold mb-6">Step 1: Select Game</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
            {GAMES.map((game) => (
              <div 
                key={game.id}
                onClick={() => game.available && setSelectedGame(game.id)}
                className={`
                  relative shrink-0 w-48 h-32 rounded-xl overflow-hidden cursor-pointer border-2 snap-center transition-all duration-300
                  ${!game.available ? "opacity-50 border-white/5 cursor-not-allowed" : "border-white/10"}
                  ${game.available && selectedGame !== game.id ? game.color : ""}
                  ${selectedGame === game.id ? game.activeColor : ""}
                `}
                data-testid={`select-game-${game.id}`}
              >
                <img src={game.img} alt={game.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-black/20" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <h3 className="text-white font-bold uppercase text-sm leading-tight">{game.name}</h3>
                </div>
                {!game.available && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-black/60 text-white text-[8px] uppercase tracking-widest">Coming Soon</Badge>
                  </div>
                )}
                {selectedGame === game.id && (
                  <div className="absolute top-2 right-2 bg-primary text-black rounded-full p-1">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Upload Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold mb-6">Step 2: Upload Footage</h2>
          
          <label 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className={`
              flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
              ${selectedGame 
                ? (selectedGame === 'fight-night' ? "border-primary/50 bg-primary/5 hover:bg-primary/10" 
                 : selectedGame === 'nba' ? "border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10"
                 : "border-green-500/50 bg-green-500/5 hover:bg-green-500/10")
                : "border-white/20 bg-white/5 hover:bg-white/10"
              }
            `}
            data-testid="upload-zone"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <>
                  <FileVideo className={`w-12 h-12 mb-4 ${selectedGameData ? 'text-white' : 'text-primary'}`} />
                  <p className="mb-2 text-sm font-bold text-white uppercase tracking-wider">{file.name}</p>
                  <p className="text-xs text-zinc-400 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 mb-4 text-zinc-500" />
                  <p className="mb-2 text-lg font-bold text-white uppercase tracking-wider">Drag & drop your gameplay footage</p>
                  <p className="text-xs text-zinc-400 font-mono mb-6">Supported: MP4, MOV, AVI — Max 2GB</p>
                  <Button variant="outline" className="border-white/20 bg-black hover:bg-white/10 pointer-events-none uppercase tracking-widest text-xs font-bold px-6">
                    Browse Files
                  </Button>
                </>
              )}
            </div>
            <input id="dropzone-file" type="file" className="hidden" accept="video/*" onChange={handleFileChange} data-testid="input-file" />
          </label>
        </motion.div>

        {/* Step 3: Match Details (shows after file selected) */}
        {file && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-16"
          >
            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold mb-6">Step 3: Match Details</h2>
            <div className="bg-[#111] border border-white/10 p-8 rounded-2xl space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Match Type</label>
                <Select defaultValue="ranked">
                  <SelectTrigger className="w-full bg-black border-white/20 text-white h-12" data-testid="select-match-type">
                    <SelectValue placeholder="Select Match Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/20 text-white">
                    <SelectItem value="ranked">Ranked Match</SelectItem>
                    <SelectItem value="casual">Casual Match</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Notes for AI Coach (Optional)</label>
                <Textarea 
                  placeholder="Describe what you want analyzed... (e.g. 'I keep getting countered in the 3rd round', 'Why is my defense failing?')"
                  className="bg-black border-white/20 text-white placeholder:text-zinc-600 min-h-[100px] resize-none focus-visible:ring-primary"
                  data-testid="input-notes"
                />
              </div>

              <Button 
                size="lg" 
                className="w-full bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest h-14 text-sm"
                data-testid="btn-submit-upload"
              >
                Start Analysis
              </Button>
            </div>
          </motion.div>
        )}

        {/* Recent Uploads */}
        <div className="mt-20 border-t border-white/10 pt-16">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Recent Uploads</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-zinc-950 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-white uppercase text-sm mb-1">Fight Night Champion</h4>
                  <p className="text-[10px] font-mono text-zinc-500">UPLOAD_094 • 2 days ago</p>
                </div>
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <img src={fightNightImg} alt="Game" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-md w-fit">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Analysis Ready</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-zinc-950 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-white uppercase text-sm mb-1">NBA 2K26</h4>
                  <p className="text-[10px] font-mono text-zinc-500">UPLOAD_095 • 5 hours ago</p>
                </div>
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <img src={nba2kImg} alt="Game" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-md w-fit">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Processing (68%)</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-zinc-950 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-white uppercase text-sm mb-1">Madden 26</h4>
                  <p className="text-[10px] font-mono text-zinc-500">UPLOAD_096 • Just now</p>
                </div>
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <img src={maddenImg} alt="Game" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1.5 rounded-md w-fit border border-white/5">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Queued</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
