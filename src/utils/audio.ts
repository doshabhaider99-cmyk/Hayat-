/**
 * Resilient Browser-Native Audio & Microphone Engine for ZOYA
 * Built specifically for Android mobile browsers (Chrome, Edge, Firefox, Samsung Internet) and Vercel.
 * Uses browser-native navigator.mediaDevices.getUserMedia(), MediaRecorder, and Web Audio API.
 * Features:
 * - HTTPS security checks & user-friendly permission error handling
 * - Android-safe AudioContext initialization (no rigid sampleRate constraints that crash mobile)
 * - Real-time Voice Activity Detection (VAD) with automatic silence detection
 * - Real-time acoustic frequency analysis for avatar lip-sync & glowing waveforms
 * - Hardware stream track release so Android mic indicators clear immediately
 */

export interface MicSupportResult {
  supported: boolean;
  isHttps: boolean;
  hasGetUserMedia: boolean;
  hasMediaRecorder: boolean;
  hasAudioContext: boolean;
  error?: string;
}

export function checkMicrophoneSupport(): MicSupportResult {
  const isHttps =
    typeof window !== "undefined" &&
    (window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".run.app"));

  const hasGetUserMedia =
    typeof navigator !== "undefined" &&
    !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function");

  const hasMediaRecorder =
    typeof window !== "undefined" && typeof (window as any).MediaRecorder !== "undefined";

  const hasAudioContext =
    typeof window !== "undefined" &&
    !!(window.AudioContext || (window as any).webkitAudioContext);

  let error: string | undefined;
  if (!isHttps) {
    error = "Microphone access requires a secure connection (HTTPS). Please ensure you are opening this app via https://.";
  } else if (!hasGetUserMedia) {
    error = "Your browser does not support microphone access. Please use Chrome, Edge, Firefox, or Samsung Internet.";
  }

  return {
    supported: isHttps && hasGetUserMedia,
    isHttps,
    hasGetUserMedia,
    hasMediaRecorder,
    hasAudioContext,
    error,
  };
}

export function formatMicError(err: any): string {
  if (!err) return "Microphone access failed. Please try again.";
  const name = err.name || "";
  const msg = err.message || "";

  if (name === "NotAllowedError" || name === "PermissionDeniedError" || msg.includes("Permission denied")) {
    return "Microphone permission was denied. Tap the site settings or lock icon in your browser's address bar, set Microphone to 'Allow', and refresh.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError" || msg.includes("device not found")) {
    return "No microphone was detected on your device. Please connect an audio input device.";
  }
  if (name === "NotReadableError" || name === "TrackStartError" || msg.includes("busy") || msg.includes("could not start")) {
    return "Your microphone is currently in use by another app (e.g. phone call, recording app, or camera). Please close other audio apps and try again.";
  }
  if (name === "OverconstrainedError") {
    return "Requested microphone constraints could not be satisfied by your device's audio hardware.";
  }
  if (name === "SecurityError") {
    return "Microphone access is blocked by browser security policy. Please make sure the app is opened via HTTPS.";
  }
  return msg || "Failed to access microphone. Please check your browser audio permissions.";
}

export function getBestSupportedMimeType(): string {
  if (typeof window === "undefined" || typeof (window as any).MediaRecorder === "undefined") {
    return "";
  }
  const MediaRec = (window as any).MediaRecorder;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
    "audio/aac",
    ""
  ];

  for (const candidate of candidates) {
    if (!candidate || MediaRec.isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return "";
}

export interface RecordingResult {
  blob: Blob;
  base64: string;
  mimeType: string;
  durationMs: number;
}

export interface VoiceRecordingOptions {
  onVolume?: (volume: number) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  silenceTimeoutMs?: number; // Silence duration before auto-stopping (default 1800ms)
  minSpeechDurationMs?: number; // Minimum speech time before silence triggers auto-stop (default 700ms)
  maxDurationMs?: number; // Hard cap on recording length (default 30000ms)
}

export class IqraAudioEngine {
  inputCtx: AudioContext | null = null;
  outputCtx: AudioContext | null = null;

  micAnalyser: AnalyserNode | null = null;
  speakerAnalyser: AnalyserNode | null = null;

  micStream: MediaStream | null = null;
  micProcessor: ScriptProcessorNode | null = null;
  micSource: MediaStreamAudioSourceNode | null = null;

  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  recordingStartTime = 0;
  isRecordingActive = false;

  activeSources: AudioBufferSourceNode[] = [];
  nextStartTime = 0;

  onAudioData: ((base64: string) => void) | null = null;

  // VAD & Real-time monitor variables
  private vadInterval: any = null;
  private hasSpeechStarted = false;
  private lastSpeechTimestamp = 0;
  private options: VoiceRecordingOptions | null = null;

  constructor() {}

  /**
   * Browser-native HTTPS recording using MediaRecorder and Web Audio API.
   * Safe for Android Chrome, Edge, and iOS Safari.
   */
  async startRecording(options?: VoiceRecordingOptions): Promise<void> {
    const support = checkMicrophoneSupport();
    if (!support.supported) {
      throw new Error(support.error || "Microphone access is not supported in this environment.");
    }

    this.options = options || {};
    this.recordedChunks = [];
    this.hasSpeechStarted = false;
    this.lastSpeechTimestamp = 0;

    // 1. Request microphone stream with mobile-optimized constraints
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err: any) {
      throw new Error(formatMicError(err));
    }

    // 2. Initialize Web Audio Context for real-time visualizer & VAD
    // Note: Do NOT force { sampleRate: 16000 } on Android mobile, as it throws NotSupportedError
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.inputCtx = new AudioContextClass();
        if (this.inputCtx.state === "suspended") {
          await this.inputCtx.resume();
        }

        this.micAnalyser = this.inputCtx.createAnalyser();
        this.micAnalyser.fftSize = 256;
        this.micAnalyser.smoothingTimeConstant = 0.4;

        this.micSource = this.inputCtx.createMediaStreamSource(this.micStream);
        this.micSource.connect(this.micAnalyser);
      }
    } catch (ctxErr) {
      console.warn("Web Audio Analyser initialization warning (audio recording will proceed):", ctxErr);
    }

    // 3. Initialize MediaRecorder
    const mimeType = getBestSupportedMimeType();
    const recorderOptions: MediaRecorderOptions = {};
    if (mimeType) {
      recorderOptions.mimeType = mimeType;
    }

    try {
      this.mediaRecorder = new MediaRecorder(this.micStream, recorderOptions);
    } catch (recErr) {
      console.warn("MediaRecorder creation with specific mimeType failed, falling back to default:", recErr);
      this.mediaRecorder = new MediaRecorder(this.micStream);
    }

    this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    // Collect data in small 250ms slices for responsive blob compilation
    this.mediaRecorder.start(250);
    this.recordingStartTime = Date.now();
    this.isRecordingActive = true;

    // 4. Start Voice Activity Detection (VAD) loop
    this.startVadMonitor();
  }

  private startVadMonitor() {
    if (this.vadInterval) {
      clearInterval(this.vadInterval);
      this.vadInterval = null;
    }

    const silenceTimeout = this.options?.silenceTimeoutMs ?? 1800;
    const minSpeechDuration = this.options?.minSpeechDurationMs ?? 600;
    const maxDuration = this.options?.maxDurationMs ?? 30000;

    this.vadInterval = setInterval(() => {
      if (!this.isRecordingActive || !this.micAnalyser) return;

      const bufferLength = this.micAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.micAnalyser.getByteFrequencyData(dataArray);

      // Compute average volume level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avgVolume = sum / bufferLength;

      if (this.options?.onVolume) {
        this.options.onVolume(avgVolume);
      }

      const now = Date.now();
      const elapsedTotal = now - this.recordingStartTime;

      // Threshold for human speech activity detection
      const SPEECH_THRESHOLD = 14;

      if (avgVolume > SPEECH_THRESHOLD) {
        if (!this.hasSpeechStarted) {
          this.hasSpeechStarted = true;
          this.options?.onSpeechStart?.();
        }
        this.lastSpeechTimestamp = now;
      }

      // Check if user spoke and has now stopped speaking (VAD silence trigger)
      if (
        this.hasSpeechStarted &&
        now - this.lastSpeechTimestamp > silenceTimeout &&
        elapsedTotal > minSpeechDuration
      ) {
        // User finished speaking!
        this.stopVadMonitor();
        if (this.options?.onSpeechEnd) {
          this.options.onSpeechEnd();
        }
      }

      // Hard safety timeout
      if (elapsedTotal >= maxDuration) {
        this.stopVadMonitor();
        if (this.options?.onSpeechEnd) {
          this.options.onSpeechEnd();
        }
      }
    }, 60);
  }

  private stopVadMonitor() {
    if (this.vadInterval) {
      clearInterval(this.vadInterval);
      this.vadInterval = null;
    }
  }

  /**
   * Stops recording and returns the compiled audio Blob, base64 payload, and duration.
   */
  async stopRecording(): Promise<RecordingResult | null> {
    this.stopVadMonitor();

    if (!this.isRecordingActive && !this.mediaRecorder) {
      return null;
    }

    this.isRecordingActive = false;
    const durationMs = Date.now() - this.recordingStartTime;

    const recorder = this.mediaRecorder;
    const stream = this.micStream;

    return new Promise((resolve) => {
      if (!recorder || recorder.state === "inactive") {
        this.cleanUpMicStreams();
        resolve(null);
        return;
      }

      recorder.onstop = async () => {
        try {
          const finalMime = recorder.mimeType || getBestSupportedMimeType() || "audio/webm";
          const blob = new Blob(this.recordedChunks, { type: finalMime });
          const base64 = await this.blobToBase64(blob);

          this.cleanUpMicStreams();

          resolve({
            blob,
            base64,
            mimeType: finalMime,
            durationMs,
          });
        } catch (err) {
          console.error("Error finalizing recording blob:", err);
          this.cleanUpMicStreams();
          resolve(null);
        }
      };

      try {
        recorder.stop();
      } catch (e) {
        this.cleanUpMicStreams();
        resolve(null);
      }
    });
  }

  private cleanUpMicStreams() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      this.micStream = null;
    }
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch (e) {}
      this.micSource = null;
    }
    if (this.inputCtx && this.inputCtx.state !== "closed") {
      try {
        this.inputCtx.close();
      } catch (e) {}
      this.inputCtx = null;
    }
    this.micAnalyser = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // Strip data url prefix (e.g. "data:audio/webm;base64,")
        const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  isRecording(): boolean {
    return this.isRecordingActive;
  }

  /**
   * Real-time Gemini Live WebSocket PCM streaming method (with Android-safe fallback)
   */
  async startMic(onAudioData: (base64: string) => void) {
    this.onAudioData = onAudioData;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error("Web Audio API not supported");
    }

    // Attempt 16000Hz (required by Gemini Live), fallback to default device rate if mobile browser rejects
    try {
      this.inputCtx = new AudioContextClass({ sampleRate: 16000 });
    } catch (e) {
      console.warn("Fixed 16000Hz AudioContext unsupported on device, using default hardware sampleRate");
      this.inputCtx = new AudioContextClass();
    }

    if (this.inputCtx.state === "suspended") {
      await this.inputCtx.resume();
    }

    this.micAnalyser = this.inputCtx.createAnalyser();
    this.micAnalyser.fftSize = 256;

    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.micSource = this.inputCtx.createMediaStreamSource(this.micStream);

    // ScriptProcessor for PCM collection
    this.micProcessor = this.inputCtx.createScriptProcessor(4096, 1, 1);
    this.micProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBuffer = this.floatTo16BitPCM(inputData);
      const base64 = this.arrayBufferToBase64(pcmBuffer);
      if (this.onAudioData) {
        this.onAudioData(base64);
      }
    };

    this.micSource.connect(this.micAnalyser);
    this.micAnalyser.connect(this.micProcessor);
    this.micProcessor.connect(this.inputCtx.destination);
  }

  stopMic() {
    this.stopVadMonitor();
    if (this.micProcessor) {
      try {
        this.micProcessor.disconnect();
      } catch (e) {}
      this.micProcessor = null;
    }
    this.cleanUpMicStreams();
  }

  initSpeaker() {
    if (!this.outputCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        try {
          this.outputCtx = new AudioContextClass({ sampleRate: 24000 });
        } catch (e) {
          this.outputCtx = new AudioContextClass();
        }
        this.speakerAnalyser = this.outputCtx.createAnalyser();
        this.speakerAnalyser.fftSize = 256;
        this.speakerAnalyser.connect(this.outputCtx.destination);
      }
    }
    if (this.outputCtx && this.outputCtx.state === "suspended") {
      this.outputCtx.resume();
    }
  }

  playChunk(base64Audio: string) {
    this.initSpeaker();
    if (!this.outputCtx || !this.speakerAnalyser) return;

    try {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const float32 = this.pcmToFloat32(bytes.buffer);
      const sampleRate = this.outputCtx.sampleRate || 24000;
      const buffer = this.outputCtx.createBuffer(1, float32.length, sampleRate);
      buffer.getChannelData(0).set(float32);

      const source = this.outputCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.speakerAnalyser);

      const currentTime = this.outputCtx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime + 0.03;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;

      source.onended = () => {
        this.activeSources = this.activeSources.filter((s) => s !== source);
      };
      this.activeSources.push(source);
    } catch (err) {
      console.warn("Failed to play audio chunk:", err);
    }
  }

  stopAllPlayback() {
    this.activeSources.forEach((s) => {
      try {
        s.stop();
      } catch (e) {}
    });
    this.activeSources = [];
    this.nextStartTime = 0;
  }

  destroy() {
    this.stopRecording();
    this.stopMic();
    this.stopAllPlayback();
    if (this.outputCtx && this.outputCtx.state !== "closed") {
      try {
        this.outputCtx.close();
      } catch (e) {}
      this.outputCtx = null;
    }
    this.speakerAnalyser = null;
  }

  getMicFrequencies(): Uint8Array {
    if (!this.micAnalyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.micAnalyser.frequencyBinCount);
    this.micAnalyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  getSpeakerFrequencies(): Uint8Array {
    if (!this.speakerAnalyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.speakerAnalyser.frequencyBinCount);
    this.speakerAnalyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  // Helpers
  private floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }

  private pcmToFloat32(arrayBuffer: ArrayBuffer): Float32Array {
    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }
    return float32Array;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
