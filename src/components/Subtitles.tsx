import { motion, AnimatePresence } from "motion/react";

interface SubtitlesProps {
  inputTranscript: string;
  outputTranscript: string;
  isListening: boolean;
  isSpeaking: boolean;
  subtitlesEnabled: boolean;
  character?: string;
}

export default function Subtitles({
  inputTranscript,
  outputTranscript,
  isListening,
  isSpeaking,
  subtitlesEnabled,
  character = "zoya",
}: SubtitlesProps) {
  if (!subtitlesEnabled) return null;

  const capitalizedName = character.charAt(0).toUpperCase() + character.slice(1);

  // Dynamic style mappings for character subtitles
  const subtitleStyles: Record<string, any> = {
    zoya: {
      card: "bg-purple-950/40 border-purple-500/25 text-purple-50 shadow-purple-950/20",
      badge: "bg-purple-600 text-white shadow-purple-500/10",
    },
    hania: {
      card: "bg-pink-950/40 border-pink-500/25 text-pink-50 shadow-pink-950/20",
      badge: "bg-pink-600 text-white shadow-pink-500/10",
    },
    iqra: {
      card: "bg-cyan-950/40 border-cyan-500/25 text-cyan-50 shadow-cyan-950/20",
      badge: "bg-cyan-600 text-white shadow-cyan-500/10",
    }
  };

  const style = subtitleStyles[character] || subtitleStyles.zoya;

  return (
    <div className="fixed bottom-36 left-0 right-0 z-40 px-6 pointer-events-none" id="subtitles-container">
      <div className="max-w-md mx-auto flex flex-col items-center gap-2">
        <AnimatePresence mode="wait">
          {/* User speech subtitles (shown when listening or when they just finished speaking) */}
          {isListening && inputTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 py-2 bg-emerald-950/30 border border-emerald-500/20 backdrop-blur-md rounded-full text-emerald-300 text-xs text-center shadow-lg"
              key="user-sub"
              id="user-subtitles"
            >
              <span className="opacity-60 text-[10px] tracking-wider uppercase mr-1.5 font-mono">You:</span>
              "{inputTranscript}"
            </motion.div>
          )}

          {/* AI Speaker speech subtitles */}
          {isSpeaking && outputTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`px-5 py-3 ${style.card} border backdrop-blur-md rounded-2xl text-sm text-center shadow-lg max-w-[90%] relative`}
              key="ai-sub"
              id="ai-subtitles"
            >
              {/* Dynamic Sassy character name badge */}
              <div className={`absolute -top-2 left-4 px-1.5 py-0.5 ${style.badge} rounded text-[8px] font-mono tracking-wider font-semibold uppercase text-white shadow-sm`}>
                {capitalizedName}
              </div>
              <p className="italic font-serif leading-relaxed">"{outputTranscript}"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
