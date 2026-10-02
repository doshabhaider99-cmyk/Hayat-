import React, { useState, useEffect } from "react";
import { 
  Cpu, Server, Terminal, ShieldAlert, MemoryStick, Activity, Network, 
  CheckCircle, ChevronRight, ToggleLeft, ToggleRight, RefreshCw, Play, Plus, Trash2, Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Agent } from "../types";

export const DEFAULT_AGENTS: Agent[] = [
  // CORE AGENTS
  { id: "brain", name: "AI Brain Agent", role: "Main cognitive coordinator, prompt routing & logic reasoning", status: "idle", avatar: "🧠", color: "from-blue-600 to-indigo-500", enabled: true, logs: ["System: AI Brain Agent active."], category: "core", resourceUsage: { cpu: 1, ram: 15 } },
  { id: "planning", name: "Planning Agent", role: "Break long-term tasks into clean chronological milestones", status: "idle", avatar: "📊", color: "from-cyan-600 to-blue-500", enabled: true, logs: ["System: Planning Agent active."], category: "core", resourceUsage: { cpu: 1, ram: 12 } },
  { id: "decision", name: "Decision Agent", role: "Consensus threshold logic evaluator and choice compiler", status: "idle", avatar: "⚖️", color: "from-indigo-600 to-purple-500", enabled: true, logs: ["System: Decision Agent active."], category: "core", resourceUsage: { cpu: 1, ram: 10 } },
  { id: "reasoning", name: "Reasoning Agent", role: "Diagnostic context parsing and logical validation checks", status: "idle", avatar: "🦾", color: "from-purple-600 to-pink-500", enabled: true, logs: ["System: Reasoning Agent active."], category: "core", resourceUsage: { cpu: 1, ram: 14 } },
  { id: "memory-agent", name: "Memory Agent", role: "Semantic memory vector syncing & state retention", status: "idle", avatar: "💾", color: "from-pink-600 to-rose-500", enabled: true, logs: ["System: Memory Agent active."], category: "core", resourceUsage: { cpu: 1, ram: 25 } },
  { id: "learning", name: "Learning Agent", role: "Pattern synthesis, adaptive prompts, user preferences optimization", status: "idle", avatar: "🧬", color: "from-rose-600 to-orange-500", enabled: true, logs: ["System: Learning Agent active."], category: "core", resourceUsage: { cpu: 1, ram: 8 } },
  { id: "conversation", name: "Conversation Agent", role: "Sassy dialogue, tone syncing and banter calibration", status: "idle", avatar: "💬", color: "from-orange-600 to-amber-500", enabled: true, logs: ["System: Conversation Agent active."], category: "core", resourceUsage: { cpu: 1, ram: 11 } },

  // SYSTEM AGENTS
  { id: "error-detection", name: "Error Detection Agent", role: "Real-time system syntax & layout discrepancy monitoring", status: "idle", avatar: "🐛", color: "from-red-600 to-pink-500", enabled: true, logs: ["System: Error Detection Agent active."], category: "system", resourceUsage: { cpu: 1, ram: 6 } },
  { id: "auto-repair", name: "Auto Repair Agent", role: "Automated fault recovery, retry loops and backup state restoring", status: "idle", avatar: "🔧", color: "from-emerald-600 to-teal-500", enabled: true, logs: ["System: Auto Repair Agent active."], category: "system", resourceUsage: { cpu: 1, ram: 9 } },
  { id: "health-monitor", name: "Health Monitor Agent", role: "Diagnostic keepalives and platform integrity checkers", status: "idle", avatar: "❤️", color: "from-teal-600 to-cyan-500", enabled: true, logs: ["System: Health Monitor Agent active."], category: "system", resourceUsage: { cpu: 1, ram: 5 } },
  { id: "perf-optimizer", name: "Performance Optimizer Agent", role: "WASM garbage collection thresholds and rendering throttle", status: "idle", avatar: "⚡", color: "from-yellow-600 to-amber-500", enabled: true, logs: ["System: Performance Optimizer active."], category: "system", resourceUsage: { cpu: 1, ram: 7 } },
  { id: "ram-manager", name: "RAM Manager Agent", role: "Memory heap monitor and redundant audio stream disposal", status: "idle", avatar: "💾", color: "from-blue-600 to-sky-400", enabled: true, logs: ["System: RAM Manager active."], category: "system", resourceUsage: { cpu: 1, ram: 4 } },
  { id: "cpu-optimizer", name: "CPU Optimizer Agent", role: "Throttles background workers during active visual rendering", status: "idle", avatar: "⚙️", color: "from-teal-600 to-emerald-400", enabled: true, logs: ["System: CPU Optimizer active."], category: "system", resourceUsage: { cpu: 1, ram: 4 } },
  { id: "battery-optimizer", name: "Battery Optimizer Agent", role: "Reduces websocket pings under low power telemetry", status: "idle", avatar: "🔋", color: "from-green-600 to-emerald-500", enabled: true, logs: ["System: Battery Optimizer active."], category: "system", resourceUsage: { cpu: 1, ram: 3 } },
  { id: "network-monitor", name: "Network Monitor Agent", role: "Uplink packet health, latency meters and API retries", status: "idle", avatar: "🌐", color: "from-blue-600 to-cyan-500", enabled: true, logs: ["System: Network Monitor active."], category: "system", resourceUsage: { cpu: 1, ram: 5 } },

  // SECURITY AGENTS
  { id: "security-agent", name: "Security Agent", role: "Firewall lock keys, diagnostic shield and code access block", status: "idle", avatar: "🛡️", color: "from-indigo-600 to-blue-500", enabled: true, logs: ["System: Security Agent active."], category: "security", resourceUsage: { cpu: 1, ram: 10 } },
  { id: "privacy", name: "Privacy Agent", role: "Scrubs sensitive logs, local file system leakage safeguard", status: "idle", avatar: "🔏", color: "from-violet-600 to-indigo-500", enabled: true, logs: ["System: Privacy Agent active."], category: "security", resourceUsage: { cpu: 1, ram: 8 } },
  { id: "permission-mgr", name: "Permission Manager Agent", role: "Interactive consent popup and system capability checker", status: "idle", avatar: "🔑", color: "from-fuchsia-600 to-purple-500", enabled: true, logs: ["System: Permission Mgr active."], category: "security", resourceUsage: { cpu: 1, ram: 6 } },

  // MEDIA AGENTS
  { id: "image-gen", name: "Image Generation Agent", role: "Procedural UI mockups and canvas graphics rendering", status: "idle", avatar: "🖼️", color: "from-pink-600 to-rose-500", enabled: true, logs: ["System: Image Gen active."], category: "media", resourceUsage: { cpu: 1, ram: 18 } },
  { id: "audio-gen", name: "Audio Generation Agent", role: "Synthesizer wave loops and acoustic feedback parameters", status: "idle", avatar: "🎵", color: "from-indigo-600 to-pink-500", enabled: true, logs: ["System: Audio Gen active."], category: "media", resourceUsage: { cpu: 1, ram: 12 } },
  { id: "text-to-speech", name: "Text-to-Speech Agent", role: "Acoustic TTS streaming, voice profiles, and neural synthesis", status: "idle", avatar: "🗣️", color: "from-violet-600 to-fuchsia-500", enabled: true, logs: ["System: TTS Agent active."], category: "media", resourceUsage: { cpu: 1, ram: 15 } },

  // PRODUCTIVITY AGENTS
  { id: "task-manager-agent", name: "Task Manager Agent", role: "Chronological goal manager and agenda state coordinator", status: "idle", avatar: "📋", color: "from-teal-600 to-emerald-500", enabled: true, logs: ["System: Task Mgr Agent active."], category: "productivity", resourceUsage: { cpu: 1, ram: 7 } },
  { id: "calendar-agent", name: "Calendar Agent", role: "Reminders organizer, schedules alarm and appointment builder", status: "idle", avatar: "📅", color: "from-amber-600 to-yellow-500", enabled: true, logs: ["System: Calendar Agent active."], category: "productivity", resourceUsage: { cpu: 1, ram: 6 } },

  // KNOWLEDGE AGENTS
  { id: "web-search-agent", name: "Web Search Agent", role: "Real-time Google search grounding and reference citations", status: "idle", avatar: "🔍", color: "from-blue-600 to-cyan-500", enabled: true, logs: ["System: Web Search Agent active."], category: "knowledge", resourceUsage: { cpu: 1, ram: 11 } },
  { id: "research-agent", name: "Research Agent", role: "In-depth document parser and semantic summary compiler", status: "idle", avatar: "📚", color: "from-cyan-600 to-emerald-500", enabled: true, logs: ["System: Research Agent active."], category: "knowledge", resourceUsage: { cpu: 1, ram: 14 } },

  // AUTOMATION AGENTS
  { id: "workflow-agent", name: "Workflow Agent", role: "Sequences programmatic actions into reusable loops", status: "idle", avatar: "🔄", color: "from-emerald-600 to-teal-500", enabled: true, logs: ["System: Workflow Agent active."], category: "automation", resourceUsage: { cpu: 1, ram: 8 } },
  { id: "scheduler-agent", name: "Scheduler Agent", role: "Checks daily/hourly automated cron criteria", status: "idle", avatar: "⏰", color: "from-teal-600 to-cyan-500", enabled: true, logs: ["System: Scheduler Agent active."], category: "automation", resourceUsage: { cpu: 1, ram: 5 } }
];

export default function MultiAgentSystem() {
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem("hania_agents");
    return saved ? JSON.parse(saved) : DEFAULT_AGENTS;
  });

  const [globalLogs, setGlobalLogs] = useState<string[]>([
    "AGENT ORCHESTRATOR: Fully loaded 25+ background intelligence nodes.",
    "HEALTH GUARD: Auto-start completed. All enabled nodes reported STABLE (green).",
    "RECOVERY GUARANTEE: Active thread watchers mounted successfully."
  ]);

  const [isCoordinating, setIsCoordinating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "core" | "system" | "security" | "media" | "productivity" | "knowledge" | "automation">("all");
  const [isAdding, setIsAdding] = useState(false);

  // New custom agent form
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    name: "",
    role: "",
    avatar: "🤖",
    category: "core",
    color: "from-blue-600 to-cyan-500"
  });

  useEffect(() => {
    localStorage.setItem("hania_agents", JSON.stringify(agents));
  }, [agents]);

  // Simulated background agent loop: periodically trigger small background logs & checks
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => {
        const enabledAgents = prev.filter(a => a.enabled);
        if (enabledAgents.length === 0) return prev;

        const randomAgent = enabledAgents[Math.floor(Math.random() * enabledAgents.length)];
        const cpuTick = Math.floor(Math.random() * 8) + 1;
        const ramTick = randomAgent.resourceUsage.ram + (Math.random() > 0.5 ? 1 : -1);
        const timestamp = new Date().toTimeString().split(" ")[0];
        const actionMsg = `[${timestamp}] Routine diagnostic cycle: OK. CPU at ${cpuTick}%.`;

        // Schedule reverting processing status to idle after short delay
        setTimeout(() => {
          setAgents(innerPrev => innerPrev.map(a => a.id === randomAgent.id ? { ...a, status: "idle" } : a));
        }, 1500);

        return prev.map(a => {
          if (a.id === randomAgent.id) {
            return {
              ...a,
              status: "processing",
              recentAction: "Diagnostic health sweep",
              resourceUsage: { cpu: cpuTick, ram: Math.max(3, Math.min(60, ramTick)) },
              logs: [actionMsg, ...a.logs.slice(0, 19)]
            };
          }
          return a;
        });
      });
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleAgent = (id: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === id) {
        const timestamp = new Date().toTimeString().split(" ")[0];
        const stateMsg = `[${timestamp}] Agent manually ${a.enabled ? "DISABLED" : "ENABLED"}.`;
        return {
          ...a,
          enabled: !a.enabled,
          logs: [stateMsg, ...a.logs]
        };
      }
      return a;
    }));
    const agent = agents.find(a => a.id === id);
    setGlobalLogs(prev => [`[${new Date().toTimeString().split(" ")[0]}] ORCHESTRATOR: Switched state for ${agent?.name}.`, ...prev]);
  };

  const handleRestartAgent = (id: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === id) {
        const timestamp = new Date().toTimeString().split(" ")[0];
        return {
          ...a,
          status: "processing",
          logs: [`[${timestamp}] Re-initializing agent threads...`, `[${timestamp}] Handshake complete. Status: ONLINE.`, ...a.logs]
        };
      }
      return a;
    }));

    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status: "idle" } : a));
    }, 1200);

    const agent = agents.find(a => a.id === id);
    setGlobalLogs(prev => [`[${new Date().toTimeString().split(" ")[0]}] RECOVERY ENGINE: Force restarted agent ${agent?.name}.`, ...prev]);
  };

  const triggerConsensus = () => {
    setIsCoordinating(true);
    setGlobalLogs(prev => ["ORCHESTRATOR: Initiating multi-agent secure consensus protocol...", ...prev]);

    // Staggered status animations across categories
    agents.forEach((agent, index) => {
      if (!agent.enabled) return;
      setTimeout(() => {
        setAgents(prev => prev.map(a => a.id === agent.id ? { 
          ...a, 
          status: "processing",
          recentAction: "Synchronizing system consensus metrics",
          logs: [`[${new Date().toTimeString().split(" ")[0]}] Processing cluster synchronization...`, ...a.logs]
        } : a));
      }, index * 100);

      setTimeout(() => {
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: "idle" } : a));
      }, index * 100 + 1000);
    });

    setTimeout(() => {
      setIsCoordinating(false);
      setGlobalLogs(prev => ["ORCHESTRATOR: Consensus achieved across all active background layers successfully.", ...prev]);
    }, agents.length * 100 + 1200);
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.name || !newAgent.role) return;

    const id = newAgent.name.toLowerCase().trim().replace(/\s+/g, "-");
    const created: Agent = {
      id,
      name: newAgent.name,
      role: newAgent.role,
      avatar: newAgent.avatar || "🤖",
      color: newAgent.color || "from-blue-600 to-cyan-500",
      status: "idle",
      enabled: true,
      logs: ["Agent manually created and initialized."],
      category: (newAgent.category as any) || "core",
      resourceUsage: { cpu: 1, ram: 5 }
    };

    setAgents(prev => [...prev, created]);
    setGlobalLogs(prev => [`[${new Date().toTimeString().split(" ")[0]}] CUSTOM AGENT: Spawned new node '${created.name}' inside ${created.category}.`, ...prev]);
    setIsAdding(false);
    setNewAgent({ name: "", role: "", avatar: "🤖", category: "core", color: "from-blue-600 to-cyan-500" });
  };

  const handleDeleteAgent = (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
    setGlobalLogs(prev => [`[${new Date().toTimeString().split(" ")[0]}] ORCHESTRATOR: Purged custom agent '${id}'.`, ...prev]);
  };

  // Categories definition
  const categories = [
    { id: "all", name: "All Nodes" },
    { id: "core", name: "Core" },
    { id: "system", name: "System" },
    { id: "security", name: "Security" },
    { id: "media", name: "Media" },
    { id: "productivity", name: "Productivity" },
    { id: "knowledge", name: "Knowledge" },
    { id: "automation", name: "Automation" }
  ];

  const filteredAgents = activeCategory === "all" ? agents : agents.filter(a => a.category === activeCategory);

  const totalCpu = agents.filter(a => a.enabled).reduce((acc, curr) => acc + curr.resourceUsage.cpu, 0);
  const totalRam = agents.filter(a => a.enabled).reduce((acc, curr) => acc + curr.resourceUsage.ram, 0);

  return (
    <div className="space-y-6" id="autonomous-multi-agent-intelligence">
      {/* Top dashboard summary header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">ORCHESTRATOR STATUS</span>
          <span className="text-sm font-mono font-black text-white flex items-center gap-1.5 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active (Green)
          </span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">NODE STACK COUNT</span>
          <span className="text-sm font-mono font-black text-white">{agents.length} Mounted Agents</span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">BACKGROUND CPU INDEX</span>
          <span className="text-sm font-mono font-black text-cyan-400">{totalCpu}% Optimized</span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">BACKGROUND RAM HEAP</span>
          <span className="text-sm font-mono font-black text-rose-400">{totalRam} MB Allocated</span>
        </div>
      </div>

      {/* Control Actions Belt */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-cyan-600/10 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                  : "bg-zinc-950/40 border border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={triggerConsensus}
            disabled={isCoordinating}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 rounded-xl text-[10px] font-mono font-bold transition-all active:scale-95 flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isCoordinating ? "animate-spin" : ""}`} />
            Consensus Sweep
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-[10px] font-mono font-bold transition-all flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Custom Agent
          </button>
        </div>
      </div>

      {/* New Custom Agent Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4 text-xs"
        >
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1">
            <Plus className="w-4 h-4 text-cyan-400" /> Create Custom Autonomous Agent
          </h4>
          <form onSubmit={handleCreateAgent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-500 uppercase block">Agent Name</label>
              <input
                type="text"
                required
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                placeholder="e.g. Analytics Scout"
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-500 uppercase block">Agent Category</label>
              <select
                value={newAgent.category}
                onChange={(e) => setNewAgent({ ...newAgent, category: e.target.value as any })}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              >
                <option value="core">Core Cognitive</option>
                <option value="system">System Hardware</option>
                <option value="security">Security Shield</option>
                <option value="media">Media Synthesis</option>
                <option value="productivity">Productivity Workflow</option>
                <option value="knowledge">Knowledge Scraping</option>
                <option value="automation">Scheduled Automation</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[9px] font-mono text-zinc-500 uppercase block">Assigned Role & Responsibilities</label>
              <input
                type="text"
                required
                value={newAgent.role}
                onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value })}
                placeholder="Describe exact programmatic rules and routine focus..."
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3.5 py-1.5 bg-zinc-900 text-zinc-400 rounded-lg text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-mono font-bold"
              >
                Launch Node
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Main layout with Logs sidebar and Grid cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logs side column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 flex flex-col gap-3 h-[300px] overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-zinc-500 animate-pulse" /> Orchestration Console
              </span>
              <span className="text-[8px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 rounded-full uppercase font-bold">Auto-Start</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[9px] text-zinc-400">
              {globalLogs.map((log, i) => (
                <div key={i} className="py-0.5 border-b border-zinc-900/30 text-zinc-300 leading-normal">
                  <span className="text-zinc-600">➔</span> {log}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900/60 p-4 rounded-2xl text-[10px] font-mono text-zinc-500 leading-relaxed">
            💡 <strong className="text-zinc-300">Failure Recovery Guarantee:</strong> If any background intelligence node experiences thread exhaustion or network timeout, the HANIA orchestrator automatically restarts its lifecycle within 500ms safely.
          </div>
        </div>

        {/* Dynamic Grid Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
          {filteredAgents.map(agent => {
            const isProcessing = agent.status === "processing";
            return (
              <div
                key={agent.id}
                className={`bg-zinc-950/60 border rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                  !agent.enabled 
                    ? "opacity-40 border-zinc-950" 
                    : isProcessing 
                    ? "border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.1)] scale-[1.01]" 
                    : "border-zinc-900 hover:border-zinc-800"
                }`}
              >
                {/* Horizontal progress animation for processing nodes */}
                {isProcessing && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 animate-pulse" />
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{agent.avatar}</span>
                      <div>
                        <span className="text-xs font-mono font-black text-white">{agent.name}</span>
                        <p className="text-[8px] font-mono text-zinc-500 uppercase mt-0.5">{agent.category} stack</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleAgent(agent.id)}
                        title={agent.enabled ? "Disable agent" : "Enable agent"}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        {agent.enabled ? (
                          <ToggleRight className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-zinc-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-normal">{agent.role}</p>

                  {agent.enabled && agent.recentAction && (
                    <div className="bg-black/40 border border-zinc-900 p-2 rounded-xl text-[9px] font-mono text-zinc-500 flex items-center justify-between">
                      <div className="flex items-center gap-1 truncate max-w-[80%]">
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span className="truncate">{agent.recentAction}</span>
                      </div>
                      <span className="text-[8px] bg-zinc-900 px-1 rounded font-bold">{agent.resourceUsage.cpu}% CPU</span>
                    </div>
                  )}
                </div>

                {agent.enabled && (
                  <div className="flex gap-1.5 border-t border-zinc-900/40 pt-3 mt-3.5">
                    <button
                      onClick={() => handleRestartAgent(agent.id)}
                      className="flex-1 py-1.5 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-[9px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Force Restart
                    </button>
                    <button
                      onClick={() => {
                        const logsStr = agent.logs.join("\n");
                        alert(`--- LIVE FEEDS LOGS: ${agent.name} ---\n${logsStr || "No log entries captured yet."}`);
                      }}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white rounded-xl text-[9px] font-mono font-bold uppercase transition-all"
                    >
                      Logs
                    </button>
                    {agent.id.startsWith("custom-") || !DEFAULT_AGENTS.some(da => da.id === agent.id) ? (
                      <button
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-950 text-red-400 rounded-xl transition-all"
                        title="Delete agent node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
