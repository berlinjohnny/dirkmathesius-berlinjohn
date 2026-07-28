// ─────────────────────────────────────────────────────────────────────────────
// Google Analytics 4 + Consent Mode v2 — identisch zum BerlinJohn-Standard
// (jim-john etc.): default-DENIED, Cookie-Banner schaltet analytics_storage frei.
//
// DSGVO/TTDSG §25: GA4 setzt Cookies → Consent nötig. Vor jedem Laden steht
// consent 'default' = denied; erst nach Opt-in im Banner greift 'update'.
//
// Ohne VITE_GA4_ID passiert nichts (kein Script, kein Banner nötig) → der
// berlinjohn.de-Testbed bleibt tracking-frei bis die echte ID gesetzt wird.
// ─────────────────────────────────────────────────────────────────────────────
import { GA4_ID, GOOGLE_ADS_ID } from "./site";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_KEY = "dm_cookie_consent";
export type Consent = { analytics: boolean; marketing: boolean };

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

/** Lädt GA4 mit Consent Mode v2 (default denied) und spielt gespeicherte Wahl ein. */
export function initAnalytics() {
  if (typeof window === "undefined" || !GA4_ID) return;
  if (document.querySelector('script[data-analytics="ga4"]')) return;

  window.dataLayer = window.dataLayer || [];
  // Muss eine echte function-Deklaration sein (arguments), nicht arrow.
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };

  // Consent Mode v2 — alles gesperrt, bis der Nutzer im Banner zustimmt.
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });

  // Frühere Entscheidung sofort wieder anwenden.
  const stored = readConsent();
  if (stored) applyConsent(stored);

  const s = document.createElement("script");
  s.async = true;
  s.setAttribute("data-analytics", "ga4");
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);

  window.gtag("js", new Date());
  window.gtag("config", GA4_ID);
  if (GOOGLE_ADS_ID) window.gtag("config", GOOGLE_ADS_ID, { send_page_view: false });
}

/** Consent-Wahl an gtag propagieren + persistieren. */
export function applyConsent(c: Consent) {
  window.gtag?.("consent", "update", {
    analytics_storage: c.analytics ? "granted" : "denied",
    ad_storage: c.marketing ? "granted" : "denied",
    ad_user_data: c.marketing ? "granted" : "denied",
    ad_personalization: c.marketing ? "granted" : "denied",
  });
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
  } catch {
    /* noop */
  }
}

/** Einheitlicher Conversion-/Engagement-Tracker (GA4). Läuft erst nach Consent. */
export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  try {
    window.gtag?.("event", name, props ?? {});
  } catch {
    /* Analytics darf niemals die Seite brechen. */
  }
}

// Benannte Conversion-Events (eine Wahrheit für alle CTAs).
export const trackAnfrageSubmit = (variante: string) =>
  trackEvent("anfrage_abgeschickt", { variante });
export const trackWhatsappClick = (ort: string) =>
  trackEvent("whatsapp_klick", { ort });
export const trackAnrufClick = (ort: string) =>
  trackEvent("anruf_klick", { ort });
export const trackCtaClick = (label: string) =>
  trackEvent("cta_klick", { label });
