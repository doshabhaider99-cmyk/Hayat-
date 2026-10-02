import { useState } from "react";
import { Database, Plus, Trash2, CheckCircle, Brain, GraduationCap, Award, Settings, BookOpen, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Memory } from "../types";

interface MemorySystemProps {
  onAddAnalysisLog: (text: string) => void;
}

const INITIAL_MEMORIES: Memory[] = [
  {
    id: "1",
    category: "preferences",
    content: "Interaction profile: Fluent in Roman Urdu, Urdu, and English. Default address term: 'Haider'.",
    timestamp: "2026-06-29 12:45"
  },
  {
    id: "2",
    category: "conversation",
    content: "Haider is studying BS Physics and is preparing for university mid-term exams.",
    timestamp: "2026-06-29 13:02"
  },
  {
    id: "3",
    category: "project",
    content: "Workspace running real-time high-latency simulation filters on port 3000.",
    timestamp: "2026-06-29 13:10"
  },
  {
    id: "4",
    category: "task",
    content: "Successfully loaded the custom stable FFmpeg libx264 video codec configurations.",
    timestamp: "2026-06-29 13:15"
  }
];

export default function MemorySystem({ onAddAnalysisLog }: MemorySystemProps) {
  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);
  const [newContent, setNewContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Memory["category"]>("preferences");

  // PERSONALIZED STUDENT PROFILE STATE
  const [eduLevel, setEduLevel] = useState("BS Physics (Undergraduate)");
  const [subjects, setSubjects] = useState("Classical Mechanics, Quantum Mechanics, Relativistic Electrodynamics");
  const [completedTopics, setCompletedTopics] = useState("Lorentz Factor, Toroidal Solenoids");
  const [weakAreas, setWeakAreas] = useState("Infinite potential Wells, Wavefunction Normalization");
  const [strongAreas, setStrongAreas] = useState("Isentropic Entropy Processes, Time Dilation");
  const [learningObjective, setLearningObjective] = useState("Mid-term exam preparation and derivation study");

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleAddMemory = () => {
    if (!newContent.trim()) return;

    const newMemory: Memory = {
      id: Date.now().toString(),
      category: selectedCategory,
      content: newContent,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    setMemories([newMemory, ...memories]);
    setNewContent("");
    onAddAnalysisLog(`IQRA MEMORY BRAIN: Successfully saved and indexed memory record of category [${selectedCategory}].`);
  };

  const handleDeleteMemory = (id: string, cat: string) => {
    setMemories(memories.filter((m) => m.id !== id));
    onAddAnalysisLog(`IQRA MEMORY BRAIN: Flushed index reference memory ID [${id}] of category [${cat}].`);
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    onAddAnalysisLog(`IQRA TUTOR BRAIN: Adaptive learning profile updated. Explanations re-weighted to match: ${eduLevel}.`);
    
    // Inject a memory context trace so Iqra automatically recalls this
    const profileMemory: Memory = {
      id: Date.now().toString(),
      category: "preferences",
      content: `User learning profile trace. Level: ${eduLevel}, Weaknesses: ${weakAreas}, Strengths: ${strongAreas}, Objectives: ${learningObjective}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    setMemories([profileMemory, ...memories]);
  };

  return (
    <div className="space-y-6" id="layered-memory-system">
      {/* 1. ADAPTIVE STUDENT PROFILE BAR */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Brain className="text-cyan-400 w-4 h-4 animate-pulse" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Iqra Adaptive Learning Brain Profile</span>
          </div>

          <button
            onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
            className="px-3 py-1.5 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg text-[10px] font-mono font-bold transition-all active:scale-95"
          >
            {isEditingProfile ? "Apply Profile Changes" : "Update Student Profile"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Education Level */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400/60" /> Academic / Education Level
            </span>
            {isEditingProfile ? (
              <input
                type="text"
                value={eduLevel}
                onChange={(e) => setEduLevel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            ) : (
              <p className="text-slate-200 pl-4.5 font-medium">{eduLevel}</p>
            )}
          </div>

          {/* Subjects of Interest */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400/60" /> Studied Subjects
            </span>
            {isEditingProfile ? (
              <input
                type="text"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            ) : (
              <p className="text-slate-300 pl-4.5 truncate" title={subjects}>{subjects}</p>
            )}
          </div>

          {/* Completed Topics */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-400/60" /> Completed Topics
            </span>
            {isEditingProfile ? (
              <input
                type="text"
                value={completedTopics}
                onChange={(e) => setCompletedTopics(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            ) : (
              <p className="text-slate-300 pl-4.5">{completedTopics}</p>
            )}
          </div>

          {/* Strong Areas */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400/60" /> Strong Cognitive Areas
            </span>
            {isEditingProfile ? (
              <input
                type="text"
                value={strongAreas}
                onChange={(e) => setStrongAreas(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            ) : (
              <p className="text-emerald-400 pl-4.5 font-medium">{strongAreas}</p>
            )}
          </div>

          {/* Weak Areas */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Settings className="w-3.5 h-3.5 text-amber-400/60" /> Weak Areas (Targeted Tutoring)
            </span>
            {isEditingProfile ? (
              <input
                type="text"
                value={weakAreas}
                onChange={(e) => setWeakAreas(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            ) : (
              <p className="text-amber-400 pl-4.5 font-medium">{weakAreas}</p>
            )}
          </div>

          {/* Learning Objectives */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-cyan-400/60" /> Current Core Objectives
            </span>
            {isEditingProfile ? (
              <input
                type="text"
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            ) : (
              <p className="text-slate-300 pl-4.5">{learningObjective}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Custom Layer Memory Ingestion */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Database className="text-cyan-400 w-4 h-4" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Save Long-Term Memory Blocks</span>
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            {(["conversation", "preferences", "project", "task"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg transition-all ${
                  selectedCategory === cat
                    ? "bg-cyan-600/10 text-cyan-400 border border-cyan-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Instruct Iqra to remember details (e.g., 'Haider prefers detailed physics derivations')`}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddMemory()}
            className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
          />
          <button
            onClick={handleAddMemory}
            className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/35 border border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Save Memory
          </button>
        </div>
      </div>

      {/* 3. Memory Display Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {memories.map((m) => (
            <motion.div
              layout
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950/40 border border-slate-900 hover:border-cyan-500/10 rounded-2xl p-4 relative flex flex-col justify-between gap-3 group/mem transition-all"
            >
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      m.category === "preferences"
                        ? "bg-blue-500/10 text-blue-300"
                        : m.category === "conversation"
                        ? "bg-fuchsia-500/10 text-fuchsia-300"
                        : m.category === "project"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {m.category}
                  </span>
                  
                  <span className="text-[8px] font-mono text-slate-500">{m.timestamp}</span>
                </div>
                <p className="text-[11px] font-mono text-slate-300 leading-relaxed">"{m.content}"</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.03] opacity-0 group-hover/mem:opacity-100 transition-opacity">
                <span className="text-[9px] font-mono text-cyan-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-cyan-400" /> Synced with Iqra Memory Matrix
                </span>

                <button
                  onClick={() => handleDeleteMemory(m.id, m.category)}
                  className="p-1 hover:bg-slate-900 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                  title="Purge Memory Block"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
