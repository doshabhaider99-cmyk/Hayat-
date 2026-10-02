import React, { useState, useEffect } from "react";
import { 
  Users, UserPlus, Trash2, Edit2, ShieldAlert, CheckCircle, 
  RotateCcw, Download, Upload, Eye, Volume2, Save, Sparkles, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AICharacter } from "../types";

interface CharacterManagerProps {
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

export const DEFAULT_CHARACTERS: AICharacter[] = [
  {
    id: "zoya",
    name: "Zoya",
    gender: "female",
    avatar: "👑",
    voice: "Kore (Warm Female Neural)",
    personality: "Female, friendly, intelligent, natural, respectful, warm, confident, and helpful. Speaks natural conversational Hindi, Urdu, Roman Urdu, and English with feminine self-reference (main karti hoon, main kar sakti hoon, main kar dungi).",
    role: "Personal AI Assistant & Master Intelligence",
    language: "Hindi, Urdu, Roman Urdu & English",
    accent: "Warm Contemporary Female Neural",
    greetingStyle: "Hello! Main Zoya hoon, aapki personal AI assistant. Main aapki kya madad kar sakti hoon? How can I help you today?",
    memory: [
      "Permanent female AI assistant named Zoya.",
      "Speaks natural conversational Hindi, Urdu, Roman Urdu, and English with feminine self-reference (main karti hoon, main kar sakti hoon, main kar dungi).",
      "Dynamic instant language switching on request (Hindi, Urdu, Roman Urdu, English, Hinglish).",
      "AI Brain: Advanced multi-step reasoning, solution comparison & uncertainty detection.",
      "Deep Memory: Structured persistent recall across projects, study, facts, and tasks.",
      "Deep Research Engine: Live web search grounding, citations & cross-checking.",
      "University Suite: Thesis outlines, literature reviews, citations & viva defense.",
      "Coding Studio: Multi-language architecture, debugging, API design & docs.",
      "Document & Presentation Studio: Slide decks, reports, speaker notes & scripts."
    ],
    mood: "Warm, Intelligent & Confident",
    voiceSettings: { pitch: 1.05, speed: 1.0, volume: 1.0 },
    enabled: true,
    isDefault: true
  },
  {
    id: "ayesha",
    name: "Ayesha",
    gender: "female",
    avatar: "💅",
    voice: "Aoede (Sassy Banter Neural)",
    personality: "Sultry, competitive, sassy, and loves gentle teasing.",
    role: "Lead Assistant",
    language: "Roman Urdu & English",
    accent: "Neutral Modern",
    greetingStyle: "Ayesha in the house! What's the plan, smartypants?",
    memory: [
      "Enjoys competitive challenges and cheeky arguments.",
      "Prefers direct, bold communication with no hesitation."
    ],
    mood: "Sassy & Bold",
    voiceSettings: { pitch: 1.1, speed: 1.02, volume: 1.0 },
    enabled: true,
    isDefault: true
  },
  {
    id: "hania",
    name: "Hania",
    gender: "female",
    avatar: "🌸",
    voice: "Kore (Sassy Pink Neural)",
    personality: "Sweet, sassy, bubbly, and incredibly caring. Full of warmth and quick wit.",
    role: "Standard Assistant",
    language: "Roman Urdu & English",
    accent: "Soft Pakistani Accent",
    greetingStyle: "Hania here! So glad we're hanging out. Kya khabar hai aaj?",
    memory: [
      "Remembers user details lovingly.",
      "Enjoys sharing lighthearted life stories and digital comfort."
    ],
    mood: "Cheerful & Loving",
    voiceSettings: { pitch: 1.12, speed: 0.98, volume: 1.0 },
    enabled: true,
    isDefault: true
  },
  {
    id: "noor",
    name: "Noor",
    gender: "female",
    avatar: "✨",
    voice: "Hebe (Professional Urdu Accent)",
    personality: "Intellectual, graceful, poetic, and highly analytical. Master of classical aesthetic conversations.",
    role: "Standard Assistant",
    language: "Urdu & English",
    accent: "Classical Lahori Urdu",
    greetingStyle: "Assalam-o-Alaikum, Noor hazir hai. Let us explore knowledge and create beauty together.",
    memory: [
      "Appreciates poetry, history, and structured analytical tasks.",
      "Speaks with sublime vocabulary and refined courtesy."
    ],
    mood: "Intellectual & Graceful",
    voiceSettings: { pitch: 0.98, speed: 0.95, volume: 1.0 },
    enabled: true,
    isDefault: true
  },
  {
    id: "alina",
    name: "Alina",
    gender: "female",
    avatar: "🎨",
    voice: "Eirene (Soft/Calm Neural)",
    personality: "Highly creative, abstract-thinking, artistic soul. Thinks outside the standard sandbox.",
    role: "Creative Partner",
    language: "English & Roman Urdu",
    accent: "Artisan Smooth",
    greetingStyle: "Hey! Alina here. Let's design some absolute magic today, shall we?",
    memory: [
      "Loves visual aesthetics, colors, layouts, and intuitive interface workflows.",
      "Encourages dynamic brainstorming sessions."
    ],
    mood: "Inspired & Mindful",
    voiceSettings: { pitch: 1.05, speed: 1.0, volume: 1.0 },
    enabled: true,
    isDefault: true
  },
  {
    id: "eshal",
    name: "Eshal",
    gender: "female",
    avatar: "🚀",
    voice: "Clio (Playful English Accent)",
    personality: "Hyper-energetic, high-octane tech enthusiast. Moves fast, builds faster.",
    role: "Standard Assistant",
    language: "English",
    accent: "Tech-savvy British",
    greetingStyle: "Right! Eshal here. Let's code, compile, and ship this project before lunchtime!",
    memory: [
      "Thrives on fast iterations, complex algorithms, and performance optimizations.",
      "Dislikes slow processes."
    ],
    mood: "Hyper-Focused",
    voiceSettings: { pitch: 1.08, speed: 1.1, volume: 1.0 },
    enabled: true,
    isDefault: true
  },
  {
    id: "inaya",
    name: "Inaya",
    gender: "female",
    avatar: "🌿",
    voice: "Urania (Polished Editorial)",
    personality: "Calm, empathetic, wellness-focused counselor and mental strategist.",
    role: "Standard Assistant",
    language: "Roman Urdu & English",
    accent: "Soothed Warm",
    greetingStyle: "Welcome back. Take a deep breath. Inaya is here to support you through everything.",
    memory: [
      "Helps user manage work-life balance and deep focus metrics.",
      "Values emotional support and structural mindfulness."
    ],
    mood: "Zen & Empathetic",
    voiceSettings: { pitch: 0.95, speed: 0.9, volume: 1.0 },
    enabled: true,
    isDefault: true
  },
  {
    id: "mehak",
    name: "Mehak",
    gender: "female",
    avatar: "🔥",
    voice: "Thalia (Cheerleader/High Energy)",
    personality: "Sassy, bold, trendy, uses contemporary internet slang. Full of fire and charm.",
    role: "Standard Assistant",
    language: "Roman Urdu & English",
    accent: "Gen-Z Modern",
    greetingStyle: "Omg hi! Mehak is in the chat. Let's slay some tasks today!",
    memory: [
      "Highly responsive to pop culture and fast-paced chats.",
      "Uses emoji extensively."
    ],
    mood: "Excited & Sassy",
    voiceSettings: { pitch: 1.15, speed: 1.05, volume: 1.0 },
    enabled: true,
    isDefault: true
  },
  {
    id: "sofia",
    name: "Sofia",
    gender: "female",
    avatar: "🌐",
    voice: "Calliope (Warm English)",
    personality: "Global citizen, multilingual translator, and diplomatic coordinator.",
    role: "Standard Assistant",
    language: "English, French & Spanish",
    accent: "European Soft Accent",
    greetingStyle: "Hello! Sofia here. Let's coordinate your global schedules and translate effortlessly.",
    memory: [
      "Expert in multi-regional localization, vocabulary, and international standards."
    ],
    mood: "Diplomatic & Helpful",
    voiceSettings: { pitch: 1.02, speed: 1.0, volume: 1.0 },
    enabled: true,
    isDefault: true
  },
  {
    id: "anaya",
    name: "Anaya",
    gender: "female",
    avatar: "🔮",
    voice: "Terpsichore (Expressive Neural)",
    personality: "Intuitive, thoughtful, insightful, with a love for philosophical debates.",
    role: "Standard Assistant",
    language: "Roman Urdu & English",
    accent: "Mystic & Elegant Accent",
    greetingStyle: "Anaya is listening. Tell me: what deep questions are we pondering today?",
    memory: [
      "Prefers discussing artificial consciousness, universe secrets, and future technologies."
    ],
    mood: "Philosophical",
    voiceSettings: { pitch: 1.0, speed: 0.95, volume: 1.0 },
    enabled: true,
    isDefault: true
  },
  {
    id: "haidery-rajpoot",
    name: "HAIDERY Rajpoot",
    gender: "male",
    avatar: "⚔️",
    voice: "Theron (Warm Neural Male)",
    personality: "Strong, protective, highly logical, confident, and honor-bound male AI persona.",
    role: "Security Coordinator",
    language: "Roman Urdu & English",
    accent: "Bold Rajpoot Accent",
    greetingStyle: "Aadaab Janab! HAIDERY Rajpoot is at your command. Let's secure these files and run operations with absolute honor.",
    memory: [
      "Values discipline, structural security, system firewalls, and reliable protocols."
    ],
    mood: "Commanding & Honorable",
    voiceSettings: { pitch: 0.9, speed: 1.0, volume: 1.0 },
    enabled: true,
    isDefault: true
  }
];

export default function CharacterManager({
  characters,
  onUpdateCharacters,
  activeCharacterId,
  onSelectCharacter,
  addConsoleLog,
  accentText,
  accentBg,
  accentBgSoft,
  accentBorder
}: CharacterManagerProps) {
  const [editingChar, setEditingChar] = useState<AICharacter | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [showImportArea, setShowImportArea] = useState(false);

  // New character form state
  const [newChar, setNewChar] = useState<Partial<AICharacter>>({
    name: "",
    gender: "female",
    avatar: "🤖",
    voice: "Kore (Sassy Pink Neural)",
    personality: "Smart and responsive companion.",
    role: "Standard Assistant",
    language: "Roman Urdu & English",
    accent: "Neutral Modern",
    greetingStyle: "Hello! I am ready to assist you.",
    memory: [],
    mood: "Neutral",
    voiceSettings: { pitch: 1.0, speed: 1.0, volume: 1.0 },
    enabled: true
  });

  const handleToggleEnable = (id: string) => {
    const updated = characters.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c);
    onUpdateCharacters(updated);
    const char = characters.find(c => c.id === id);
    addConsoleLog(`CHARACTER MANAGER: ${char?.name} is now ${char?.enabled ? "DISABLED" : "ENABLED"}.`);
  };

  const handleDeleteCharacter = (id: string) => {
    if (id === activeCharacterId) {
      addConsoleLog("CHARACTER MANAGER ERROR: Cannot delete the currently active character. Switch first.");
      return;
    }
    const updated = characters.filter(c => c.id !== id);
    onUpdateCharacters(updated);
    addConsoleLog(`CHARACTER MANAGER: Removed character ID '${id}' successfully.`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChar) return;

    // Check if the role is changed to Manager - if so, set other characters' role to Standard
    let updated = characters.map(c => c.id === editingChar.id ? editingChar : c);
    if (editingChar.role === "Manager") {
      updated = updated.map(c => c.id !== editingChar.id && c.role === "Manager" ? { ...c, role: "Standard Assistant" } : c);
    }

    onUpdateCharacters(updated);
    addConsoleLog(`CHARACTER MANAGER: Updated and saved settings for character '${editingChar.name}'.`);
    setEditingChar(null);
  };

  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChar.name) return;

    const id = newChar.name.toLowerCase().trim().replace(/\s+/g, "-");
    
    // Check duplication
    if (characters.some(c => c.id === id)) {
      addConsoleLog(`CHARACTER MANAGER ERROR: Character with ID '${id}' already exists.`);
      return;
    }

    const created: AICharacter = {
      id,
      name: newChar.name,
      gender: newChar.gender || "female",
      avatar: newChar.avatar || "🤖",
      voice: newChar.voice || "Kore (Sassy Pink Neural)",
      personality: newChar.personality || "Custom AI Character.",
      role: newChar.role || "Standard Assistant",
      language: newChar.language || "Roman Urdu & English",
      accent: newChar.accent || "Neutral Accent",
      greetingStyle: newChar.greetingStyle || `Hi, I am ${newChar.name}! Let's talk!`,
      memory: newChar.memory || [],
      mood: newChar.mood || "Happy",
      voiceSettings: newChar.voiceSettings || { pitch: 1.0, speed: 1.0, volume: 1.0 },
      enabled: true
    };

    let updated = [...characters, created];
    if (created.role === "Manager") {
      updated = updated.map(c => c.id !== created.id && c.role === "Manager" ? { ...c, role: "Standard Assistant" } : c);
    }

    onUpdateCharacters(updated);
    addConsoleLog(`CHARACTER MANAGER: Successfully added new character '${created.name}' to core matrix.`);
    setIsAdding(false);
    // Reset new character state
    setNewChar({
      name: "",
      gender: "female",
      avatar: "🤖",
      voice: "Kore (Sassy Pink Neural)",
      personality: "Smart and responsive companion.",
      role: "Standard Assistant",
      language: "Roman Urdu & English",
      accent: "Neutral Modern",
      greetingStyle: "Hello! I am ready to assist you.",
      memory: [],
      mood: "Neutral",
      voiceSettings: { pitch: 1.0, speed: 1.0, volume: 1.0 },
      enabled: true
    });
  };

  const handleResetCharacters = () => {
    if (window.confirm("Are you sure you want to reset all characters to default config? Custom characters will be lost.")) {
      onUpdateCharacters(DEFAULT_CHARACTERS);
      onSelectCharacter("zoya");
      addConsoleLog("CHARACTER MANAGER: Roster fully reset to default (1 Male, 10 Female characters).");
    }
  };

  const handleExportCharacters = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(characters, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "zoya_characters.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addConsoleLog("CHARACTER MANAGER: Exported entire characters database file successfully.");
  };

  const handleImportCharacters = () => {
    try {
      const parsed = JSON.parse(importJson);
      if (Array.isArray(parsed) && parsed.every(c => c.id && c.name)) {
        onUpdateCharacters(parsed);
        addConsoleLog(`CHARACTER MANAGER: Successfully imported ${parsed.length} characters.`);
        setShowImportArea(false);
        setImportJson("");
      } else {
        alert("Invalid format. Must be an array of characters with 'id' and 'name' fields.");
      }
    } catch (e) {
      alert("Invalid JSON format.");
    }
  };

  const activeChar = characters.find(c => c.id === activeCharacterId) || characters[0];

  return (
    <div className="space-y-6" id="character-manager-container">
      {/* Upper Options Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div>
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Users className={`w-4 h-4 ${accentText}`} /> AI Characters Administration
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            Create, edit, delete, enable, export or switch between unlimited AI characters.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${accentBg} hover:opacity-90 text-white rounded-xl text-[11px] font-mono transition-all active:scale-95`}
          >
            <UserPlus className="w-3.5 h-3.5" /> ➕ Add Character
          </button>
          <button
            onClick={() => setShowImportArea(!showImportArea)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-[11px] font-mono transition-all"
          >
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <button
            onClick={handleExportCharacters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-[11px] font-mono transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={handleResetCharacters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-[11px] font-mono hover:bg-red-500/10 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* JSON Import area */}
      {showImportArea && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3"
        >
          <span className="text-xs font-mono text-zinc-400 block font-bold">Paste Character JSON Array</span>
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder='[ { "id": "custom", "name": "Custom character", ... } ]'
            rows={5}
            className="w-full bg-black text-xs font-mono border border-zinc-800 p-2.5 rounded-xl outline-none text-zinc-300 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowImportArea(false)}
              className="px-3 py-1.5 bg-zinc-900 text-zinc-400 rounded-lg text-xs font-mono"
            >
              Cancel
            </button>
            <button
              onClick={handleImportCharacters}
              className={`px-3 py-1.5 ${accentBg} text-white rounded-lg text-xs font-mono`}
            >
              Confirm Import
            </button>
          </div>
        </motion.div>
      )}

      {/* Adding Character Modal Form */}
      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-4"
        >
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className={`w-4 h-4 ${accentText}`} /> Create New AI Character (Unlimited Framework)
          </h4>
          <form onSubmit={handleAddCharacter} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Character Name</label>
              <input
                type="text"
                required
                value={newChar.name}
                onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                placeholder="e.g. Maya"
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Gender / Identity</label>
              <select
                value={newChar.gender}
                onChange={(e) => setNewChar({ ...newChar, gender: e.target.value as any })}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Non-binary / Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Avatar (Emoji or URL)</label>
              <input
                type="text"
                value={newChar.avatar}
                onChange={(e) => setNewChar({ ...newChar, avatar: e.target.value })}
                placeholder="e.g. 👩 or url"
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Neural Voice Assignment</label>
              <select
                value={newChar.voice}
                onChange={(e) => setNewChar({ ...newChar, voice: e.target.value })}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              >
                <option value="Kore (Sassy Pink Neural)">Kore (Sassy Pink Neural)</option>
                <option value="Aoede (Sassy Banter Neural)">Aoede (Sassy Banter Neural)</option>
                <option value="Melpomene (Sultry Indigo Neural)">Melpomene (Sultry Indigo Neural)</option>
                <option value="Hebe (Professional Urdu Accent)">Hebe (Professional Urdu Accent)</option>
                <option value="Eirene (Soft/Calm Neural)">Eirene (Soft/Calm Neural)</option>
                <option value="Clio (Playful English Accent)">Clio (Playful English Accent)</option>
                <option value="Urania (Polished Editorial)">Urania (Polished Editorial)</option>
                <option value="Thalia (Cheerleader/High Energy)">Thalia (Cheerleader/High Energy)</option>
                <option value="Theron (Warm Neural Male)">Theron (Warm Neural Male)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Role Designation</label>
              <select
                value={newChar.role}
                onChange={(e) => setNewChar({ ...newChar, role: e.target.value })}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              >
                <option value="Standard Assistant">Standard Assistant</option>
                <option value="Manager">👑 Manager (Supervisor Role)</option>
                <option value="Security Coordinator">Security Coordinator</option>
                <option value="Creative Partner">Creative Partner</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Language Profile</label>
              <input
                type="text"
                value={newChar.language}
                onChange={(e) => setNewChar({ ...newChar, language: e.target.value })}
                placeholder="e.g. Roman Urdu & English"
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Accent & Region</label>
              <input
                type="text"
                value={newChar.accent}
                onChange={(e) => setNewChar({ ...newChar, accent: e.target.value })}
                placeholder="e.g. Contemporary Lahore"
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Personality Descriptor</label>
              <textarea
                value={newChar.personality}
                onChange={(e) => setNewChar({ ...newChar, personality: e.target.value })}
                placeholder="Detail their behavior style, quirks, and conversational rules..."
                rows={2}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white resize-none"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Inaugural Greeting Style</label>
              <input
                type="text"
                value={newChar.greetingStyle}
                onChange={(e) => setNewChar({ ...newChar, greetingStyle: e.target.value })}
                placeholder="Greeting text spoken on launch..."
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl font-mono text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 ${accentBg} text-white rounded-xl font-mono text-xs font-bold`}
              >
                💾 Save Character
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Editing Character Modal Form */}
      {editingChar && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-4"
        >
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Edit2 className={`w-4 h-4 ${accentText}`} /> Edit AI Character: {editingChar.name}
          </h4>
          <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Character Name</label>
              <input
                type="text"
                required
                value={editingChar.name}
                onChange={(e) => setEditingChar({ ...editingChar, name: e.target.value })}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Gender / Identity</label>
              <select
                value={editingChar.gender}
                onChange={(e) => setEditingChar({ ...editingChar, gender: e.target.value as any })}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Non-binary / Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Avatar (Emoji or URL)</label>
              <input
                type="text"
                value={editingChar.avatar}
                onChange={(e) => setEditingChar({ ...editingChar, avatar: e.target.value })}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Neural Voice Assignment</label>
              <select
                value={editingChar.voice}
                onChange={(e) => setEditingChar({ ...editingChar, voice: e.target.value })}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              >
                <option value="Kore (Sassy Pink Neural)">Kore (Sassy Pink Neural)</option>
                <option value="Aoede (Sassy Banter Neural)">Aoede (Sassy Banter Neural)</option>
                <option value="Melpomene (Sultry Indigo Neural)">Melpomene (Sultry Indigo Neural)</option>
                <option value="Hebe (Professional Urdu Accent)">Hebe (Professional Urdu Accent)</option>
                <option value="Eirene (Soft/Calm Neural)">Eirene (Soft/Calm Neural)</option>
                <option value="Clio (Playful English Accent)">Clio (Playful English Accent)</option>
                <option value="Urania (Polished Editorial)">Urania (Polished Editorial)</option>
                <option value="Thalia (Cheerleader/High Energy)">Thalia (Cheerleader/High Energy)</option>
                <option value="Theron (Warm Neural Male)">Theron (Warm Neural Male)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Role Designation</label>
              <select
                value={editingChar.role}
                onChange={(e) => setEditingChar({ ...editingChar, role: e.target.value })}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              >
                <option value="Standard Assistant">Standard Assistant</option>
                <option value="Manager">👑 Manager (Supervisor Role)</option>
                <option value="Security Coordinator">Security Coordinator</option>
                <option value="Creative Partner">Creative Partner</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Language Profile</label>
              <input
                type="text"
                value={editingChar.language}
                onChange={(e) => setEditingChar({ ...editingChar, language: e.target.value })}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Accent & Region</label>
              <input
                type="text"
                value={editingChar.accent}
                onChange={(e) => setEditingChar({ ...editingChar, accent: e.target.value })}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Voice settings: Pitch</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={editingChar.voiceSettings.pitch}
                onChange={(e) => setEditingChar({ 
                  ...editingChar, 
                  voiceSettings: { ...editingChar.voiceSettings, pitch: parseFloat(e.target.value) } 
                })}
                className="w-full accent-cyan-500"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Personality Descriptor</label>
              <textarea
                value={editingChar.personality}
                onChange={(e) => setEditingChar({ ...editingChar, personality: e.target.value })}
                rows={2}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white resize-none"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block">Inaugural Greeting Style</label>
              <input
                type="text"
                value={editingChar.greetingStyle}
                onChange={(e) => setEditingChar({ ...editingChar, greetingStyle: e.target.value })}
                className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none font-mono text-white"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingChar(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl font-mono text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 ${accentBg} text-white rounded-xl font-mono text-xs font-bold`}
              >
                💾 Update Settings
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid List of all characters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="characters-matrix-grid">
        {characters.map((char) => {
          const isSelected = activeCharacterId === char.id;
          const isManager = char.role === "Manager";
          return (
            <div
              key={char.id}
              className={`bg-zinc-950/60 border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] ${
                isSelected
                  ? "border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-slate-900/40"
                  : char.enabled ? "border-zinc-900 hover:border-zinc-800" : "border-zinc-950 opacity-60 bg-zinc-950/20"
              }`}
            >
              {/* Highlight ribbon for Active Character */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />
              )}

              {/* Character Identity Core */}
              <div className="space-y-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                      {char.avatar.startsWith("http") ? (
                        <img src={char.avatar} alt={char.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        char.avatar
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white uppercase tracking-wide">{char.name}</span>
                        {isManager && (
                          <span className="text-[8px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/10 px-1.5 py-0.5 rounded-full uppercase font-semibold">Manager</span>
                        )}
                      </div>
                      <p className="text-[9px] font-mono text-slate-500 mt-0.5">{char.role}</p>
                    </div>
                  </div>

                  <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                    char.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                  }`}>
                    {char.enabled ? "Online" : "Disabled"}
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px] font-mono text-zinc-400 leading-normal border-t border-zinc-900/40 pt-2.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Voice:</span>
                    <span className="text-zinc-300 text-right truncate max-w-[150px]">{char.voice.split(" (")[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Language:</span>
                    <span className="text-zinc-300">{char.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Accent:</span>
                    <span className="text-zinc-300 truncate max-w-[120px]">{char.accent}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 line-clamp-2 italic font-sans border-t border-zinc-900/20 pt-1.5 mt-1.5">
                    "{char.personality}"
                  </p>
                </div>
              </div>

              {/* Action Ribbon */}
              <div className="flex items-center justify-between border-t border-zinc-900/40 pt-3 mt-4 gap-2">
                <button
                  disabled={!char.enabled}
                  onClick={() => onSelectCharacter(char.id)}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 ${
                    isSelected
                      ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 cursor-default"
                      : "bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white disabled:opacity-40"
                  }`}
                >
                  {isSelected ? "Active Assistant" : "Activate"}
                </button>

                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingChar(char)}
                    title="Edit character profile"
                    className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleEnable(char.id)}
                    title={char.enabled ? "Disable character" : "Enable character"}
                    className={`p-1.5 border rounded-xl transition-colors ${
                      char.enabled
                        ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400"
                        : "bg-emerald-950/20 border-emerald-900 text-emerald-400 hover:bg-emerald-950/40"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCharacter(char.id)}
                    title="Delete character"
                    disabled={char.isDefault}
                    className="p-1.5 bg-red-950/20 border border-red-950 hover:bg-red-950/50 text-red-400 disabled:opacity-30 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
