import { useEffect, useRef } from "react";

export type OrbState = "disconnected" | "connecting" | "idle" | "listening" | "speaking" | "error";

interface VoiceOrbProps {
  state: OrbState;
  frequencies: Uint8Array;
  onClick: () => void;
}

export default function VoiceOrb({ state, frequencies, onClick }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use a fixed logical resolution for sharp drawing
    const size = 320;
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const center = size / 2;
    const baseRadius = 80;

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      
      // Advance rotation slightly for ambient motion
      rotationRef.current += 0.006;
      const rot = rotationRef.current;

      // 1. Draw glowing background shadow / aura
      let glowColor = "rgba(139, 92, 246, 0.15)"; // violet
      let coreColor = "rgba(124, 58, 237, 1)"; // primary purple
      let pulseSpeed = 0.003;

      if (state === "disconnected") {
        glowColor = "rgba(100, 116, 139, 0.1)";
        coreColor = "rgba(71, 85, 105, 1)";
      } else if (state === "connecting") {
        glowColor = "rgba(59, 130, 246, 0.2)";
        coreColor = "rgba(37, 99, 235, 1)";
        pulseSpeed = 0.015;
      } else if (state === "listening") {
        glowColor = "rgba(16, 185, 129, 0.25)";
        coreColor = "rgba(5, 150, 105, 1)";
      } else if (state === "speaking") {
        glowColor = "rgba(236, 72, 153, 0.3)"; // pink
        coreColor = "rgba(219, 39, 119, 1)";
      } else if (state === "error") {
        glowColor = "rgba(239, 68, 68, 0.25)";
        coreColor = "rgba(220, 38, 38, 1)";
      }

      const pulseFactor = 1 + Math.sin(Date.now() * pulseSpeed) * 0.05;
      const currentRadius = baseRadius * pulseFactor;

      // Outer Radial Glow
      const glowGrad = ctx.createRadialGradient(center, center, currentRadius - 30, center, center, currentRadius + 70);
      glowGrad.addColorStop(0, glowColor);
      glowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(center, center, currentRadius + 70, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw multiple waveform rings if active
      if (state === "speaking" || state === "listening" || state === "connecting" || state === "idle") {
        const ringCount = state === "speaking" ? 4 : 3;
        
        // Use either the real-time audio frequencies or simulate minor ambient waves for idle
        const dataLength = frequencies.length;
        const hasAudio = dataLength > 0 && Array.prototype.some.call(frequencies, (v) => v > 10);

        for (let r = 0; r < ringCount; r++) {
          ctx.save();
          ctx.translate(center, center);
          // Alternate rotation direction for concentric complexity
          ctx.rotate(rot * (r % 2 === 0 ? 1 : -1) + (r * Math.PI) / ringCount);

          ctx.beginPath();
          const ringRadius = currentRadius - 10 + r * 12;
          const points = 80;

          for (let i = 0; i <= points; i++) {
            const angle = (i * Math.PI * 2) / points;
            
            // Get frequency offset
            let freqOffset = 0;
            if (hasAudio) {
              // Map index to frequency index with wrap-around
              const freqIdx = Math.floor((i / points) * (dataLength / 2)) % dataLength;
              freqOffset = (frequencies[freqIdx] / 255) * (state === "speaking" ? 40 : 25);
            } else {
              // Idle ambient gentle wave
              const speedCoeff = state === "connecting" ? 0.005 : 0.002;
              freqOffset = Math.sin(angle * 4 + Date.now() * speedCoeff + r) * 3;
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
          
          // Styling concentric waves
          let strokeColor = "";
          if (state === "speaking") {
            // Fuschia to pink gradients
            strokeColor = `rgba(${219 - r * 20}, ${39 + r * 15}, ${119 + r * 25}, ${0.8 - r * 0.15})`;
          } else if (state === "listening") {
            // Emerald to teal gradients
            strokeColor = `rgba(${16 + r * 10}, ${185 - r * 20}, ${129 + r * 10}, ${0.8 - r * 0.15})`;
          } else if (state === "connecting") {
            // Blue/violet
            strokeColor = `rgba(${59 + r * 20}, ${130 - r * 10}, ${246}, ${0.6 - r * 0.15})`;
          } else {
            // Idle cyan/purple ambient
            strokeColor = `rgba(${139 - r * 15}, ${92 + r * 10}, ${246}, ${0.4 - r * 0.1})`;
          }

          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = r === 0 ? 2.5 : 1.5;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 3. Central Solid Core Orb
      ctx.beginPath();
      const coreGrad = ctx.createRadialGradient(center - 10, center - 10, 5, center, center, currentRadius);
      
      let coreColorStart = "#a78bfa"; // default violet light
      let coreColorEnd = coreColor;

      if (state === "disconnected") {
        coreColorStart = "#94a3b8";
      } else if (state === "connecting") {
        coreColorStart = "#60a5fa";
      } else if (state === "listening") {
        coreColorStart = "#34d399";
      } else if (state === "speaking") {
        coreColorStart = "#f472b6";
      } else if (state === "error") {
        coreColorStart = "#f87171";
      }

      coreGrad.addColorStop(0, coreColorStart);
      coreGrad.addColorStop(0.8, coreColorEnd);
      coreGrad.addColorStop(1, "rgba(0, 0, 0, 0.4)");

      ctx.fillStyle = coreGrad;
      ctx.arc(center, center, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner radial highlights for volumetric feel
      ctx.beginPath();
      ctx.ellipse(center - 12, center - 12, currentRadius * 0.4, currentRadius * 0.2, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fill();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, frequencies]);

  // Handle CSS neon pulse ring colors
  let pulseRingColor = "border-violet-500/20 shadow-violet-500/10";
  if (state === "disconnected") {
    pulseRingColor = "border-slate-500/10 shadow-slate-500/5";
  } else if (state === "connecting") {
    pulseRingColor = "border-blue-500/20 shadow-blue-500/10 animate-pulse";
  } else if (state === "listening") {
    pulseRingColor = "border-emerald-500/30 shadow-emerald-500/20";
  } else if (state === "speaking") {
    pulseRingColor = "border-pink-500/40 shadow-pink-500/30";
  } else if (state === "error") {
    pulseRingColor = "border-red-500/30 shadow-red-500/20";
  }

  return (
    <div className="relative flex items-center justify-center select-none cursor-pointer group" onClick={onClick} id="iqra-orb-container">
      {/* Outer pulsing ring structure */}
      <div className={`absolute w-[360px] h-[360px] rounded-full border ${pulseRingColor} transition-all duration-700 pointer-events-none`} />
      <div className={`absolute w-[400px] h-[400px] rounded-full border border-dashed opacity-20 ${state === 'listening' || state === 'speaking' ? 'animate-spin [animation-duration:40s]' : ''} border-slate-700 pointer-events-none`} />

      {/* Actual core canvas */}
      <canvas
        ref={canvasRef}
        className="relative z-10 transition-transform duration-300 hover:scale-105 active:scale-95 drop-shadow-[0_0_25px_rgba(0,0,0,0.5)]"
        id="iqra-orb-canvas"
      />
    </div>
  );
}
