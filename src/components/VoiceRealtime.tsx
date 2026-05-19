import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, PhoneOff, Loader2 } from "lucide-react";

type Phase = "idle" | "connecting" | "listening" | "speaking" | "error";

const TOKEN_URL = "https://dpyokpprfplvmplhvuou.supabase.co/functions/v1/berlinike-realtime-token";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweW9rcHByZnBsdm1wbGh2dW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTQ4NDUsImV4cCI6MjA5MDQzMDg0NX0.k-CzGDH4_hHFrSYr-7cetQZBbWBN2LwURL47BkCXiQ8";
const SESSION_MAX_SEC = 180; // 3 min cost cap

// ── PCM16 helpers ─────────────────────────────────────
function float32ToPCM16Base64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function pcm16Base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;
  return float32;
}

// ── Waveform bars ─────────────────────────────────────
const Waveform = ({ active, color }: { active: boolean; color: string }) => (
  <div className="flex items-center gap-[3px] h-8">
    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
      <div
        key={i}
        className={`w-[3px] rounded-full transition-all ${color}`}
        style={{
          height: active ? `${8 + Math.sin(i) * 12 + (i % 3) * 6}px` : "4px",
          animation: active ? `wave${i % 3} 0.${6 + i}s ease-in-out infinite alternate` : "none",
          animationDelay: `${i * 0.07}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes wave0 { from{height:4px} to{height:24px} }
      @keyframes wave1 { from{height:6px} to{height:20px} }
      @keyframes wave2 { from{height:3px} to{height:28px} }
    `}</style>
  </div>
);

// ── Main component ────────────────────────────────────
interface Props {
  lang: string;
  onTranscript?: (text: string, role: "user" | "assistant") => void;
}

const VoiceRealtime = ({ lang, onTranscript }: Props) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [nikeText, setNikeText] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppingRef = useRef(false);

  const stopAll = useCallback(() => {
    stoppingRef.current = true;
    wsRef.current?.close();
    processorRef.current?.disconnect();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    playbackCtxRef.current?.close();
    if (timerRef.current) clearInterval(timerRef.current);
    wsRef.current = null;
    audioCtxRef.current = null;
    playbackCtxRef.current = null;
    streamRef.current = null;
    processorRef.current = null;
    playbackTimeRef.current = 0;
    stoppingRef.current = false;
    setElapsed(0);
    setTranscript("");
    setNikeText("");
    setPhase("idle");
  }, []);

  // Auto-disconnect at session limit
  useEffect(() => {
    if (elapsed >= SESSION_MAX_SEC) stopAll();
  }, [elapsed, stopAll]);

  const playPCM16 = useCallback((base64: string) => {
    const ctx = playbackCtxRef.current;
    if (!ctx) return;
    const float32 = pcm16Base64ToFloat32(base64);
    if (float32.length === 0) return;
    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    const startAt = Math.max(ctx.currentTime, playbackTimeRef.current);
    src.start(startAt);
    playbackTimeRef.current = startAt + buffer.duration;
  }, []);

  const startSession = useCallback(async () => {
    setPhase("connecting");
    setErrorMsg("");

    try {
      // 1. Get ephemeral token
      const tokenRes = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
      });
      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        throw new Error(err.error || `Token error ${tokenRes.status}`);
      }
      const { client_secret } = await tokenRes.json();
      const token = client_secret?.value;
      if (!token) throw new Error("No token received");

      // 2. Open WebSocket to OpenAI Realtime
      const ws = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
        ["realtime", `openai-insecure-api-key.${token}`, "openai-beta.realtime-v1"]
      );
      wsRef.current = ws;

      // 3. Setup audio capture
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      // 4. Setup playback context
      const playCtx = new AudioContext({ sampleRate: 24000 });
      playbackCtxRef.current = playCtx;
      playbackTimeRef.current = playCtx.currentTime;

      // 5. WebSocket handlers
      ws.onopen = () => {
        // Send audio chunks when recording
        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const pcm = float32ToPCM16Base64(e.inputBuffer.getChannelData(0));
          ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: pcm }));
        };
        source.connect(processor);
        processor.connect(audioCtx.destination);

        setPhase("listening");

        // Start session timer
        timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      };

      ws.onmessage = (e) => {
        const event = JSON.parse(e.data);

        switch (event.type) {
          case "input_audio_buffer.speech_started":
            setPhase("listening");
            setNikeText("");
            // Cancel ongoing playback when user speaks
            playbackTimeRef.current = playCtx.currentTime;
            break;

          case "response.audio_transcript.delta":
            setNikeText(prev => prev + (event.delta || ""));
            setPhase("speaking");
            break;

          case "response.audio_transcript.done":
            if (event.transcript) {
              onTranscript?.(event.transcript, "assistant");
              setNikeText(event.transcript);
            }
            break;

          case "conversation.item.input_audio_transcription.completed":
            if (event.transcript) {
              setTranscript(event.transcript);
              onTranscript?.(event.transcript, "user");
            }
            break;

          case "response.audio.delta":
            if (event.delta) playPCM16(event.delta);
            break;

          case "response.done":
            setPhase("listening");
            break;

          case "error":
            setErrorMsg(event.error?.message || "Unbekannter Fehler");
            setPhase("error");
            break;
        }
      };

      ws.onerror = () => { setErrorMsg("Verbindungsfehler zur Sprachverbindung"); setPhase("error"); };
      ws.onclose = (e) => {
        if (!stoppingRef.current) {
          setErrorMsg(`Verbindung getrennt (Code ${e.code}${e.reason ? ": " + e.reason : ""})`);
          setPhase("error");
          stopAll();
        }
      };

    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setPhase("error");
      stopAll();
    }
  }, [lang, onTranscript, playPCM16, phase, stopAll]);

  const remaining = SESSION_MAX_SEC - elapsed;
  const isActive = phase !== "idle" && phase !== "error";

  return (
    <div className="flex flex-col items-center gap-6 py-4">

      {/* Session timer */}
      {isActive && (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${remaining < 30 ? "bg-red-400 animate-pulse" : "bg-primary animate-pulse"}`} />
          <span className="text-xs font-sans text-foreground/40 tracking-widest">
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")} verbleibend
          </span>
        </div>
      )}

      {/* Live transcripts */}
      <div className="w-full space-y-2 min-h-[3rem]">
        {transcript && (
          <p className="text-right text-xs text-foreground/40 italic px-2">{transcript}</p>
        )}
        {nikeText && (
          <div className="glass px-4 py-3 rounded-none">
            <span className="text-primary/50 text-[10px] tracking-widest uppercase block mb-1 font-sans">BerliNike</span>
            <p className="text-foreground/80 text-sm font-light leading-relaxed">{nikeText}</p>
          </div>
        )}
      </div>

      {/* Central mic button */}
      <div className="relative flex items-center justify-center">
        {/* Pulse rings */}
        {phase === "listening" && (
          <>
            <span className="absolute w-24 h-24 rounded-full border border-primary/25 animate-ping" />
            <span className="absolute w-32 h-32 rounded-full border border-primary/12 animate-ping" style={{ animationDelay: "0.35s" }} />
            <span className="absolute w-40 h-40 rounded-full border border-primary/6 animate-ping" style={{ animationDelay: "0.7s" }} />
          </>
        )}
        {phase === "speaking" && (
          <>
            <span className="absolute w-24 h-24 rounded-full bg-primary/12 animate-pulse" />
            <span className="absolute w-36 h-36 rounded-full bg-primary/5 animate-pulse" style={{ animationDelay: "0.2s" }} />
          </>
        )}

        <button
          onClick={isActive ? stopAll : startSession}
          disabled={phase === "connecting"}
          className={`relative z-10 w-20 h-20 rounded-full glass-strong flex items-center justify-center transition-all duration-300
            ${phase === "idle" || phase === "error" ? "text-primary/50 hover:text-primary hover:scale-105" : ""}
            ${phase === "listening" ? "text-primary scale-105 border-primary/50" : ""}
            ${phase === "speaking" ? "text-primary/80 scale-105" : ""}
            ${phase === "connecting" ? "text-primary/30 cursor-wait" : ""}
          `}
        >
          {phase === "connecting" && <Loader2 size={28} className="animate-spin" />}
          {phase === "listening" && <MicOff size={28} />}
          {phase === "speaking" && <Waveform active color="bg-primary" />}
          {(phase === "idle" || phase === "error") && <Mic size={28} />}
          {isActive && phase !== "speaking" && phase !== "connecting" && <Mic size={28} />}
        </button>
      </div>

      {/* Status label */}
      <div className="text-center space-y-1">
        {phase === "idle" && <p className="text-foreground/25 text-[11px] font-sans tracking-[0.3em] uppercase">Tippen zum Gespräch beginnen</p>}
        {phase === "connecting" && <p className="text-primary/50 text-[11px] font-sans tracking-[0.3em] uppercase animate-pulse">Verbinde mit BerliNike …</p>}
        {phase === "listening" && <p className="text-primary/60 text-[11px] font-sans tracking-[0.3em] uppercase">Sprich jetzt — ich höre zu</p>}
        {phase === "speaking" && <p className="text-primary/80 text-[11px] font-sans tracking-[0.3em] uppercase">BerliNike spricht …</p>}
        {phase === "error" && <p className="text-red-400/70 text-xs font-sans">{errorMsg}</p>}
        {isActive && <p className="text-foreground/20 text-[10px] font-sans">Auflegen zum Beenden</p>}
      </div>

      {isActive && (
        <button onClick={stopAll} className="flex items-center gap-2 text-foreground/25 hover:text-red-400/60 text-xs font-sans tracking-widest uppercase transition-colors">
          <PhoneOff size={12} /> Gespräch beenden
        </button>
      )}

      <p className="text-foreground/15 text-[10px] font-sans tracking-wider text-center">
        OpenAI Realtime · max 3 min · BerliNike.ai
      </p>
    </div>
  );
};

export default VoiceRealtime;
