import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BreakdownModal({ isOpen, onClose }: BreakdownModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col bg-black">
        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-950">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-black text-white uppercase tracking-widest">MATCH BREAKDOWN</h1>
            <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Fight Night Champion</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white" data-testid="btn-close-breakdown">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-5xl py-8 px-6">
            
            {/* Top Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mb-8"
            >
              <div className="h-32 bg-gradient-to-r from-[rgba(10,50,20,0.8)] to-black border-b border-white/5 flex items-end px-8 pb-6">
                <div className="flex items-end justify-between w-full">
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">Pressure Counter Fighter</h3>
                    <p className="text-sm font-mono text-zinc-400">Fight Night Champion • Ranked Match</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Global Grade</p>
                    <p className="text-6xl font-black text-primary leading-none drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">B+</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 bg-zinc-950">
                {["overview", "mistakes", "strengths", "suggestions"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${
                      activeTab === tab 
                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                    }`}
                    data-testid={`tab-${tab}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8 min-h-[400px]">
                {activeTab === "overview" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div>
                      <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold mb-6">Performance Score</h4>
                      <div className="space-y-4">
                        {[
                          { label: "Pressure", value: 81, color: "bg-green-500" },
                          { label: "Timing", value: 72, color: "bg-blue-500" },
                          { label: "Stamina Management", value: 45, color: "bg-red-500" },
                          { label: "Counter Defense", value: 38, color: "bg-orange-500" },
                        ].map((stat) => (
                          <div key={stat.label}>
                            <div className="flex justify-between text-sm font-medium mb-2">
                              <span className="text-white uppercase tracking-wider">{stat.label}</span>
                              <span className="text-zinc-400 font-mono">{stat.value}%</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.value}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${stat.color}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                      <p className="text-[10px] text-primary font-mono mb-2 uppercase tracking-widest font-bold">Key Finding</p>
                      <p className="text-lg text-white font-medium">Stamina collapsed after aggressive exchanges, leaving you vulnerable to late-round counters.</p>
                    </div>
                  </motion.div>
                )}

                {activeTab === "mistakes" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {[
                      { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", title: "Stamina Burn", desc: "Over-committing to power shots in early rounds depleted stamina below 40% by Round 5." },
                      { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", title: "Guard Drop", desc: "Failing to reset guard immediately after throwing a 1-2 combination." },
                      { icon: Info, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", title: "Predictable Movement", desc: "Circling into the opponent's lead hand consistently." }
                    ].map((mistake, i) => (
                      <div key={i} className={`flex gap-4 p-5 rounded-xl border ${mistake.border} ${mistake.bg}`}>
                        <mistake.icon className={`w-6 h-6 ${mistake.color} shrink-0`} />
                        <div>
                          <h5 className="text-white font-bold uppercase tracking-wider mb-1">{mistake.title}</h5>
                          <p className="text-zinc-300 text-sm leading-relaxed">{mistake.desc}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "strengths" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {[
                      { title: "Aggressive Openings", desc: "Excellent pressure applied in the first 30 seconds of each round." },
                      { title: "Counter Accuracy", desc: "Landed 68% of counter-punches when opponent missed heavy shots." },
                      { title: "Ring Generalship", desc: "Effectively cut off the ring, forcing opponent to the ropes 12 times." }
                    ].map((strength, i) => (
                      <div key={i} className="flex gap-4 p-5 rounded-xl border border-green-500/20 bg-green-500/5">
                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                        <div>
                          <h5 className="text-white font-bold uppercase tracking-wider mb-1">{strength.title}</h5>
                          <p className="text-zinc-300 text-sm leading-relaxed">{strength.desc}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "suggestions" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {[
                      { title: "Shorten Your Combos", desc: "Limit yourself to 2-3 punches per exchange to preserve stamina for later rounds." },
                      { title: "Active Guard Reset", desc: "Consciously pull LT/L2 to reset your guard immediately after your last punch connects or misses." },
                      { title: "Mix Up Directions", desc: "Practice circling away from the opponent's power hand to avoid walking into hooks." }
                    ].map((sugg, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 font-bold text-white">
                          {i + 1}
                        </div>
                        <div className="pt-1">
                          <h5 className="text-primary font-bold uppercase tracking-wider mb-1">{sugg.title}</h5>
                          <p className="text-zinc-300 text-sm leading-relaxed bg-white/5 p-4 rounded-lg border border-white/5 mt-2">{sugg.desc}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pb-12">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold uppercase tracking-widest px-8 h-12" data-testid="btn-share-card">
                Share Card
              </Button>
              <Button className="bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-widest px-8 h-12 flex gap-2" onClick={onClose} data-testid="btn-upload-another">
                <Upload className="w-4 h-4" /> Upload Another Match
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
