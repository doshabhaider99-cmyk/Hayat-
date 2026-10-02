import { useState } from "react";
import { CheckCircle2, Circle, AlertCircle, Plus, Play, Pause, Square, Trash2, Calendar, Settings, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TaskPlan, TaskStep, AutomationWorkflow } from "../types";

interface TaskPlanningEngineProps {
  onAddAnalysisLog: (text: string) => void;
}

const INITIAL_PLANS: TaskPlan[] = [
  {
    id: "p1",
    title: "Vercel Deployment Pipeline Scaffold",
    description: "Compile production bundle, check tsconfig compliance, and test asset routing.",
    progress: 33,
    status: "idle",
    steps: [
      { id: "s1", title: "Verify strict TypeScript type-safety bounds", completed: true, priority: "high" },
      { id: "s2", title: "Bundle server.ts into standalone CommonJS", completed: false, priority: "high" },
      { id: "s3", title: "Run test compile_applet verifying Vite config", completed: false, priority: "medium" }
    ]
  },
  {
    id: "p2",
    title: "Image Generation Agent Calibration",
    description: "Connect standard pyttsx3 voice metrics to secondary Imagen-3 payload.",
    progress: 100,
    status: "completed",
    steps: [
      { id: "s4", title: "Initialize GoogleGenAI image models safely", completed: true, priority: "high" },
      { id: "s5", title: "Map prompt text variables into save buffer", completed: true, priority: "medium" }
    ]
  }
];

const INITIAL_AUTOMATIONS: AutomationWorkflow[] = [
  {
    id: "a1",
    name: "Daily Folder Sorter & Optimizer",
    description: "Auto-arranges generated images into /public/assets folder at midnight.",
    trigger: "Schedule Event",
    frequency: "Every 24 hours (00:00)",
    status: "active",
    lastRun: "2026-06-29 00:00"
  },
  {
    id: "a2",
    name: "Screen Stream Guard",
    description: "Purges temporary computer vision buffers on local disk space periodically.",
    trigger: "Storage Threshold",
    frequency: "Every 6 hours",
    status: "paused",
    lastRun: "2026-06-29 12:00"
  }
];

export default function TaskPlanningEngine({ onAddAnalysisLog }: TaskPlanningEngineProps) {
  const [plans, setPlans] = useState<TaskPlan[]>(INITIAL_PLANS);
  const [automations, setAutomations] = useState<AutomationWorkflow[]>(INITIAL_AUTOMATIONS);
  
  // Custom Task formulation state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  // Custom Automation formulation state
  const [newAutoName, setNewAutoName] = useState("");
  const [newAutoFreq, setNewAutoFreq] = useState("");

  // Plan actions
  const handleToggleStep = (planId: string, stepId: string) => {
    setPlans(
      plans.map((p) => {
        if (p.id !== planId) return p;
        const updatedSteps = p.steps.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s));
        const completedCount = updatedSteps.filter((s) => s.completed).length;
        const progress = Math.round((completedCount / updatedSteps.length) * 100);
        return {
          ...p,
          steps: updatedSteps,
          progress,
          status: progress === 100 ? "completed" : p.status
        };
      })
    );
    onAddAnalysisLog(`KABIR PLANNING: Modified subtask completion checkpoint.`);
  };

  const handleStartPlan = (id: string, name: string) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, status: "running" } : p)));
    onAddAnalysisLog(`KABIR PLANNING: Commenced execution sequence for '${name}'.`);
  };

  const handlePausePlan = (id: string, name: string) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, status: "paused" } : p)));
    onAddAnalysisLog(`KABIR PLANNING: Execution paused for '${name}'.`);
  };

  const handleCreatePlan = () => {
    if (!newTaskTitle.trim()) return;
    const newPlan: TaskPlan = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDesc || "User-configured multi-step technical execution strategy.",
      progress: 0,
      status: "idle",
      steps: [
        { id: `s_${Date.now()}_1`, title: "Deconstruct requirements under Aisha's reasoning", completed: false, priority: "high" },
        { id: `s_${Date.now()}_2`, title: "Scaffold strict type boundaries", completed: false, priority: "medium" }
      ]
    };
    setPlans([newPlan, ...plans]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    onAddAnalysisLog(`KABIR PLANNING: Formulated and queued '${newPlan.title}' workflow.`);
  };

  // Automation actions
  const handleToggleAuto = (id: string, currentStatus: "active" | "paused" | "stopped", name: string) => {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    setAutomations(
      automations.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
    );
    onAddAnalysisLog(`AUTOMATION ENGINE: Flow '${name}' status updated to [${nextStatus}].`);
  };

  const handleDeleteAuto = (id: string, name: string) => {
    setAutomations(automations.filter((a) => a.id !== id));
    onAddAnalysisLog(`AUTOMATION ENGINE: Decommissioned and deleted persistent stream: '${name}'.`);
  };

  const handleCreateAuto = () => {
    if (!newAutoName.trim()) return;
    const newAuto: AutomationWorkflow = {
      id: Date.now().toString(),
      name: newAutoName,
      description: "User scheduled custom background automation workflow.",
      trigger: "Cron Job Trigger",
      frequency: newAutoFreq || "Every 12 hours",
      status: "active",
      lastRun: "Never"
    };
    setAutomations([newAuto, ...automations]);
    setNewAutoName("");
    setNewAutoFreq("");
    onAddAnalysisLog(`AUTOMATION ENGINE: Persistent stream registered: '${newAuto.name}'.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="planning-and-automation">
      {/* Task Planning Column */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
          <Calendar className="text-pink-500 w-4 h-4" />
          <h3 className="text-sm font-semibold font-mono text-white uppercase tracking-wider">Iqra Task Planning Engine</h3>
        </div>

        {/* Task Creator Form */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-3">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Formulate Next Technical Strategy</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Task title (e.g. Flutter custom paint)"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-pink-500/40"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-pink-500/40"
            />
          </div>
          <button
            onClick={handleCreatePlan}
            className="w-full py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Break Task into Sub-steps
          </button>
        </div>

        {/* Plans List */}
        <div className="space-y-4">
          {plans.map((p) => (
            <div key={p.id} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold text-white">{p.title}</h4>
                  <p className="text-[10px] text-zinc-400">{p.description}</p>
                </div>

                <div className="flex gap-1">
                  {p.status === "running" ? (
                    <button
                      onClick={() => handlePausePlan(p.id, p.title)}
                      className="p-1 hover:bg-zinc-900 text-zinc-400 hover:text-amber-400 rounded-lg"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    p.status !== "completed" && (
                      <button
                        onClick={() => handleStartPlan(p.id, p.title)}
                        className="p-1 hover:bg-zinc-900 text-zinc-400 hover:text-emerald-400 rounded-lg"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                  <span>PROGRESS</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              {/* Steps Checklist */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-900/40">
                {p.steps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => handleToggleStep(p.id, step.id)}
                    className="flex items-center gap-2 cursor-pointer group text-[11px] font-mono text-zinc-300 hover:text-white"
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-pink-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 group-hover:text-pink-500/50" />
                    )}
                    <span className={`${step.completed ? "line-through text-zinc-500" : ""}`}>{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Persistent Automation Workflows Column */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
          <Activity className="text-pink-500 w-4 h-4" />
          <h3 className="text-sm font-semibold font-mono text-white uppercase tracking-wider">Long-Term Automation Streams</h3>
        </div>

        {/* Automation Creator Form */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-3">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Spawn New Automation Worker</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Process name (e.g. Asset Backup)"
              value={newAutoName}
              onChange={(e) => setNewAutoName(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-pink-500/40"
            />
            <input
              type="text"
              placeholder="Frequency (e.g. Every 12h)"
              value={newAutoFreq}
              onChange={(e) => setNewAutoFreq(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-pink-500/40"
            />
          </div>
          <button
            onClick={handleCreateAuto}
            className="w-full py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Deploy Background Worker
          </button>
        </div>

        {/* Automations List */}
        <div className="space-y-4">
          {automations.map((a) => (
            <div key={a.id} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between gap-3 relative overflow-hidden group/auto">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">{a.name}</span>
                  <span
                    className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      a.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {a.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-normal">{a.description}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-900/40">
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono text-zinc-600">SCHEDULE</span>
                  <span className="text-[10px] font-mono text-pink-400">{a.frequency}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover/auto:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleAuto(a.id, a.status, a.name)}
                    className="p-1 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg"
                    title={a.status === "active" ? "Pause Workflow" : "Resume Workflow"}
                  >
                    {a.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteAuto(a.id, a.name)}
                    className="p-1 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 rounded-lg"
                    title="Terminate Worker"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
