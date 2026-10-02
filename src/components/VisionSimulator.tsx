import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, Monitor, Upload, Search, Check, AlertTriangle, Cpu, Maximize2, Shield, 
  Terminal, MousePointer, Type, Eye, Trash2, FolderOpen, Volume2, Sun, Wifi, Bluetooth, Zap, RefreshCw, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VisionSimulatorProps {
  onAddAnalysisLog: (text: string) => void;
  onSendVisionText: (text: string) => void;
}

interface DetectedElement {
  id: string;
  label: string;
  confidence: number;
  type: "button" | "text" | "icon" | "window" | "input";
  x: number; // percentage
  y: number; // percentage
  w: number; // width percentage
  h: number; // height percentage
}

const PRESET_SCREENS = [
  {
    id: "vs-code",
    name: "VS Code (TypeScript Project)",
    url: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=800&q=80",
    description: "Active VS Code workspace. Warning: TypeScript error found on index.ts line 42.",
    elements: [
      { id: "v1", label: "window: VS Code Interface", confidence: 0.98, type: "window", x: 2, y: 2, w: 96, h: 96 },
      { id: "v2", label: "text: TS2322 Type mismatch in database.ts", confidence: 0.99, type: "text", x: 15, y: 72, w: 70, h: 12 },
      { id: "v3", label: "button: Quick Fix Code", confidence: 0.95, type: "button", x: 15, y: 86, w: 12, h: 4 },
      { id: "v4", label: "icon: Error Alert Warning", confidence: 0.97, type: "icon", x: 10, y: 73, w: 4, h: 4 }
    ] as DetectedElement[]
  },
  {
    id: "figma",
    name: "Figma (Dashboard UX Board)",
    url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=800&q=80",
    description: "Collaborative design screen showcasing luxury dark-glass bento dashboard UI widgets.",
    elements: [
      { id: "f1", label: "window: Figma Editor", confidence: 0.96, type: "window", x: 1, y: 1, w: 98, h: 98 },
      { id: "f2", label: "button: Connect Stripe API", confidence: 0.94, type: "button", x: 74, y: 8, w: 14, h: 5 },
      { id: "f3", label: "icon: Profile Avatar", confidence: 0.98, type: "icon", x: 91, y: 8, w: 4, h: 5 },
      { id: "f4", label: "text: Main Title 'Ambient Neural Net'", confidence: 0.99, type: "text", x: 10, y: 28, w: 48, h: 8 }
    ] as DetectedElement[]
  },
  {
    id: "chrome",
    name: "Chrome (Grounding Search Sandbox)",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    description: "Secure browser instance querying real-time artificial intelligence milestones.",
    elements: [
      { id: "c1", label: "window: Chrome browser window", confidence: 0.99, type: "window", x: 2, y: 2, w: 96, h: 96 },
      { id: "c2", label: "text: Google Search: HANIA Autonomous Agent", confidence: 0.97, type: "text", x: 42, y: 45, w: 22, h: 6 },
      { id: "c3", label: "button: Re-run automation scripts", confidence: 0.92, type: "button", x: 66, y: 45, w: 10, h: 5 },
      { id: "c4", label: "input: Search address bar", confidence: 0.95, type: "input", x: 25, y: 12, w: 50, h: 5 }
    ] as DetectedElement[]
  }
];

export default function VisionSimulator({ onAddAnalysisLog, onSendVisionText }: VisionSimulatorProps) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_SCREENS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedElements, setScannedElements] = useState<DetectedElement[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  // Desktop control system mock state
  const [permissionPending, setPermissionPending] = useState<string | null>(null);
  const [permissionAction, setPermissionAction] = useState<() => void>(() => {});
  const [systemVolume, setSystemVolume] = useState(80);
  const [systemBrightness, setSystemBrightness] = useState(75);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);

  // Simulated desktop window and files management state
  const [openApps, setOpenApps] = useState<string[]>(["Finder", "VS Code"]);
  const [activeWindow, setActiveWindow] = useState<string>("VS Code");
  const [terminalCommands, setTerminalCommands] = useState<string[]>([
    "hania-desktop-core init...",
    "All OS automation bridges linked: SECURE // COM17",
    "Standing by for user permission requests..."
  ]);
  const [filesList, setFilesList] = useState<{ name: string; size: string; type: string }[]>([
    { name: "main.tsx", size: "12 KB", type: "code" },
    { name: "App.tsx", size: "32 KB", type: "code" },
    { name: "index.css", size: "4 KB", type: "style" },
    { name: "logo.png", size: "145 KB", type: "image" },
    { name: "reminders.txt", size: "1.2 KB", type: "text" }
  ]);
  const [newFileName, setNewFileName] = useState("");

  const triggerDesktopAction = (actionName: string, executeFn: () => void, isSensitive = false) => {
    if (isSensitive) {
      setPermissionPending(actionName);
      setPermissionAction(() => () => {
        executeFn();
        setPermissionPending(null);
      });
    } else {
      executeFn();
    }
  };

  const handleLaunchApp = (appName: string) => {
    triggerDesktopAction(`Launch application: ${appName}`, () => {
      if (!openApps.includes(appName)) {
        setOpenApps([...openApps, appName]);
      }
      setActiveWindow(appName);
      setTerminalCommands(prev => [...prev, `Launched application: ${appName} successfully.`]);
      onAddAnalysisLog(`DESKTOP CONTROLLER: Launched application '${appName}'.`);
    });
  };

  const handleCloseApp = (appName: string) => {
    triggerDesktopAction(`Terminate application process: ${appName}`, () => {
      setOpenApps(openApps.filter(app => app !== appName));
      if (activeWindow === appName) {
        setActiveWindow(openApps[0] || "Desktop");
      }
      setTerminalCommands(prev => [...prev, `Closed process: ${appName}.`]);
      onAddAnalysisLog(`DESKTOP CONTROLLER: Closed application process '${appName}'.`);
    }, true);
  };

  const handleCreateFile = () => {
    if (!newFileName) return;
    triggerDesktopAction(`Create secure user file: ${newFileName}`, () => {
      setFilesList([...filesList, { name: newFileName, size: "0 KB", type: "text" }]);
      setTerminalCommands(prev => [...prev, `Created file: ${newFileName} in /src directory.`]);
      onAddAnalysisLog(`DESKTOP CONTROLLER: Created user file '${newFileName}'.`);
      setNewFileName("");
    });
  };

  const handleDeleteFile = (name: string) => {
    triggerDesktopAction(`Irreversibly delete file: ${name}`, () => {
      setFilesList(filesList.filter(f => f.name !== name));
      setTerminalCommands(prev => [...prev, `Deleted file: ${name} safely.`]);
      onAddAnalysisLog(`DESKTOP CONTROLLER: Deleted file '${name}'.`);
    }, true);
  };

  const handleScanScreen = () => {
    setIsScanning(true);
    setScannedElements([]);
    setScanProgress(0);
    onAddAnalysisLog(`VISION CORE: Scanning multi-monitor virtual viewport...`);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScannedElements(selectedPreset.elements);
          
          const logMsg = `VISION INTERPRETER: Scanned ${selectedPreset.name}. Identified ${selectedPreset.elements.length} clickable nodes (OCR texts, buttons).`;
          onAddAnalysisLog(logMsg);

          // Alert model with precise screen transcription coordinates
          const ocrText = selectedPreset.elements.filter(e => e.type === "text").map(e => e.label).join(", ");
          onSendVisionText(`[System notification: HANIA analyzed screen '${selectedPreset.name}'. OCR: ${ocrText}. Speak in your active character persona to assist user.]`);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleSimulateAutomation = () => {
    triggerDesktopAction("Execute workflow: Daily backup and cache cleanup routines", () => {
      setTerminalCommands(prev => [
        ...prev,
        "Running automation pipeline...",
        "Cleaning local browser cookie and cache files...",
        "Syncing file backups directly with cloud database...",
        "SUCCESS: Daily routines finished cleanly."
      ]);
      onAddAnalysisLog("DESKTOP AUTOMATION: Completed automated backup workflow loop.");
    }, true);
  };

  return (
    <div className="space-y-6" id="desktop-vision-bridge-subsystem">
      {/* Top Warning Permission Banner */}
      <AnimatePresence>
        {permissionPending && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-amber-950/50 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg z-50 backdrop-blur"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 animate-pulse">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-white uppercase">OS AUTHORIZATION SECURITY PROMPT</h4>
                <p className="text-[10px] text-amber-300 mt-0.5 leading-relaxed font-mono">
                  HANIA is requesting explicit authorization to perform: <strong className="text-white">"{permissionPending}"</strong>.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setPermissionPending(null)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl text-xs font-mono transition-colors"
              >
                Deny Access
              </button>
              <button 
                onClick={() => {
                  if (permissionAction) permissionAction();
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-mono font-bold transition-colors"
              >
                Grant Permission
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Neural Vision Monitor Screen */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400 animate-pulse" /> Neural Vision & UI Detector
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                Analyze mock monitor viewports, identify bounding coordinates, and parse OCR text.
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {PRESET_SCREENS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset);
                    setScannedElements([]);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono transition-all ${
                    selectedPreset.id === preset.id
                      ? "bg-cyan-600/10 border-cyan-500/30 text-cyan-400"
                      : "bg-zinc-950/40 border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {preset.name.split(" (")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Screenshot viewport canvas with neural bounding boxes overlay */}
          <div className="relative aspect-video bg-black/60 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
            <img 
              src={selectedPreset.url} 
              alt={selectedPreset.name} 
              className="w-full h-full object-cover opacity-70 select-none pointer-events-none" 
            />

            {/* Simulated Window Frame */}
            <div className="absolute inset-x-0 top-0 h-7 bg-zinc-950/80 border-b border-zinc-900 flex items-center justify-between px-3 pointer-events-none select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase font-black">Active Window: {activeWindow}</span>
              <span className="text-[8px] font-mono text-zinc-600">IP: 127.0.0.1</span>
            </div>

            {/* Sweep indicator scanner line */}
            {isScanning && (
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_12px_cyan] z-20 pointer-events-none"
              />
            )}

            {/* Neural Box Overlays */}
            <AnimatePresence>
              {scannedElements.map((el) => (
                <motion.div
                  key={el.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setTerminalCommands(prev => [...prev, `[USER ACTION] Triggered mock click on detected element: '${el.label}'`]);
                    onAddAnalysisLog(`VISION INTERPRETER: Clicked OCR bounding box '${el.label}'.`);
                  }}
                  className={`absolute border rounded pointer-events-auto group cursor-pointer hover:border-white transition-all ${
                    el.type === "button"
                      ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      : el.type === "text"
                      ? "border-purple-500 bg-purple-500/10"
                      : el.type === "icon"
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-emerald-500 bg-emerald-500/10"
                  }`}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.w}%`,
                    height: `${el.h}%`
                  }}
                >
                  <div className="absolute top-0 left-0 bg-black/90 text-[7px] font-mono text-zinc-200 px-1 py-0.5 rounded-br pointer-events-none whitespace-nowrap leading-none border-r border-b border-zinc-800">
                    {el.label} ({(el.confidence * 100).toFixed(0)}%)
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Quick voice command actions overlay shortcuts */}
            <div className="absolute bottom-3 right-3 bg-black/80 border border-zinc-800 rounded-lg p-2 space-y-1.5 font-mono text-[9px] text-zinc-400 pointer-events-auto max-w-[200px]">
              <span className="text-zinc-500 uppercase tracking-widest block font-bold border-b border-zinc-900 pb-1 mb-1">VOICE TEST SHORTCUTS</span>
              <button 
                onClick={() => {
                  handleLaunchApp("Chrome");
                  setTerminalCommands(prev => [...prev, "Command parsed: 'HANIA open Chrome browser'"]);
                }}
                className="w-full text-left hover:text-white transition-colors block"
              >
                🗣️ "Open Chrome"
              </button>
              <button 
                onClick={handleScanScreen}
                className="w-full text-left hover:text-white transition-colors block"
              >
                🗣️ "Take a screenshot"
              </button>
              <button 
                onClick={() => {
                  triggerDesktopAction("Adjust volume level to 100%", () => setSystemVolume(100));
                }}
                className="w-full text-left hover:text-white transition-colors block"
              >
                🗣️ "Increase the volume"
              </button>
            </div>
          </div>

          <button
            onClick={handleScanScreen}
            disabled={isScanning}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,0,0,0.2)] disabled:opacity-40"
          >
            <Search className="w-4 h-4 text-cyan-400 animate-spin [animation-duration:10s]" />
            {isScanning ? `Extracting Visual Telemetry Elements (${scanProgress}%)` : "Analyze Screen OCR Text"}
          </button>
        </div>

        {/* Right Side: OS Automation Controller controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Hardware & Environment Controls */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-4 font-mono text-xs text-zinc-300">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-900 pb-2">System Controls</span>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5 text-zinc-500" /> Sound Volume</span>
                <span className="text-zinc-400">{systemVolume}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={systemVolume} 
                onChange={(e) => setSystemVolume(parseInt(e.target.value))} 
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-zinc-500" /> Screen Brightness</span>
                <span className="text-zinc-400">{systemBrightness}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={systemBrightness} 
                onChange={(e) => setSystemBrightness(parseInt(e.target.value))} 
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-zinc-900/60 pt-3 text-[10px]">
              <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-emerald-500" /> Wi-Fi Uplink</span>
              <button 
                onClick={() => setWifiEnabled(!wifiEnabled)}
                className={`px-2 py-1 rounded font-bold uppercase ${wifiEnabled ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-900 text-zinc-500"}`}
              >
                {wifiEnabled ? "CONNECTED" : "DISCONNECTED"}
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5"><Bluetooth className="w-3.5 h-3.5 text-blue-500" /> Bluetooth</span>
              <button 
                onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
                className={`px-2 py-1 rounded font-bold uppercase ${bluetoothEnabled ? "bg-blue-500/10 text-blue-400" : "bg-zinc-900 text-zinc-500"}`}
              >
                {bluetoothEnabled ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>
          </div>

          {/* Simulated File Explorer panel */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-4 font-mono text-xs text-zinc-300">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-900 pb-2">Integrated Filesystem Simulator</span>
            
            {/* Create File Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="newfile.txt"
                className="flex-1 bg-black border border-zinc-900 px-3 py-1.5 rounded-lg outline-none text-[10px]"
              />
              <button
                onClick={handleCreateFile}
                className="px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg border border-zinc-850 font-bold text-[10px] uppercase"
              >
                Create
              </button>
            </div>

            {/* List of files */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {filesList.map((f) => (
                <div key={f.name} className="flex items-center justify-between p-1.5 bg-black/40 border border-zinc-950 rounded-lg hover:border-zinc-900 transition-colors">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-[10px] truncate max-w-[120px]">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-500">{f.size}</span>
                    <button 
                      onClick={() => handleDeleteFile(f.name)}
                      className="p-1 hover:text-red-400 rounded transition-colors"
                      title="Purge file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OS System Application Launcher panel */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-3 font-mono text-xs text-zinc-300">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-900 pb-2">Active Apps & Workflows</span>
            
            <div className="grid grid-cols-2 gap-2">
              {["Chrome", "VS Code", "Spotify", "Terminator", "Settings", "Database"].map((app) => {
                const isRunning = openApps.includes(app);
                return (
                  <div key={app} className="p-2 bg-black/40 border border-zinc-950 rounded-xl flex flex-col justify-between h-16">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white">{app}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-zinc-800"}`} />
                    </div>
                    <div className="flex gap-1 justify-end pt-1">
                      {isRunning ? (
                        <button 
                          onClick={() => handleCloseApp(app)}
                          className="px-1.5 py-0.5 bg-red-950/40 text-red-400 hover:bg-red-950 rounded text-[8px] uppercase font-bold"
                        >
                          Close
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleLaunchApp(app)}
                          className="px-1.5 py-0.5 bg-zinc-900 text-zinc-400 hover:text-white rounded text-[8px] uppercase font-bold"
                        >
                          Launch
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSimulateAutomation}
              className="w-full py-2.5 bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/20 text-cyan-300 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              Simulate Desktop Automation Loop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
