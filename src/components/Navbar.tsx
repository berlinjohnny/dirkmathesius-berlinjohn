import { useState, useEffect } from "react";
import { Globe, X } from "lucide-react";
import { useLang, LANGS } from "@/contexts/LangContext";

const Navbar = () => {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [showLangs, setShowLangs] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setShowLangs(false);
  };

  const current = LANGS.find((l) => l.code === lang);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass border-b border-primary/20" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo + Mika's subtitle */}
          <button onClick={() => scrollTo("hero")} className="text-left group">
            <span className="text-lg tracking-widest font-heading gold-shimmer block leading-tight">
              BERLINIKE
            </span>
            <span className="text-[10px] text-foreground/30 tracking-[0.12em] group-hover:text-primary/40 transition-colors font-sans leading-none">
              {t("nikeSubtitle")}
            </span>
          </button>

          <div className="flex items-center gap-6">
            {/* Nav links */}
            <div className="hidden md:flex items-center gap-6 text-xs tracking-widest text-foreground/50">
              <button onClick={() => scrollTo("ueber")} className="hover:text-primary transition-colors uppercase">
                {t("navAbout")}
              </button>
              <button onClick={() => scrollTo("chat")} className="hover:text-primary transition-colors uppercase">
                {t("navChat")}
              </button>
            </div>

            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangs(!showLangs)}
                className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-primary/60 transition-colors"
              >
                <span>{current?.flag}</span>
                <Globe size={12} />
              </button>
              {showLangs && (
                <div className="absolute right-0 top-8 bg-background/98 border border-primary/20 backdrop-blur-md min-w-[160px] z-50 shadow-xl">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setShowLangs(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-primary/8 transition-colors text-left ${
                        lang === l.code ? "text-primary" : "text-foreground/50"
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span className="font-sans">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => scrollTo("chat")}
              className="hidden sm:block px-4 py-2 border border-primary/40 text-primary text-[10px] tracking-widest uppercase hover:bg-primary/10 transition-all duration-300"
            >
              {t("navCta")}
            </button>
          </div>
        </div>
      </nav>

      {/* Click outside to close lang dropdown */}
      {showLangs && (
        <div className="fixed inset-0 z-40" onClick={() => setShowLangs(false)} />
      )}
    </>
  );
};

export default Navbar;
