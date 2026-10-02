import { useState } from "react";
import { Zap, Play, ArrowRight, ToggleLeft, ToggleRight, Plus, HelpCircle, BellRing, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SmartWorkflow } from "../types";

interface WorkflowEngineProps {
  onAddAnalysisLog: (text: string) => void;
}

const INITIAL_WORKFLOWS: SmartWorkflow[] = [
  {
    id: "wf-1",
    name: "Autonomic Screen Diagnostic & Correction",
    description: "Triggers on UI layout errors, performs OCR OCR scans, requests corrective steps, and patches imports.",
    isActive: true,
    triggerType: "event",
    actions: [
      { id: "a1", type: "action", label: "Capture Screen sharing active buffer", config: "Format: PNG" },
      { id: "a2", type: "conditional", label: "Check: Contains 'TS' error string?", config: "True -> Proceed" },
      { id: "a3", type: "delay", label: "Hold pipeline for Iqra analysis", config: "Delay: 400ms" },
      { id: "a4", type: "action", label: "Trigger Iqra voice summary suggestion", config: "Language: Roman Urdu" }
    ]
  },
  {
    id: "wf-2",
    name: "Midnight System Health Integrity Scan",
    description: "Scheduled backup and sandbox state clearance run with user notifications.",
    isActive: false,
    triggerType: "schedule",
    actions: [
      { id: "b1", type: "action", label: "Verify memory structures", config: "All layers" },
      { id: "b2", type: "action", label: "Clear local cache & video storage", config: "WASM safe-purge" },
      { id: "b3", type: "loop", label: "Loop: Check all installed plugins", config: "Count: 3" }
    ]
  }
];

export default function WorkflowEngine({ onAddAnalysisLog }: WorkflowEngineProps) {
  const [workflows, setWorkflows] = useState<SmartWorkflow[]>(INITIAL_WORKFLOWS);
  const [runningWorkflowId, setRunningWorkflowId] = useState<string | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(-1);

  const handleToggleWorkflow = (id: string, name: string, current: boolean) => {
    setWorkflows(
      workflows.map((wf) => (wf.id === id ? { ...wf, isActive: !current } : wf))
    );
    onAddAnalysisLog(`WORKFLOW ENGINE: Pipeline '${name}' is now [${!current ? "ACTIVE" : "INACTIVE"}].`);
  };

  const handleExecuteWorkflow = (wf: SmartWorkflow) => {
    if (runningWorkflowId) return;
    setRunningWorkflowId(wf.id);
    setActiveStepIdx(0);
    onAddAnalysisLog(`WORKFLOW RUNTIME: Initializing pipeline chain '${wf.name}'...`);

    let currentStep = 0;
    const executeStep = () => {
      if (currentStep < wf.actions.length) {
        setActiveStepIdx(currentStep);
        onAddAnalysisLog(`WORKFLOW STEP ${currentStep + 1}: Executing [${wf.actions[currentStep].label}] - config: ${wf.actions[currentStep].config}`);
        currentStep++;
        setTimeout(executeStep, 1000);
      } else {
        setRunningWorkflowId(null);
        setActiveStepIdx(-1);
        onAddAnalysisLog(`WORKFLOW RUNTIME SUCCESS: Pipeline chain completed successfully in ${(wf.actions.length * 1000)}ms.`);
      }
    };

    setTimeout(executeStep, 500);
  };

  return (
    <div className="space-y-6" id="smart-workflow-engine">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div>
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-pink-500 animate-pulse" /> Reusable Workflow Pipelines
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            Orchestrate composite multi-step logic paths. Includes conditional branches, loops, and custom delays.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className={`bg-zinc-950/60 border rounded-2xl p-5 space-y-5 transition-all ${
              runningWorkflowId === wf.id ? "border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.1)]" : "border-zinc-900"
            }`}
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-mono font-bold text-white">{wf.name}</h4>
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full uppercase ${
                    wf.triggerType === "event"
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "bg-purple-500/10 text-purple-400"
                  }`}>
                    {wf.triggerType}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-normal">{wf.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleWorkflow(wf.id, wf.name, wf.isActive)}
                  className="text-zinc-400 hover:text-white transition-colors"
                  disabled={runningWorkflowId === wf.id}
                >
                  {wf.isActive ? (
                    <ToggleRight className="w-6 h-6 text-pink-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-zinc-600" />
                  )}
                </button>

                <button
                  onClick={() => handleExecuteWorkflow(wf)}
                  disabled={!wf.isActive || runningWorkflowId !== null}
                  className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                >
                  <Play className="w-3 h-3" /> Run
                </button>
              </div>
            </div>

            {/* Visual connected pipeline chain nodes */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-2 overflow-x-auto py-2">
              {wf.actions.map((act, idx) => {
                const isActiveStep = runningWorkflowId === wf.id && activeStepIdx === idx;
                const isCompletedStep = runningWorkflowId === wf.id && activeStepIdx > idx;

                return (
                  <div key={act.id} className="flex flex-col md:flex-row md:items-center gap-2 shrink-0">
                    {/* Node block */}
                    <div
                      className={`p-3 rounded-xl border transition-all w-[180px] text-left relative overflow-hidden ${
                        isActiveStep
                          ? "bg-pink-500/10 border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.2)]"
                          : isCompletedStep
                          ? "bg-zinc-900 border-emerald-500/40 text-zinc-400"
                          : "bg-zinc-950 border-zinc-900 text-zinc-500"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span
                          className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                            act.type === "conditional"
                              ? "bg-blue-500/10 text-blue-300"
                              : act.type === "delay"
                              ? "bg-amber-500/10 text-amber-300"
                              : act.type === "loop"
                              ? "bg-purple-500/10 text-purple-300"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {act.type}
                        </span>

                        {isActiveStep && (
                          <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" />
                        )}
                      </div>

                      <h5 className="text-[10px] font-mono font-semibold text-zinc-200 truncate">{act.label}</h5>
                      <span className="text-[8px] font-mono text-zinc-500 block truncate mt-0.5">{act.config}</span>
                    </div>

                    {/* Right connector arrow (not for the last step) */}
                    {idx < wf.actions.length - 1 && (
                      <div className="hidden md:flex items-center justify-center text-zinc-700 px-1">
                        <ArrowRight className={`w-3.5 h-3.5 ${runningWorkflowId === wf.id && activeStepIdx === idx ? 'text-pink-500' : ''}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
