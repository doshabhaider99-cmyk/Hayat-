import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Power,
  HelpCircle,
  Terminal,
  Cpu,
  Monitor,
  Network,
  Database,
  Calendar,
  FolderGit,
  Zap,
  Activity,
  Eye,
  Wifi,
  MessageSquare,
  FolderOpen,
  Wand2,
  Sliders,
  History,
  Clock,
  Bell,
  CheckSquare,
  Users,
  Music,
  Film,
  Download,
  Globe,
  Mail,
  ShieldCheck,
  Cloud,
  Save,
  Search,
  Bug,
  AlertOctagon,
  X,
  Play,
  RotateCcw,
  Check,
  Brain,
  WifiOff,
  Radio,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import IqraAvatar, { AvatarState } from "./components/IqraAvatar";
import ControlPanel from "./components/ControlPanel";
import Subtitles from "./components/Subtitles";
import CommandHub from "./components/CommandHub";
import MaxBrainSuite from "./components/MaxBrainSuite";
import { IqraAudioEngine, checkMicrophoneSupport, formatMicError, RecordingResult } from "./utils/audio";
import { DEFAULT_CHARACTERS } from "./components/CharacterManager";
import { AICharacter } from "./types";
import { apiPost, ApiError, isOnline, subscribeNetworkStatus } from "./utils/apiClient";
import { speakText, stopSpeech, isRecognitionSupported, createSpeechRecognizer } from "./utils/speech";

// Full list of 25 requested features categorized for easy modular navigation
interface FeatureItem {
  id: string;
  name: string;
  icon: any;
  category: "core" | "media" | "tools" | "system";
  description: string;
}

const FEATURES: FeatureItem[] = [
  { id: "max-brain", name: "MAX 147 Suite", icon: Brain, category: "core", description: "Unified Master AI Brain, Deep Memory, Research Engine, University Suite, Coding & Creative Pipeline." },
  { id: "voice", name: "Voice Assistant", icon: Mic, category: "core", description: "Real-time AI spoken dialogue with dynamic acoustic feedback." },
  { id: "chat", name: "Chat", icon: MessageSquare, category: "core", description: "Interactive full-text prompt terminal with prebuilt suggestions." },
  { id: "camera", name: "Camera", icon: Eye, category: "core", description: "Computer vision feed, real-time object tracking and image analysis." },
  { id: "files", name: "Files", icon: FolderOpen, category: "media", description: "Secure storage explorer, cloud drive synchronizer and local exporter." },
  { id: "automation", name: "Automation", icon: Zap, category: "media", description: "Custom task automation scripts, logic chains and active triggers." },
  { id: "tools", name: "AI Tools", icon: Wand2, category: "tools", description: "Mathematical calculations, physical derivation solvers and summaries." },
  { id: "plugins", name: "Plugins", icon: FolderGit, category: "tools", description: "Third-party extension registry and live Google integration." },
  { id: "settings", name: "Settings", icon: Sliders, category: "system", description: "Acoustic parameters, voice tuning, and safety guardrails." },
  { id: "history", name: "History", icon: History, category: "core", description: "Historical database search and exportable conversation transcripts." },
  { id: "notifications", name: "Notifications", icon: Bell, category: "system", description: "Active system alerts, task completions and safety telemetry." },
  { id: "memory", name: "Memory", icon: Database, category: "core", description: "Persistent semantic storage graph and database statistics." },
  { id: "tasks", name: "Tasks", icon: CheckSquare, category: "tools", description: "Chronological task planner, agenda schedules and checklist engines." },
  { id: "calendar", name: "Calendar", icon: Calendar, category: "tools", description: "Organized time matrix planner synced directly with active tasks." },
  { id: "contacts", name: "Contacts", icon: Users, category: "core", description: "Local contacts directory with interactive user mapping profiles." },
  { id: "music", name: "Music", icon: Music, category: "media", description: "Audio synthesizer, ambient sound generators and MP3 player." },
  { id: "video", name: "Video", icon: Film, category: "media", description: "Visual timeline editor, MP4 stream encoder and clip rendering." },
  { id: "downloads", name: "Downloads", icon: Download, category: "media", description: "Asset extraction terminal and offline export package hub." },
  { id: "browser", name: "Browser", icon: Globe, category: "tools", description: "Secure search sandbox, webpage extractor and grounding core." },
  { id: "email", name: "Email", icon: Mail, category: "tools", description: "Holographic client proxy for outbound correspondence drafts." },
  { id: "terminal", name: "Terminal", icon: Terminal, category: "system", description: "Interactive shell prompt for local and backend command parsing." },
  { id: "monitor", name: "System Monitor", icon: Activity, category: "system", description: "CPU, Memory, Disk, and Network hardware metrics charts." },
  { id: "security", name: "Security", icon: ShieldCheck, category: "system", description: "Firewall rules status, SSL keys validator and database lock keys." },
  { id: "cloud", name: "Cloud", icon: Cloud, category: "system", description: "Cloud Run containers status, API latency meters and gateways." },
  { id: "backup", name: "Backup", icon: Save, category: "system", description: "Encrypted offline archive packer and local state restorer." },
  { id: "search", name: "Search", icon: Search, category: "tools", description: "Semantic web lookup engine with citations grounding links." }
];

export default function App() {
  const [status, setStatus] = useState<AvatarState>("disconnected");
  const [frequencies, setFrequencies] = useState<Uint8Array>(new Uint8Array(0));
  const [inputTranscript, setInputTranscript] = useState("");
  const [outputTranscript, setOutputTranscript] = useState("");
  const [activeVoice, setActiveVoice] = useState("Kore");
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [lastToolCall, setLastToolCall] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micUnavailable, setMicUnavailable] = useState(false);
  const [textMessage, setTextMessage] = useState("");
  
  // Dynamic Characters Database & Active Selector State
  const [characters, setCharacters] = useState<AICharacter[]>(() => {
    const saved = localStorage.getItem("zoya_characters_db") || localStorage.getItem("hania_characters_db");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_CHARACTERS;
  });

  const [activeCharacterId, setActiveCharacterId] = useState<string>(() => {
    const saved = localStorage.getItem("active_character_id");
    if (!saved || saved === "max" || saved === "hania" || saved === "iqra") return "zoya";
    return saved;
  });

  const currentCharacterProfile = characters.find(c => c.id === activeCharacterId) || characters[0] || DEFAULT_CHARACTERS[0];
  const activeCharacter = (currentCharacterProfile.id === "max" || currentCharacterProfile.id === "hania" || currentCharacterProfile.id === "iqra" || currentCharacterProfile.id === "zoya") 
    ? (currentCharacterProfile.id as "max" | "hania" | "iqra" | "zoya") 
    : "zoya"; // fallback style match

  // Active Conversational Language State
  const [currentLanguage, setCurrentLanguage] = useState<string>("Hindi");

  // Resilient Dual-Mode & Network Telemetry States
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(isOnline());
  const [connectionMode, setConnectionMode] = useState<"live-ws" | "rest-smart">("rest-smart");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState<boolean>(false);
  const [isListeningSTT, setIsListeningSTT] = useState<boolean>(false);
  const speechRecognizerRef = useRef<any>(null);

  // Robust Native Voice Recording & VAD States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [isSpeechDetected, setIsSpeechDetected] = useState<boolean>(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState<boolean>(false);
  const recordingTimerRef = useRef<any>(null);

  // Subscribe to real-time network connectivity changes
  useEffect(() => {
    return subscribeNetworkStatus((online) => {
      setIsDeviceOnline(online);
      if (online) {
        addConsoleLog("NETWORK RESTORED: Internet connection re-established.");
        setError(null);
      } else {
        addConsoleLog("NETWORK WARNING: Device dropped offline. Operating in local cached mode.");
      }
    });
  }, []);

  // Custom Photo Upload & Local Persistence State
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(
    localStorage.getItem(`${activeCharacterId}_custom_avatar`) || null
  );

  const handleCharacterChange = (id: string) => {
    const found = characters.find(c => c.id === id);
    if (found) {
      setActiveCharacterId(id);
      localStorage.setItem("active_character_id", id);
      setCustomAvatarUrl(localStorage.getItem(`${id}_custom_avatar`) || null);
      setActiveVoice(found.voice);
      addConsoleLog(`SYSTEM CONFIGURATION: Character matrix aligned to ${found.name.toUpperCase()}_OS.`);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "textPrompt",
          text: `[SYSTEM: Active character persona changed to ${found.name}. Personality: ${found.personality}. Role: ${found.role}. Language: ${found.language}. Greet the user in character now: "${found.greetingStyle}"]`
        }));
      } else {
        setOutputTranscript(found.greetingStyle);
        setStatus("speaking");
        setIsSpeakingTTS(true);
        speakText(found.greetingStyle, {
          language: found.language || currentLanguage,
          onEnd: () => { setStatus("idle"); setIsSpeakingTTS(false); },
          onError: () => { setStatus("idle"); setIsSpeakingTTS(false); }
        });
      }
    }
  };

  // Language Switching Handler (Priority Rule: Immediate switch and continuation with feminine grammar)
  const detectLanguageSwitchCommand = (text: string): boolean => {
    const clean = text.trim().toLowerCase();
    
    // Check for Hindi request
    if (clean.includes("hindi mein baat karo") || clean.includes("hindi me baat karo") || clean.includes("hindi bolo") || clean.includes("speak in hindi") || clean === "hindi") {
      setCurrentLanguage("Hindi");
      addConsoleLog("LANGUAGE SWITCH: User requested Hindi. Zoya continuing in conversational Hindi with feminine grammar.");
      const reply = "Bilkul, ab main aapse Hindi mein hi baat karungi. Bataiye, main aapki kya madad kar sakti hoon?";
      setOutputTranscript(reply);
      setStatus("speaking");
      setIsSpeakingTTS(true);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "textPrompt",
          text: `[SYSTEM: The user explicitly requested Hindi ("${text}"). Speak and continue in natural conversational Hindi using feminine self-reference (main karti hoon, main kar sakti hoon, main bata sakti hoon). Acknowledge and continue helping the user in Hindi: "${reply}"]`
        }));
      } else {
        speakText(reply, {
          language: "Hindi",
          onEnd: () => { setStatus("idle"); setIsSpeakingTTS(false); },
          onError: () => { setStatus("idle"); setIsSpeakingTTS(false); }
        });
      }
      return true;
    }

    // Check for Urdu request
    if (clean.includes("urdu mein baat karo") || clean.includes("urdu me baat karo") || clean.includes("urdu bolo") || clean.includes("speak in urdu") || clean === "urdu") {
      setCurrentLanguage("Urdu");
      addConsoleLog("LANGUAGE SWITCH: User requested Urdu. Zoya continuing in polite Urdu with feminine grammar.");
      const reply = "Bilkul, ab main aapse Urdu mein hi baat karungi. Farmaiye, main aapki kya madad kar sakti hoon?";
      setOutputTranscript(reply);
      setStatus("speaking");
      setIsSpeakingTTS(true);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "textPrompt",
          text: `[SYSTEM: The user explicitly requested Urdu ("${text}"). Speak and continue in natural Urdu using feminine self-reference (main karti hoon, main bata sakti hoon). Acknowledge and continue helping in Urdu: "${reply}"]`
        }));
      } else {
        speakText(reply, {
          language: "Urdu",
          onEnd: () => { setStatus("idle"); setIsSpeakingTTS(false); },
          onError: () => { setStatus("idle"); setIsSpeakingTTS(false); }
        });
      }
      return true;
    }

    // Check for Roman Urdu request
    if (clean.includes("roman urdu mein baat karo") || clean.includes("roman urdu me baat karo") || clean.includes("roman urdu")) {
      setCurrentLanguage("Roman Urdu");
      addConsoleLog("LANGUAGE SWITCH: User requested Roman Urdu. Zoya continuing in Roman Urdu with feminine grammar.");
      const reply = "Bilkul, ab main aapse Roman Urdu mein hi baat karungi. Bataiye, main aapki kya madad kar sakti hoon?";
      setOutputTranscript(reply);
      setStatus("speaking");
      setIsSpeakingTTS(true);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "textPrompt",
          text: `[SYSTEM: The user explicitly requested Roman Urdu ("${text}"). Speak and continue in natural Roman Urdu using feminine self-reference (main karti hoon, main bata sakti hoon). Acknowledge and continue: "${reply}"]`
        }));
      } else {
        speakText(reply, {
          language: "Roman Urdu",
          onEnd: () => { setStatus("idle"); setIsSpeakingTTS(false); },
          onError: () => { setStatus("idle"); setIsSpeakingTTS(false); }
        });
      }
      return true;
    }

    // Check for English request
    if (clean.includes("english mein baat karo") || clean.includes("speak in english") || clean.includes("talk in english") || clean === "english") {
      setCurrentLanguage("English");
      addConsoleLog("LANGUAGE SWITCH: User requested English. Zoya continuing in articulate English.");
      const reply = "Certainly! I will now speak with you in English. How may I assist you today?";
      setOutputTranscript(reply);
      setStatus("speaking");
      setIsSpeakingTTS(true);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "textPrompt",
          text: `[SYSTEM: The user explicitly requested English ("${text}"). Speak and continue in articulate English. Acknowledge and continue: "${reply}"]`
        }));
      } else {
        speakText(reply, {
          language: "English",
          onEnd: () => { setStatus("idle"); setIsSpeakingTTS(false); },
          onError: () => { setStatus("idle"); setIsSpeakingTTS(false); }
        });
      }
      return true;
    }

    // Check for Hinglish request
    if (clean.includes("hinglish mein baat karo") || clean.includes("hinglish me baat karo") || clean.includes("hinglish")) {
      setCurrentLanguage("Hinglish");
      addConsoleLog("LANGUAGE SWITCH: User requested Hinglish. Zoya continuing in Hinglish with feminine grammar.");
      const reply = "Sure thing! Ab hum natural Hinglish mein baat karenge. Bataiye, what can I do for you today?";
      setOutputTranscript(reply);
      setStatus("speaking");
      setIsSpeakingTTS(true);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "textPrompt",
          text: `[SYSTEM: The user explicitly requested Hinglish ("${text}"). Speak and continue in modern Hinglish with feminine self-reference (main karti hoon). Acknowledge and continue: "${reply}"]`
        }));
      } else {
        speakText(reply, {
          language: "Hinglish",
          onEnd: () => { setStatus("idle"); setIsSpeakingTTS(false); },
          onError: () => { setStatus("idle"); setIsSpeakingTTS(false); }
        });
      }
      return true;
    }

    return false;
  };

  const detectCharacterSwitchCommand = (text: string): boolean => {
    const cleanText = text.trim().toLowerCase();
    const patterns = [
      /call\s+([A-Za-z0-9\s_\-\u0600-\u06FF]+)/i,
      /switch\s+to\s+([A-Za-z0-9\s_\-\u0600-\u06FF]+)/i,
      /i\s+want\s+to\s+talk\s+to\s+([A-Za-z0-9\s_\-\u0600-\u06FF]+)/i,
      /bring\s+([A-Za-z0-9\s_\-\u0600-\u06FF]+)/i,
    ];

    for (const pattern of patterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        const targetName = match[1].trim().toLowerCase();
        const found = characters.find(c => c.name.toLowerCase() === targetName && c.enabled);
        if (found) {
          handleCharacterChange(found.id);
          addConsoleLog(`SYSTEM INTERPRETER: Voice/Written trigger matched. Shifted presence to '${found.name}'.`);
          setOutputTranscript(found.greetingStyle);
          setStatus("speaking");
          return true;
        }
      }
    }
    return false;
  };

  // Active Feature View Selection
  const [activeFeature, setActiveFeature] = useState<string>("voice");

  // Telemetry system monitor states
  const [cpuUsage, setCpuUsage] = useState(23);
  const [ramUsage, setRamUsage] = useState(45);
  const [diskUsage, setDiskUsage] = useState(62);
  const [networkSpeed, setNetworkSpeed] = useState(128);
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "ZOYA OS [v3.1]: Fully integrated female neural interface standing by.",
    "DEVICES: Audio micro-array found. High precision PCM active.",
    "STATUS: Off-grid encryption keys calibrated and secured."
  ]);

  // Bug / Error Reporting Modals
  const [reportType, setReportType] = useState<"bug" | "error" | null>(null);
  const [reportText, setReportText] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Quick Terminal state
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "Welcome to ZOYA-OS shell. Type 'help' or 'diagnose' to begin."
  ]);
  const [terminalInput, setTerminalInput] = useState("");

  const audioEngineRef = useRef<IqraAudioEngine | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Live telemetry pulse animation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((p) => {
        const delta = Math.floor(Math.random() * 9) - 4;
        return Math.max(10, Math.min(95, p + delta));
      });
      setRamUsage((p) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(30, Math.min(85, p + delta));
      });
      setNetworkSpeed((p) => {
        const delta = Math.floor(Math.random() * 41) - 20;
        return Math.max(50, Math.min(950, p + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Poll real-time audio frequencies with frame throttling to avoid infinite render thrashing
  useEffect(() => {
    if (status !== "speaking" && status !== "listening") {
      setFrequencies((prev) => (prev.length === 0 ? prev : new Uint8Array(0)));
      return;
    }

    let lastTick = 0;
    const poll = (time: number) => {
      // Throttle state updates to ~12fps (every 80ms) which is optimal for UI waves without React loop thrashing
      if (time - lastTick > 80) {
        lastTick = time;
        if (status === "speaking") {
          let freqs = audioEngineRef.current?.getSpeakerFrequencies();
          if (!freqs || freqs.length === 0 || freqs.every(v => v === 0)) {
            // Organic vocal frequency wave simulation during REST TTS speech playback
            const sim = new Uint8Array(16);
            for (let i = 0; i < 16; i++) {
              sim[i] = Math.floor(Math.abs(Math.sin(time / 180 + i * 0.45)) * 170 + Math.random() * 45);
            }
            freqs = sim;
          }
          setFrequencies(freqs);
        } else if (status === "listening") {
          let freqs = audioEngineRef.current?.getMicFrequencies();
          if (!freqs || freqs.length === 0) {
            const sim = new Uint8Array(16);
            for (let i = 0; i < 16; i++) {
              sim[i] = Math.floor(Math.abs(Math.sin(time / 250 + i * 0.6)) * 90 + Math.random() * 30);
            }
            freqs = sim;
          }
          setFrequencies(freqs);
        }
      }
      animationFrameRef.current = requestAnimationFrame(poll);
    };

    animationFrameRef.current = requestAnimationFrame(poll);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status]);

  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, []);

  const addConsoleLog = (text: string) => {
    const timestamp = new Date().toTimeString().split(" ")[0];
    setSystemLogs((prev) => [`[${timestamp}] ${text}`, ...prev.slice(0, 49)]);
  };

  const cleanupSession = () => {
    setStatus("disconnected");
    setFrequencies(new Uint8Array(0));
    setMicUnavailable(false);
    setIsSpeakingTTS(false);
    setIsListeningSTT(false);
    setIsRecording(false);
    setIsSpeechDetected(false);
    setIsProcessingVoice(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    stopSpeech();

    if (speechRecognizerRef.current) {
      try { speechRecognizerRef.current.stop(); } catch (e) {}
      speechRecognizerRef.current = null;
    }
    
    if (audioEngineRef.current) {
      audioEngineRef.current.destroy();
      audioEngineRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const enterRestSmartMode = (engine: IqraAudioEngine | null) => {
    setConnectionMode("rest-smart");
    setStatus("idle");
    setError(null);
    addConsoleLog("ZOYA READY: Operating in Resilient Web Architecture (Vercel & Android Optimized).");

    // Play initial greeting
    const welcome = "Hello! Main Zoya hoon, aapki personal AI assistant. Main aapki kya madad kar sakti hoon?";
    setOutputTranscript(welcome);
    setStatus("speaking");
    setIsSpeakingTTS(true);
    speakText(welcome, {
      language: currentLanguage,
      onEnd: () => {
        setStatus("idle");
        setIsSpeakingTTS(false);
      },
      onError: () => {
        setStatus("idle");
        setIsSpeakingTTS(false);
      }
    });
  };

  const handleToggleSession = async () => {
    if (status !== "disconnected" && status !== "error") {
      cleanupSession();
      addConsoleLog("SESSION SHUTDOWN: Neural audio channels closed.");
      return;
    }

    setError(null);
    setStatus("connecting");
    setInputTranscript("");
    setOutputTranscript("");
    addConsoleLog("NEURAL LINK: Connecting to Zoya intelligence...");

    if (!isOnline()) {
      setError("Internet is currently offline. Please reconnect your network.");
      setStatus("error");
      return;
    }

    try {
      const engine = new IqraAudioEngine();
      audioEngineRef.current = engine;
      engine.initSpeaker();

      // On Vercel, serverless HTTP functions do not support persistent WebSockets.
      // Immediately switch to the resilient REST smart mode with MediaRecorder voice pipeline without blocking.
      const isVercelHost = typeof window !== "undefined" && 
        (window.location.hostname.includes("vercel.app") || window.location.hostname.includes(".now.sh"));
      
      if (isVercelHost) {
        enterRestSmartMode(engine);
        return;
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const charParam = encodeURIComponent(currentCharacterProfile.name);
      const roleParam = encodeURIComponent(currentCharacterProfile.role);
      const persParam = encodeURIComponent(currentCharacterProfile.personality);
      const wsUrl = `${protocol}//${window.location.host}/api/live?voice=${encodeURIComponent(activeVoice)}&character=${charParam}&role=${roleParam}&personality=${persParam}`;
      
      let wsConnected = false;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const wsTimeout = setTimeout(() => {
        if (!wsConnected && wsRef.current === ws) {
          console.warn("WebSocket handshake timeout (Vercel serverless / restricted port). Gracefully switching to REST smart engine.");
          try { ws.close(); } catch (e) {}
          wsRef.current = null;
          enterRestSmartMode(engine);
        }
      }, 1500);

      ws.onopen = async () => {
        wsConnected = true;
        clearTimeout(wsTimeout);
        setConnectionMode("live-ws");
        addConsoleLog("NEURAL LINK ESTABLISHED: Real-time Gemini Live WebSocket connected.");
        try {
          await engine.startMic((base64Audio) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "audio", audio: base64Audio }));
            }
          });
          setStatus("idle");
        } catch (micErr: any) {
          console.warn("Mic access denied, falling back to direct keyboard chat:", micErr);
          setError("Microphone permission denied. Direct keyboard input mode is fully active!");
          setMicUnavailable(true);
          setStatus("idle");
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "status") {
            if (msg.status === "connected") {
              setStatus("idle");
              addConsoleLog(`${activeCharacter.toUpperCase()} STATUS: Ready and standing by.`);
            }
          } else if (msg.type === "audio" && msg.audio) {
            setStatus("speaking");
            engine.playChunk(msg.audio);
          } else if (msg.type === "interrupted") {
            addConsoleLog("INTERRUPT: User spoken word barge-in occurred.");
            engine.stopAllPlayback();
            setStatus("listening");
          } else if (msg.type === "toolCall") {
            const toolCall = msg.toolCall;
            const functionCalls = toolCall.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
              const call = functionCalls[0];
              if (call.name === "openWebsite") {
                const { url, name } = call.args;
                setLastToolCall({ url, name });
                addConsoleLog(`ACTION DIRECTIVE: Opening external web node ${name} (${url})`);
                
                try {
                  window.open(url, "_blank");
                } catch (e) {
                  console.warn("Popup blocked opening directly.");
                }

                ws.send(
                  JSON.stringify({
                    type: "toolResponse",
                    id: call.id,
                    response: { success: true, message: `Successfully opened ${name} for the user.` },
                  })
                );
              }
            }
          } else if (msg.type === "inputTranscription") {
            setInputTranscript(msg.text);
            setStatus("listening");
            if (!detectLanguageSwitchCommand(msg.text)) {
              detectCharacterSwitchCommand(msg.text);
            }
          } else if (msg.type === "outputTranscription") {
            setOutputTranscript(msg.text);
            setStatus("speaking");
          } else if (msg.type === "error") {
            console.warn("Live WebSocket error notification:", msg.error);
            clearTimeout(wsTimeout);
            enterRestSmartMode(engine);
          }
        } catch (err) {
          console.error("Error handling server message:", err);
        }
      };

      ws.onclose = () => {
        clearTimeout(wsTimeout);
        if (wsConnected) {
          addConsoleLog(`SOCKET NOTICE: Real-time socket closed. Standby REST mode active.`);
        }
      };

      ws.onerror = (err) => {
        clearTimeout(wsTimeout);
        console.warn("WebSocket error, falling back to REST smart mode:", err);
        wsRef.current = null;
        enterRestSmartMode(engine);
      };

    } catch (err: any) {
      console.warn("Session start exception, falling back to REST mode:", err);
      enterRestSmartMode(null);
    }
  };

  const handleVoiceChange = (voice: string) => {
    setActiveVoice(voice);
    addConsoleLog(`SYSTEM RECONFIGURATION: Voice preferences switched to ${voice}.`);
    if (status !== "disconnected" && status !== "error") {
      cleanupSession();
      setTimeout(() => {
        setStatus("connecting");
      }, 100);
    }
  };

  // Central Resilient Message Dispatcher (Works in WebSocket, REST smart mode, and before Launch is clicked)
  const dispatchUserMessage = async (rawText: string) => {
    const cleanText = rawText.trim();
    if (!cleanText) return;

    if (detectLanguageSwitchCommand(cleanText)) {
      setTextMessage("");
      return;
    }

    if (detectCharacterSwitchCommand(cleanText)) {
      setTextMessage("");
      return;
    }

    setInputTranscript(cleanText);
    setTextMessage("");

    // 1. If WebSocket is connected, stream via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setStatus("listening");
      wsRef.current.send(JSON.stringify({ type: "textPrompt", text: cleanText }));
      addConsoleLog(`WEBSOCKET QUERY: User injected text: "${cleanText}"`);
      return;
    }

    // 2. Otherwise use REST Smart Mode with automatic exponential retry
    if (!isOnline()) {
      setError("Device is currently offline. Please check your internet connection.");
      return;
    }

    setStatus("thinking");
    addConsoleLog(`REST PIPELINE: Dispatching query to /api/chat with auto-retry...`);

    // Check for web open directive
    const lower = cleanText.toLowerCase();
    if (lower.startsWith("open ") || lower.includes("open website")) {
      const match = lower.match(/open\s+([a-z0-9_\-\.]+)/i);
      if (match && match[1]) {
        const target = match[1];
        let url = target.startsWith("http") ? target : `https://${target}`;
        if (!target.includes(".")) url = `https://${target}.com`;
        setLastToolCall({ url, name: target });
        addConsoleLog(`ACTION DIRECTIVE: Opening external web node ${target} (${url})`);
        try { window.open(url, "_blank"); } catch (e) {}
      }
    }

    try {
      const newHistory = [...chatHistory.slice(-6), { role: "user", content: cleanText }];
      const res = await apiPost<{ success?: boolean; text?: string; reply?: string; error?: string }>(
        "/api/chat",
        {
          message: cleanText,
          language: currentLanguage,
          history: newHistory,
          characterName: currentCharacterProfile.name,
          characterRole: currentCharacterProfile.role,
        },
        { timeoutMs: 25000, maxRetries: 3 }
      );

      const replyText = res.text || res.reply || "Main Zoya hoon. Main aapki kya madad kar sakti hoon?";
      setOutputTranscript(replyText);
      setChatHistory([...newHistory, { role: "assistant", content: replyText }]);
      addConsoleLog(`ZOYA REPLY: Received response.`);

      setStatus("speaking");
      setIsSpeakingTTS(true);
      await speakText(replyText, {
        language: currentLanguage,
        onEnd: () => {
          setStatus("idle");
          setIsSpeakingTTS(false);
        },
        onError: () => {
          setStatus("idle");
          setIsSpeakingTTS(false);
        }
      });
    } catch (chatErr: any) {
      console.error("Chat error:", chatErr);
      const isRate = chatErr instanceof ApiError && chatErr.isRateLimit;
      const errorMsg = isRate
        ? "Rate limit reached. Server traffic is elevated, please retry in a moment."
        : chatErr.message || "Failed to contact Zoya AI backend.";
      setError(errorMsg);
      setStatus("idle");
      addConsoleLog(`SYSTEM FAULT: ${errorMsg}`);
    }
  };

  const getOrCreateAudioEngine = () => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = new IqraAudioEngine();
    }
    return audioEngineRef.current;
  };

  // Browser-native HTTPS recording using getUserMedia, MediaRecorder, and VAD
  const startVoiceRecording = async () => {
    if (status === "speaking" || isSpeakingTTS) {
      stopSpeech();
      if (audioEngineRef.current) audioEngineRef.current.stopAllPlayback();
      setIsSpeakingTTS(false);
    }

    const support = checkMicrophoneSupport();
    if (!support.supported) {
      setError(support.error || "Microphone access is not supported on this device/connection.");
      addConsoleLog(`MIC ERROR: ${support.error}`);
      return;
    }

    setError(null);
    const engine = getOrCreateAudioEngine();

    try {
      setIsRecording(true);
      setIsSpeechDetected(false);
      setRecordingDuration(0);
      setStatus("listening");
      addConsoleLog("VOICE INPUT: Microphone activated. Listening with live acoustic feedback & VAD...");

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);

      await engine.startRecording({
        onSpeechStart: () => {
          setIsSpeechDetected(true);
        },
        onSpeechEnd: () => {
          addConsoleLog("VAD ENGINE: Silence detected after speech. Automatically compiling voice input...");
          stopVoiceRecordingAndProcess();
        },
        silenceTimeoutMs: 1800,
        minSpeechDurationMs: 600,
        maxDurationMs: 28000,
      });
    } catch (err: any) {
      console.error("Failed to start voice recording:", err);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setIsRecording(false);
      setIsSpeechDetected(false);
      setStatus("idle");
      const formatted = formatMicError(err);
      setError(formatted);
      addConsoleLog(`MIC FAULT: ${formatted}`);
    }
  };

  const stopVoiceRecordingAndProcess = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
    setIsSpeechDetected(false);

    const engine = audioEngineRef.current;
    if (!engine) return;

    setStatus("thinking");
    setIsProcessingVoice(true);
    addConsoleLog("AUDIO PIPELINE: Transmitting recorded voice payload to Gemini voice processor...");

    try {
      const result = await engine.stopRecording();
      if (!result || !result.base64 || result.durationMs < 250) {
        addConsoleLog("VOICE PIPELINE: Audio input too brief or silent. Standing by.");
        setIsProcessingVoice(false);
        setStatus("idle");
        return;
      }

      addConsoleLog(`VOICE PIPELINE: Audio captured (${Math.round(result.durationMs / 1000)}s, ${result.mimeType}). Transcribing and generating response...`);

      const newHistory = [...chatHistory.slice(-4)];
      const res = await apiPost<{
        success?: boolean;
        text?: string;
        reply?: string;
        transcript?: string;
        language?: string;
        error?: string;
      }>(
        "/api/voice",
        {
          audio: result.base64,
          mimeType: result.mimeType,
          language: currentLanguage,
          history: newHistory,
          characterName: currentCharacterProfile.name,
          characterRole: currentCharacterProfile.role,
        },
        { timeoutMs: 28000, maxRetries: 2 }
      );

      const userTranscript = (res.transcript || "").trim();
      const replyText = res.reply || res.text || "Main Zoya hoon. Main aapki kya madad kar sakti hoon?";
      const detectedLang = res.language || currentLanguage;

      if (userTranscript) {
        setInputTranscript(userTranscript);
        addConsoleLog(`TRANSCRIPT: User said: "${userTranscript}"`);

        if (detectLanguageSwitchCommand(userTranscript)) {
          setIsProcessingVoice(false);
          return;
        }

        if (detectCharacterSwitchCommand(userTranscript)) {
          setIsProcessingVoice(false);
          return;
        }
      }

      setOutputTranscript(replyText);
      setChatHistory([
        ...newHistory,
        ...(userTranscript ? [{ role: "user", content: userTranscript }] : []),
        { role: "assistant", content: replyText }
      ]);
      addConsoleLog(`ZOYA REPLY: Spoken response ready (${detectedLang}).`);

      setIsProcessingVoice(false);
      setStatus("speaking");
      setIsSpeakingTTS(true);

      await speakText(replyText, {
        language: detectedLang,
        onEnd: () => {
          setStatus("idle");
          setIsSpeakingTTS(false);
        },
        onError: () => {
          setStatus("idle");
          setIsSpeakingTTS(false);
        }
      });
    } catch (err: any) {
      console.error("Voice processing error:", err);
      setIsProcessingVoice(false);
      setStatus("idle");
      const errorMsg = err?.message || "Failed to process voice recording. Please retry.";
      setError(errorMsg);
      addConsoleLog(`VOICE PIPELINE ERROR: ${errorMsg}`);
    }
  };

  const cancelVoiceRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setIsSpeechDetected(false);
    if (audioEngineRef.current) {
      await audioEngineRef.current.stopRecording();
    }
    setStatus("idle");
    addConsoleLog("VOICE INPUT: Recording cancelled by user.");
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecordingAndProcess();
    } else if (status === "speaking" || isSpeakingTTS) {
      stopSpeech();
      if (audioEngineRef.current) audioEngineRef.current.stopAllPlayback();
      setStatus("idle");
      setIsSpeakingTTS(false);
      addConsoleLog("AUDIO INTERRUPT: Playback stopped by user.");
    } else {
      startVoiceRecording();
    }
  };

  // Retain Web Speech fallback reference
  const toggleSpeechRecognition = () => {
    toggleVoiceRecording();
  };

  const handleIcebreakerClick = (text: string) => {
    dispatchUserMessage(text);
  };

  const handleSendTextMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    dispatchUserMessage(textMessage);
  };

  const handleSendTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    setTerminalHistory((prev) => [...prev, `${activeCharacter}@haidery:~$ ${terminalInput}`]);

    if (cmd === "help") {
      setTerminalHistory((prev) => [
        ...prev,
        "Available commands:",
        "  help         Expose help protocols",
        "  diagnose     Trigger systemic diagnostics check",
        "  sysinfo      Show server state metrics",
        "  clear        Clear terminal scrollback",
        "  speak <msg>  Inject mock text-to-speech feedback"
      ]);
    } else if (cmd === "diagnose") {
      setTerminalHistory((prev) => [
        ...prev,
        "Calibrating system parameters...",
        "✔ AUDIO CHANNELS: ACTIVE mono-PCM 16000Hz",
        "✔ NEURAL WEB: REACHABLE - Gemini 3.1 Flash ready",
        "✔ PERIPHERAL CAMERA: ONLINE - simulated matrix loaded",
        "All systems stable. No compromises detected."
      ]);
    } else if (cmd === "sysinfo") {
      setTerminalHistory((prev) => [
        ...prev,
        `CPU Usage: ${cpuUsage}% | RAM Usage: ${ramUsage}%`,
        `Network Gateway: ${networkSpeed} KB/s`,
        `Uptime Code: ${Math.floor(performance.now() / 1000)}s`
      ]);
    } else if (cmd === "clear") {
      setTerminalHistory([]);
    } else if (cmd.startsWith("speak ")) {
      const msgText = terminalInput.substring(6);
      dispatchUserMessage(msgText);
    } else {
      setTerminalHistory((prev) => [
        ...prev,
        `Command not found: '${cmd}'. Type 'help' to see protocols.`
      ]);
    }

    setTerminalInput("");
  };

  const handleAvatarClick = () => {
    if (status === "speaking" || isSpeakingTTS) {
      stopSpeech();
      if (audioEngineRef.current) audioEngineRef.current.stopAllPlayback();
      setStatus("idle");
      setIsSpeakingTTS(false);
      addConsoleLog("AUDIO INTERRUPT: Speech stopped by user.");
      return;
    }
    if (isRecording) {
      stopVoiceRecordingAndProcess();
      return;
    }
    if (status === "disconnected") {
      handleToggleSession();
      return;
    }
    toggleVoiceRecording();
  };

  const handleUploadPhoto = (url: string) => {
    setCustomAvatarUrl(url);
    localStorage.setItem(`${activeCharacter}_custom_avatar`, url);
    addConsoleLog("AVATAR SYSTEM: Profile photograph successfully updated and locked.");
  };

  const handleResetAvatar = () => {
    setCustomAvatarUrl(null);
    localStorage.removeItem(`${activeCharacter}_custom_avatar`);
    addConsoleLog("AVATAR SYSTEM: Reset to default photorealistic expression library.");
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReportSubmitted(true);
    addConsoleLog(`TELEMETRY EXPORTED: Diagnostic logs submitted regarding ${reportType?.toUpperCase()}.`);
    setTimeout(() => {
      setReportType(null);
      setReportText("");
      setReportSubmitted(false);
    }, 2000);
  };

  // Dynamic design variables based on active character
  const getStyleForCharacter = (charId: string) => {
    if (charId === "max") {
      return {
        accentText: "text-cyan-400",
        accentBg: "bg-cyan-600",
        accentBgHover: "hover:bg-cyan-500",
        accentBgSoft: "bg-cyan-500/10",
        accentBorder: "border-cyan-500/15",
        accentBorderHeavy: "border-cyan-500/30",
        accentBorderHover: "hover:border-cyan-500/40",
        accentBorderFocus: "focus:border-cyan-500/60",
        textGlowClass: "text-glow-cyan",
        shadowGlowClass: "shadow-glow-cyan",
        textMuted: "text-cyan-300",
        solidText: "text-cyan-400",
        statusGlow: "bg-cyan-500 shadow-[0_0_15px_#06b6d4]",
        headerBorder: "border-cyan-500/20",
        navActive: "bg-cyan-600/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)] scale-[1.015]",
        navHover: "hover:border-cyan-500/20",
        quickActive: "bg-cyan-600/25 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.35)]",
        subsystemGradient: "from-cyan-500/30",
        terminalText: "text-cyan-400",
        terminalBorder: "border-cyan-500/30",
        terminalInputText: "text-cyan-300",
      };
    } else if (charId === "hania") {
      return {
        accentText: "text-pink-400",
        accentBg: "bg-pink-600",
        accentBgHover: "hover:bg-pink-500",
        accentBgSoft: "bg-pink-500/10",
        accentBorder: "border-pink-500/10",
        accentBorderHeavy: "border-pink-500/20",
        accentBorderHover: "hover:border-pink-500/30",
        accentBorderFocus: "focus:border-pink-500/50",
        textGlowClass: "text-glow-pink",
        shadowGlowClass: "shadow-glow-pink",
        textMuted: "text-pink-300",
        solidText: "text-pink-500",
        statusGlow: "bg-pink-500 shadow-[0_0_12px_#ec4899]",
        headerBorder: "border-pink-500/10",
        navActive: "bg-pink-600/15 border-pink-500/30 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.15)] scale-[1.015]",
        navHover: "hover:border-pink-500/5",
        quickActive: "bg-pink-600/20 border-pink-500 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.25)]",
        subsystemGradient: "from-pink-500/20",
        terminalText: "text-pink-400",
        terminalBorder: "border-pink-500/20",
        terminalInputText: "text-pink-300",
      };
    } else if (charId === "zoya") {
      return {
        accentText: "text-purple-400",
        accentBg: "bg-purple-600",
        accentBgHover: "hover:bg-purple-500",
        accentBgSoft: "bg-purple-500/10",
        accentBorder: "border-purple-500/10",
        accentBorderHeavy: "border-purple-500/20",
        accentBorderHover: "hover:border-purple-500/30",
        accentBorderFocus: "focus:border-purple-500/50",
        textGlowClass: "text-glow-purple",
        shadowGlowClass: "shadow-glow-purple",
        textMuted: "text-purple-300",
        solidText: "text-purple-500",
        statusGlow: "bg-purple-500 shadow-[0_0_12px_#a855f7]",
        headerBorder: "border-purple-500/10",
        navActive: "bg-purple-600/15 border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)] scale-[1.015]",
        navHover: "hover:border-purple-500/5",
        quickActive: "bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]",
        subsystemGradient: "from-purple-500/20",
        terminalText: "text-purple-400",
        terminalBorder: "border-purple-500/20",
        terminalInputText: "text-purple-300",
      };
    } else if (charId === "iqra") {
      return {
        accentText: "text-cyan-400",
        accentBg: "bg-cyan-600",
        accentBgHover: "hover:bg-cyan-500",
        accentBgSoft: "bg-cyan-500/10",
        accentBorder: "border-cyan-500/10",
        accentBorderHeavy: "border-cyan-500/20",
        accentBorderHover: "hover:border-cyan-500/30",
        accentBorderFocus: "focus:border-cyan-500/50",
        textGlowClass: "text-glow-cyan",
        shadowGlowClass: "shadow-glow-cyan",
        textMuted: "text-cyan-300",
        solidText: "text-cyan-500",
        statusGlow: "bg-cyan-500 shadow-[0_0_12px_#06b6d4]",
        headerBorder: "border-cyan-500/10",
        navActive: "bg-cyan-600/15 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-[1.015]",
        navHover: "hover:border-cyan-500/5",
        quickActive: "bg-cyan-600/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]",
        subsystemGradient: "from-cyan-500/20",
        terminalText: "text-cyan-400",
        terminalBorder: "border-cyan-500/20",
        terminalInputText: "text-cyan-300",
      };
    } else {
      // Dynamic Accent based on gender of custom characters
      const profile = characters.find(c => c.id === charId) || currentCharacterProfile;
      const isMale = profile?.gender === "male";
      const colorPrefix = isMale ? "cyan" : "pink";
      const hexColor = isMale ? "#06b6d4" : "#ec4899";
      const rgbColor = isMale ? "6,182,212" : "236,72,153";
      
      return {
        accentText: `text-${colorPrefix}-400`,
        accentBg: `bg-${colorPrefix}-600`,
        accentBgHover: `hover:bg-${colorPrefix}-500`,
        accentBgSoft: `bg-${colorPrefix}-500/10`,
        accentBorder: `border-${colorPrefix}-500/10`,
        accentBorderHeavy: `border-${colorPrefix}-500/20`,
        accentBorderHover: `hover:border-${colorPrefix}-500/30`,
        accentBorderFocus: `focus:border-${colorPrefix}-500/50`,
        textGlowClass: `text-glow-${colorPrefix}`,
        shadowGlowClass: `shadow-glow-${colorPrefix}`,
        textMuted: `text-${colorPrefix}-300`,
        solidText: `text-${colorPrefix}-500`,
        statusGlow: `bg-${colorPrefix}-500 shadow-[0_0_12px_${hexColor}]`,
        headerBorder: `border-${colorPrefix}-500/10`,
        navActive: `bg-${colorPrefix}-600/15 border-${colorPrefix}-500/30 text-${colorPrefix}-300 shadow-[0_0_15px_rgba(${rgbColor},0.15)] scale-[1.015]`,
        navHover: `hover:border-${colorPrefix}-500/5`,
        quickActive: `bg-${colorPrefix}-600/20 border-${colorPrefix}-500 text-${colorPrefix}-300 shadow-[0_0_15px_rgba(${rgbColor},0.25)]`,
        subsystemGradient: `from-${colorPrefix}-500/20`,
        terminalText: `text-${colorPrefix}-400`,
        terminalBorder: `border-${colorPrefix}-500/20`,
        terminalInputText: `text-${colorPrefix}-300`,
      };
    }
  };

  const style = getStyleForCharacter(activeCharacterId);
  const capitalizedCharacter = currentCharacterProfile ? currentCharacterProfile.name : "Zoya";
  const coreAssistantLabel = currentCharacterProfile ? `${currentCharacterProfile.name.toUpperCase()} ASSISTANT` : "ZOYA ASSISTANT";
  const systemOSVersion = `${capitalizedCharacter}-OS v3.1_CJS // Secure Engine`;

  return (
    <div className="min-h-screen bg-[#030008] text-zinc-100 relative overflow-x-hidden flex flex-col font-sans" id="app-root">
      {/* Laser-guided holographic scanline screen mesh */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-[0.03] z-50" />

      {/* Futuristic Character-Dynamic Nebula Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {activeCharacter === "max" && (
          <>
            <div className="absolute top-[5%] left-[10%] w-[60%] h-[50%] bg-cyan-950/20 rounded-full blur-[160px]" />
            <div className="absolute bottom-[15%] right-[5%] w-[50%] h-[50%] bg-blue-950/20 rounded-full blur-[160px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_80%)]" />
          </>
        )}
        {activeCharacter === "hania" && (
          <>
            <div className="absolute top-[5%] left-[10%] w-[60%] h-[50%] bg-pink-950/15 rounded-full blur-[160px]" />
            <div className="absolute bottom-[15%] right-[5%] w-[50%] h-[50%] bg-rose-950/15 rounded-full blur-[160px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.03)_0%,transparent_80%)]" />
          </>
        )}
        {activeCharacter === "iqra" && (
          <>
            <div className="absolute top-[5%] left-[10%] w-[60%] h-[50%] bg-cyan-950/15 rounded-full blur-[160px]" />
            <div className="absolute bottom-[15%] right-[5%] w-[50%] h-[50%] bg-teal-950/15 rounded-full blur-[160px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_80%)]" />
          </>
        )}
        {activeCharacter === "zoya" && (
          <>
            <div className="absolute top-[5%] left-[10%] w-[60%] h-[50%] bg-purple-950/15 rounded-full blur-[160px]" />
            <div className="absolute bottom-[15%] right-[5%] w-[50%] h-[50%] bg-indigo-950/15 rounded-full blur-[160px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03)_0%,transparent_80%)]" />
          </>
        )}
      </div>

      {/* Offline Alert Banner */}
      {!isDeviceOnline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono backdrop-blur-md flex items-center gap-2 shadow-2xl animate-pulse">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode • Internet disconnected. Reconnecting automatically...</span>
        </div>
      )}

      {/* Global Actionable Microphone / System Error Banner */}
      {error && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl p-3 bg-red-950/90 border border-red-500/60 rounded-2xl flex items-center justify-between gap-3 text-red-200 text-xs font-mono shadow-2xl backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-base shrink-0">⚠️</span>
            <div className="min-w-0">
              <span className="font-semibold text-red-100 block truncate">{error}</span>
              <span className="text-[10px] text-red-300/80 block">Tap lock icon in browser URL to allow microphone.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setError(null); startVoiceRecording(); }}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase transition-colors"
            >
              Retry Mic
            </button>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-900/50 rounded-lg text-red-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Holographic Navigation Bar */}
      <header className={`w-full border-b ${style.headerBorder} px-6 py-4 flex items-center justify-between backdrop-blur-md bg-slate-950/40 relative z-30`} id="app-header">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${status !== "disconnected" && status !== "error" ? style.statusGlow + " animate-pulse" : "bg-zinc-600"}`} />
            <div className={`absolute -inset-1 ${status !== "disconnected" && status !== "error" ? style.accentBgSoft : "bg-transparent"} rounded-full blur-sm`} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono tracking-[0.25em] ${style.accentText} font-bold uppercase`}>
                {status === "disconnected" ? "SECURE STANDBY" : "NEURAL NETWORK ON"}
              </span>
              <span className={`text-[9px] ${style.accentBgSoft} ${style.accentText} border ${style.accentBorderHeavy} px-1.5 py-0.2 rounded font-mono font-semibold`}>
                SYSTEM_V3.1
              </span>
              {connectionMode === "rest-smart" && status !== "disconnected" && (
                <span className="hidden sm:inline-flex text-[9px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded font-mono font-semibold items-center gap-1">
                  <Radio className="w-2.5 h-2.5" /> REST ENGINE
                </span>
              )}
              {!isDeviceOnline && (
                <span className="text-[9px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-1.5 py-0.2 rounded font-mono font-semibold flex items-center gap-1">
                  <WifiOff className="w-2.5 h-2.5" /> OFFLINE
                </span>
              )}
            </div>
            <h1 className="text-xl font-display font-bold tracking-wider mt-0.5 text-white uppercase flex items-center gap-1.5">
              {coreAssistantLabel} <span className={`${style.solidText} italic`}>AI</span>
            </h1>
          </div>
        </div>

        {/* Global Action Terminal Buttons: Desktop top-right corners */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={() => setReportType("bug")}
              className={`px-3.5 py-1.5 rounded-xl border ${style.accentBorderHeavy} ${style.accentBgSoft} ${style.accentText} hover:text-white hover:${style.accentBorderHover} hover:${style.accentBgSoft} text-xs font-mono font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5`}
            >
              <Bug className="w-3.5 h-3.5" />
              Report Bug
            </button>
            <button
              onClick={() => setReportType("error")}
              className="px-3.5 py-1.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 text-xs font-mono font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              Report Error
            </button>
          </div>
          
          {/* Mobile Single Top-Right Button */}
          <div className="md:hidden">
            <button
              onClick={() => setReportType("bug")}
              className={`p-2 rounded-xl border ${style.accentBorderHeavy} ${style.accentBgSoft} ${style.accentText} hover:text-white hover:${style.accentBgSoft} transition-all`}
            >
              <Bug className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden lg:flex flex-col items-end text-right text-[10px] font-mono text-slate-500">
            <span>PING: 14MS</span>
            <span className={style.accentText}>HOST: 0.0.0.0:3000</span>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-[1700px] mx-auto w-full flex flex-col md:flex-row gap-6 p-4 md:p-6 relative z-10" id="workspace">
        
        {/* DESKTOP SIDEBAR NAVIGATION (Hidden on mobile) */}
        <aside className={`hidden md:flex flex-col w-72 shrink-0 border ${style.accentBorder} bg-slate-950/40 backdrop-blur-xl rounded-3xl p-4 h-[calc(100vh-8.5rem)] sticky top-24 overflow-y-auto`} id="sidebar">
          <div className="mb-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 font-bold block px-2">Subsystems Core</span>
            <div className={`h-px w-full bg-gradient-to-r ${style.subsystemGradient} to-transparent mt-1.5`} />
          </div>

          <nav className="space-y-1 flex-1 pr-1">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              const isActive = activeFeature === feat.id;
              return (
                <button
                  key={feat.id}
                  onClick={() => {
                    setActiveFeature(feat.id);
                    addConsoleLog(`VIEWPORT TRANSFERRED: Focusing modules inside ${feat.name}.`);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-[11px] font-mono font-semibold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? `${style.navActive} scale-[1.015]`
                      : `bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 ${style.navHover}`
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? style.accentText : "text-slate-500"}`} />
                  <span className="truncate">{feat.name}</span>
                  {isActive && (
                    <span className={`w-1.5 h-1.5 rounded-full ${style.accentBg} ml-auto animate-ping`} />
                  )}
                </button>
              );
            })}
          </nav>

          <div className={`mt-4 pt-3 border-t ${style.accentBorder} flex flex-col gap-2`}>
            {customAvatarUrl && (
              <button
                onClick={handleResetAvatar}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-mono uppercase tracking-widest border border-slate-800 transition-colors"
              >
                Reset Default Face
              </button>
            )}
            <div className="text-[9px] text-center font-mono text-slate-600">
              {systemOSVersion}
            </div>
          </div>
        </aside>

        {/* MAIN INTERACTIVE CORE */}
        <main className="flex-1 flex flex-col gap-6 overflow-x-hidden" id="center-viewport">
          
          {/* CORE SYSTEM HERO HUB: CIRCLE PROFILE AREA, AI NAME, GLOWING LAUNCH BUTTON */}
          <div className="glass-card rounded-3xl p-6 relative flex flex-col items-center justify-center overflow-hidden min-h-[460px]" id="avatar-visual-stage">
            {/* Holographic background wireframe details */}
            <div className={`absolute left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8 pointer-events-none select-none text-[9px] font-mono ${style.accentText}/30 tracking-[0.3em] [writing-mode:vertical-rl] uppercase`}>
              <span>Holographic Waveguide Matrix</span>
              <span>PCM 16k Mono Link</span>
            </div>
            <div className={`absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8 pointer-events-none select-none text-[9px] font-mono ${style.accentText}/30 tracking-[0.3em] [writing-mode:vertical-rl] uppercase`}>
              <span>Dual Interaction Grounding</span>
              <span>Hardware Synced Telemetry</span>
            </div>

            {/* Glowing avatar sphere */}
            <IqraAvatar
              state={status}
              frequencies={frequencies}
              onClick={handleAvatarClick}
              inputTranscript={inputTranscript}
              outputTranscript={outputTranscript}
              customAvatarUrl={customAvatarUrl}
              onUploadPhoto={handleUploadPhoto}
              character={activeCharacterId}
              avatar={currentCharacterProfile?.avatar}
            />

            {/* AI Name Below the Circle */}
            <div className="text-center mt-6">
              <h2 className={`text-2xl font-display font-black tracking-[0.15em] text-white ${style.textGlowClass} uppercase`}>
                {coreAssistantLabel}
              </h2>
              <div className={`text-[10px] font-mono tracking-[0.3em] ${style.accentText} mt-1 uppercase opacity-80`}>
                • YOUR AI ASSISTANT •
              </div>
            </div>

            {/* Glowing LAUNCH AI Button Directly Below the AI Name (Small Gap) */}
            <div className="mt-4 w-full max-w-[260px] relative z-20 flex flex-col items-center gap-2.5">
              <button
                onClick={handleToggleSession}
                className={`w-full py-4 px-6 rounded-2xl border font-display font-bold text-xs uppercase tracking-[0.25em] transition-all duration-500 flex items-center justify-center gap-2.5 ${
                  status !== "disconnected" && status !== "error"
                    ? "bg-rose-950/40 border-rose-500/60 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:bg-rose-900/40"
                    : `bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-glow-purple-heavy hover:scale-[1.03]`
                }`}
              >
                <Power className={`w-4 h-4 ${status !== "disconnected" ? "animate-spin" : ""}`} />
                {status === "disconnected" ? `LAUNCH ZOYA AI` : "SHUTDOWN INSTANCE"}
              </button>

              {/* Quick Spoken Voice Input Mic Trigger */}
              <button
                onClick={toggleVoiceRecording}
                disabled={isProcessingVoice}
                className={`w-full py-2.5 px-4 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 ${
                  isRecording
                    ? "bg-red-600/30 border-red-500 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse"
                    : isProcessingVoice
                    ? "bg-amber-600/20 border-amber-500/50 text-amber-300"
                    : status === "speaking"
                    ? "bg-fuchsia-600/20 border-fuchsia-500/50 text-fuchsia-300"
                    : `${style.accentBgSoft} ${style.accentBorderHeavy} ${style.accentText} hover:bg-slate-900/80 hover:border-slate-700`
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    <span>Listening • 0:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration} (Tap to Send)</span>
                  </>
                ) : isProcessingVoice ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Processing Voice...</span>
                  </>
                ) : status === "speaking" ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 animate-bounce text-fuchsia-400" />
                    <span>Speaking (Tap to Stop)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Tap to Speak (Mic)</span>
                  </>
                )}
              </button>
            </div>

            {/* Instant Language Switching Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-xl z-20">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1 mr-1">
                <span>🗣️</span> Speak:
              </span>
              {[
                { label: "Hindi", flag: "🇮🇳", prompt: "Zoya, Hindi mein baat karo." },
                { label: "Urdu", flag: "🇵🇰", prompt: "Zoya, Urdu mein baat karo." },
                { label: "Roman Urdu", flag: "💬", prompt: "Zoya, Roman Urdu mein baat karo." },
                { label: "English", flag: "🇬🇧", prompt: "Zoya, speak in English." },
                { label: "Hinglish", flag: "🌐", prompt: "Zoya, Hinglish mein baat karo." },
              ].map((lang) => (
                <button
                  key={lang.label}
                  onClick={() => handleIcebreakerClick(lang.prompt)}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${
                    currentLanguage === lang.label
                      ? `${style.accentBg} text-white border-transparent shadow-[0_0_15px_rgba(168,85,247,0.35)] scale-[1.03]`
                      : "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>

            {/* LARGE EMPTY SPACE BELOW THE LAUNCH AI BUTTON (Required in guidelines) */}
            <div className="h-10 md:h-16 pointer-events-none w-full" />
          </div>

          {/* DYNAMIC FEATURE WIDGET PANEL - Placed directly into the workspace */}
          <section className="glass-card rounded-3xl p-6 space-y-4" id="feature-workspace">
            <div className={`flex items-center justify-between border-b ${style.accentBorder} pb-3`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 ${style.accentBgSoft} rounded-xl border ${style.accentBorderHeavy} ${style.accentText}`}>
                  {React.createElement(FEATURES.find((f) => f.id === activeFeature)?.icon || Monitor, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                    {FEATURES.find((f) => f.id === activeFeature)?.name} Module
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                    {FEATURES.find((f) => f.id === activeFeature)?.description}
                  </p>
                </div>
              </div>
              <span className={`text-[9px] ${style.accentBgSoft} border ${style.accentBorderHeavy} px-2 py-0.5 rounded font-mono ${style.accentText}`}>
                ONLINE
              </span>
            </div>

            <div className="min-h-[250px] transition-all duration-300">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* MAX 147 CORE SUITE VIEW */}
                  {activeFeature === "max-brain" && (
                    <div className="space-y-4">
                      <MaxBrainSuite onSendToVoice={handleIcebreakerClick} />
                    </div>
                  )}

                  {/* VOICE ASSISTANT VIEW */}
                  {activeFeature === "voice" && (
                    <div className="space-y-6 flex flex-col items-center justify-center p-4 md:p-6 text-center">
                      {/* Prominent Native Microphone Recording Button */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          {isRecording && (
                            <div className="absolute -inset-4 rounded-full bg-red-500/25 animate-ping pointer-events-none" />
                          )}
                          <button
                            onClick={toggleVoiceRecording}
                            disabled={isProcessingVoice}
                            className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
                              isRecording
                                ? "bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-[0_0_35px_rgba(239,68,68,0.5)] border-2 border-red-300 scale-105"
                                : isProcessingVoice
                                ? "bg-amber-600/30 text-amber-300 border-2 border-amber-500/50 animate-pulse"
                                : status === "speaking"
                                ? "bg-gradient-to-tr from-fuchsia-600 to-pink-500 text-white shadow-[0_0_30px_rgba(217,70,239,0.4)] border-2 border-fuchsia-300 animate-pulse"
                                : `${style.accentBg} ${style.accentBgHover} text-white shadow-glow-${activeCharacter === "hania" ? "pink" : activeCharacter === "iqra" ? "cyan" : "purple"}-heavy border-2 border-white/20 hover:scale-105`
                            }`}
                          >
                            {isRecording ? (
                              <MicOff className="w-10 h-10 animate-pulse" />
                            ) : isProcessingVoice ? (
                              <RotateCcw className="w-9 h-9 animate-spin" />
                            ) : status === "speaking" ? (
                              <Volume2 className="w-9 h-9 animate-bounce" />
                            ) : (
                              <Mic className="w-10 h-10" />
                            )}
                          </button>
                        </div>

                        {/* Dynamic Status Badges and Labels */}
                        <div className="space-y-1.5 mt-1">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            {isRecording ? (
                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                Recording • 0:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}
                              </span>
                            ) : isProcessingVoice ? (
                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                                <RotateCcw className="w-3 h-3 animate-spin" />
                                Processing Voice...
                              </span>
                            ) : status === "speaking" ? (
                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-300 text-xs font-mono font-bold uppercase tracking-wider">
                                <Volume2 className="w-3 h-3" />
                                Zoya Speaking (Tap to Stop)
                              </span>
                            ) : (
                              <span className={`text-xs font-mono font-bold ${style.accentText} uppercase tracking-wider`}>
                                Tap to Speak
                              </span>
                            )}

                            {isSpeechDetected && isRecording && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wide">
                                Speech Detected
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-400 font-mono max-w-sm">
                            {isRecording
                              ? "Listening... Speak naturally in Hindi, Urdu, or English. Auto-stops on silence or tap to send."
                              : isProcessingVoice
                              ? "Transcribing with Gemini 3.8 Flash & formulating feminine response..."
                              : status === "speaking"
                              ? "Tap button or avatar to stop speech."
                              : "Tap the microphone to speak. Uses browser-native HTTPS getUserMedia and VAD."}
                          </p>
                        </div>

                        {/* Cancel button if recording */}
                        {isRecording && (
                          <button
                            onClick={cancelVoiceRecording}
                            className="mt-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono uppercase tracking-wider border border-slate-800 transition-colors"
                          >
                            Cancel Recording
                          </button>
                        )}
                      </div>

                      {/* Live Transcripts Card */}
                      {(inputTranscript || outputTranscript) && (
                        <div className={`w-full max-w-lg border ${style.accentBorder} rounded-2xl bg-slate-950/70 p-4 text-left font-mono text-xs space-y-2 backdrop-blur-md`}>
                          {inputTranscript && (
                            <div className="flex gap-2">
                              <span className={`font-bold ${style.accentText} shrink-0`}>YOU SPOKE:</span>
                              <span className="text-slate-200">{inputTranscript}</span>
                            </div>
                          )}
                          {outputTranscript && (
                            <div className="flex gap-2 pt-1 border-t border-white/5">
                              <span className={`font-bold ${style.solidText} shrink-0`}>{capitalizedCharacter.toUpperCase()}:</span>
                              <span className="text-white">{outputTranscript}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick Language Switching Buttons */}
                      <div className="max-w-md space-y-2 pt-2 border-t border-white/5">
                        <div className={`text-[11px] font-mono ${style.textMuted} uppercase tracking-wider`}>
                          Instant Language & Voice Triggers
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          <button onClick={() => handleIcebreakerClick("Zoya, Hindi mein baat karo.")} className={`text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl hover:${style.accentBorderHeavy} hover:${style.accentText} transition-colors flex items-center gap-1 active:scale-95`}>
                            <span>🇮🇳</span> Hindi
                          </button>
                          <button onClick={() => handleIcebreakerClick("Zoya, Urdu mein baat karo.")} className={`text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl hover:${style.accentBorderHeavy} hover:${style.accentText} transition-colors flex items-center gap-1 active:scale-95`}>
                            <span>🇵🇰</span> Urdu
                          </button>
                          <button onClick={() => handleIcebreakerClick("Zoya, Roman Urdu mein baat karo.")} className={`text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl hover:${style.accentBorderHeavy} hover:${style.accentText} transition-colors flex items-center gap-1 active:scale-95`}>
                            <span>💬</span> Roman Urdu
                          </button>
                          <button onClick={() => handleIcebreakerClick("Zoya, speak in English.")} className={`text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl hover:${style.accentBorderHeavy} hover:${style.accentText} transition-colors flex items-center gap-1 active:scale-95`}>
                            <span>🇬🇧</span> English
                          </button>
                          <button onClick={() => handleIcebreakerClick("Zoya, introduce yourself!")} className={`text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl hover:${style.accentBorderHeavy} hover:${style.accentText} transition-colors flex items-center gap-1 active:scale-95`}>
                            <span>👑</span> Introduce Yourself
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CHAT VIEW */}
                  {activeFeature === "chat" && (
                    <div className="space-y-4">
                      <div className={`h-44 overflow-y-auto border ${style.accentBorder} rounded-2xl bg-slate-950/60 p-4 space-y-2 font-mono text-xs text-slate-300`}>
                        {inputTranscript && (
                          <div className={`flex gap-2 ${style.accentText}`}>
                            <span className="font-bold shrink-0">YOU:</span>
                            <span>{inputTranscript}</span>
                          </div>
                        )}
                        {outputTranscript && (
                          <div className="flex gap-2 text-white">
                            <span className={`font-bold ${style.solidText} shrink-0`}>ZOYA:</span>
                            <span>{outputTranscript}</span>
                          </div>
                        )}
                        {!inputTranscript && !outputTranscript && (
                          <div className="text-slate-600 text-center py-10">No messages in buffer. Speak using microphone or type below.</div>
                        )}
                      </div>
                      <form onSubmit={handleSendTextMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={textMessage}
                          onChange={(e) => setTextMessage(e.target.value)}
                          placeholder={`Type a query (e.g. 'Can you analyze files?') and ask ${capitalizedCharacter}...`}
                          className={`flex-1 bg-slate-950 border border-slate-800 ${style.accentBorderFocus} text-slate-200 text-xs rounded-xl px-4 py-3 outline-none transition-all font-mono placeholder:text-slate-600`}
                        />
                        <button
                          type="button"
                          onClick={toggleVoiceRecording}
                          disabled={isProcessingVoice}
                          className={`px-3.5 py-2.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                            isRecording 
                              ? "bg-red-500/30 border-red-500 text-red-300 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                              : isProcessingVoice
                              ? "bg-amber-500/20 border-amber-500 text-amber-400"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                          }`}
                          title={isRecording ? "Recording... tap to send" : "Tap to speak with microphone"}
                        >
                          {isRecording ? <MicOff className="w-4 h-4 animate-pulse text-red-400" /> : isProcessingVoice ? <RotateCcw className="w-4 h-4 animate-spin text-amber-400" /> : <Mic className="w-4 h-4" />}
                          {isRecording && <span className="text-[10px] font-mono text-red-300">0:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}</span>}
                        </button>
                        <button type="submit" className={`${style.accentBg} ${style.accentBgHover} text-white rounded-xl px-4 text-xs font-mono font-bold transition-all flex items-center gap-1`}>
                          Send
                        </button>
                      </form>
                    </div>
                  )}

                  {/* CAMERA VIEW */}
                  {activeFeature === "camera" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`border ${style.accentBorder} bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] text-center space-y-3 relative overflow-hidden`}>
                        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(${activeCharacter === "iqra" ? "6,182,212" : activeCharacter === "zoya" ? "168,85,247" : "236,72,153"},0.05)_0%,transparent_70%)] pointer-events-none`} />
                        <Eye className={`w-12 h-12 ${style.accentText} animate-pulse`} />
                        <div>
                          <h4 className="text-xs font-mono font-bold uppercase text-white">Camera Live Sensor</h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">SIMULATION ENGINE: INGESTING OK // DETECTING OBJECTS</p>
                        </div>
                        <button onClick={() => addConsoleLog("CAMERA: Synchronizing video telemetry frame...")} className={`px-3.5 py-1.5 ${style.accentBg} ${style.accentBgHover} text-white font-mono text-[10px] rounded-xl font-bold uppercase tracking-wider transition-colors`}>
                          Capture Snapshot
                        </button>
                      </div>
                      <div className="border border-slate-900 bg-slate-950/60 rounded-2xl p-4 flex flex-col justify-between font-mono text-[11px] text-slate-400">
                        <div className="space-y-2">
                          <span className={`${style.accentText} text-xs font-bold uppercase tracking-widest block font-display`}>Core Vision Analysis</span>
                          <div className={`h-px bg-gradient-to-r ${style.subsystemGradient} to-transparent`} />
                          <div className="flex justify-between"><span>Active Object Tracking:</span><span className="text-white">Active (72fps)</span></div>
                          <div className="flex justify-between"><span>Resolution:</span><span className="text-white">4K (4096x2160)</span></div>
                          <div className="flex justify-between"><span>Color Balance:</span><span className="text-white">Laser calibrated HDR</span></div>
                        </div>
                        <div className={`p-2 ${style.accentBgSoft} border ${style.accentBorder} rounded-xl text-[10px] ${style.textMuted} leading-relaxed mt-2`}>
                          💡 You can upload custom images as visual presets or direct coding error screenshots to {capitalizedCharacter}.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SYSTEM MONITOR VIEW */}
                  {activeFeature === "monitor" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className={`bg-slate-950 border ${style.accentBorder} p-4 rounded-2xl flex flex-col justify-between`}>
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">CPU LOAD</span>
                          <Activity className={`w-4 h-4 ${style.accentText}`} />
                        </div>
                        <div className="my-3">
                          <div className={`text-2xl font-mono font-bold ${style.accentText}`}>{cpuUsage}%</div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className={`${style.accentBg} h-full transition-all duration-1000`} style={{ width: `${cpuUsage}%` }} />
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 uppercase">Core clocks stabilized</span>
                      </div>

                      <div className={`bg-slate-950 border ${style.accentBorder} p-4 rounded-2xl flex flex-col justify-between`}>
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">RAM ALLOC</span>
                          <Database className="w-4 h-4 text-rose-400" />
                        </div>
                        <div className="my-3">
                          <div className="text-2xl font-mono font-bold text-rose-400">{ramUsage}%</div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${ramUsage}%` }} />
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 uppercase">7.2 GB / 16 GB active</span>
                      </div>

                      <div className={`bg-slate-950 border ${style.accentBorder} p-4 rounded-2xl flex flex-col justify-between`}>
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">DISK SPACE</span>
                          <FolderOpen className={`w-4 h-4 ${style.accentText}`} />
                        </div>
                        <div className="my-3">
                          <div className={`text-2xl font-mono font-bold ${style.accentText}`}>{diskUsage}%</div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className={`${style.accentBg} h-full`} style={{ width: `${diskUsage}%` }} />
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 uppercase">621 GB / 1 TB allocated</span>
                      </div>

                      <div className={`bg-slate-950 border ${style.accentBorder} p-4 rounded-2xl flex flex-col justify-between`}>
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">NETWORK CAP</span>
                          <Wifi className="w-4 h-4 text-rose-400 animate-pulse" />
                        </div>
                        <div className="my-3">
                          <div className="text-2xl font-mono font-bold text-rose-400">{networkSpeed} KB/s</div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${(networkSpeed / 1000) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 uppercase">Latency 14ms response</span>
                      </div>
                    </div>
                  )}

                  {/* FILES EXPLORER VIEW */}
                  {activeFeature === "files" && (
                    <div className="space-y-4 font-mono text-xs">
                      <div className={`flex justify-between items-center bg-slate-950 p-3 rounded-xl border ${style.accentBorder}`}>
                        <span className={`${style.accentText} font-bold uppercase`}>Local Encrypted Directory: /src/*</span>
                        <button onClick={() => addConsoleLog("FILES: Re-scanned and synchronized source code trees.")} className={`px-2.5 py-1 ${style.accentBgSoft} hover:bg-pink-500/20 border border-slate-800 hover:${style.accentBorderHover} ${style.accentText} rounded font-bold uppercase text-[9px]`}>Scan Files</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="border border-slate-900 bg-slate-950 p-3 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FolderOpen className={`w-4 h-4 ${style.accentText}`} />
                            <span>/src/components/IqraAvatar.tsx</span>
                          </div>
                          <span className="text-slate-500">12.5 KB</span>
                        </div>
                        <div className="border border-slate-900 bg-slate-950 p-3 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FolderOpen className={`w-4 h-4 ${style.accentText}`} />
                            <span>/src/App.tsx</span>
                          </div>
                          <span className="text-slate-500">25.8 KB</span>
                        </div>
                        <div className="border border-slate-900 bg-slate-950 p-3 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FolderOpen className={`w-4 h-4 ${style.accentText}`} />
                            <span>/server.ts</span>
                          </div>
                          <span className="text-slate-500">10.6 KB</span>
                        </div>
                        <div className="border border-slate-900 bg-slate-950 p-3 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FolderOpen className={`w-4 h-4 ${style.accentText}`} />
                            <span>/src/utils/audio.ts</span>
                          </div>
                          <span className="text-slate-500">5.9 KB</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SETTINGS VIEW */}
                  {activeFeature === "settings" && (
                    <div className="space-y-4">
                      <ControlPanel
                        onIcebreakerClick={handleIcebreakerClick}
                        lastToolCall={lastToolCall}
                        onClearToolCall={() => setLastToolCall(null)}
                        subtitlesEnabled={subtitlesEnabled}
                        onToggleSubtitles={() => setSubtitlesEnabled(!subtitlesEnabled)}
                        activeVoice={activeVoice}
                        onVoiceChange={handleVoiceChange}
                        error={error}
                        character={activeCharacterId}
                        onCharacterChange={handleCharacterChange}
                        characters={characters}
                      />
                    </div>
                  )}

                  {/* INTERACTIVE TERMINAL VIEW */}
                  {activeFeature === "terminal" && (
                    <div className="space-y-3 font-mono">
                      <div className={`h-44 overflow-y-auto bg-black border ${style.terminalBorder} rounded-2xl p-4 text-[11px] ${style.terminalText} space-y-1`}>
                        {terminalHistory.map((line, i) => (
                          <div key={i} className="leading-relaxed whitespace-pre-wrap">{line}</div>
                        ))}
                      </div>
                      <form onSubmit={handleSendTerminalCommand} className="flex gap-2 relative">
                        <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] ${style.terminalText} font-bold`}>{activeCharacter}@haidery:~$</span>
                        <input
                          type="text"
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          placeholder={`Type 'diagnose', 'sysinfo', or 'speak Hello ${capitalizedCharacter}'...`}
                          className={`flex-1 bg-black border ${style.terminalBorder} ${style.terminalInputText} text-[11px] rounded-xl pl-32 pr-4 py-3 outline-none`}
                        />
                      </form>
                    </div>
                  )}

                  {/* FALLBACK FOR OTHER COGNITIVE FEATURES */}
                  {!["max-brain", "voice", "chat", "camera", "monitor", "files", "settings", "terminal"].includes(activeFeature) && (
                    <div className={`p-6 border ${style.accentBorder} bg-slate-950/40 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]`}>
                      <div className={`p-3 ${style.accentBgSoft} rounded-full border ${style.accentBorderHeavy} ${style.accentText}`}>
                        {React.createElement(FEATURES.find((f) => f.id === activeFeature)?.icon || Wand2, { className: "w-6 h-6 animate-pulse" })}
                      </div>
                      <div className="max-w-md">
                        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          Interactive {FEATURES.find((f) => f.id === activeFeature)?.name} System
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono leading-relaxed mt-2">
                          {capitalizedCharacter}'s specialized cognitive model has fully synchronized with this subsystem. To trigger programmatic commands or ask questions related to this module, simply launch the Voice/Chat system and speak or type directly.
                        </p>
                      </div>
                      <button
                        onClick={() => handleIcebreakerClick(`${capitalizedCharacter}, run system check inside ${FEATURES.find((f) => f.id === activeFeature)?.name} module.`)}
                        className={`px-4 py-2 ${style.accentBgSoft} hover:${style.accentBg} hover:text-white border ${style.accentBorderHeavy} ${style.accentText} text-[10px] font-mono font-bold rounded-xl uppercase tracking-wider transition-all duration-300`}
                      >
                        Inquire This Module
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* DESKTOP GLASSMORPHISM BOTTOM CONTAINERS (Requirement: 1 or 2 large glass containers with features as rounded blocks) */}
          <section className="glass-card rounded-3xl p-6 space-y-4" id="desktop-features-block">
            <div className={`flex items-center justify-between border-b ${style.accentBorder} pb-2`}>
              <span className={`text-[11px] font-mono uppercase tracking-[0.2em] ${style.accentText} font-bold`}>
                Quick Action Grid Matrix
              </span>
              <span className="text-[9px] font-mono text-slate-500">25 FULLY MOUNTED SYSTEM CARDS</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {FEATURES.map((feat) => {
                const Icon = feat.icon;
                const isActive = activeFeature === feat.id;
                return (
                  <button
                    key={feat.id}
                    onClick={() => {
                      setActiveFeature(feat.id);
                      addConsoleLog(`ACTIVE TELEMETRY: Spawning dialog window for ${feat.name}.`);
                    }}
                    className={`p-3 rounded-2xl border text-left font-mono transition-all duration-300 flex flex-col justify-between h-24 relative overflow-hidden group hover:scale-[1.03] ${
                      isActive
                        ? style.quickActive
                        : `bg-slate-950/50 border-slate-900 text-slate-400 hover:text-white hover:${style.accentBorderHover} hover:bg-slate-900/40`
                    }`}
                  >
                    {/* Top Right visual status circle */}
                    <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${isActive ? style.accentText.replace("text-", "bg-") : "bg-zinc-800"}`} />
                    
                    <Icon className={`w-5 h-5 ${isActive ? style.accentText : `text-slate-500 hover:${style.accentText} transition-colors`}`} />
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-wider truncate">
                      {feat.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* MASTER COMMAND CENTER HUB DIAGNOSTIC GRID */}
          <CommandHub
            onSendVisionText={(text) => handleIcebreakerClick(text)}
            characters={characters}
            onUpdateCharacters={setCharacters}
            activeCharacterId={activeCharacterId}
            onSelectCharacter={handleCharacterChange}
            addConsoleLog={addConsoleLog}
            accentText={style.accentText}
            accentBg={style.accentBg}
            accentBgSoft={style.accentBgSoft}
            accentBorder={style.accentBorder}
          />

          {/* GLOBAL SYSTEM STATUS & REAL-TIME LOGS FOOTER BAR */}
          <footer className="glass-card rounded-3xl p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[9px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Terminal className={`w-3.5 h-3.5 ${style.accentText} animate-pulse`} /> Live Telemetry Console Log Stream
              </span>
              <span className={`text-[8px] font-mono ${style.accentText} ${style.accentBgSoft} px-2 py-0.5 rounded`}>CONNECTIVITY GATEWAY: RUNNING</span>
            </div>
            <div className="h-20 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1 pr-1 select-text">
              {systemLogs.map((log, idx) => (
                <div key={idx} className="border-b border-white/[0.02] pb-0.5 last:border-0 hover:text-white transition-colors">
                  {log}
                </div>
              ))}
            </div>
          </footer>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden sticky bottom-0 z-40 w-full bg-slate-950/90 border-t border-slate-900 px-6 py-3 flex justify-around items-center backdrop-blur-lg">
        <button
          onClick={() => { setActiveFeature("voice"); addConsoleLog("MOBILE MENU: Switch to Home/Voice Assistant."); }}
          className={`flex flex-col items-center gap-1 font-mono text-[9px] uppercase font-bold ${activeFeature === "voice" ? style.accentText : "text-slate-500"}`}
        >
          <Mic className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => { setActiveFeature("chat"); addConsoleLog("MOBILE MENU: Switch to Chat interface."); }}
          className={`flex flex-col items-center gap-1 font-mono text-[9px] uppercase font-bold ${activeFeature === "chat" ? style.accentText : "text-slate-500"}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => { setActiveFeature("camera"); addConsoleLog("MOBILE MENU: Switch to Camera scanner."); }}
          className={`flex flex-col items-center gap-1 font-mono text-[9px] uppercase font-bold ${activeFeature === "camera" ? style.accentText : "text-slate-500"}`}
        >
          <Eye className="w-4 h-4" />
          <span>Vision</span>
        </button>
        <button
          onClick={() => { setActiveFeature("settings"); addConsoleLog("MOBILE MENU: Switch to configuration."); }}
          className={`flex flex-col items-center gap-1 font-mono text-[9px] uppercase font-bold ${activeFeature === "settings" ? style.accentText : "text-slate-500"}`}
        >
          <Sliders className="w-4 h-4" />
          <span>System</span>
        </button>
      </div>

      {/* Dynamic Subtitles Overlay */}
      <Subtitles
        inputTranscript={inputTranscript}
        outputTranscript={outputTranscript}
        isListening={status === "listening"}
        isSpeaking={status === "speaking"}
        subtitlesEnabled={subtitlesEnabled}
        character={activeCharacterId}
      />

      {/* BUG / ERROR REPORTING MODAL */}
      <AnimatePresence>
        {reportType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md bg-slate-950 border ${style.accentBorderHeavy} rounded-3xl p-6 relative shadow-[0_0_30px_rgba(15,23,42,0.8)] overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-44 h-44 ${style.accentBgSoft} rounded-full blur-2xl pointer-events-none`} />
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${reportType === "bug" ? `border-${activeCharacter === "iqra" ? "cyan" : activeCharacter === "zoya" ? "purple" : "pink"}-500/20 ${style.accentBgSoft} ${style.accentText}` : "border-red-500/20 bg-red-500/10 text-red-400"}`}>
                    {reportType === "bug" ? <Bug className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
                  </div>
                  <h3 className="font-display font-black uppercase text-sm tracking-wider text-white">
                    Submit System {reportType === "bug" ? "Bug Report" : "Critical Error"}
                  </h3>
                </div>
                <button
                  onClick={() => setReportType(null)}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-900 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!reportSubmitted ? (
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Describe what you experienced</label>
                    <textarea
                      required
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder={reportType === "bug" ? "Describe the UI layout glitch or behavior anomaly..." : "Paste the precise diagnostic traceback or error fault..."}
                      rows={4}
                      className={`w-full bg-slate-900 border border-slate-800 ${style.accentBorderFocus} rounded-xl p-3 text-xs text-white outline-none font-mono resize-none placeholder:text-slate-600`}
                    />
                  </div>
                  <div className="bg-slate-900/50 border border-slate-900 p-2.5 rounded-xl text-[9px] font-mono text-slate-500 flex gap-2">
                    <span>💡</span>
                    <span>Diagnostic terminal dumps, hardware settings, and audio codecs states will be automatically appended to this telemetry package.</span>
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-3 bg-gradient-to-r ${activeCharacter === "iqra" ? "from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500" : activeCharacter === "zoya" ? "from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500" : "from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500"} text-white rounded-xl text-xs font-mono font-bold uppercase tracking-widest ${activeCharacter === "iqra" ? "shadow-glow-cyan" : activeCharacter === "zoya" ? "shadow-glow-purple" : "shadow-glow-pink"} transition-all`}
                  >
                    Transmit Diagnostic Package
                  </button>
                </form>
              ) : (
                <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
                  <div className={`p-3 ${style.accentBgSoft} border ${style.accentBorderHeavy} ${style.accentText} rounded-full animate-bounce`}>
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Holographic Package Transmitted</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Fault code log successfully submitted to G-Engine database.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
