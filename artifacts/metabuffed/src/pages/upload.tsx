import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Upload, FileVideo, CheckCircle2, Lock, Loader2, ChevronRight, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { listGamesForUpload } from "@/lib/games";
import {
  analyzeGameplayFrames,
  analyzeGameplayLink,
  readVideoDuration,
  uploadGameplayVideo,
  type AnalyzeResult,
} from "@/lib/analyze-client";
import { extractVideoFrames } from "@/lib/video-frames";
import { isSupportedVideoLink } from "@/lib/video-link";

const GAMES = listGamesForUpload();
const MAX_UPLOAD_MB = 100;

const FILE_PROCESSING_STEPS = [
  "Upload received",
  "Sampling video frames",
  "Analyzing gameplay visuals",
  "Detecting key exchanges",
  "Reviewing stamina and pressure patterns",
  "Generating coaching feedback",
];

const LINK_PROCESSING_STEPS = [
  "Link received",
  "Fetching clip metadata",
  "Extracting gameplay context",
  "Detecting key exchanges",
  "Reviewing stamina and pressure patterns",
  "Generating coaching feedback",
];

type InputMode = "file" | "link";
type UploadState = "idle" | "uploading" | "processing" | "ready" | "error";

export default function UploadPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialGame = searchParams.get("game");

  const [selectedGame, setSelectedGame] = useState<string | null>(initialGame || null);
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processStep, setProcessStep] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const processIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProcessInterval = () => {
    if (processIntervalRef.current) {
      clearInterval(processIntervalRef.current);
      processIntervalRef.current = null;
    }
  };

  const processingSteps =
    inputMode === "link" ? LINK_PROCESSING_STEPS : FILE_PROCESSING_STEPS;

  const startProcessingAnimation = () => {
    clearProcessInterval();
    setProcessStep(0);
    let step = 0;
    processIntervalRef.current = setInterval(() => {
      step = Math.min(step + 1, processingSteps.length - 1);
      setProcessStep(step);
    }, 1200);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
    setErrorMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
    setErrorMessage(null);
  };

  const startUpload = async () => {
    if (!file || !selectedGame) return;

    const maxBytes = MAX_UPLOAD_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage(`File is too large. Max ${MAX_UPLOAD_MB}MB for now.`);
      return;
    }

    setUploadState("uploading");
    setUploadProgress(0);
    setAnalysis(null);
    setErrorMessage(null);

    try {
      const durationSeconds = await readVideoDuration(file);
      setUploadProgress(15);

      let frames: Awaited<ReturnType<typeof extractVideoFrames>> = [];
      try {
        frames = await extractVideoFrames(file);
      } catch {
        frames = [];
      }
      setUploadProgress(45);
      setUploadState("processing");
      startProcessingAnimation();

      let result: AnalyzeResult;
      if (frames.length > 0) {
        result = await analyzeGameplayFrames({
          gameId: selectedGame,
          fileName: file.name,
          durationSeconds,
          fileSizeBytes: file.size,
          frames,
        });
      } else {
        result = await uploadGameplayVideo({
          gameId: selectedGame,
          file,
          durationSeconds,
          onProgress: (percent) => {
            setUploadProgress(45 + percent * 0.55);
          },
        });
      }

      clearProcessInterval();
      setProcessStep(processingSteps.length);
      setAnalysis(result);
      setUploadState("ready");
    } catch (err) {
      clearProcessInterval();
      setUploadState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    }
  };

  const startLinkAnalysis = async () => {
    if (!selectedGame || !videoUrl.trim()) return;

    if (!isSupportedVideoLink(videoUrl)) {
      setErrorMessage("Paste a valid YouTube or Twitch clip/VOD link.");
      return;
    }

    setUploadState("processing");
    setUploadProgress(100);
    setAnalysis(null);
    setErrorMessage(null);
    startProcessingAnimation();

    try {
      const result = await analyzeGameplayLink({
        gameId: selectedGame,
        url: videoUrl.trim(),
      });

      clearProcessInterval();
      setProcessStep(processingSteps.length);
      setAnalysis(result);
      setUploadState("ready");
    } catch (err) {
      clearProcessInterval();
      setUploadState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Link analysis failed. Please try again.",
      );
    }
  };

  const reset = () => {
    clearProcessInterval();
    setFile(null);
    setVideoUrl("");
    setUploadState("idle");
    setUploadProgress(0);
    setProcessStep(0);
    setAnalysis(null);
    setErrorMessage(null);
  };

  const selectedGameData = GAMES.find((g) => g.id === selectedGame);
  const sourceLabel =
    analysis?.sourceTitle ??
    analysis?.fileName ??
    file?.name ??
    (videoUrl.trim() || "Gameplay footage");

  return (
    <div className="min-h-[100dvh] bg-black text-foreground selection:bg-primary/30 pt-20 relative">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,28,139,0.10)_0%,transparent_70%)]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,122,0,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.06)_0%,transparent_70%)]" />
      </div>
      <Nav />

      <main className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        <div className="mb-10">
          <p className="text-xs font-mono text-primary uppercase tracking-[0.3em] mb-3 font-bold">Metabuffed Analysis</p>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Upload Your Match</h1>
          <p className="text-sm text-zinc-500 mt-3 max-w-2xl">
            Console players: paste a YouTube or Twitch clip link, or upload an exported MP4 from Share Factory / Xbox Game DVR.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          <div className="space-y-10">
            <div>
              <h2 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.25em] font-bold mb-5">Select Game</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GAMES.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => !game.locked && setSelectedGame(game.id)}
                    className={`relative h-28 rounded-xl overflow-hidden transition-all duration-300 ${
                      game.locked
                        ? "cursor-not-allowed opacity-35 grayscale"
                        : "cursor-pointer"
                    } ${
                      selectedGame === game.id
                        ? "ring-2 ring-primary shadow-[0_0_24px_rgba(255,28,139,0.35)]"
                        : !game.locked
                        ? "ring-1 ring-white/10 hover:ring-white/30"
                        : "ring-1 ring-white/5"
                    }`}
                    data-testid={`select-game-${game.id}`}
                  >
                    <img src={game.img} alt={game.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-bold text-xs uppercase tracking-tight leading-tight">{game.name}</p>
                    </div>
                    {game.locked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/70 rounded-full p-2 border border-white/10">
                          <Lock className="w-4 h-4 text-zinc-500" />
                        </div>
                      </div>
                    )}
                    {selectedGame === game.id && (
                      <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5 shadow-[0_0_10px_rgba(255,28,139,0.6)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {selectedGame && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-mono text-primary mt-3 uppercase tracking-widest"
                >
                  ● {selectedGameData?.name} selected
                </motion.p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.25em] font-bold">Add Footage</h2>
                <div className="flex rounded-lg border border-white/10 p-0.5 bg-black/40">
                  <button
                    type="button"
                    onClick={() => { setInputMode("file"); setErrorMessage(null); }}
                    className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-md transition-colors ${
                      inputMode === "file" ? "bg-primary text-white" : "text-zinc-500 hover:text-white"
                    }`}
                    data-testid="tab-upload-file"
                  >
                    File
                  </button>
                  <button
                    type="button"
                    onClick={() => { setInputMode("link"); setErrorMessage(null); }}
                    className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-md transition-colors ${
                      inputMode === "link" ? "bg-primary text-white" : "text-zinc-500 hover:text-white"
                    }`}
                    data-testid="tab-upload-link"
                  >
                    YouTube / Twitch
                  </button>
                </div>
              </div>

              {uploadState === "idle" || uploadState === "error" ? (
                inputMode === "file" ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => !file && inputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center w-full h-56 rounded-2xl transition-all duration-300 ${
                    isDragOver ? "bg-primary/8" : "bg-zinc-950"
                  } ${!file ? "cursor-pointer" : ""}`}
                  data-testid="upload-zone"
                >
                  <div className={`absolute inset-0 rounded-2xl border-2 border-dashed transition-colors duration-300 ${
                    isDragOver ? "border-primary" : file ? "border-primary/50" : "border-zinc-800 hover:border-zinc-600"
                  }`} />
                  {isDragOver && (
                    <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_40px_rgba(255,28,139,0.08)]" />
                  )}

                  {file ? (
                    <div className="flex flex-col items-center gap-4 relative z-10 px-6 text-center">
                      <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center">
                        <FileVideo className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm uppercase tracking-wider truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-zinc-500 font-mono mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={(e) => { e.stopPropagation(); void startUpload(); }}
                          disabled={!selectedGame}
                          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black border-0 uppercase tracking-widest text-xs h-10 px-8 rounded-[10px] shadow-[0_0_16px_rgba(59,130,246,0.45)] hover:shadow-[0_0_24px_rgba(59,130,246,0.65)] disabled:opacity-40 transition-all duration-200"
                          data-testid="btn-submit-upload"
                        >
                          Begin Analysis
                        </Button>
                        <button
                          onClick={(e) => { e.stopPropagation(); reset(); }}
                          className="text-xs text-zinc-500 hover:text-white font-mono uppercase tracking-wider transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      {!selectedGame && (
                        <p className="text-[10px] text-zinc-600 font-mono -mt-2">Select a game above first</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 relative z-10">
                      <Upload className={`w-10 h-10 transition-colors duration-300 ${isDragOver ? "text-primary" : "text-zinc-700"}`} />
                      <div className="text-center">
                        <p className="font-bold text-white uppercase tracking-wider text-sm">Drag & Drop Gameplay Footage</p>
                        <p className="text-xs text-zinc-600 font-mono mt-1.5">MP4, MOV, AVI — Max {MAX_UPLOAD_MB}MB</p>
                      </div>
                      <span className="text-xs font-bold text-zinc-400 border border-zinc-700 rounded-lg px-5 py-2 hover:border-zinc-500 hover:text-white transition-colors">
                        Browse Files
                      </span>
                    </div>
                  )}
                  <input ref={inputRef} type="file" className="hidden" accept="video/*" onChange={handleFileChange} data-testid="input-file" />
                </div>
                ) : (
                <div className="relative flex flex-col gap-5 w-full rounded-2xl bg-zinc-950 border-2 border-dashed border-zinc-800 p-8" data-testid="link-zone">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center">
                      <Link2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm uppercase tracking-wider">Paste Clip Link</p>
                      <p className="text-xs text-zinc-600 font-mono mt-1">YouTube · Twitch clips · Twitch VODs</p>
                    </div>
                  </div>
                  <Input
                    value={videoUrl}
                    onChange={(e) => { setVideoUrl(e.target.value); setErrorMessage(null); }}
                    placeholder="https://youtube.com/watch?v=... or https://clips.twitch.tv/..."
                    className="bg-[#111] border-white/10 text-white placeholder:text-zinc-600 h-12"
                    data-testid="input-video-link"
                  />
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => void startLinkAnalysis()}
                      disabled={!selectedGame || !videoUrl.trim()}
                      className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black border-0 uppercase tracking-widest text-xs h-10 px-8 rounded-[10px] shadow-[0_0_16px_rgba(59,130,246,0.45)] hover:shadow-[0_0_24px_rgba(59,130,246,0.65)] disabled:opacity-40 transition-all duration-200"
                      data-testid="btn-submit-link"
                    >
                      Analyze Link
                    </Button>
                    {!selectedGame && (
                      <p className="text-[10px] text-zinc-600 font-mono">Select a game above first</p>
                    )}
                  </div>
                </div>
                )
              ) : (
                <div className="bg-zinc-950 border border-white/8 rounded-2xl p-7 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <FileVideo className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{sourceLabel}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {inputMode === "link"
                          ? `${analysis?.sourcePlatform ?? "link"} · ${selectedGameData?.name}`
                          : `${file ? (file.size / (1024 * 1024)).toFixed(2) : 0} MB · ${selectedGameData?.name}`}
                      </p>
                    </div>
                    {uploadState === "ready" && (
                      <div className="flex items-center gap-1.5 text-primary shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Complete</span>
                      </div>
                    )}
                    {uploadState !== "ready" && (
                      <Loader2 className="w-4 h-4 text-zinc-600 animate-spin shrink-0" />
                    )}
                  </div>

                  {uploadState === "uploading" && (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Uploading</span>
                        <span className="text-xs font-mono text-primary font-bold">{Math.min(100, Math.round(uploadProgress))}%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(255,28,139,0.7)]"
                          style={{ width: `${Math.min(100, uploadProgress)}%` }}
                          transition={{ duration: 0.15 }}
                        />
                      </div>
                    </div>
                  )}

                  {(uploadState === "processing" || uploadState === "ready") && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-3">Analysis Pipeline</p>
                      {processingSteps.map((step, i) => {
                        const done = i < processStep || uploadState === "ready";
                        const active = i === processStep && uploadState === "processing";
                        return (
                          <motion.div
                            key={step}
                            initial={{ opacity: 0.2 }}
                            animate={{ opacity: done || active ? 1 : 0.25 }}
                            className="flex items-center gap-3 py-1"
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                              done
                                ? "bg-primary"
                                : active
                                ? "border border-primary bg-primary/10"
                                : "border border-zinc-800"
                            }`}>
                              {done ? (
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              ) : active ? (
                                <Loader2 className="w-2.5 h-2.5 text-primary animate-spin" />
                              ) : null}
                            </div>
                            <span className={`text-xs font-medium transition-colors ${
                              done ? "text-zinc-300" : active ? "text-white" : "text-zinc-700"
                            }`}>
                              {step}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="bg-zinc-950 border border-white/8 rounded-2xl overflow-hidden">
              <div className="border-b border-white/5 px-5 py-4 flex items-center justify-between">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Coaching Feedback</p>
                {uploadState !== "idle" && uploadState !== "error" && (
                  <div className={`w-2 h-2 rounded-full ${uploadState === "ready" ? "bg-primary shadow-[0_0_6px_rgba(255,28,139,0.8)]" : "bg-yellow-500 animate-pulse"}`} />
                )}
              </div>

              <div className="p-6 min-h-[320px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {(uploadState === "idle" || uploadState === "error") && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center py-6 gap-5"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                        <Upload className="w-7 h-7 text-zinc-700" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm mb-2">Waiting for footage</p>
                        <p className="text-xs text-zinc-500 leading-relaxed">Upload a file or paste a YouTube/Twitch link for strengths, weaknesses, and meta advice.</p>
                      </div>
                    </motion.div>
                  )}

                  {uploadState === "uploading" && (
                    <motion.div
                      key="uploading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center py-6 gap-5"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Loader2 className="w-7 h-7 text-primary animate-spin" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm mb-1">
                          {inputMode === "link" ? "Analyzing clip link" : "Uploading footage"}
                        </p>
                        <p className="text-xs text-zinc-500 font-mono">{sourceLabel}</p>
                        {inputMode === "file" && (
                          <p className="text-xs text-zinc-600 mt-1">{file ? (file.size / (1024 * 1024)).toFixed(2) : 0} MB · {Math.min(100, Math.round(uploadProgress))}% uploaded</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {uploadState === "processing" && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center py-6 gap-5"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm mb-1">Running AI analysis</p>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                          Step {processStep + 1} / {processingSteps.length}
                        </p>
                        <p className="text-xs text-primary font-mono mt-2">{processingSteps[processStep] ?? "Finalizing..."}</p>
                      </div>
                    </motion.div>
                  )}

                  {uploadState === "ready" && (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Feedback Ready</span>
                      </div>

                      <div className="space-y-2">
                        {analysis?.strengths && analysis.strengths.length > 0 && (
                          <div className="bg-black/60 border border-white/5 rounded-xl p-3.5">
                            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Strengths</p>
                            <ul className="space-y-1.5">
                              {analysis.strengths.map((item) => (
                                <li key={item} className="text-xs font-semibold text-white leading-relaxed flex gap-2">
                                  <span className="text-primary shrink-0">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis?.weaknesses && analysis.weaknesses.length > 0 && (
                          <div className="bg-black/60 border border-pink-900/20 rounded-xl p-3.5">
                            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Weaknesses</p>
                            <ul className="space-y-1.5">
                              {analysis.weaknesses.map((item) => (
                                <li key={item} className="text-xs font-semibold text-white leading-relaxed flex gap-2">
                                  <span className="text-pink-400 shrink-0">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis?.summary && (
                          <div className="bg-black/60 border border-white/5 rounded-xl p-3.5">
                            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-1.5">Coach Advice</p>
                            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{analysis.summary}</p>
                          </div>
                        )}
                        {analysis?.visionUsed && (
                          <p className="text-[10px] font-mono text-primary/80 uppercase tracking-widest text-center">
                            {analysis.framesAnalyzed
                              ? `Vision analysis from ${analysis.framesAnalyzed} frames`
                              : "Vision analysis from clip preview"}
                          </p>
                        )}
                      </div>

                      <Button
                        className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black border-0 uppercase tracking-widest text-xs h-11 flex items-center justify-center gap-2 rounded-[10px] shadow-[0_0_16px_rgba(59,130,246,0.45)] hover:shadow-[0_0_24px_rgba(59,130,246,0.65)] transition-all duration-200"
                        data-testid="btn-view-breakdown"
                        onClick={() => window.location.assign("/coach")}
                      >
                        Ask Coach Follow-Up <ChevronRight className="w-4 h-4" />
                      </Button>
                      <button
                        onClick={reset}
                        className="w-full text-center text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors font-mono uppercase tracking-widest"
                      >
                        Upload another match
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
