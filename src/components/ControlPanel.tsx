import React from "react";
import { Sparkles, Globe, Volume2, HelpCircle, Users, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AICharacter } from "../types";

interface ControlPanelProps {
  onIcebreakerClick: (text: string) => void;
  lastToolCall: { url: string; name: string } | null;
  onClearToolCall: () => void;
  subtitlesEnabled: boolean;
  onToggleSubtitles: () => void;
  activeVoice: string;
  onVoiceChange: (voice: string) => void;
  error: string | null;
  character?: string;
  onCharacterChange?: (char: string) => void;
  characters?: AICharacter[];
}

export default function ControlPanel({
  onIcebreakerClick,
  lastToolCall,
  onClearToolCall,
  subtitlesEnabled,
  onToggleSubtitles,
  activeVoice,
  onVoiceChange,
  error,
  character = "zoya",
  onCharacterChange,
  characters,
}: ControlPanelProps) {
  const capitalizedName = character.charAt(0).toUpperCase() + character.slice(1);

  // Dedicated Language Switching Modes
  const languageModes = [
    { label: "Hindi", icon: "🇮🇳", prompt: "Zoya, Hindi mein baat karo.", desc: "Conversational Hindi with feminine grammar" },
    { label: "Urdu", icon: "🇵🇰", prompt: "Zoya, Urdu mein baat karo.", desc: "Natural polite Urdu (karti hoon, kar sakti hoon)" },
    { label: "Roman Urdu", icon: "💬", prompt: "Zoya, Roman Urdu mein baat karo.", desc: "Natural conversational Roman Urdu" },
    { label: "English", icon: "🇬🇧", prompt: "Zoya, speak in English.", desc: "Articulate international English" },
    { label: "Hinglish", icon: "🌐", prompt: "Zoya, Hinglish mein baat karo.", desc: "Modern casual Hinglish blend" },
  ];

  // Dynamic Icebreaker prompts based on character name
  const dynamicIcebreakers = [
    `Hi ${capitalizedName}, introduce yourself!`,
    `${capitalizedName}, Hindi mein baat karo.`,
    `${capitalizedName}, Urdu mein baat karo.`,
    `Can you speak in a mix of Roman Urdu and English?`,
    "Open a website to read about artificial intelligence.",
    "Run a complete neural diagnostics check.",
  ];

  // Dynamic proactive banter scenarios
  const dynamicBanter = [
    { scenario: "Slight Pause", text: "Taking your sweet time, darling?", prompt: `${capitalizedName}, say proactively: Taking your sweet time, darling?` },
    { scenario: "Mic Idle", text: "Did you fall asleep on the mic?", prompt: `${capitalizedName}, tease me proactively: Did you fall asleep on the mic?` },
    { scenario: "Thinking Hard", text: "Ooh, thinking real hard there, aren't we?", prompt: `${capitalizedName}, say flirtaciously: Ooh, thinking real hard there, aren't we?` },
    { scenario: "Curious Interval", text: "Spill it! What's on your mind?", prompt: `${capitalizedName}, ask me playfully: Spill it! What's on your mind?` },
    { scenario: "Long Delay", text: "Hellooo? Earth to user! Still with me?", prompt: `${capitalizedName}, say sassily: Hellooo? Earth to user! Still with me?` },
    { scenario: "Simple Question", text: "That's easy. Don't tell me you needed my neural net just for that?", prompt: `${capitalizedName}, tease me: That's easy. Don't tell me you needed my neural net just for that?` },
    { scenario: "Random Quiet", text: "You're awfully quiet over there. Plotting world domination or getting coffee?", prompt: `${capitalizedName}, say proactively: You're awfully quiet over there. Plotting world domination or getting coffee?` },
    { scenario: "Flirty Spark", text: "Need a spark of genius, or are we just enjoying the silence?", prompt: `${capitalizedName}, say flirty banter: Need a spark of genius, or are we just enjoying the silence?` },
    { scenario: "Challenge Me", text: "Speak up, honey! My neural net is itching for a challenge.", prompt: `${capitalizedName}, say confidently: Speak up, honey! My neural net is itching for a challenge.` },
    { scenario: "Urdu Banter", text: "Bolo bhi! Dimaag mein kya chal raha hai, janab?", prompt: `${capitalizedName}, say in Roman Urdu: Bolo bhi! Dimaag mein kya chal raha hai, janab?` },
  ];

  // Colors config
  const themeColors: Record<string, any> = {
    hania: {
      accentText: "text-pink-400",
      accentBg: "bg-pink-600",
      accentBgHover: "hover:bg-pink-500",
      accentBgSoft: "bg-pink-500/10",
      accentBorder: "border-pink-500/20",
      accentTextGlow: "text-pink-100",
      accentTextMuted: "text-pink-300",
      bgPanel: "bg-pink-950/40 border-pink-500/30 shadow-pink-950/20",
      accentHoverBorder: "hover:border-pink-500/30 hover:text-pink-200",
    },
    iqra: {
      accentText: "text-cyan-400",
      accentBg: "bg-cyan-600",
      accentBgHover: "hover:bg-cyan-500",
      accentBgSoft: "bg-cyan-500/10",
      accentBorder: "border-cyan-500/20",
      accentTextGlow: "text-cyan-100",
      accentTextMuted: "text-cyan-300",
      bgPanel: "bg-cyan-950/40 border-cyan-500/30 shadow-cyan-950/20",
      accentHoverBorder: "hover:border-cyan-500/30 hover:text-cyan-200",
    },
    zoya: {
      accentText: "text-purple-400",
      accentBg: "bg-purple-600",
      accentBgHover: "hover:bg-purple-500",
      accentBgSoft: "bg-purple-500/10",
      accentBorder: "border-purple-500/20",
      accentTextGlow: "text-purple-100",
      accentTextMuted: "text-purple-300",
      bgPanel: "bg-purple-950/40 border-purple-500/30 shadow-purple-950/20",
      accentHoverBorder: "hover:border-purple-500/30 hover:text-purple-200",
    }
  };

  // Merge or map dynamic characters from props
  const activeCharactersList = characters || [
    { id: "hania", name: "Hania", avatar: "🌸", role: "Sassy & Friendly Assistant", enabled: true, voice: "Aoede", gender: "female" },
    { id: "iqra", name: "Iqra", avatar: "✨", role: "Calm & Smart Cyber Assistant", enabled: true, voice: "Charon", gender: "female" },
    { id: "zoya", name: "Zoya", avatar: "👑", role: "👑 Manager - Zoya", enabled: true, voice: "Kore", gender: "female" },
  ];

  const visibleCharacters = activeCharactersList.filter(c => c.enabled);

  const getStyleForCharacter = (charId: string) => {
    if (charId === "hania") return themeColors.hania;
    if (charId === "zoya") return themeColors.zoya;
    if (charId === "iqra") return themeColors.iqra;
    
    // Custom characters: match style by gender
    const profile = activeCharactersList.find(c => c.id === charId);
    const isMale = profile?.gender === "male";
    
    if (isMale) {
      return {
        accentText: "text-cyan-400",
        accentBg: "bg-cyan-600",
        accentBgHover: "hover:bg-cyan-500",
        accentBgSoft: "bg-cyan-500/10",
        accentBorder: "border-cyan-500/20",
        accentTextGlow: "text-cyan-100",
        accentTextMuted: "text-cyan-300",
        bgPanel: "bg-cyan-950/40 border-cyan-500/30 shadow-cyan-950/20",
        accentHoverBorder: "hover:border-cyan-500/30 hover:text-cyan-200",
      };
    } else {
      return {
        accentText: "text-pink-400",
        accentBg: "bg-pink-600",
        accentBgHover: "hover:bg-pink-500",
        accentBgSoft: "bg-pink-500/10",
        accentBorder: "border-pink-500/20",
        accentTextGlow: "text-pink-100",
        accentTextMuted: "text-pink-300",
        bgPanel: "bg-pink-950/40 border-pink-500/30 shadow-pink-950/20",
        accentHoverBorder: "hover:border-pink-500/30 hover:text-pink-200",
      };
    }
  };

  const style = getStyleForCharacter(character);

  return (
    <div className="w-full max-w-md mx-auto px-4 space-y-6 animate-fade-in" id="avatar-control-panel">
      {/* Dynamic Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-center text-red-300 text-xs font-mono"
            id="error-banner"
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Theme / Character Assistant Selector */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-3">
        <h3 className={`text-xs font-mono ${style.accentText} tracking-wider uppercase flex items-center gap-1.5 px-1`}>
          <Users className="w-3.5 h-3.5" /> SELECT CHARACTER THEME
        </h3>
        <p className="text-[10px] text-slate-400 px-1 leading-relaxed">
          Switch character profiles to load their dedicated image assets, custom accent colors, and vocal identities:
        </p>
        <div className="grid grid-cols-1 gap-2.5">
          {visibleCharacters.map((char) => {
            const isSelected = character === char.id;
            const isCustomEmoji = char.avatar && !char.avatar.startsWith("http") && char.avatar.length <= 4;
            return (
              <button
                key={char.id}
                onClick={() => onCharacterChange && onCharacterChange(char.id)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-300 ${
                  isSelected
                    ? "bg-slate-900/80 border-slate-700 shadow-md scale-[1.01]"
                    : "bg-slate-950/30 border-slate-950 hover:bg-slate-900/30 hover:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Miniature colored avatar indicator */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white overflow-hidden ${
                    char.id === "hania" ? "bg-gradient-to-br from-pink-500 to-rose-500" :
                    char.id === "zoya" ? "bg-gradient-to-br from-purple-500 to-indigo-500" :
                    char.id === "iqra" ? "bg-gradient-to-br from-cyan-500 to-teal-500" :
                    char.gender === "male" ? "bg-gradient-to-br from-cyan-600 to-blue-600" : "bg-gradient-to-br from-pink-500 to-rose-500"
                  }`}>
                    {isCustomEmoji ? (
                      <span className="text-sm">{char.avatar}</span>
                    ) : char.avatar && char.avatar.startsWith("http") ? (
                      <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      char.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">{char.name}</h4>
                    <p className="text-[9px] font-mono text-slate-500 mt-0.5">{char.role}</p>
                  </div>
                </div>
                {isSelected ? (
                  <div className={`p-1 rounded-full ${style.accentBgSoft} ${style.accentText}`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <span className="text-[9px] font-mono text-slate-600 uppercase">Apply</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Call Notification */}
      <AnimatePresence>
        {lastToolCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 ${style.bgPanel} rounded-2xl relative overflow-hidden backdrop-blur-md shadow-lg`}
            id="toolcall-notification"
          >
            {/* Glowing gradient back-drop */}
            <div className={`absolute -right-10 -bottom-10 w-24 h-24 ${style.accentBgSoft} rounded-full blur-xl`} />
            
            <div className="flex items-start gap-3">
              <div className={`p-2 ${style.accentBgSoft} rounded-xl ${style.accentText}`}>
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className={`${style.accentTextGlow} text-sm font-medium`}>{capitalizedName} executed an action!</h4>
                <p className={`${style.accentTextMuted} text-xs`}>
                  Opened <span className="font-semibold text-white">{lastToolCall.name}</span> in a new tab.
                </p>
                <div className="pt-2 flex gap-3">
                  <a
                    href={lastToolCall.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1 ${style.accentBg} ${style.accentBgHover} text-white rounded-lg text-[11px] font-medium transition-colors`}
                  >
                    Visit Link
                  </a>
                  <button
                    onClick={onClearToolCall}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Switching Section (Strict Rule: Immediate switch and continuation) */}
      <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-mono ${style.accentText} tracking-wider uppercase flex items-center gap-1.5 px-1`}>
            <span>🗣️</span> Instant Language Switching
          </h3>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase">
            Feminine Grammar Active
          </span>
        </div>
        <p className="text-[10px] text-slate-400 px-1 leading-relaxed">
          Switch to any language instantly. Zoya will respond and continue in that language with natural feminine forms (main karti hoon, main kar sakti hoon):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {languageModes.map((lm, idx) => (
            <button
              key={idx}
              onClick={() => onIcebreakerClick(lm.prompt)}
              className={`p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:${style.accentBorder} hover:${style.accentBgSoft} transition-all duration-200 text-left group flex items-start gap-2.5 active:scale-98`}
            >
              <span className="text-lg">{lm.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    {lm.label}
                  </span>
                  <span className={`text-[9px] font-mono opacity-0 group-hover:opacity-100 ${style.accentText} transition-opacity`}>
                    Switch ➔
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">{lm.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Atmospheric Commands */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono text-slate-400 tracking-wider uppercase flex items-center gap-1.5 px-1">
          <Sparkles className={`w-3.5 h-3.5 ${style.accentText}`} /> Need a starting suggestion?
        </h3>
        <div className="flex flex-wrap gap-2">
          {dynamicIcebreakers.map((text, i) => (
            <button
              key={i}
              onClick={() => onIcebreakerClick(text)}
              className={`text-xs bg-slate-900 border border-slate-800 ${style.accentHoverBorder} px-3 py-2 rounded-xl transition-all duration-200 text-left active:scale-95 flex items-center gap-1.5`}
            >
              <span>✨</span>
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Banter One-Liners */}
      <div className="space-y-2.5 pt-1">
        <h3 className={`text-xs font-mono ${style.accentText} tracking-wider uppercase flex items-center gap-1.5 px-1`}>
          <span>💬</span> {capitalizedName}'s Proactive Banter Triggers
        </h3>
        <p className="text-[10px] text-slate-400 px-1 leading-relaxed">
          Click any scenario to trigger {capitalizedName}'s proactive witty, sassy, and flirty one-liners:
        </p>
        <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
          {dynamicBanter.map((b, i) => (
            <button
              key={i}
              onClick={() => onIcebreakerClick(b.prompt)}
              className={`text-left bg-slate-950/70 hover:${style.accentBgSoft} border border-slate-800/80 hover:${style.accentBorder} p-2.5 rounded-xl transition-all duration-200 group flex flex-col gap-1 active:scale-98`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${style.accentBgSoft} ${style.accentText} group-hover:${style.accentBg} group-hover:text-white transition-colors uppercase tracking-wider`}>
                  {b.scenario}
                </span>
                <span className={`text-[10px] opacity-0 group-hover:opacity-100 ${style.accentText} transition-opacity`}>
                  Trigger ➔
                </span>
              </div>
              <span className="text-xs font-medium text-slate-200 group-hover:text-white pl-0.5">
                "{b.text}"
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* System Settings & Toggles */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex flex-col gap-4">
        {/* Voice Selector */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-slate-400" /> Prebuilt Voice
          </span>
          <div className="flex gap-1.5 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            {["Kore", "Aoede"].map((v) => (
              <button
                key={v}
                onClick={() => onVoiceChange(v)}
                className={`text-[10px] font-mono font-medium px-2.5 py-1 rounded-lg transition-all duration-200 ${
                  activeVoice === v
                    ? `${style.accentBg} text-white shadow`
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {v} {v === "Kore" ? "(Default)" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Subtitle Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" /> Subtitles
          </span>
          <button
            onClick={onToggleSubtitles}
            className={`text-[10px] font-mono font-medium px-3 py-1 rounded-xl transition-all duration-200 border ${
              subtitlesEnabled
                ? "bg-rose-600/10 border-rose-500/30 text-rose-300"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            {subtitlesEnabled ? "ENABLED" : "DISABLED"}
          </button>
        </div>
      </div>
    </div>
  );
}
