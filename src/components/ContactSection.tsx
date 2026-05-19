import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Mic, MicOff, MessageSquare } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { trackChatMessage } from "@/lib/gtag";
import VoiceRealtime from "@/components/VoiceRealtime";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Mode = "text" | "voice";
type VoiceState = "idle" | "listening" | "thinking" | "speaking";

const WELCOME: Record<string, string> = {
  de: "Na endlich biste da! Ick hab schon auf dich jewartet, wa? Dit hier ist mein Zuhause — und du bist mein Gast. Also, schreib mir wat — ick hör dir zu. Et voilà.",
  en: "Well, you finally made it! I've been waiting for you. This is my home — and you're my guest. Write me something — I'm all ears. Et voilà.",
  fr: "Te voilà enfin! Je t'attendais, mon ami. Ici c'est chez moi — et tu es mon invité. Écris-moi quelque chose — je t'écoute. Et voilà.",
  ru: "Наконец-то! Я тебя ждала, ва? Это мой дом — ты мой гость. Напиши мне что-нибудь — я слушаю. Et voilà.",
  es: "¡Por fin llegaste! Te estaba esperando. Esta es mi casa — y tú eres mi invitado. Escríbeme algo — te escucho. Et voilà.",
  zh: "你终于来了！我一直在等你呢。这是我的家，你是我的客人。给我写点什么吧。Et voilà。",
  ja: "やっと来てくれたね！待ってたよ。ここは私の家、あなたは私のゲスト。何か書いてみて。Et voilà。",
  pt: "Finalmente chegaste! Estava te esperando. Esta é minha casa — és meu convidado. Escreve-me algo. Et voilà.",
  ar: "أخيراً وصلت! كنت أنتظرك. هذا بيتي وأنت ضيفي. اكتب لي شيئاً. Et voilà.",
  it: "Finalmente sei qui! Ti stavo aspettando. Questa è casa mia — sei il mio ospite. Scrivimi qualcosa. Et voilà.",
};

const VOICE_LABELS: Record<string, Record<string, string>> = {
  idle:      { de: "Tippe zum Sprechen", en: "Tap to speak", fr: "Appuie pour parler", ru: "Нажми чтобы говорить", es: "Toca para hablar", zh: "点击说话", ja: "タップして話す", pt: "Toca para falar", ar: "اضغط للتحدث", it: "Tocca per parlare" },
  listening: { de: "Ich höre zu …", en: "Listening …", fr: "J'écoute …", ru: "Слушаю …", es: "Escuchando …", zh: "正在听 …", ja: "聞いています …", pt: "Ouvindo …", ar: "أستمع …", it: "Sto ascoltando …" },
  thinking:  { de: "Denke nach …", en: "Thinking …", fr: "Je réfléchis …", ru: "Думаю …", es: "Pensando …", zh: "思考中 …", ja: "考えています …", pt: "Pensando …", ar: "أفكر …", it: "Sto pensando …" },
  speaking:  { de: "BerliNike spricht …", en: "BerliNike speaking …", fr: "BerliNike parle …", ru: "BerliNike говорит …", es: "BerliNike habla …", zh: "BerliNike 说话 …", ja: "BerliNikeが話しています …", pt: "BerliNike falando …", ar: "BerliNike تتحدث …", it: "BerliNike parla …" },
};

const LANG_CODES: Record<string, string> = {
  de: "de-DE", en: "en-US", fr: "fr-FR", ru: "ru-RU",
  es: "es-ES", zh: "zh-CN", ja: "ja-JP", pt: "pt-BR", ar: "ar-SA", it: "it-IT",
};

const SUPABASE_URL = "https://dpyokpprfplvmplhvuou.supabase.co/functions/v1/berlinike-chat";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweW9rcHByZnBsdm1wbGh2dW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTQ4NDUsImV4cCI6MjA5MDQzMDg0NX0.k-CzGDH4_hHFrSYr-7cetQZBbWBN2LwURL47BkCXiQ8";

const ChatSection = () => {
  const { t, lang } = useLang();
  const [mode, setMode] = useState<Mode>("text");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesRef = useRef<Message[]>([]);

  messagesRef.current = messages;

  useEffect(() => {
    setMessages([{ role: "assistant", content: WELCOME[lang] || WELCOME.en }]);
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Stop any ongoing speech when mode changes
  useEffect(() => {
    window.speechSynthesis?.cancel();
    recognitionRef.current?.abort();
    setVoiceState("idle");
    setTranscript("");
  }, [mode]);

  const callGrok = useCallback(async (text: string, history: Message[]) => {
    const userMsg: Message = { role: "user", content: text };
    const updated = [...history, userMsg];
    setMessages(updated);
    trackChatMessage(lang);

    try {
      const res = await fetch(SUPABASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
        },
        body: JSON.stringify({ messages: updated }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const reply = data.reply as string;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      return reply;
    } catch {
      const err = "Oje, dit Netz klemmt gerade. Versuch's nochmal, mon ami!";
      setMessages((prev) => [...prev, { role: "assistant", content: err }]);
      return err;
    }
  }, [lang]);

  const speakText = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    setVoiceState("speaking");
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LANG_CODES[lang] || "de-DE";
    utter.rate = 0.88;
    utter.pitch = 1.15;
    utter.volume = 1;

    // Pick best available voice — prefer female
    const voices = window.speechSynthesis.getVoices();
    const langCode = LANG_CODES[lang] || "de-DE";
    const match = voices.find(v => v.lang.startsWith(langCode.split("-")[0]) && v.name.toLowerCase().includes("female"))
      || voices.find(v => v.lang.startsWith(langCode.split("-")[0]))
      || voices.find(v => v.lang === langCode);
    if (match) utter.voice = match;

    utter.onend = () => setVoiceState("idle");
    utter.onerror = () => setVoiceState("idle");
    synthRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [lang]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;

    window.speechSynthesis?.cancel();
    setVoiceState("listening");
    setTranscript("");

    const rec = new SR();
    rec.lang = LANG_CODES[lang] || "de-DE";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (e) => {
      const interim = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(interim);
    };

    rec.onend = async () => {
      const final = transcript || "";
      if (!final.trim()) { setVoiceState("idle"); return; }
      setTranscript("");
      setVoiceState("thinking");
      const reply = await callGrok(final, messagesRef.current);
      speakText(reply);
    };

    rec.onerror = () => setVoiceState("idle");
    recognitionRef.current = rec;
    rec.start();
  }, [lang, transcript, callGrok, speakText]);

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setVoiceState("idle");
  };

  // Text mode send
  const sendText = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setLoading(true);
    await callGrok(text, messagesRef.current);
    setLoading(false);
  };

  const voiceLabel = VOICE_LABELS[voiceState]?.[lang] || VOICE_LABELS[voiceState]?.en || "";

  return (
    <section id="chat" className="py-24 md:py-36 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/4 blur-[80px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-2xl relative z-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px w-8 bg-primary/30" />
          <span className="text-primary text-xs tracking-[0.4em] uppercase font-sans">Parle avec moi</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
        </div>

        <h2 className="text-3xl md:text-4xl font-heading font-light mb-3 text-foreground/90">
          {t("chatTitle")}<br />
          <span className="gold-shimmer">{t("chatSub")}</span>
        </h2>
        <p className="text-foreground/40 text-sm mb-8 font-light">{t("chatHint")}</p>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("text")}
            className={`glass-pill flex items-center gap-2 px-4 py-2 text-xs font-sans tracking-widest uppercase transition-all ${mode === "text" ? "text-primary border-primary/40" : "text-foreground/30 hover:text-foreground/60"}`}
          >
            <MessageSquare size={12} /> Text
          </button>
          <button
            onClick={() => setMode("voice")}
            className={`glass-pill flex items-center gap-2 px-4 py-2 text-xs font-sans tracking-widest uppercase transition-all ${mode === "voice" ? "text-primary border-primary/40" : "text-foreground/30 hover:text-foreground/60"}`}
          >
            <Mic size={12} /> Voice
          </button>
        </div>

        {/* Chat window — shared message history */}
        <div className="glass-strong rounded-none overflow-hidden relative">
          <div className="h-72 overflow-y-auto p-6 space-y-4 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed font-light rounded-none ${
                  msg.role === "assistant"
                    ? "glass text-foreground/80"
                    : "bg-primary/10 border border-primary/20 text-foreground/60"
                }`}>
                  {msg.role === "assistant" && (
                    <span className="text-primary/50 text-[10px] tracking-widest uppercase block mb-1 font-sans">BerliNike</span>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {(loading || voiceState === "thinking") && (
              <div className="flex justify-start">
                <div className="px-4 py-3 glass">
                  <Loader2 size={14} className="text-primary animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* TEXT MODE input */}
          {mode === "text" && (
            <div className="border-t border-primary/15 p-4 flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendText()}
                placeholder={t("placeholder")}
                className="flex-1 bg-transparent text-sm text-foreground/70 placeholder:text-foreground/25 outline-none font-light"
              />
              <button
                onClick={sendText}
                disabled={loading || !input.trim()}
                className="p-2 text-primary hover:text-primary/70 disabled:opacity-30 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          )}

          {/* VOICE MODE — OpenAI Realtime */}
          {mode === "voice" && (
            <div className="border-t border-primary/15 p-6">
              <VoiceRealtime
                lang={lang}
                onTranscript={(text, role) => {
                  setMessages(prev => [...prev, { role, content: text }]);
                }}
              />
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-foreground/20 text-center font-sans tracking-wider">
          Powered by xAI · Grok · BerliNike.ai
        </p>
      </div>
    </section>
  );
};

export default ChatSection;
