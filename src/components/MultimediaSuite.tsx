import { useState, useEffect } from "react";
import { Film, Image as ImageIcon, Sparkles, Sliders, Play, Scissors, Video, Music, Type, Plus, Download, Trash2, Cpu, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MultimediaSuiteProps {
  onAddAnalysisLog: (text: string) => void;
}

interface TimelineClip {
  id: string;
  name: string;
  track: "video" | "audio" | "subtitle" | "effects";
  start: number; // in seconds
  duration: number; // in seconds
  color: string;
}

const TEMPLATE_PRESETS = [
  {
    name: "Cinematic Horizon",
    category: "Cinematic",
    duration: 15,
    music: "cinematic_epic_swells.mp3",
    clips: [
      { id: "v1", name: "Aerial Drone Sunset.mov", track: "video", start: 0, duration: 6, color: "bg-blue-600/30 border-blue-500" },
      { id: "v2", name: "Subject Close-up Portrait.mov", track: "video", start: 6, duration: 9, color: "bg-blue-600/30 border-blue-500" },
      { id: "a1", name: "cinematic_epic_swells.mp3", track: "audio", start: 0, duration: 15, color: "bg-emerald-600/30 border-emerald-500" },
      { id: "s1", name: "Subtitle: '[Epic Music Intro]'", track: "subtitle", start: 0, duration: 4, color: "bg-purple-600/30 border-purple-500" },
      { id: "s2", name: "Subtitle: 'Life begins at the edge'", track: "subtitle", start: 6, duration: 5, color: "bg-purple-600/30 border-purple-500" },
      { id: "e1", name: "Cinematic Teal & Orange Grade", track: "effects", start: 0, duration: 15, color: "bg-amber-600/30 border-amber-500" }
    ]
  },
  {
    name: "Velocity Beat Sync Pulse",
    category: "Velocity / TikTok",
    duration: 12,
    music: "hyper_pop_pulse.mp3",
    clips: [
      { id: "v1", name: "Action Parkour Clip.mov", track: "video", start: 0, duration: 4, color: "bg-blue-600/30 border-blue-500" },
      { id: "v2", name: "Spinning Kick High-Angle.mov", track: "video", start: 4, duration: 4, color: "bg-blue-600/30 border-blue-500" },
      { id: "v3", name: "Landing Slow-Mo.mov", track: "video", start: 8, duration: 4, color: "bg-blue-600/30 border-blue-500" },
      { id: "a1", name: "hyper_pop_pulse.mp3", track: "audio", start: 0, duration: 12, color: "bg-emerald-600/30 border-emerald-500" },
      { id: "s1", name: "Subtitle: 'WATCH OUT!'", track: "subtitle", start: 4, duration: 2, color: "bg-purple-600/30 border-purple-500" },
      { id: "e1", name: "Flash Zoom Transition", track: "effects", start: 3.8, duration: 0.5, color: "bg-amber-600/30 border-amber-500" },
      { id: "e2", name: "Velocity Ramp (8x Speed -> 0.2x)", track: "effects", start: 4, duration: 4, color: "bg-amber-600/30 border-amber-500" }
    ]
  },
  {
    name: "Minimalist Travel Vlog Entry",
    category: "Travel Vlog",
    duration: 20,
    music: "chill_lofi_acoustic.mp3",
    clips: [
      { id: "v1", name: "Cozy Cabin Coffee.mov", track: "video", start: 0, duration: 8, color: "bg-blue-600/30 border-blue-500" },
      { id: "v2", name: "Rainy Window View.mov", track: "video", start: 8, duration: 12, color: "bg-blue-600/30 border-blue-500" },
      { id: "a1", name: "chill_lofi_acoustic.mp3", track: "audio", start: 0, duration: 20, color: "bg-emerald-600/30 border-emerald-500" },
      { id: "s1", name: "Subtitle: 'Chasing rainy mornings...☕'", track: "subtitle", start: 1, duration: 6, color: "bg-purple-600/30 border-purple-500" },
      { id: "e1", name: "Film Grain & Light Leak Effect", track: "effects", start: 0, duration: 20, color: "bg-amber-600/30 border-amber-500" }
    ]
  }
];

export default function MultimediaSuite({ onAddAnalysisLog }: MultimediaSuiteProps) {
  const [activeMediaTab, setActiveMediaTab] = useState<"video" | "photo" | "generation">("video");
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATE_PRESETS[0]>(TEMPLATE_PRESETS[0]);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>(TEMPLATE_PRESETS[0].clips as TimelineClip[]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<any | null>(null);

  // Render variables
  const [renderProgress, setRenderProgress] = useState(-1);
  const [renderLogs, setRenderLogs] = useState<string[]>([]);
  const [watermarkFree, setWatermarkFree] = useState(true);
  const [exportQuality, setExportQuality] = useState("1080p");

  // AI Generation values
  const [genPrompt, setGenPrompt] = useState("");
  const [genType, setGenType] = useState<"t2i" | "i2i" | "t2v" | "i2v">("t2i");
  const [generatingAsset, setGeneratingAsset] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  // Photo editing state
  const [photoOption, setPhotoOption] = useState<"bg_remove" | "obj_remove" | "upscale" | "face_enhance">("bg_remove");
  const [photoSelected, setPhotoSelected] = useState<string | null>(null);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [photoLogs, setPhotoLogs] = useState<string[]>([]);

  // Track select template changes
  const handleSelectTemplate = (tmpl: typeof TEMPLATE_PRESETS[0]) => {
    setSelectedTemplate(tmpl);
    setTimelineClips(tmpl.clips as TimelineClip[]);
    setAnalysisReport(null);
    onAddAnalysisLog(`MULTIMEDIA: Switched timeline to template [${tmpl.name}].`);
  };

  // Timeline operations
  const handleSplitClip = (id: string) => {
    const clipToSplit = timelineClips.find(c => c.id === id);
    if (!clipToSplit) return;
    
    const halfDuration = clipToSplit.duration / 2;
    const splitClipA: TimelineClip = {
      ...clipToSplit,
      id: `${clipToSplit.id}_split_A`,
      name: `${clipToSplit.name} (Part 1)`,
      duration: halfDuration
    };
    const splitClipB: TimelineClip = {
      ...clipToSplit,
      id: `${clipToSplit.id}_split_B`,
      name: `${clipToSplit.name} (Part 2)`,
      start: clipToSplit.start + halfDuration,
      duration: halfDuration
    };

    setTimelineClips([splitClipA, splitClipB, ...timelineClips.filter(c => c.id !== id)]);
    onAddAnalysisLog(`MULTIMEDIA: Trimmed and split clip [${clipToSplit.name}] into two layers.`);
  };

  const handleDeleteClip = (id: string) => {
    setTimelineClips(timelineClips.filter(c => c.id !== id));
    onAddAnalysisLog(`MULTIMEDIA: Deleted clip from active workspace.`);
  };

  // Highlight Analysis Trigger
  const triggerMediaAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisReport(null);
    onAddAnalysisLog(`MULTIMEDIA: Launching deep vision-audio neural probe on raw media files...`);

    setTimeout(() => {
      setAnalysisReport({
        category: selectedTemplate.category === "Cinematic" ? "Cinematic B-Roll" : "Action Sports Short",
        scenesDetected: 5,
        cameraMovement: "Pans, Drone Sweeps, Stabilized Steadicam tracking",
        facesFound: "1 Face detected, expressing warm, neutral-to-smiling emotion",
        highlights: "Time 0:02 - Peak scenic sunset, Time 0:08 - Mid-air action apex, Time 0:12 - Soft facial focus contrast close-up",
        subtitles: "[Music swells] -> 'Life begins at the edge of comfort' -> [Soft breeze ambience]",
        musicBpm: "88 BPM, chill beat transitions matching cuts exactly"
      });
      setIsAnalyzing(false);
      onAddAnalysisLog(`MULTIMEDIA: Scene & highlight analysis completed successfully.`);
    }, 1500);
  };

  // FFmpeg Export Simulation
  const handleExportVideo = () => {
    setRenderProgress(0);
    setRenderLogs([]);
    onAddAnalysisLog(`MULTIMEDIA: Spawning export pipeline thread. Formats configured.`);

    const totalSeconds = 15;
    let step = 0;

    const ffmpegCmd = `ffmpeg -y -i input_tracks.txt -vf "scale=${exportQuality === "4K" ? "3840:2160" : exportQuality === "2K" ? "2560:1440" : "1920:1080"},format=yuv420p" -c:v libx264 -preset superfast -crf 18 -c:a aac -b:a 256k -movflags +faststart ${watermarkFree ? "-metadata author='Iqra AI'" : ""} output.mp4`;

    const logsList = [
      `[FFmpeg init] Initializing multiplexer wrapper frame. Version: n6.1-stable.`,
      `[FFmpeg config] Target Resolution: ${exportQuality} // Codec: H.264 (libx264) // Audio: AAC Stereo.`,
      `[FFmpeg parse] Loading timelines mapping file. Found ${timelineClips.length} active multi-layer tracks.`,
      `[FFmpeg filter] Injecting color grade: Teal & Orange Cinematic lookup table.`,
      `[FFmpeg filter] Dynamic speed-ramping applied to highlight points.`,
      `[FFmpeg render] Frame pass 1: Analyzing spatial block distributions.`,
      `[FFmpeg render] Encoding frame 120/450. Bitrate stable at 8.2 Mbps.`,
      `[FFmpeg render] Rendering subtitle overlays with Arial outline parameters.`,
      `[FFmpeg audio] Remuxing soundtrack thread. Applying ducking under spoken subtitles.`,
      `[FFmpeg finish] Optimizing container offsets with +faststart (web stream ready).`,
      `[Success] Output file validated: output.mp4 (${exportQuality}, 24.5MB, H.264/AAC). Zero corruption checks passed.`
    ];

    const timer = setInterval(() => {
      step++;
      const currentProgress = Math.min(Math.round((step / logsList.length) * 100), 100);
      setRenderProgress(currentProgress);
      setRenderLogs((prev) => [...prev, logsList[step - 1]]);

      if (step >= logsList.length) {
        clearInterval(timer);
        onAddAnalysisLog(`MULTIMEDIA: Finished video export! Format: MP4, Codec: libx264, Audio: AAC, Quality: ${exportQuality}.`);
      }
    }, 450);
  };

  // AI Art Generation Simulation
  const handleGenerateAsset = () => {
    if (!genPrompt.trim()) return;
    setGeneratingAsset(true);
    setGeneratedResult(null);
    onAddAnalysisLog(`AI GENERATOR: Initiating Diffusion framework. Model: Gemini Imagen 3.`);

    setTimeout(() => {
      setGeneratingAsset(false);
      if (genType === "t2i" || genType === "i2i") {
        setGeneratedResult("/src/assets/images/iqra_idle_cyber_cyan.jpg");
        onAddAnalysisLog(`AI GENERATOR: Successfully synthesised high-quality image artifact based on prompt.`);
      } else {
        setGeneratedResult("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000");
        onAddAnalysisLog(`AI GENERATOR: Successfully synthesized 10-second cinematic video loop.`);
      }
    }, 1800);
  };

  // Photo editing simulation
  const handleProcessPhoto = () => {
    setIsPhotoProcessing(true);
    setPhotoLogs([]);
    onAddAnalysisLog(`PHOTO EDITOR: Initializing visual tensor graph for photo refinement.`);

    const photoStepLogs = [
      `[Tensor init] Loading model nodes for semantic segmentation...`,
      photoOption === "bg_remove" ? `[Matting model] Isolating foreground objects from secondary boundaries...` :
      photoOption === "obj_remove" ? `[Inpaint model] Masking coordinates and calculating contextual fill matrices...` :
      photoOption === "upscale" ? `[Super-Resolution] Interpolating pixels with SR-GAN scale factor 4x...` :
      `[Face-Mesh] Locating facial landmarks, adjusting light reflections and smoothing textures...`,
      `[Color Engine] Normalizing exposure and boosting contrast vectors...`,
      `[Success] Refinement complete. Re-routing output stream to preview canvas.`
    ];

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setPhotoLogs((prev) => [...prev, photoStepLogs[step - 1]]);
      if (step >= photoStepLogs.length) {
        clearInterval(timer);
        setIsPhotoProcessing(false);
        setPhotoSelected("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000");
        onAddAnalysisLog(`PHOTO EDITOR: Completed successfully! Applied mode: ${photoOption}.`);
      }
    }, 500);
  };

  return (
    <div className="space-y-6" id="iqra-multimedia-suite-root">
      {/* Subtab Navigation */}
      <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-900 max-w-sm">
        <button
          onClick={() => setActiveMediaTab("video")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeMediaTab === "video"
              ? "bg-cyan-600/10 border border-cyan-500/20 text-cyan-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Film className="w-3.5 h-3.5" /> AI Video Editor
        </button>
        <button
          onClick={() => setActiveMediaTab("photo")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeMediaTab === "photo"
              ? "bg-cyan-600/10 border border-cyan-500/20 text-cyan-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> Photo Lab
        </button>
        <button
          onClick={() => setActiveMediaTab("generation")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeMediaTab === "generation"
              ? "bg-cyan-600/10 border border-cyan-500/20 text-cyan-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> AI Generator
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* VIDEO TAB */}
        {activeMediaTab === "video" && (
          <motion.div
            key="video"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Templates Selector */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 space-y-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Video Styling Templates (CapCut Mode)</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {TEMPLATE_PRESETS.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`bg-slate-900/40 border p-3.5 rounded-xl text-left transition-all duration-300 group hover:bg-slate-900/80 active:scale-[0.98] ${
                      selectedTemplate.name === tmpl.name
                        ? "border-cyan-500/30 bg-cyan-950/5 shadow-[0_0_15px_rgba(6,182,212,0.05)]"
                        : "border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        {tmpl.category}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500">{tmpl.duration}s Cut</span>
                    </div>
                    <h4 className="text-xs text-slate-200 font-medium group-hover:text-white">{tmpl.name}</h4>
                    <p className="text-[9px] text-slate-500 font-mono mt-1">Audio: {tmpl.music}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Vision & Highlight Analyzer Controls */}
            <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400 animate-spin [animation-duration:10s]" /> AI Highlights Scene Analyzer
                </h4>
                <p className="text-[11px] text-slate-400 font-sans">
                  Instantly scan raw clips for faces, emotions, pacing transitions, and automatically build editing cuts.
                </p>
              </div>

              <button
                onClick={triggerMediaAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-cyan-600/15 hover:bg-cyan-600/25 border border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} /> Run Highlight Detector
              </button>
            </div>

            {/* Analysis Report View */}
            {analysisReport && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/40 border border-cyan-500/10 rounded-2xl p-5 space-y-3 font-mono text-[11px]"
              >
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block">Iqra AI Highlight Analysis Log</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 border-l-2 border-cyan-500/30 text-slate-300">
                  <div><span className="text-slate-500 uppercase">Est. Category:</span> {analysisReport.category}</div>
                  <div><span className="text-slate-500 uppercase">Scenes Segmented:</span> {analysisReport.scenesDetected} cuts</div>
                  <div><span className="text-slate-500 uppercase">Camera Trajectory:</span> {analysisReport.cameraMovement}</div>
                  <div><span className="text-slate-500 uppercase">Facial Landmarks:</span> {analysisReport.facesFound}</div>
                  <div className="md:col-span-2"><span className="text-slate-500 uppercase">Highlight Apexes:</span> {analysisReport.highlights}</div>
                  <div className="md:col-span-2"><span className="text-slate-500 uppercase">Beat Sync Tempo:</span> {analysisReport.musicBpm}</div>
                </div>
              </motion.div>
            )}

            {/* MULTI-LAYER TIMELINE VISUALIZER */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" /> Interactive Multilayer Timeline Tracks
                </span>
                <span className="text-[10px] font-mono text-slate-500">Duration: {selectedTemplate.duration}s</span>
              </div>

              {/* Grid timeline track */}
              <div className="space-y-3 font-mono text-[10px]">
                {/* 1. Video Track */}
                <div className="flex items-center gap-3">
                  <div className="w-16 text-slate-500 text-right uppercase font-bold tracking-wider flex items-center justify-end gap-1 shrink-0">
                    <Video className="w-3.5 h-3.5 text-blue-400" /> Video
                  </div>
                  <div className="flex-1 bg-slate-900/40 border border-slate-900/80 h-10 rounded-xl relative overflow-hidden flex items-center p-1 gap-1">
                    {timelineClips.filter(c => c.track === "video").map((clip) => (
                      <div
                        key={clip.id}
                        className={`h-full border rounded-lg ${clip.color} flex items-center justify-between px-2 group/clip select-none`}
                        style={{ width: `${(clip.duration / selectedTemplate.duration) * 100}%` }}
                      >
                        <span className="text-white truncate font-mono text-[9px]" title={clip.name}>{clip.name}</span>
                        <div className="opacity-0 group-hover/clip:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            onClick={() => handleSplitClip(clip.id)}
                            className="p-0.5 hover:bg-slate-900 text-slate-400 hover:text-cyan-400 rounded transition-all"
                            title="Split Clip"
                          >
                            <Scissors className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClip(clip.id)}
                            className="p-0.5 hover:bg-slate-900 text-slate-400 hover:text-red-400 rounded transition-all"
                            title="Remove Clip"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Audio Track */}
                <div className="flex items-center gap-3">
                  <div className="w-16 text-slate-500 text-right uppercase font-bold tracking-wider flex items-center justify-end gap-1 shrink-0">
                    <Music className="w-3.5 h-3.5 text-emerald-400" /> Audio
                  </div>
                  <div className="flex-1 bg-slate-900/40 border border-slate-900/80 h-10 rounded-xl relative overflow-hidden flex items-center p-1 gap-1">
                    {timelineClips.filter(c => c.track === "audio").map((clip) => (
                      <div
                        key={clip.id}
                        className={`h-full border rounded-lg ${clip.color} flex items-center justify-between px-2 group/clip select-none`}
                        style={{ width: `${(clip.duration / selectedTemplate.duration) * 100}%` }}
                      >
                        <span className="text-white truncate font-mono text-[9px]" title={clip.name}>{clip.name}</span>
                        <button
                          onClick={() => handleDeleteClip(clip.id)}
                          className="opacity-0 group-hover/clip:opacity-100 p-0.5 hover:bg-slate-900 text-slate-400 hover:text-red-400 rounded transition-all shrink-0"
                          title="Remove Track"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Subtitle Track */}
                <div className="flex items-center gap-3">
                  <div className="w-16 text-slate-500 text-right uppercase font-bold tracking-wider flex items-center justify-end gap-1 shrink-0">
                    <Type className="w-3.5 h-3.5 text-purple-400" /> Subtitle
                  </div>
                  <div className="flex-1 bg-slate-900/40 border border-slate-900/80 h-10 rounded-xl relative overflow-hidden flex items-center p-1 gap-1">
                    {timelineClips.filter(c => c.track === "subtitle").map((clip) => (
                      <div
                        key={clip.id}
                        className={`h-full border rounded-lg ${clip.color} flex items-center justify-between px-2 group/clip select-none`}
                        // Account for starting offsets visually
                        style={{ 
                          width: `${(clip.duration / selectedTemplate.duration) * 100}%`,
                          marginLeft: clip.start > 0 ? `${(clip.start / selectedTemplate.duration) * 100}%` : "0%"
                        }}
                      >
                        <span className="text-white truncate font-mono text-[9px]" title={clip.name}>{clip.name}</span>
                        <button
                          onClick={() => handleDeleteClip(clip.id)}
                          className="opacity-0 group-hover/clip:opacity-100 p-0.5 hover:bg-slate-900 text-slate-400 hover:text-red-400 rounded transition-all shrink-0"
                          title="Remove Track"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Effects Track */}
                <div className="flex items-center gap-3">
                  <div className="w-16 text-slate-500 text-right uppercase font-bold tracking-wider flex items-center justify-end gap-1 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Effects
                  </div>
                  <div className="flex-1 bg-slate-900/40 border border-slate-900/80 h-10 rounded-xl relative overflow-hidden flex items-center p-1 gap-1">
                    {timelineClips.filter(c => c.track === "effects").map((clip) => (
                      <div
                        key={clip.id}
                        className={`h-full border rounded-lg ${clip.color} flex items-center justify-between px-2 group/clip select-none`}
                        style={{ 
                          width: `${(clip.duration / selectedTemplate.duration) * 100}%`,
                          marginLeft: clip.start > 0 ? `${(clip.start / selectedTemplate.duration) * 100}%` : "0%"
                        }}
                      >
                        <span className="text-white truncate font-mono text-[9px]" title={clip.name}>{clip.name}</span>
                        <button
                          onClick={() => handleDeleteClip(clip.id)}
                          className="opacity-0 group-hover/clip:opacity-100 p-0.5 hover:bg-slate-900 text-slate-400 hover:text-red-400 rounded transition-all shrink-0"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Export Configurations & Logs panel */}
            <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block border-b border-white/5 pb-2">Stable FFmpeg Codec Export Settings</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                {/* 1. Quality */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase text-slate-500 block">Export Quality</span>
                  <div className="flex gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
                    {["1080p", "2K", "4K"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setExportQuality(q)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                          exportQuality === q
                            ? "bg-cyan-600/10 text-cyan-400 border border-cyan-500/20"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Watermark options */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase text-slate-500 block">Watermark Matrix</span>
                  <div className="flex gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setWatermarkFree(true)}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                        watermarkFree
                          ? "bg-cyan-600/10 text-cyan-400 border border-cyan-500/20"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Watermark-Free
                    </button>
                    <button
                      onClick={() => setWatermarkFree(false)}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                        !watermarkFree
                          ? "bg-cyan-600/10 text-cyan-400 border border-cyan-500/20"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Standard Logged
                    </button>
                  </div>
                </div>

                {/* 3. Export trigger */}
                <div className="flex items-end">
                  <button
                    onClick={handleExportVideo}
                    disabled={renderProgress >= 0 && renderProgress < 100}
                    className="w-full px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" /> Compile & Export Video
                  </button>
                </div>
              </div>

              {/* Render status */}
              {renderProgress >= 0 && (
                <div className="space-y-3 font-mono text-[10px]">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Exporting Output File // Codec: libx264 // PixelFormat: yuv420p</span>
                      <span className="text-cyan-400 font-bold">{renderProgress}%</span>
                    </div>
                    <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-300"
                        style={{ width: `${renderProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Log screen */}
                  <div className="h-28 overflow-y-auto bg-slate-950 border border-slate-900 rounded-xl p-3 text-[9px] text-slate-400 space-y-1 pr-1 font-mono">
                    {renderLogs.map((log, idx) => (
                      <div key={idx} className="border-b border-white/[0.01] pb-0.5 last:border-0 hover:text-white transition-colors">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PHOTO TAB */}
        {activeMediaTab === "photo" && (
          <motion.div
            key="photo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block border-b border-white/5 pb-2">AI Photographic Manipulation Tools</span>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-xs">
                {(["bg_remove", "obj_remove", "upscale", "face_enhance"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPhotoOption(opt)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      photoOption === opt
                        ? "bg-cyan-600/10 border-cyan-500/30 text-cyan-400 font-bold scale-[1.01]"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {opt === "bg_remove" ? "AI Remove Background" :
                     opt === "obj_remove" ? "AI Remove Object" :
                     opt === "upscale" ? "AI 4x Pixel Upscaler" : "AI Portrait Enhance"}
                  </button>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-white/5 pt-4">
                <div className="text-[11px] font-sans text-slate-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Choose any local photo file, and Iqra will run automated segment computations.</span>
                </div>
                
                <button
                  onClick={handleProcessPhoto}
                  disabled={isPhotoProcessing}
                  className="px-5 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-50"
                >
                  {isPhotoProcessing ? (
                    <>
                      <Cpu className="w-3.5 h-3.5 animate-spin" /> Processing Tensors...
                    </>
                  ) : (
                    <>
                      Apply AI Modification
                    </>
                  )}
                </button>
              </div>

              {/* Photo Logs */}
              {photoLogs.length > 0 && (
                <div className="space-y-2 font-mono text-[9px]">
                  <span className="text-slate-500 uppercase block">Refinement Tensor Pipeline Status</span>
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-400 space-y-1 font-mono">
                    {photoLogs.map((l, i) => (
                      <div key={i} className="hover:text-white transition-colors">{l}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview mock area */}
              {photoSelected && (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">Render Preview Output</span>
                  <div className="w-56 h-56 rounded-xl overflow-hidden relative border border-white/5">
                    <img src={photoSelected} alt="Processed product" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-mono text-cyan-400 font-bold uppercase backdrop-blur-[0.5px]">
                      {photoOption === "bg_remove" ? "Isolating Foreground" :
                       photoOption === "obj_remove" ? "Object Removed" :
                       photoOption === "upscale" ? "4x SuperRes Rendered" : "Portrait Enhanced"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI GENERATION TAB */}
        {activeMediaTab === "generation" && (
          <motion.div
            key="generation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block border-b border-white/5 pb-2">AI Diffusion Synthesizer</span>

              {/* Mode Select */}
              <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-900 max-w-sm font-mono text-xs">
                {(["t2i", "i2i", "t2v", "i2v"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setGenType(mode)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      genType === mode
                        ? "bg-cyan-600/10 border border-cyan-500/20 text-cyan-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {mode === "t2i" ? "Text to Image" :
                     mode === "i2i" ? "Image to Image" :
                     mode === "t2v" ? "Text to Video" : "Image to Video"}
                  </button>
                ))}
              </div>

              {/* Prompt field */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Generative Synthesis Prompt</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., A beautiful retro sci-fi space colony on Mars, digital painting..."
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateAsset()}
                    className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                  />
                  <button
                    onClick={handleGenerateAsset}
                    disabled={generatingAsset || !genPrompt.trim()}
                    className="px-5 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-50"
                  >
                    {generatingAsset ? (
                      <>
                        <Cpu className="w-3.5 h-3.5 animate-spin" /> Synthesizing...
                      </>
                    ) : (
                      <>
                        Generate AI Asset
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results Preview */}
              {generatedResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-3"
                >
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">Completed AI Asset Synthesized</span>
                  <div className="w-64 h-64 rounded-xl overflow-hidden border border-white/5 shadow-2xl relative group">
                    <img src={generatedResult} alt="AI output" className="w-full h-full object-cover select-none" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <a
                        href={generatedResult}
                        download="iqra_ai_synthesized"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-slate-950/80 border border-slate-800 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 hover:border-cyan-400/40"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" /> Save Generated Asset
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
