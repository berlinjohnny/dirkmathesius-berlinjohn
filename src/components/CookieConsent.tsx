import { useState, useEffect } from "react";
import { GA4_ID } from "@/lib/site";
import { applyConsent, readConsent, type Consent } from "@/lib/analytics";

// GA4-Cookie-Banner (Consent Mode v2). Erscheint nur, wenn eine GA4-ID gesetzt
// ist und noch keine Wahl gespeichert wurde. Wiederaufrufbar über das Event
// "dm-consent-reopen" (Footer-Link „Cookie-Einstellungen").
const REOPEN_EVENT = "dm-consent-reopen";
export const openCookieSettings = () => window.dispatchEvent(new Event(REOPEN_EVENT));

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!GA4_ID) return;
    if (!readConsent()) {
      const t = setTimeout(() => setShow(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const reopen = () => setShow(true);
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  if (!GA4_ID || !show) return null;

  const choose = (c: Consent) => {
    applyConsent(c);
    setShow(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-foreground/10 bg-background/98 backdrop-blur px-5 py-4 md:py-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      role="dialog" aria-label="Cookie-Hinweis">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-[12px] leading-relaxed text-foreground/60 flex-1">
          Diese Seite nutzt Cookies für anonyme Statistik (Google Analytics), um das Angebot zu
          verbessern. Nur mit deiner Zustimmung.{" "}
          <a href="/datenschutzerklaerung.html" className="text-[#FF6600] hover:underline">Datenschutz</a>
        </p>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button onClick={() => choose({ analytics: false, marketing: false })}
            className="px-4 py-2.5 text-[11px] tracking-[0.14em] uppercase text-foreground/60 border border-foreground/15 hover:border-foreground/40 transition-colors">
            Nur notwendige
          </button>
          <button onClick={() => choose({ analytics: true, marketing: false })}
            className="px-5 py-2.5 text-[11px] tracking-[0.14em] uppercase text-white bg-[#FF6600] hover:bg-[#e25c00] transition-colors">
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
