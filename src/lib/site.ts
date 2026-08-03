// ─────────────────────────────────────────────────────────────────────────────
// Zentrale Site-Konfiguration — EINE Wahrheit für Domain, Kontakt, Analytics.
//
// Cutover auf die offizielle Domain = nur .env ändern (VITE_SITE_URL) +
// `node scripts/build-portfolio-manifest.mjs` neu laufen lassen (regeneriert
// sitemap.xml, robots.txt, imageJsonLd.ts und die Kategorie-.html mit SITE_URL).
// index.html liest %VITE_SITE_URL% direkt beim Vite-Build.
// ─────────────────────────────────────────────────────────────────────────────

/** Kanonische Basis-URL ohne abschließenden Slash. Pre-Cutover: berlinjohn.de-Testbed. */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://dirkmathesius.berlinjohn.de"
).replace(/\/$/, "");

/** Offizielle Zieldomain — für sameAs/Verweise, unabhängig vom aktuellen Host. */
export const OFFICIAL_URL = "https://www.dirkmathesius.de";

// ── Seiten-Variante ─────────────────────────────────────────────────────────────
// „official" = Dirks eigene Business-Seite (dirkmathesius.de): schlicht, ohne
//   Fan-/Kollab-Content auf der Startseite (nur dezent auf /kollaborationen).
// „fanpage"  = meine Subdomain: feiert die John×Dirk-Kollaboration, Buchungen
//   führen auf dirkmathesius.de. canonical→official (Ranking bündelt bei Dirk).
// Ableitung: dirkmathesius.de-Host → official, sonst fanpage. Override via
// VITE_SITE_VARIANT (für lokale Vorschau, ohne live etwas umzustellen).
const _hostIsOfficial = /(^|\.)dirkmathesius\.de$/.test(
  (() => { try { return new URL(SITE_URL).hostname; } catch { return ""; } })()
);
const _variant = (import.meta.env.VITE_SITE_VARIANT || "").toLowerCase();
export const IS_OFFICIAL =
  _variant === "official" ? true : _variant === "fanpage" ? false : _hostIsOfficial;
export const IS_FANPAGE = !IS_OFFICIAL;

/** WhatsApp im wa.me-Format (nur Ziffern, Länderkennung ohne +). */
export const WHATSAPP_NUMBER = "491755915670";
export const PHONE_DISPLAY = "+49 175 5915670";
export const PHONE_TEL = "+491755915670";
export const EMAIL = "mail@dirkmathesius.de";

/** Vorformulierte WhatsApp-Nachricht (URL-encodiert beim Aufruf). */
export const WHATSAPP_TEXT =
  "Hallo Dirk, ich interessiere mich für ein Shooting und hätte eine Anfrage:";

export const whatsappUrl = () =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

// ── Analytics (Google GA4 + Consent Mode v2 — wie die übrigen BerlinJohn-Seiten) ─
/** GA4 Measurement-ID (G-XXXXXXX). Leer = Analytics + Cookie-Banner deaktiviert. */
export const GA4_ID = import.meta.env.VITE_GA4_ID || "";
/** Optionale Google-Ads-Conversion-ID (AW-XXXXXXXXX). Leer = kein Ads-Tag. */
export const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID || "";

// ── Kontaktformular (Web3Forms — läuft auf jedem Static-Host, auch IONOS/Apache) ─
/** Web3Forms Access-Key. Leer = Formular fällt auf mailto zurück. */
export const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "";
