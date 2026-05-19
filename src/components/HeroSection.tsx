import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { trackNikeClick, trackCtaClick, trackScrollToChat } from "@/lib/gtag";

const NikeStatue = ({ onClick }: { onClick: () => void }) => (
  <svg
    onClick={onClick}
    viewBox="0 0 120 220"
    className="w-32 md:w-48 mx-auto drop-shadow-[0_0_30px_rgba(201,168,76,0.5)] cursor-pointer hover:drop-shadow-[0_0_50px_rgba(201,168,76,0.7)] transition-all duration-500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ animation: "float 5s ease-in-out infinite" }}
  >
    <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }`}</style>
    <ellipse cx="60" cy="80" rx="14" ry="22" fill="url(#gold)" opacity="0.9"/>
    <circle cx="60" cy="46" r="13" fill="url(#gold)" opacity="0.95"/>
    <ellipse cx="60" cy="33" rx="16" ry="4" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.6"/>
    <path d="M46 75 C20 55 10 30 25 20 C35 30 42 55 46 75Z" fill="url(#gold)" opacity="0.7"/>
    <path d="M74 75 C100 55 110 30 95 20 C85 30 78 55 74 75Z" fill="url(#gold)" opacity="0.7"/>
    <path d="M47 72 C30 58 22 42 28 35" stroke="#C9A84C" strokeWidth="6" strokeLinecap="round" opacity="0.9"/>
    <path d="M73 72 C85 80 88 90 85 100" stroke="#C9A84C" strokeWidth="6" strokeLinecap="round" opacity="0.9"/>
    <path d="M46 100 L50 155 L60 150 L70 155 L74 100Z" fill="url(#gold)" opacity="0.85"/>
    <path d="M52 155 C48 170 44 180 46 195" stroke="#C9A84C" strokeWidth="7" strokeLinecap="round" opacity="0.9"/>
    <path d="M68 155 C68 170 68 185 68 200" stroke="#C9A84C" strokeWidth="7" strokeLinecap="round" opacity="0.9"/>
    <path d="M65 200 L75 202" stroke="#C9A84C" strokeWidth="5" strokeLinecap="round" opacity="0.8"/>
    <ellipse cx="68" cy="205" rx="12" ry="5" fill="#8B6914" opacity="0.5"/>
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFD700"/>
        <stop offset="50%" stopColor="#C9A84C"/>
        <stop offset="100%" stopColor="#8B6914"/>
      </linearGradient>
    </defs>
  </svg>
);

const HeroSection = () => {
  const { t, lang } = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [greeted, setGreeted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, size: Math.random() * 1.8 + 0.3, alpha: Math.random() * 0.4 + 0.05 });
    }
    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(43,90%,52%,${p.alpha})`; ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  const greetings: Record<string, string> = {
    de: "Na du Schlawiner, biste endlich bei mir zu Hause angekommen?",
    en: "Well hello there, stranger — you finally made it to my home!",
    fr: "Ah te voilà enfin, mon ami! Bienvenue chez moi.",
    ru: "Наконец-то добрался до меня, дружище!",
    es: "¡Vaya, por fin llegaste a mi casa, amigo!",
    zh: "哦，你终于来到我家了，朋友！",
    ja: "ついに来たね、友よ。ようこそ私の家へ。",
    pt: "Finalmente chegaste, amigo! Bem-vindo à minha casa.",
    ar: "أخيراً وصلت إلى بيتي، يا صديقي!",
    it: "Finalmente sei arrivato a casa mia, amico!",
  };

  const speakGreeting = () => {
    if (greeted || !window.speechSynthesis) return;
    setGreeted(true);
    const u = new SpeechSynthesisUtterance(greetings[lang] || greetings.en);
    u.lang = lang === "zh" ? "zh-CN" : lang === "ja" ? "ja-JP" : lang === "ar" ? "ar-SA" : lang === "pt" ? "pt-BR" : `${lang}-${lang.toUpperCase()}`;
    u.rate = 0.9; u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  };

  const popupText = t("nikePopup").split("\n");

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" onClick={speakGreeting}>
      {/* Overlay — leicht oben (Sky sichtbar), dunkler unten für Text */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/75" />
      {/* Gold glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[150px] pointer-events-none" />
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
          <span className="text-primary/50 text-[10px] tracking-[0.5em] uppercase font-sans">Gendarmenmarkt · Berlin</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
        </div>

        {/* Subtle Nike trigger — real statue visible in background photo */}
        <button
          onClick={(e) => { (e as unknown as MouseEvent).stopPropagation(); trackNikeClick(); setShowPopup(true); }}
          className="mb-8 text-primary/40 text-[10px] tracking-[0.4em] uppercase font-sans hover:text-primary/70 transition-colors border border-primary/20 px-4 py-2 hover:border-primary/50"
          title="Klick mich"
        >
          Νίκη · seit 1785
        </button>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-light leading-none mb-4 tracking-wide">
          <span className="gold-shimmer">BerliNike</span>
        </h1>

        <p className="text-base md:text-lg text-foreground/45 tracking-widest mb-2 font-light uppercase">
          {t("tagline1")}
        </p>
        <p className="text-sm text-primary/40 italic mb-2 font-light">{t("tagline2")}</p>

        {!greeted && (
          <p className="text-xs text-foreground/20 tracking-wider mb-8 font-sans">{t("voiceHint")}</p>
        )}
        {greeted && <div className="mb-8" />}

        <button
          onClick={(e) => { (e as unknown as MouseEvent).stopPropagation(); trackScrollToChat(); trackCtaClick("hero_sprich_mit_berlinike"); document.getElementById("chat")?.scrollIntoView({ behavior: "smooth" }); }}
          className="px-10 py-5 bg-primary text-primary-foreground font-sans font-bold text-sm tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 gold-glow"
        >
          {t("cta")}
        </button>

        <button
          onClick={(e) => { (e as unknown as MouseEvent).stopPropagation(); document.getElementById("ueber")?.scrollIntoView({ behavior: "smooth" }); }}
          className="mt-4 text-xs text-foreground/30 tracking-widest uppercase hover:text-primary/60 transition-colors font-sans"
        >
          {t("who")} →
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-primary/30" />
        </div>
      </div>

      {/* Nike popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="gold-border bg-card/90 p-10 max-w-sm mx-6 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-foreground/30 hover:text-primary/60">
              <X size={14} />
            </button>
            {popupText.map((line, i) => (
              <p key={i} className={`font-heading text-xl md:text-2xl font-light text-foreground/80 leading-relaxed ${i > 0 ? "mt-3 gold-shimmer" : ""}`}>
                {line}
              </p>
            ))}
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-primary/30" />
              <span className="text-primary/30 text-[10px] tracking-widest font-sans">— BerliNike</span>
              <div className="h-px w-8 bg-primary/30" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
