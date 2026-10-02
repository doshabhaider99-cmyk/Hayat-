/**
 * Resilient Browser Text-To-Speech (TTS) Engine for ZOYA
 * Guarantees graceful female vocal responses when Gemini Live WebSockets are unavailable or in REST mode.
 */

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let resumeTimer: any = null;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSpeechSupported()) {
      return resolve([]);
    }

    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing && existing.length > 0) {
      cachedVoices = existing;
      return resolve(existing);
    }

    const handler = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        cachedVoices = voices;
        synth.removeEventListener("voiceschanged", handler);
        resolve(voices);
      }
    };

    synth.addEventListener("voiceschanged", handler);
    // Timeout fallback if event never fires
    setTimeout(() => {
      const fallback = synth.getVoices();
      cachedVoices = fallback;
      resolve(fallback);
    }, 500);
  });
}

// Find preferred natural female voice for Hindi, Urdu, or English
export function findBestFemaleVoice(voices: SpeechSynthesisVoice[], languagePreference = "auto"): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const pref = languagePreference.toLowerCase();

  // 1. Hindi Voice Match
  if (pref.includes("hindi") || pref === "hi") {
    const hindiVoice = voices.find((v) => 
      v.lang.startsWith("hi") && (v.name.toLowerCase().includes("female") || v.name.includes("Kalpana") || v.name.includes("Swara") || v.name.includes("Google हिन्दी"))
    ) || voices.find((v) => v.lang.startsWith("hi"));
    if (hindiVoice) return hindiVoice;
  }

  // 2. Urdu Voice Match
  if (pref.includes("urdu") || pref === "ur") {
    const urduVoice = voices.find((v) => v.lang.startsWith("ur")) ||
      voices.find((v) => v.lang.startsWith("hi"));
    if (urduVoice) return urduVoice;
  }

  // 3. High-priority female voice names
  const femaleKeywords = ["zira", "samantha", "victoria", "karen", "moira", "fiona", "tessa", "female", "natural", "swara", "kalpana", "lekha", "jenny", "aria"];
  for (const kw of femaleKeywords) {
    const match = voices.find((v) => v.name.toLowerCase().includes(kw));
    if (match) return match;
  }

  // 4. English female or default voice
  const enVoice = voices.find((v) => v.lang.startsWith("en") && !v.name.toLowerCase().includes("male") && !v.name.toLowerCase().includes("david") && !v.name.toLowerCase().includes("george"));
  if (enVoice) return enVoice;

  return voices[0] || null;
}

export function stopSpeech(): void {
  if (!isSpeechSupported()) return;
  try {
    if (resumeTimer) {
      clearInterval(resumeTimer);
      resumeTimer = null;
    }
    window.speechSynthesis.cancel();
  } catch (e) {
    console.warn("Failed to stop speech synthesis:", e);
  }
}

export async function speakText(text: string, options?: SpeechOptions): Promise<void> {
  if (!isSpeechSupported() || !text?.trim()) {
    options?.onEnd?.();
    return;
  }

  try {
    // Cancel any pending speech so audio queues don't accumulate
    stopSpeech();

    const voices = cachedVoices.length > 0 ? cachedVoices : await loadVoices();
    const cleanText = text.replace(/[*_#`[\]()]/g, "").trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const selectedVoice = findBestFemaleVoice(voices, options?.language || "auto");
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }

    utterance.pitch = options?.pitch ?? 1.08; // Feminine, warm pitch
    utterance.rate = options?.rate ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;

    let hasEnded = false;

    utterance.onstart = () => {
      options?.onStart?.();
      // Chrome workaround: resume synthesis periodically to prevent silent pause on long utterances
      if (resumeTimer) clearInterval(resumeTimer);
      resumeTimer = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(resumeTimer);
          resumeTimer = null;
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 8000);
    };

    utterance.onend = () => {
      if (hasEnded) return;
      hasEnded = true;
      if (resumeTimer) {
        clearInterval(resumeTimer);
        resumeTimer = null;
      }
      options?.onEnd?.();
    };

    utterance.onerror = (err) => {
      if (hasEnded) return;
      hasEnded = true;
      if (resumeTimer) {
        clearInterval(resumeTimer);
        resumeTimer = null;
      }
      console.warn("SpeechSynthesis error:", err);
      options?.onError?.(err);
      options?.onEnd?.();
    };

    // Safety timeout in case onend never fires (prevents UI lock)
    const maxDurationMs = Math.max(5000, (cleanText.length / 10) * 1000);
    setTimeout(() => {
      if (!hasEnded) {
        hasEnded = true;
        if (resumeTimer) {
          clearInterval(resumeTimer);
          resumeTimer = null;
        }
        options?.onEnd?.();
      }
    }, maxDurationMs);

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("Failed to speak text:", err);
    options?.onError?.(err);
    options?.onEnd?.();
  }
}

export function isRecognitionSupported(): boolean {
  return typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
}

export function createSpeechRecognizer(
  language = "en-US",
  onResult: (text: string) => void,
  onError?: (err: any) => void
): any {
  if (!isRecognitionSupported()) return null;
  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognizer = new SpeechRec();
  recognizer.continuous = false;
  recognizer.interimResults = false;

  const langLower = language.toLowerCase();
  if (langLower.includes("hindi")) recognizer.lang = "hi-IN";
  else if (langLower.includes("urdu")) recognizer.lang = "ur-PK";
  else recognizer.lang = "en-US";

  recognizer.onresult = (e: any) => {
    const text = e.results?.[0]?.[0]?.transcript;
    if (text) onResult(text);
  };
  if (onError) recognizer.onerror = onError;
  return recognizer;
}
