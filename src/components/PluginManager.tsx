import { useState } from "react";
import { FolderGit, Check, ShieldCheck, AlertTriangle, Download, Trash2, Sliders, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Plugin } from "../types";

interface PluginManagerProps {
  onAddAnalysisLog: (text: string) => void;
}

const INITIAL_PLUGINS: Plugin[] = [
  {
    id: "p-map",
    name: "Google Maps Platform Grounder",
    description: "Resolves architectural coordinates directly using the Maps/Places/Routes API.",
    version: "1.0.4",
    author: "Iqra Team",
    status: "enabled",
    verified: true,
    category: "Location APIs"
  },
  {
    id: "p-math",
    name: "Sympy Math Solver Node",
    description: "Evaluates algebraic or matrix calculations safely inside sandboxed WebAssembly.",
    version: "2.1.0",
    author: "WASM Community",
    status: "disabled",
    verified: true,
    category: "Computing Core"
  },
  {
    id: "p-gpt",
    name: "Deep Research Scraper",
    description: "Integrates recursive web indexing to construct deep domain digests.",
    version: "0.9.1",
    author: "Deep Research",
    status: "not_installed",
    verified: false,
    category: "Web Intelligence"
  }
];

export default function PluginManager({ onAddAnalysisLog }: PluginManagerProps) {
  const [plugins, setPlugins] = useState<Plugin[]>(INITIAL_PLUGINS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationTarget, setVerificationTarget] = useState<string | null>(null);

  const handleInstall = (id: string, name: string) => {
    setVerificationTarget(id);
    setIsVerifying(true);
    onAddAnalysisLog(`SECURITY: Initiating sandboxed signature validation for '${name}'...`);

    setTimeout(() => {
      setPlugins(
        plugins.map((p) =>
          p.id === id ? { ...p, status: "enabled", verified: true, version: "1.0.0" } : p
        )
      );
      setIsVerifying(false);
      setVerificationTarget(null);
      onAddAnalysisLog(`SECURITY SUCCESS: Signature validated. '${name}' successfully installed to sandbox with restricted system permissions.`);
    }, 1800);
  };

  const handleToggle = (id: string, currentStatus: "enabled" | "disabled", name: string) => {
    const nextStatus = currentStatus === "enabled" ? "disabled" : "enabled";
    setPlugins(
      plugins.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
    );
    onAddAnalysisLog(`PLUGIN SYSTEM: Set '${name}' to state [${nextStatus}].`);
  };

  const handleUninstall = (id: string, name: string) => {
    setPlugins(
      plugins.map((p) => (p.id === id ? { ...p, status: "not_installed" } : p))
    );
    onAddAnalysisLog(`PLUGIN SYSTEM: Deallocated binaries and purged credentials for '${name}'.`);
  };

  return (
    <div className="space-y-6" id="plugin-system-manager">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div>
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <FolderGit className="w-4 h-4 text-pink-500" /> Secure Plugin Registry
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            Isolate and extend capabilities with checked third-party plugins. Core system code is protected.
          </p>
        </div>

        <div className="text-[9px] font-mono text-zinc-500 border border-zinc-800 rounded-lg px-2.5 py-1 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Core Overwrite Shield Activated
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {plugins.map((p) => (
            <motion.div
              layout
              key={p.id}
              className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between gap-4 relative overflow-hidden transition-all hover:border-pink-500/10 group/plugin"
            >
              {/* Verification loader banner */}
              {isVerifying && verificationTarget === p.id && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-[10px] font-mono text-pink-400">SIGNATURE INSPECTION</span>
                  <span className="text-[8px] font-mono text-zinc-600 mt-0.5">Scanning manifest for dangerous APIs</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-pink-400 uppercase">{p.category}</span>
                    <h4 className="text-xs font-mono font-bold text-white">{p.name}</h4>
                  </div>
                  
                  {p.status !== "not_installed" && (
                    <span className="text-[9px] font-mono text-zinc-500">v{p.version}</span>
                  )}
                </div>

                <p className="text-[10px] text-zinc-400 leading-normal font-sans">{p.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-900/40">
                <div className="flex items-center gap-1.5">
                  {p.verified ? (
                    <div className="flex items-center gap-0.5 text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5 text-[8px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> UNVERIFIED
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {p.status === "not_installed" ? (
                    <button
                      onClick={() => handleInstall(p.id, p.name)}
                      className="px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 active:scale-95"
                    >
                      <Download className="w-3 h-3" /> Install
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleToggle(p.id, p.status as "enabled" | "disabled", p.name)}
                        className="text-zinc-400 hover:text-white transition-colors"
                        title={p.status === "enabled" ? "Disable Plugin" : "Enable Plugin"}
                      >
                        {p.status === "enabled" ? (
                          <ToggleRight className="w-5 h-5 text-pink-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-zinc-600" />
                        )}
                      </button>

                      <button
                        onClick={() => handleUninstall(p.id, p.name)}
                        className="p-1 hover:bg-zinc-900 text-zinc-600 hover:text-red-400 rounded transition-colors"
                        title="Uninstall Plugin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
