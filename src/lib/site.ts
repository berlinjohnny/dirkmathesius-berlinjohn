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

// ── Telefon — bewusst NICHT im Klartext ──────────────────────────────────────
// Die Nummer stand vorher im Klartext im Bundle und als tel:-Link sowie
// als sichtbarer Text im ausgelieferten HTML. Genau danach greifen die einfachen
// Harvester, die Nummern fuer Spam-Anrufe und SMS-Listen einsammeln.
//
// Jetzt liegt sie base64-kodiert im Code und wird erst im Browser zusammengesetzt.
// Ehrlich zur Wirkung: das haelt regex-basierte Scraper ab, nicht jemanden, der
// gezielt das Bundle liest. Vollstaendiger Schutz ginge nur ohne klickbare Nummer.
const _tel = "KzQ5MTc1NTkxNTY3MA==";
const _dec = (s: string) =>
  typeof atob === "function" ? atob(s) : Buffer.from(s, "base64").toString();

/** tel:-URL, erst zur Laufzeit zusammengesetzt. */
export const phoneTel = () => `tel:${_dec(_tel)}`;
/** Anzeigeform mit Leerzeichen, erst zur Laufzeit zusammengesetzt. */
export const phoneDisplay = () => {
  const t = _dec(_tel);
  return `+${t.slice(1, 3)} ${t.slice(3, 6)} ${t.slice(6)}`;
};

export const EMAIL = "mail@dirkmathesius.de";

// ── Analytics (Google GA4 + Consent Mode v2 — wie die übrigen BerlinJohn-Seiten) ─
/** GA4 Measurement-ID (G-XXXXXXX). Leer = Analytics + Cookie-Banner deaktiviert. */
export const GA4_ID = import.meta.env.VITE_GA4_ID || "";
/** Optionale Google-Ads-Conversion-ID (AW-XXXXXXXXX). Leer = kein Ads-Tag. */
export const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID || "";

// ── Kontaktformular (Web3Forms — läuft auf jedem Static-Host, auch IONOS/Apache) ─
/** Web3Forms Access-Key. Leer = Formular fällt auf mailto zurück. */
export const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "";
