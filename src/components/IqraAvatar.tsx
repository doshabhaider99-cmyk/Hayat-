import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export type AvatarState = "disconnected" | "connecting" | "idle" | "listening" | "speaking" | "searching" | "thinking" | "success" | "error";

interface IqraAvatarProps {
  state: AvatarState;
  frequencies: Uint8Array;
  onClick: () => void;
  inputTranscript?: string;
  outputTranscript?: string;
  customAvatarUrl?: string | null;
  onUploadPhoto?: (url: string) => void;
  character?: string;
  avatar?: string;
}

// Map of all photorealistic character expressions (Hania, Iqra, Zoya)
const CHARACTER_IMAGES = {
  max: {
    idle: "/src/assets/images/iqra_idle_cyber_cyan.jpg",
    thinking: "/src/assets/images/iqra_thinking_cyber_cyan.jpg",
    speaking: "/src/assets/images/iqra_speaking_cyber_cyan.jpg",
    happy: "/src/assets/images/iqra_happy_cyber_cyan.jpg",
    concerned: "/src/assets/images/iqra_concerned_cyber_cyan.jpg",
  },
  hania: {
    idle: "/src/assets/images/hania_idle_1782704680184.jpg",
    thinking: "/src/assets/images/hania_thinking_1782704698176.jpg",
    speaking: "/src/assets/images/hania_speaking_1782704714523.jpg",
    happy: "/src/assets/images/hania_happy_1782704731366.jpg",
    concerned: "/src/assets/images/hania_concerned_1782704747629.jpg",
  },
  iqra: {
    idle: "/src/assets/images/iqra_idle_cyber_cyan.jpg",
    thinking: "/src/assets/images/iqra_thinking_cyber_cyan.jpg",
    speaking: "/src/assets/images/iqra_speaking_cyber_cyan.jpg",
    happy: "/src/assets/images/iqra_happy_cyber_cyan.jpg",
    concerned: "/src/assets/images/iqra_concerned_cyber_cyan.jpg",
  },
  zoya: {
    idle: "/src/assets/images/zoya_idle_1782705640554.jpg",
    thinking: "/src/assets/images/zoya_thinking_1782705670586.jpg",
    speaking: "/src/assets/images/zoya_speaking_1782705686439.jpg",
    happy: "/src/assets/images/zoya_happy_1782705705962.jpg",
    concerned: "/src/assets/images/zoya_concerned_1782705724285.jpg",
  }
};

export default function IqraAvatar({
  state,
  frequencies,
  onClick,
  inputTranscript = "",
  outputTranscript = "",
  customAvatarUrl = null,
  onUploadPhoto,
  character = "zoya",
  avatar = "👑",
}: IqraAvatarProps) {
  const currentImages = (CHARACTER_IMAGES as any)[character] || CHARACTER_IMAGES.zoya;

  // Derive active image synchronously to eliminate cascading re-renders
  const activeImage = (() => {
    if (customAvatarUrl) return customAvatarUrl;
    const textOut = outputTranscript.toLowerCase();
    const textIn = inputTranscript.toLowerCase();

    if (state === "error") return currentImages.concerned;
    if (state === "connecting" || state === "searching" || state === "thinking") return currentImages.thinking;
    if (state === "speaking") {
      if (
        textOut.includes("sorry") ||
        textOut.includes("apolog") ||
        textOut.includes("afsoos") ||
        textOut.includes("galti") ||
        textOut.includes("trouble")
      ) {
        return currentImages.concerned;
      }
      if (
        textOut.includes("shabash") ||
        textOut.includes("great") ||
        textOut.includes("mubarak") ||
        textOut.includes("success") ||
        textOut.includes("perfect") ||
        textOut.includes("khushi") ||
        textOut.includes("congrat") ||
        textOut.includes("glorious")
      ) {
        return currentImages.happy;
      }
      return currentImages.speaking;
    }
    if (state === "idle" || state === "listening") {
      if (
        textIn.includes("hello") ||
        textIn.includes("salaam") ||
        textIn.includes("hi") ||
        textIn.includes("thank") ||
        textIn.includes("shukriya") ||
        textIn.includes("assalamualaikum")
      ) {
        return currentImages.happy;
      }
      return currentImages.idle;
    }
    return currentImages.idle;
  })();

  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthScale, setMouthScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);
  const frequenciesRef = useRef<Uint8Array>(frequencies);
  frequenciesRef.current = frequencies;

  // 2. AUTO BLINK ENGINE
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;

    const triggerBlink = () => {
      // If we are using a custom avatar, we skip drawn eyelid overlays to avoid aligning mismatch
      if (!customAvatarUrl) {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          const nextInterval = Math.random() * 4000 + 3000;
          blinkTimeout = setTimeout(triggerBlink, nextInterval);
        }, Math.random() * 80 + 120);
      } else {
        const nextInterval = Math.random() * 4000 + 3000;
        blinkTimeout = setTimeout(triggerBlink, nextInterval);
      }
    };

    const initialInterval = Math.random() * 3000 + 2000;
    blinkTimeout = setTimeout(triggerBlink, initialInterval);

    return () => {
      clearTimeout(blinkTimeout);
    };
  }, [customAvatarUrl]);

  // 3. LIP-SYNC AUDIO RESPONDERS
  useEffect(() => {
    if (state !== "speaking") {
      setMouthScale((prev) => (prev === 1 ? prev : 1));
      return;
    }

    const talkLoop = setInterval(() => {
      const freqs = frequenciesRef.current;
      const dataLength = freqs ? freqs.length : 0;
      const hasAudio = dataLength > 0 && Array.prototype.some.call(freqs, (v) => v > 10);

      if (hasAudio) {
        let sum = 0;
        for (let i = 0; i < dataLength; i++) {
          sum += freqs[i];
        }
        const avg = sum / dataLength;
        const scale = 1 + (avg / 255) * 1.5;
        setMouthScale((prev) => (Math.abs(prev - scale) > 0.05 ? scale : prev));
      } else {
        setMouthScale(1 + Math.sin(Date.now() * 0.02) * 0.35);
      }
    }, 60);

    return () => clearInterval(talkLoop);
  }, [state]);

  // 4. FUTURISTIC NEON GLOW RINGS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 320;
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const center = size / 2;
    const baseRadius = 110;

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      rotationRef.current += 0.005;
      const rot = rotationRef.current;

      // Primary Futuristic Theme color is selected based on character choice
      let rValue = 14, gValue = 165, bValue = 233; // MAX Electric Blue / Cyan
      if (character === "hania") {
        rValue = 236; gValue = 72; bValue = 153; // Hania Pink/Rose
      } else if (character === "iqra") {
        rValue = 6; gValue = 182; bValue = 212; // Iqra Cyan
      } else if (character === "zoya") {
        rValue = 168; gValue = 85; bValue = 247; // Zoya Purple
      }

      let glowColor = `rgba(${rValue}, ${gValue}, ${bValue}, 0.15)`;
      let coreColor = `rgba(${rValue}, ${gValue}, ${bValue}, 0.8)`; 
      let speedCoeff = 0.002;

      if (state === "disconnected") {
        glowColor = "rgba(113, 113, 122, 0.08)";
        coreColor = "rgba(113, 113, 122, 0.45)";
      } else if (state === "connecting" || state === "searching") {
        glowColor = `rgba(${rValue}, ${gValue}, ${bValue}, 0.2)`;
        coreColor = `rgba(${rValue}, ${gValue}, ${bValue}, 0.85)`;
        speedCoeff = 0.008;
      } else if (state === "listening") {
        glowColor = `rgba(${Math.min(255, rValue + 20)}, ${Math.max(0, gValue - 20)}, ${Math.max(0, bValue - 20)}, 0.25)`;
        coreColor = `rgba(${Math.min(255, rValue + 20)}, ${Math.max(0, gValue - 20)}, ${Math.max(0, bValue - 20)}, 0.85)`;
      } else if (state === "speaking") {
        glowColor = `rgba(${rValue}, ${gValue}, ${bValue}, 0.3)`;
        coreColor = `rgba(${rValue}, ${gValue}, ${bValue}, 0.95)`;
      } else if (state === "error") {
        glowColor = "rgba(239, 68, 68, 0.18)";
        coreColor = "rgba(239, 68, 68, 0.8)";
      }

      const pulseFactor = 1 + Math.sin(Date.now() * speedCoeff) * 0.035;
      const currentRadius = baseRadius * pulseFactor;

      if (state !== "disconnected") {
        const ringCount = state === "speaking" ? 3 : 2;
        const freqs = frequenciesRef.current;
        const dataLength = freqs ? freqs.length : 0;
        const hasAudio = dataLength > 0 && Array.prototype.some.call(freqs, (v) => v > 10);

        for (let r = 0; r < ringCount; r++) {
          ctx.save();
          ctx.translate(center, center);
          ctx.rotate(rot * (r % 2 === 0 ? 1 : -1) + (r * Math.PI) / ringCount);

          ctx.beginPath();
          const ringRadius = currentRadius + 10 + r * 12;
          const points = 72;

          for (let i = 0; i <= points; i++) {
            const angle = (i * Math.PI * 2) / points;
            let freqOffset = 0;

            if (hasAudio && state === "speaking") {
              const freqIdx = Math.floor((i / points) * (dataLength / 2)) % dataLength;
              freqOffset = (freqs[freqIdx] / 255) * 30;
            } else {
              freqOffset = Math.sin(angle * 4 + Date.now() * (state === "connecting" ? 0.008 : 0.003) + r) * 3;
            }

            const rCombined = ringRadius + freqOffset;
            const x = Math.cos(angle) * rCombined;
            const y = Math.sin(angle) * rCombined;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.closePath();
          ctx.strokeStyle = r === 0 ? coreColor : `${coreColor.replace("0.8", "0.3").replace("0.95", "0.3").replace("0.85", "0.3")}`;
          ctx.lineWidth = r === 0 ? 2 : 1;
          ctx.stroke();
          ctx.restore();
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, character]);

  // File picker handler for custom image upload
  const handlePhotoUploadTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string" && onUploadPhoto) {
          onUploadPhoto(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Build character theme colors
  let themeColorClass = "pink";
  if (character === "iqra") themeColorClass = "cyan";
  else if (character === "zoya") themeColorClass = "purple";

  let borderPulseClass = `border-${themeColorClass}-500/20 shadow-${themeColorClass}-500/10`;
  if (state === "disconnected") {
    borderPulseClass = "border-zinc-500/10 shadow-transparent";
  } else if (state === "connecting" || state === "searching") {
    borderPulseClass = `border-${themeColorClass}-500/30 shadow-${themeColorClass}-500/25 animate-pulse`;
  } else if (state === "listening") {
    borderPulseClass = character === "iqra" ? "border-teal-500/30 shadow-teal-500/25" : character === "zoya" ? "border-fuchsia-500/30 shadow-fuchsia-500/25" : "border-rose-500/30 shadow-rose-500/25";
  } else if (state === "error") {
    borderPulseClass = "border-red-500/30 shadow-red-500/20";
  }

  // Generate dynamic canvas dropshadow based on character
  const dropShadowColor = character === "iqra" ? "rgba(6,182,212,0.25)" : character === "zoya" ? "rgba(168,85,247,0.25)" : "rgba(236,72,153,0.25)";
  const customBorderColor = character === "iqra" ? "border-cyan-700" : character === "zoya" ? "border-purple-700" : "border-pink-700";
  const innerBorderAndShadow = character === "iqra" ? "border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]" : character === "zoya" ? "border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.3)]";
  const hoverTextClass = character === "iqra" ? "text-cyan-300" : character === "zoya" ? "text-purple-300" : "text-pink-300";
  const uploadSvgColor = character === "iqra" ? "text-cyan-400" : character === "zoya" ? "text-purple-400" : "text-pink-400";
  const scannerLineGlow = character === "iqra" ? "bg-cyan-400/50 shadow-[0_0_8px_cyan]" : character === "zoya" ? "bg-purple-400/50 shadow-[0_0_8px_purple]" : "bg-pink-400/50 shadow-[0_0_8px_pink]";

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center select-none cursor-pointer group"
      id="avatar-system-root"
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <canvas
        ref={canvasRef}
        style={{ filter: `drop-shadow(0 0 15px ${dropShadowColor})` }}
        className="absolute z-0 pointer-events-none"
      />

      <div
        className={`absolute w-[330px] h-[330px] rounded-full border border-dashed opacity-25 ${customBorderColor} pointer-events-none ${
          state === "speaking" || state === "listening" ? "animate-spin [animation-duration:60s]" : ""
        }`}
      />

      <div
        className={`absolute w-[240px] h-[240px] rounded-full border-2 ${borderPulseClass} transition-all duration-700 pointer-events-none z-10`}
      />

      <motion.div
        animate={{
          y: [0, -3, 0],
          rotate: [-0.4, 0.4, -0.4],
          scale: [1, 1.012, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut",
        }}
        className={`relative w-56 h-56 rounded-full overflow-hidden border ${innerBorderAndShadow} bg-slate-950 z-20 flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-300`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/50 pointer-events-none z-10" />

        {/* Photorealistic Face Display with Crossfade */}
        <AnimatePresence mode="wait">
          <motion.img
            key={customAvatarUrl || activeImage}
            src={customAvatarUrl || activeImage}
            alt={`${character} AI Avatar`}
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`w-full h-full object-cover select-none pointer-events-none ${
              state === "disconnected" ? "grayscale contrast-[0.95] brightness-[0.7]" : ""
            }`}
          />
        </AnimatePresence>

        {/* Dynamic Character Emoji Badge */}
        {!customAvatarUrl && avatar && !avatar.startsWith("http") && (
          <div className="absolute bottom-2 right-2 z-30 bg-black/60 backdrop-blur-md border border-white/10 rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-lg pointer-events-none">
            {avatar}
          </div>
        )}

        {/* Hover Upload Trigger Overlay */}
        <div
          onClick={handlePhotoUploadTrigger}
          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center z-30 upload-trigger"
        >
          <svg className={`w-8 h-8 ${uploadSvgColor} mb-1`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className={`text-[10px] font-mono ${hoverTextClass} uppercase tracking-widest font-bold`}>Upload Photo</span>
        </div>

        {/* Procedural Lip Sync and Eyes Overlay (Skipped if custom photo uploaded to guarantee face alignment sharpness) */}
        {!customAvatarUrl && (
          <>
            <AnimatePresence>
              {isBlinking && (
                <>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{ duration: 0.08 }}
                    style={{ originY: 0 }}
                    className="absolute left-[37.5%] top-[42.2%] w-[8%] h-[3.2%] bg-[#ebd2be] border-b border-zinc-700/40 rounded-full z-20 pointer-events-none shadow-[inset_0_-1px_3px_rgba(0,0,0,0.15)]"
                  />
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{ duration: 0.08 }}
                    style={{ originY: 0 }}
                    className="absolute left-[54.5%] top-[42.2%] w-[8%] h-[3.2%] bg-[#ebd2be] border-b border-zinc-700/40 rounded-full z-20 pointer-events-none shadow-[inset_0_-1px_3px_rgba(0,0,0,0.15)]"
                  />
                </>
              )}
            </AnimatePresence>

            {state === "speaking" && (
              <motion.div
                animate={{ scaleY: mouthScale }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                style={{ originY: 0.5 }}
                className="absolute left-[47.6%] top-[50%] w-[4.8%] h-[2.2%] bg-[#9c2525] rounded-full border border-[#501010] z-20 pointer-events-none shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
              />
            )}
          </>
        )}

        {(state === "connecting" || state === "searching") && (
          <motion.div
            initial={{ top: "35%" }}
            animate={{ top: ["35%", "55%", "35%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`absolute left-0 right-0 h-0.5 ${scannerLineGlow} z-30 pointer-events-none`}
          />
        )}
      </motion.div>
    </div>
  );
}
