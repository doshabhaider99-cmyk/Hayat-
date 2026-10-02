import { useState } from "react";
import { Monitor, Network, Database, Calendar, FolderGit, Zap, Terminal, Activity, Eye, Wifi, GraduationCap, Film, Users, Brain } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Lazy-loaded subcomponents
import MaxBrainSuite from "./MaxBrainSuite";
import VisionSimulator from "./VisionSimulator";
import MultiAgentSystem from "./MultiAgentSystem";
import MemorySystem from "./MemorySystem";
import TaskPlanningEngine from "./TaskPlanningEngine";
import PluginManager from "./PluginManager";
import WorkflowEngine from "./WorkflowEngine";
import PhysicsTutor from "./PhysicsTutor";
import MultimediaSuite from "./MultimediaSuite";
import CharacterManager from "./CharacterManager";
import { AICharacter } from "../types";

interface CommandHubProps {
  onSendVisionText: (text: string) => void;
  characters: AICharacter[];
  onUpdateCharacters: (chars: AICharacter[]) => void;
  activeCharacterId: string;
  onSelectCharacter: (id: string) => void;
  addConsoleLog: (text: string) => void;
  accentText: string;
  accentBg: string;
  accentBgSoft: string;
  accentBorder: string;
}

type TabType = "max-brain" | "vision" | "character" | "tutor" | "multimedia" | "agents" | "memory" | "planner" | "plugins" | "workflows";

export default function CommandHub({ 
  onSendVisionText,
  characters,
  onUpdateCharacters,
  activeCharacterId,
  onSelectCharacter,
  addConsoleLog,
  accentText,
  accentBg,
  accentBgSoft,
  accentBorder
}: CommandHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>("max-brain");
  const [logs, setLogs] = useState<string[]>([
    "ZOYA OS INITIALIZATION: 147 Core features and unified neural matrix active.",
    "RESEARCH ENGINE: Dual Google Search grounding calibrated.",
    "INTELLIGENT COGNITION: Academic, coding, and creative suites standing by."
  ]);

  const addAnalysisLog = (text: string) => {
    const timestamp = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [`[${timestamp}] ${text}`, ...prev.slice(0, 49)]);
  };

  const tabs = [
    { id: "max-brain" as TabType, name: "ZOYA 147 Suite", icon: Brain, color: "text-purple-400 bg-purple-500/10" },
    { id: "vision" as TabType, name: "Vision & Desktop", icon: Monitor, color: "text-cyan-400 bg-cyan-500/10" },
    { id: "character" as TabType, name: "AI Characters", icon: Users, color: "text-rose-400 bg-rose-500/10" },
    { id: "agents" as TabType, name: "Multi-Agent System", icon: Network, color: "text-blue-400 bg-blue-500/10" },
    { id: "tutor" as TabType, name: "Physics & Learn", icon: GraduationCap, color: "text-blue-400 bg-blue-500/10" },
    { id: "multimedia" as TabType, name: "AI Multimedia", icon: Film, color: "text-pink-400 bg-pink-500/10" },
    { id: "memory" as TabType, name: "Memory Center", icon: Database, color: "text-sky-400 bg-sky-500/10" },
    { id: "planner" as TabType, name: "Plan & Auto", icon: Calendar, color: "text-teal-400 bg-teal-500/10" },
    { id: "plugins" as TabType, name: "Plugin Registry", icon: FolderGit, color: "text-amber-400 bg-amber-500/10" },
    { id: "workflows" as TabType, name: "Workflows", icon: Zap, color: "text-emerald-400 bg-emerald-500/10" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto bg-slate-950/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6" id="zoya-command-hub">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header telemetry ribbon */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/15 rounded-xl border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wider font-mono text-white uppercase">ZOYA Master Administration Command Center</h2>
            <p className="text-[10px] text-slate-500 font-mono">CORE STATUS: STABLE // WASM COMPILED ON PORT 3000</p>
          </div>
        </div>

        {/* Real-time telemetry readouts */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <Wifi className="w-3 h-3 text-emerald-500" />
            <span>LATENCY: 14ms</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>MEM: 2.1 / 16 GB</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>VISION: INGEST_OK</span>
          </div>
        </div>
      </div>

      {/* Dashboard Subsystem Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                addAnalysisLog(`SUBSYSTEM CONSOLE: Transferred viewport focus to ${tab.name}.`);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-[11px] font-bold tracking-wider uppercase transition-all duration-300 ${
                isActive
                  ? "bg-cyan-600/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)] scale-[1.02]"
                  : "bg-slate-950/60 border-slate-900 text-slate-500 hover:text-slate-300 hover:border-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Dynamic Subsystem Tab Frame */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "max-brain" && (
              <MaxBrainSuite onSendToVoice={onSendVisionText} />
            )}
            {activeTab === "vision" && (
              <VisionSimulator onAddAnalysisLog={addAnalysisLog} onSendVisionText={onSendVisionText} />
            )}
            {activeTab === "character" && (
              <CharacterManager 
                characters={characters}
                onUpdateCharacters={onUpdateCharacters}
                activeCharacterId={activeCharacterId}
                onSelectCharacter={onSelectCharacter}
                addConsoleLog={addConsoleLog}
                accentText={accentText}
                accentBg={accentBg}
                accentBgSoft={accentBgSoft}
                accentBorder={accentBorder}
              />
            )}
            {activeTab === "tutor" && (
              <PhysicsTutor onAddAnalysisLog={addAnalysisLog} />
            )}
            {activeTab === "multimedia" && (
              <MultimediaSuite onAddAnalysisLog={addAnalysisLog} />
            )}
            {activeTab === "agents" && (
              <MultiAgentSystem />
            )}
            {activeTab === "memory" && (
              <MemorySystem onAddAnalysisLog={addAnalysisLog} />
            )}
            {activeTab === "planner" && (
              <TaskPlanningEngine onAddAnalysisLog={addAnalysisLog} />
            )}
            {activeTab === "plugins" && (
              <PluginManager onAddAnalysisLog={addAnalysisLog} />
            )}
            {activeTab === "workflows" && (
              <WorkflowEngine onAddAnalysisLog={addAnalysisLog} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global Command Center Logger */}
      <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Console System Logs
          </span>
          <span className="text-[8px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">STREAMING</span>
        </div>
        <div className="h-24 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 pr-1">
          {logs.map((log, idx) => (
            <div key={idx} className="border-b border-white/[0.02] pb-0.5 last:border-0 hover:text-white transition-colors">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
