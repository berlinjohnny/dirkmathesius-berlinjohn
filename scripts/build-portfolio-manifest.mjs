import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const portfolioDir = join(root, "public", "portfolio");
const outFile = join(root, "src", "lib", "portfolio.ts");
const jsonLdFile = join(root, "src", "lib", "imageJsonLd.ts");

// EINE Wahrheit für die Domain. Cutover = VITE_SITE_URL in .env setzen + Generator neu laufen.
// Der Generator läuft separat von Vite, liest die .env aber selbst (kein dotenv nötig),
// damit .env die einzige Stelle bleibt — identisch zu src/lib/site.ts (VITE_SITE_URL).
function readEnv(key) {
  if (process.env[key]) return process.env[key];
  try {
    const txt = readFileSync(join(root, ".env"), "utf8");
    const m = txt.match(new RegExp(`^\\s*${key}\\s*=\\s*(.+?)\\s*$`, "m"));
    return m ? m[1].replace(/^['"]|['"]$/g, "") : undefined;
  } catch {
    return undefined;
  }
}
const SITE = (readEnv("SITE_URL") || readEnv("VITE_SITE_URL") || "https://dirkmathesius.berlinjohn.de").replace(/\/$/, "");

// Buchungsziel der Kategorie-CTAs:
//  - Pre-Cutover (SITE = Testbed): Buchungen gehen an Dirks Live-Server → Performance-Messung.
//  - Post-Cutover (SITE = offizielle Domain): CTA würde auf sich selbst zeigen → stattdessen
//    On-Page-Buchungsanker. Steuerbar via BOOK_URL; Default leitet das automatisch ab.
const OFFICIAL = "https://www.dirkmathesius.de";
const isOfficialHost = /(^|\.)dirkmathesius\.de$/.test(new URL(SITE).hostname);

const categoryMeta = {
  sport:       { label: "Sport",       altSuffix: "Sportfotografie Berlin – Dirk Mathesius" },
  folks:       { label: "People",      altSuffix: "Portraitfotografie Berlin – Dirk Mathesius" },
  music:       { label: "Music",       altSuffix: "Musikfotografie Berlin – Dirk Mathesius" },
  reportage:   { label: "Reportage",   altSuffix: "Reportagefotografie Berlin – Dirk Mathesius" },
  landscape:   { label: "Landscape",   altSuffix: "Landschaftsfotografie – Dirk Mathesius" },
  stills:      { label: "Stills",      altSuffix: "Produktfotografie Stills Berlin – Dirk Mathesius" },
  publication: { label: "Publication", altSuffix: "Editorial Photography Berlin – Stern, Men's Health – Dirk Mathesius" },
  // Nur Fanpage: eine Uebersicht statt drei fast leerer Rubriken.
  photography: { label: "Photography", altSuffix: "Fotografie von Dirk Mathesius – Kollaboration mit John Förster" },
};

const order = ["sport", "folks", "music", "reportage", "landscape", "stills", "publication"];

const captionByCat = {
  sport:       "© Dirk Mathesius – Sportfotografie Berlin",
  folks:       "© Dirk Mathesius – Portrait & People Photography Berlin",
  music:       "© Dirk Mathesius – Musikfotografie & Konzertfotografie Berlin",
  reportage:   "© Dirk Mathesius – Reportagefotografie Berlin",
  landscape:   "© Dirk Mathesius – Landschaftsfotografie",
  stills:      "© Dirk Mathesius – Stills & Produktfotografie Berlin",
  publication: "© Dirk Mathesius – Editorial Photography Berlin (Stern, Men's Health)",
  photography: "© Dirk Mathesius – fotografiert mit John Förster, AcroBerlin",
};

// Per-category SEO copy for the static category pages — unique title/description/H1/intro
// per page (no two pages share head text → no thin-content / duplicate risk).
const seoByCat = {
  sport: {
    title:       "Sportfotografie Berlin – Dirk Mathesius",
    h1:          "Sport",
    description: "Sportfotografie aus Berlin von Dirk Mathesius: Athleten, Action und Editorial – u. a. für Runners World und SCC Berlin. Echtes Material, ehrlich fotografiert.",
    intro:       "Sport in Bewegung, mit dem Mittelformat festgehalten – vom Generali-Halbmarathon vor dem Reichstag bis zu freien Arbeiten mit Akrobaten, Läufern und Skatern.",
  },
  folks: {
    title:       "Portrait- & People-Fotografie Berlin – Dirk Mathesius",
    h1:          "People",
    description: "People- und Portraitfotografie aus Berlin von Dirk Mathesius: charaktervolle Menschen, ehrliche Momente und klares Licht – für Magazine, Agenturen und freie Arbeiten.",
    intro:       "Menschen mit Charakter: Portrait- und People-Fotografie zwischen Auftragsarbeit und freier Beobachtung.",
  },
  music: {
    title:       "Musik- & Konzertfotografie Berlin – Dirk Mathesius",
    h1:          "Music",
    description: "Musik- und Konzertfotografie aus Berlin von Dirk Mathesius: Künstler, Bühne und Backstage – Atmosphäre statt Hochglanz.",
    intro:       "Musik in Bildern: Künstlerportraits, Bühne und Backstage – nah dran an der Energie des Moments.",
  },
  reportage: {
    title:       "Reportagefotografie Berlin – Dirk Mathesius",
    h1:          "Reportage",
    description: "Reportage- und Dokumentarfotografie aus Berlin von Dirk Mathesius: Geschichten, Orte und Menschen – erzählt in ehrlichen Bildern.",
    intro:       "Reportage: erzählende Fotografie, die Orte und Menschen so zeigt, wie sie wirklich sind.",
  },
  landscape: {
    title:       "Landschaftsfotografie – Dirk Mathesius",
    h1:          "Landscape",
    description: "Landschaftsfotografie von Dirk Mathesius: Weite, Licht und Stille – Naturräume in ruhiger, präziser Bildsprache.",
    intro:       "Landschaft: Weite, Licht und Atmosphäre – ruhige Bilder mit Tiefe.",
  },
  stills: {
    title:       "Stills- & Produktfotografie Berlin – Dirk Mathesius",
    h1:          "Stills",
    description: "Stills- und Produktfotografie aus Berlin von Dirk Mathesius: präzise inszenierte Objekte, klares Licht – on location und im Studio.",
    intro:       "Stills: Objekte präzise in Szene gesetzt – mit Gefühl für Material, Form und Licht.",
  },
  publication: {
    title:       "Editorial- & Publikationsfotografie Berlin – Dirk Mathesius",
    h1:          "Publication",
    description: "Editorial-Fotografie aus Berlin von Dirk Mathesius – veröffentlicht u. a. in Stern und Men's Health. Magazinstrecken mit Haltung.",
    intro:       "Editorial & Publikationen: Magazinstrecken und veröffentlichte Arbeiten – u. a. für Stern und Men's Health.",
  },
  // Nur Fanpage: die gesammelte Zusammenarbeit statt drei aufgeteilter Rubriken.
  photography: {
    title:       "Photography – Dirk Mathesius × John Förster",
    h1:          "Photography",
    description: "Fotografien von Dirk Mathesius aus der Zusammenarbeit mit Sportmodel John Förster: Human Flag, Freerunning und Akrobatik in Berlin – echte Action, ohne Bildbearbeitung.",
    intro:       "Die gemeinsamen Arbeiten mit Dirk Mathesius – Akrobatik, Human Flag und Freerunning, alles real vor der Kamera entstanden. Buchungen laufen direkt über Dirk.",
  },
};

// ── Dark/Light auf den statischen Unterseiten ────────────────────────────────
// Die SPA hat den Umschalter laengst; die generierten Seiten waren licht-only.
// Gleiche Mechanik wie in index.html/ThemeToggle.tsx: Klasse `dark` am <html>,
// Wahl in localStorage["dm-theme"]. Dadurch traegt die Entscheidung ueber den
// Wechsel zwischen SPA und statischen Seiten hinweg.
//
// Alles hier steht EINMAL und wird in alle drei Seiten-Vorlagen eingesetzt
// (Kategorie-Seiten, kollaborationen, subPage) — die Vorlagen haben je ein
// eigenes Stylesheet, und genau so laufen solche Dinge sonst auseinander.

/** Inline-Skript fuer den <head>: setzt das Theme VOR dem ersten Paint (kein Flash). */
const THEME_BOOT = `<script>
(function(){try{var t=localStorage.getItem("dm-theme");
if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){
document.documentElement.classList.add("dark");}}catch(e){}})();
</script>`;

/** Dieselbe Google-Fonts-Quelle wie index.html (nur der dort ebenfalls genutzte
 *  Inter-Schnitt) — damit die Kategorie-Seiten dieselbe Schrift wie die SPA zeigen,
 *  statt auf Arial zurueckzufallen. */
const GOOGLE_FONT = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">`;

/** Umschalt-Knopf fuer den Brand-Kopf, inkl. Klick-Logik und Symbolwechsel. */
const THEME_BTN = `<button id="dm-theme-btn" type="button" class="themebtn" aria-label="Hell/Dunkel umschalten" title="Hell/Dunkel umschalten">◐</button>
<script>
(function(){var b=document.getElementById("dm-theme-btn");if(!b)return;
var d=function(){return document.documentElement.classList.contains("dark");};
var sync=function(){b.textContent=d()?"☀":"☾";
b.setAttribute("aria-label",d()?"Zu hellem Modus wechseln":"Zu dunklem Modus wechseln");};
sync();b.addEventListener("click",function(){var n=!d();
document.documentElement.classList.toggle("dark",n);
try{localStorage.setItem("dm-theme",n?"dark":"light");}catch(e){}sync();});})();
</script>`;

/** Dunkle Variante. `html.dark X` schlaegt die hellen Regeln ueber die Spezifitaet,
 *  unabhaengig von der Reihenfolge im <style> — wichtig, weil UEBER_CSS nachfolgt. */
const DARK_CSS = `
  .themebtn{position:absolute;top:18px;right:16px;width:32px;height:32px;border-radius:50%;
            border:1px solid rgba(0,0,0,.15);background:transparent;color:#666;font-size:14px;
            line-height:1;cursor:pointer;padding:0;}
  .themebtn:hover{color:#FF6600;border-color:#FF6600;}
  .wrap{position:relative;}
  html.dark body{background:#131110;color:#e8e4df;}
  html.dark .themebtn{border-color:rgba(255,255,255,.22);color:#b3aca4;}
  html.dark .brand .hl{color:#cfc9c2;}
  html.dark .brand .hl .c{color:#5c5650;}
  html.dark nav.cat{background:#1c1917;}
  html.dark nav.cat a{color:#d8d2cb;}
  html.dark nav.cat a:hover{color:#FF6600;}
  html.dark h1{color:#f2eee9;}
  html.dark h2{color:#b9b2aa;border-color:#2a2724;}
  html.dark h3{color:#efeae4;}
  html.dark p,html.dark .intro,html.dark .lead{color:#c2bbb3;}
  html.dark .clients,html.dark .cap{color:#9a938b;}
  html.dark a{color:#d8d2cb;}
  html.dark .card{border-color:#2a2724;}
  html.dark .card p,html.dark .card .price{color:#a9a29a;}
  html.dark .faq details{border-color:#2a2724;}
  html.dark .faq summary{color:#ddd7d0;}
  html.dark .faq p{color:#a9a29a;}
  html.dark .cta{border-color:#2a2724;}
  html.dark .cta p{color:#a9a29a;}
  html.dark footer{border-color:#2a2724;color:#8d867f;}
  html.dark footer a{color:#8d867f;}
  html.dark figcaption{color:#9a938b;}
  html.dark form.dm input,html.dark form.dm textarea{color:#e8e4df;border-color:#3a3632;}
  html.dark form.dm input::placeholder,html.dark form.dm textarea::placeholder{color:#7d766f;}
  html.dark #dm-status{color:#b3aca4;}
  html.dark .legal{color:#7d766f;}
  /* Seiten-eigene Regeln von /ueber-dirk.html */
  html.dark .ueber .facts li{border-color:#2f2b28;color:#b3aca4;}
  html.dark .ueber .logos li{background:#1c1917;color:#c2bbb3;}
  html.dark .ueber .steps{background:#2a2724;border-color:#2a2724;}
  html.dark .ueber .steps > div{background:#171513;}
  html.dark .ueber .steps p,html.dark .ueber .tech p{color:#a9a29a;}
  html.dark .ueber .bts figure{background:#1c1917;}
  html.dark .ueber .rights p{color:#b3aca4;}
  html.dark .ueber .more{color:#a9a29a;}
`;

// Design-Vereinheitlichung (2026-08-28, Johns Auftrag): categoryPage(), SUB_CSS
// (info/ueber-dirk/hochzeitsfotograf-berlin) und kollaborationen.html hatten je
// eine EIGENE Kopie dieser Regeln — leicht auseinandergedriftet (Arial vs. Inter,
// Nav mit Hintergrundbild vs. Haarlinie, undefinierte vs. definierte h1-Groesse).
// BASE_PAGE_CSS ist jetzt die EINE Quelle fuer Brand-Kopf, Navigation, Ueberschriften,
// CTA-Button und Footer — alle drei Stellen binden sie ein und ergaenzen nur noch
// ihre seiteneigenen Regeln (Grid, Karten, Formular …). DARK_CSS bleibt unveraendert
// und greift wie gehabt.
const BASE_PAGE_CSS = `
  body{background:#fff;margin:0;color:#181818;font-family:'Inter',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;}
  .wrap{max-width:1100px;margin:0 auto;padding:0 16px;}
  .brand{text-align:center;padding:28px 0 8px;}
  .brand img{width:50px;height:50px;border:0;}
  .brand .hl{font-size:13px;font-weight:500;letter-spacing:.32em;text-transform:uppercase;margin-top:14px;color:#181818;}
  .brand .hl .c{color:#ccc;}
  nav.cat{text-align:center;margin:20px 0 0;padding:14px 0;border-top:1px solid #ddd;border-bottom:1px solid #ddd;}
  nav.cat a{display:inline-block;line-height:1.8;font-size:11px;letter-spacing:.2em;text-transform:uppercase;
            color:#000;opacity:.6;text-decoration:none;padding:0 14px;border-bottom:1px solid transparent;transition:color .15s,opacity .15s;}
  nav.cat a:hover{color:#FF6600;opacity:1;border-color:#FF6600;}
  h1{font-size:clamp(23px,4vw,32px);font-weight:600;letter-spacing:-.01em;line-height:1.18;margin:30px 0 10px;color:#181818;}
  h2{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#999;border-top:1px solid #ececec;padding-top:24px;margin:46px 0 18px;font-weight:600;}
  .intro{font-size:14px;color:#555;max-width:760px;line-height:1.7;margin:0 0 20px;}
  /* Zurueckhaltend: Haarlinie statt schwarzem Balken. Auf einer Fotoseite sollen die
     Bilder tragen — der orange Button bleibt der einzige Akzent. */
  .cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:14px;
       border-top:1px solid #ececec;padding:26px 0 6px;margin:36px 0 0;text-align:center;}
  .cta p{margin:0;font-size:12.5px;line-height:1.5;color:#666;}
  a.book{background:#FF6600;color:#fff;text-decoration:none;font-size:11px;
         letter-spacing:.18em;text-transform:uppercase;padding:12px 22px;white-space:nowrap;
         display:inline-block;border-radius:2px;transition:background .15s;}
  a.book:hover{background:#e25c00;}
  footer{border-top:1px solid #eee;margin-top:34px;padding:20px 0 44px;text-align:center;font-size:11px;color:#888;}
  footer a{color:#888;text-decoration:none;margin:0 8px;}
  footer a:hover{color:#FF6600;}
`;

// Nav order matches the original dirkmathesius.de layout (info.html). folks → "people".
const navOrder = ["folks", "sport", "music", "publication", "landscape", "reportage", "stills"];
const navLabel = (id) => (id === "folks" ? "people" : id);

// ── Kollaborationen John × Dirk ───────────────────────────────────────────────
// Die Fanpage (dirkmathesius.berlinjohn.de) zeigt AUSSCHLIESSLICH Bilder, die
// gemeinsam mit John Förster entstanden sind. Dirks übriges Portfolio bleibt
// exklusiv seiner offiziellen Seite vorbehalten — das ist der ganze Sinn der
// Trennung: die Fanpage feiert die Zusammenarbeit, Buchungen gehen zu Dirk.
//
// Die Erkennung läuft über Dateiname + Bildtexte. Wo das danebenliegt, sind die
// beiden Mengen darunter die Handbremse — sie schlagen die Automatik.
const COLLAB_RE = /john|förster|foerster|acroberlin/i;
/** Trotz Namenstreffer KEINE John-Kollaboration (Dateiname, ohne Pfad). */
const COLLAB_EXCLUDE = new Set([]);
/** Zusätzlich als Kollaboration werten, obwohl kein Treffer (Dateiname, ohne Pfad). */
const COLLAB_INCLUDE = new Set([]);

const isCollab = (img) => {
  const file = decodeURIComponent(img.src.split("/").pop() || "");
  if (COLLAB_EXCLUDE.has(file)) return false;
  if (COLLAB_INCLUDE.has(file)) return true;
  return [img.src, img.alt, img.title, img.caption]
    .some((s) => COLLAB_RE.test(s || ""));
};

// Seiten-Variante — wie in src/lib/site.ts. "fanpage" reduziert Sitemap, JSON-LD
// und die statischen Kategorie-Seiten auf die Kollaborationen.
const VARIANT = (readEnv("SITE_VARIANT") || readEnv("VITE_SITE_VARIANT") || "").toLowerCase();
const IS_FANPAGE = VARIANT === "fanpage";

// Hand-curated premium motifs ("Beste Motive", PR #15). These are .jpg without embedded
// XMP, so they can't be auto-derived from the file scan — they're maintained here with their
// hand-written alt/title/caption and PREPENDED (shown first → also become the category cover).
// Single source of truth: feeds portfolio.ts, imageJsonLd.ts, sitemap.xml AND the static pages.
const manualExtras = {
  sport: [
    {
      src: "/portfolio/sport/John-Foerster-Human-Flag-Berliner-Mauer-Bernauer-Strasse.jpg",
      alt: "John Förster hält eine perfekte Human-Flag horizontal an den rostigen Stahlstelen der Gedenkstätte Berliner Mauer, Bernauer Straße in Berlin – Sport- und Konzeptfotografie, 100% real ohne Bildbearbeitung.",
      title: "John Förster – Human-Flag an der Berliner Mauer, Bernauer Straße",
      caption: "John Förster hält eine perfekte Human-Flag horizontal an den rostigen Stahlstelen der Gedenkstätte Berliner Mauer, Bernauer Straße in Berlin – freie Fotokunst, 100% real ohne Bildbearbeitung.",
      creator: "Dirk Mathesius",
      rights: "Nutzung nur mit ausdrücklicher Genehmigung möglich",
    },
    {
      src: "/portfolio/sport/John-Foerster-Sprung-Stelenfeld-Berliner-Mauer-Bernauer-Strasse.jpg",
      alt: "John Förster springt dynamisch über das Stelenfeld der Gedenkstätte Berliner Mauer, Bernauer Straße in Berlin, gestreckt im Flug – dynamische Sport- und Konzeptfotografie, 100% real ohne Bildbearbeitung.",
      title: "John Förster – Sprung über das Stelenfeld, Berliner Mauer Bernauer Straße",
      caption: "John Förster springt dynamisch über das Stelenfeld der Gedenkstätte Berliner Mauer, Bernauer Straße in Berlin – freie Fotokunst, 100% real ohne Bildbearbeitung.",
      creator: "Dirk Mathesius",
      rights: "Nutzung nur mit ausdrücklicher Genehmigung möglich",
    },
    {
      src: "/portfolio/sport/John-Foerster-Akrobat-Stele-Berliner-Mauer-Bernauer-Strasse.jpg",
      alt: "John Förster akrobatisch an einer einzelnen Stahlstele der Gedenkstätte Berliner Mauer, Bernauer Straße in Berlin – Sport- und Konzeptfotografie, 100% real ohne Bildbearbeitung.",
      title: "John Förster – Stele an der Berliner Mauer, Bernauer Straße",
      caption: "John Förster akrobatisch an einer Stahlstele der Gedenkstätte Berliner Mauer, Bernauer Straße in Berlin – freie Fotokunst, 100% real ohne Bildbearbeitung.",
      creator: "Dirk Mathesius",
      rights: "Nutzung nur mit ausdrücklicher Genehmigung möglich",
    },
  ],
};

// Fallback alt-text derived from the filename (legacy behaviour).
const fileToAlt = (file) =>
  file.replace(/\.webp$/i, "")
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

// --- Embedded metadata extraction (XMP from the WebP RIFF container) -----------
// exifr does not support WebP, so we read the "XMP " chunk directly. Zero deps.

function riffChunk(buf, fourcc) {
  if (buf.length < 12 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }
  let off = 12;
  while (off + 8 <= buf.length) {
    const cc = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    const start = off + 8;
    if (cc === fourcc) return buf.slice(start, start + size);
    off = start + size + (size & 1); // chunks are padded to an even size
  }
  return null;
}

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function clean(v) {
  if (!v) return undefined;
  const out = decodeEntities(v).replace(/\s+/g, " ").trim();
  return out || undefined;
}

// Read an XMP property: handles both lang-alt (rdf:Alt > rdf:li x-default) and plain elements.
function pickXmp(xmp, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = xmp.match(re);
  if (!m) return undefined;
  const inner = m[1];
  const li = inner.match(/<rdf:li[^>]*xml:lang="x-default"[^>]*>([\s\S]*?)<\/rdf:li>/i)
         || inner.match(/<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>/i);
  return clean(li ? li[1] : inner);
}

function extractMeta(filePath) {
  let xmp = "";
  try {
    const chunk = riffChunk(readFileSync(filePath), "XMP ");
    xmp = chunk ? chunk.toString("utf8") : "";
  } catch {
    xmp = "";
  }
  if (!xmp) return { hasMeta: false };

  const altText  = pickXmp(xmp, "Iptc4xmpCore:AltTextAccessibility");
  const desc     = pickXmp(xmp, "dc:description");
  const title    = pickXmp(xmp, "dc:title") || pickXmp(xmp, "photoshop:Headline");
  let creator    = pickXmp(xmp, "dc:creator") || pickXmp(xmp, "photoshop:Credit");
  const rights   = pickXmp(xmp, "xmpRights:UsageTerms");

  if (creator) creator = creator.replace(/^©\s*/, "").trim() || undefined;

  const hasMeta = Boolean(altText || desc || title);
  return { hasMeta, altText, desc, title, creator, rights };
}

// --- Build per-category image manifest -----------------------------------------
let withMeta = 0;
let withoutMeta = 0;

const categories = order.map((id) => {
  const dir = join(portfolioDir, id);
  const files = readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".webp"))
    .sort(); // ASCII / byte order — matches macOS `ls` default = Dirk's chosen order
  const meta = categoryMeta[id];

  const images = files.map((file) => {
    const m = extractMeta(join(dir, file));
    if (m.hasMeta) withMeta++; else withoutMeta++;

    const fallbackAlt = `${fileToAlt(file)} – ${meta.altSuffix}`;
    const alt = m.altText || m.desc || fallbackAlt;
    const title = m.title || fileToAlt(file);
    const caption = m.desc || captionByCat[id];

    const img = { src: `/portfolio/${id}/${file}`, alt };
    if (m.title || m.desc) img.title = title;       // only surface real metadata
    if (m.desc) img.caption = caption;
    if (m.creator) img.creator = m.creator;
    if (m.rights) img.rights = m.rights;
    return img;
  });

  const allImages = [...(manualExtras[id] || []), ...images]
    .map((img) => (isCollab(img) ? { ...img, collab: true } : img));

  return {
    id,
    label: meta.label,
    altBase: meta.altSuffix,
    cover: allImages[0]?.src ?? "",
    coverAlt: allImages[0]?.alt ?? meta.altSuffix,
    images: allImages,
  };
});

// Was DIESE Seite zeigt. portfolio.ts bleibt immer vollständig (die React-Galerie
// filtert zur Laufzeit über IS_FANPAGE) — hier geht es um die generierten
// Artefakte: Sitemap, JSON-LD und die statischen Kategorie-Seiten. Auf der Fanpage
// dürfen die nur enthalten, was dort auch tatsächlich zu sehen ist; Kategorien
// ohne eine einzige Kollaboration verschwinden ganz.
// Auf der Fanpage fliesst alles in EINE Uebersicht: 13 Bilder auf drei Rubriken zu
// verteilen ergibt keine Kategorie, sondern drei fast leere Seiten. „Photography"
// zeigt die Zusammenarbeit am Stueck; Dirks Seite behaelt ihre sieben Kategorien.
const PHOTO_ID = "photography";
const collabImages = categories.flatMap((c) => c.images.filter(isCollab));

const siteCategories = IS_FANPAGE
  ? [{
      id: PHOTO_ID,
      label: "Photography",
      altBase: "Fotografie von Dirk Mathesius – Kollaborationen mit John Förster",
      cover: collabImages[0]?.src ?? "",
      coverAlt: collabImages[0]?.alt ?? "Fotografie von Dirk Mathesius",
      images: collabImages,
    }]
  : categories;

const siteNavOrder = IS_FANPAGE ? [PHOTO_ID] : navOrder;

const banner = `// AUTO-GENERATED — do not edit by hand.
// Source: scripts/build-portfolio-manifest.mjs (run via \`node scripts/build-portfolio-manifest.mjs\`)
// Alt-texts & captions are read from the embedded XMP/IPTC metadata of each .webp.
// Updated: ${new Date().toISOString().slice(0, 10)}
`;

const body = `export type PortfolioImage = {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  creator?: string;
  rights?: string;
  /** Gemeinsam mit John Förster entstanden — die Fanpage zeigt ausschliesslich diese. */
  collab?: boolean;
};
export type PortfolioCategory = {
  id: string;
  label: string;
  altBase: string;
  cover: string;
  coverAlt: string;
  images: PortfolioImage[];
};

export const portfolio: PortfolioCategory[] = ${JSON.stringify(categories, null, 2)};

export const portfolioById = Object.fromEntries(portfolio.map((c) => [c.id, c]));
`;

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, banner + "\n" + body);
const total = categories.reduce((n, c) => n + c.images.length, 0);
console.log(`✅ portfolio.ts — ${categories.length} Kategorien, ${total} Bilder`);
console.log(`   Metadaten: ${withMeta} mit XMP, ${withoutMeta} ohne (Fallback Dateiname)`);
for (const c of categories) console.log(`   ${c.id}: ${c.images.length}`);

// --- imageJsonLd.ts (schema.org ImageGallery with per-image ImageObject) -------
const CREATOR = { "@type": "Person", name: "Dirk Mathesius", url: "https://www.dirkmathesius.de" };

/**
 * EIN Bauplan für jedes ImageObject — von der React-Galerie (imageJsonLd.ts) und
 * den statischen Kategorie-Seiten gemeinsam genutzt. Vorher stand die Struktur an
 * zwei Stellen; genau so laufen Auszeichnungen auseinander.
 *
 * `license` + `acquireLicensePage` + `creditText` sind die Felder, die Googles
 * Bild-Metadaten-Bericht als fehlend meldet. Mit ihnen kennzeichnet die Bildersuche
 * die Fotos als "Lizenzierbar" und zeigt einen Weg zum Erwerb — für einen Fotografen,
 * dessen Bilder das Produkt sind, ein direkter Anfragekanal.
 *
 * Beide Links zeigen bewusst immer auf die offizielle Domain: die Rechte liegen bei
 * Dirk und erworben werden sie bei ihm, auch wenn gerade die Fanpage ausgeliefert wird.
 */
const imageNode = (img) => {
  const node = {
    "@type": "ImageObject",
    contentUrl: `${SITE}${img.src}`,
    name: img.title || img.alt,
    description: img.alt,
    creator: CREATOR,
    copyrightHolder: CREATOR,
    creditText: "Dirk Mathesius",
    license: `${OFFICIAL}/ueber-dirk.html#nutzungsrechte`,
    acquireLicensePage: `${OFFICIAL}/info.html#kontakt`,
  };
  if (img.rights) node.copyrightNotice = img.rights;
  return node;
};

const associatedMedia = siteCategories.flatMap((c) =>
  c.images.map((img) => {
    return imageNode(img);
  })
);

const imageGalleryJsonLd = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "@id": `${SITE}/#gallery`,
  name: "Dirk Mathesius – Portfolio",
  url: SITE,
  about: "Sport-, Portrait-, Musik-, Reportage- und Editorial-Fotografie aus Berlin",
  author: CREATOR,
  associatedMedia,
};

const jsonLdBody = `// AUTO-GENERATED — do not edit by hand.
// Source: scripts/build-portfolio-manifest.mjs
// schema.org ImageGallery built from the embedded XMP/IPTC metadata of each photo.
// Render via react-helmet-async:
//   <Helmet><script type="application/ld+json">{JSON.stringify(imageGalleryJsonLd)}</script></Helmet>
// Updated: ${new Date().toISOString().slice(0, 10)}

export const imageGalleryJsonLd = ${JSON.stringify(imageGalleryJsonLd, null, 2)} as const;
`;
writeFileSync(jsonLdFile, jsonLdBody);
console.log(`✅ imageJsonLd.ts — ${associatedMedia.length} ImageObject-Einträge`);

// --- sitemap.xml (Google Image Sitemap, SEO-optimized for the live multi-page site)
// Startseiten-Hero — muss dem <img> in Index.tsx + og:image in index.html entsprechen.
// (Frueher hart auf das alte windowpic.jpg + fremde Domain verdrahtet → Sitemap warb
//  das falsche Startbild; jetzt host-relativ ueber SITE.)
const HOME_HERO = `${SITE}/images/John-Foerster-Human-Flag-Friedenstaube-Pappeln-Berlin.webp`;
const today = new Date().toISOString().slice(0, 10);
const xmlEscape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const enc = (s) => s.split("/").map(encodeURIComponent).join("/");

const imageBlock = (img, catId) =>
  `    <image:image>
      <image:loc>${SITE}${enc(img.src)}</image:loc>
      <image:title>${xmlEscape(img.title || img.alt)}</image:title>
      <image:caption>${xmlEscape(img.caption || captionByCat[catId] || "© Dirk Mathesius")}</image:caption>
    </image:image>`;

const categoryUrl = (c) => {
  const blocks = c.images.map((img) => imageBlock(img, c.id)).join("\n");
  const priority = c.id === "sport" || c.id === "folks" || c.id === "music" || c.id === "publication" ? "0.9" : "0.8";
  return `  <url>
    <loc>${SITE}/${c.id}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
${blocks}
  </url>`;
};

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${HOME_HERO}</image:loc>
      <image:title>Dirk Mathesius Fotograf Berlin – Human Flag zwischen Pappeln, Friedenstaube</image:title>
      <image:caption>© Dirk Mathesius – Startfoto: Sportmodel John Förster in perfekter Human-Flag zwischen mächtigen Pappeln, weiße Friedenstaube auf blauem Shirt – 100 % real, ohne Bildbearbeitung</image:caption>
    </image:image>
  </url>
${siteCategories.map(categoryUrl).join("\n")}
  <url>
    <loc>${SITE}/ueber-dirk.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE}/info.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
${IS_FANPAGE ? "" : `  <url>
    <loc>${SITE}/hochzeitsfotograf-berlin.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`}${IS_FANPAGE ? "" : `  <url>
    <loc>${SITE}/kollaborationen.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`}  <url>
    <loc>${SITE}/impressum.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>${SITE}/datenschutzerklaerung.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
</urlset>
`;
writeFileSync(join(root, "public", "sitemap.xml"), sitemap);
const totalImg = siteCategories.reduce((n, c) => n + c.images.length, 0);
console.log(`✅ sitemap.xml — ${categories.length} category pages × image entries = ${totalImg} <image:image> blocks + 1 hero`);

// --- robots.txt (in den Generator gefaltet → bleibt beim Cutover NICHT auf der Subdomain hängen)
const robots = `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
writeFileSync(join(root, "public", "robots.txt"), robots);
console.log("✅ robots.txt — Sitemap → " + SITE + "/sitemap.xml");

// --- llms.txt (GEO — Kontext für KI-Crawler/Assistenten, gleiche Variantenlogik wie oben) ---
const llms = IS_FANPAGE
  ? `# Dirk Mathesius × John Förster — Photography Collaboration

> Fanpage von John Förster (BerlinJohn) mit den gemeinsamen Fotoarbeiten des Berliner
> Fotografen Dirk Mathesius. Zeigt ausschließlich Bilder aus der Zusammenarbeit; Dirks
> vollständiges Portfolio und Buchungen liegen auf seiner offiziellen Seite.

- [Photography](${SITE}/photography.html): Kollaborationen John Förster × Dirk Mathesius
  (Sport-, Konzept- und Porträtfotografie in Berlin, u. a. Berliner Mauer / Bernauer Straße).
- [Über Dirk Mathesius](${SITE}/ueber-dirk.html): Kurzprofil, Showreel.
- [Kontakt](${SITE}/info.html): Buchungsanfragen.
- Buchungen für Dirk Mathesius laufen über die offizielle Seite: ${OFFICIAL}/
`
  : `# Dirk Mathesius — Fotograf Berlin

> Offizielle Website von Dirk Mathesius, Fotograf in Berlin. Sport-, Porträt-, Musik-,
> Reportage-, Landschafts-, Stills- und Editorial-Fotografie (u. a. Stern, Men's Health).
> Buchungsanfragen für Shootings laufen über das Kontaktformular.

- [Sport](${SITE}/sport.html): Sportfotografie Berlin.
- [People](${SITE}/folks.html): Portraitfotografie Berlin.
- [Music](${SITE}/music.html): Musik- & Konzertfotografie Berlin.
- [Reportage](${SITE}/reportage.html): Reportagefotografie Berlin.
- [Landscape](${SITE}/landscape.html): Landschaftsfotografie.
- [Stills](${SITE}/stills.html): Produktfotografie / Stills Berlin.
- [Publication](${SITE}/publication.html): Editorial Photography (Stern, Men's Health).
- [Hochzeit & private Feiern](${SITE}/hochzeitsfotograf-berlin.html): Hochzeitsfotograf Berlin, Verlobung,
  Geburtstag & private Feiern — individuelles Angebot meist innerhalb von 24 Stunden.
- [Über Dirk Mathesius](${SITE}/ueber-dirk.html): Profil, Showreel.
- [Kontakt](${SITE}/info.html): Buchungsanfragen für Shootings.
`;
writeFileSync(join(root, "public", "llms.txt"), llms);
console.log("✅ llms.txt — Variante " + (IS_FANPAGE ? "fanpage" : "official"));

// --- Static category pages (real .html files → fix Soft-404, served directly by Apache) ---
// Encoding-independent: every non-ASCII char becomes a numeric entity, so the page renders
// correctly regardless of the charset the server declares.
const E = (s) =>
  Array.from(String(s ?? "")).map((ch) => {
    if (ch === "&") return "&amp;";
    if (ch === "<") return "&lt;";
    if (ch === ">") return "&gt;";
    if (ch === '"') return "&quot;";
    if (ch === "'") return "&#39;";
    const code = ch.codePointAt(0);
    return code > 127 ? `&#x${code.toString(16)};` : ch;
  }).join("");

// JSON-LD safe to embed inside <script> (escape the angle bracket sequence).
const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");

const utm = (cat) =>
  isOfficialHost
    // Post-Cutover: diese Seite IST die offizielle Domain → On-Page-Buchungsanker.
    ? `/#info`
    // Pre-Cutover: Buchung an Dirks Live-Server weiterleiten (Performance-Messung).
    : `${OFFICIAL}/?utm_source=dirkmathesius&utm_medium=booking-booster&utm_campaign=portfolio-${cat}`;

// CTA-Beschriftung/Target abhängig vom Host (self-link nach Cutover vermeiden).
const bookLabel = isOfficialHost ? "Shooting anfragen →" : "Buchen auf dirkmathesius.de →";
const bookAttrs = isOfficialHost ? "" : ' target="_blank" rel="noopener"';

const categoryPage = (c) => {
  const seo = seoByCat[c.id];
  const pageUrl = `${SITE}/${c.id}.html`;
  const cover = c.images[0] ? `${SITE}${enc(c.images[0].src)}` : `${SITE}/images/dm-logo.jpg`;

  const nav = siteNavOrder
    .map((id) => {
      const active = id === c.id ? ' style="color:#FF6600;opacity:1;border-color:#FF6600"' : "";
      return `<a href="/${id}.html"${active}>${E(navLabel(id))}</a>`;
    })
    .join("\n        ") + `\n        <a href="/info.html">info</a>`;

  const figures = c.images
    .map((img) => {
      const titleVisible = img.title || img.alt;
      return `      <figure>
        <img src="${enc(img.src)}" alt="${E(img.alt)}" loading="lazy" decoding="async" />
        <figcaption>${E(titleVisible)}</figcaption>
      </figure>`;
    })
    .join("\n");

  const galleryLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": `${pageUrl}#gallery`,
    name: `Dirk Mathesius – ${seo.h1}`,
    url: pageUrl,
    description: seo.description,
    author: CREATOR,
    associatedMedia: c.images.map(imageNode),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: seo.h1, item: pageUrl },
    ],
  };

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${E(seo.title)} | Portfolio</title>
<meta name="description" content="${E(seo.description)}" />
<link rel="canonical" href="${pageUrl}" />
<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
${THEME_BOOT}
<meta property="og:type" content="website" />
<meta property="og:title" content="${E(seo.title)}" />
<meta property="og:description" content="${E(seo.description)}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:image" content="${cover}" />
<meta property="og:site_name" content="Dirk Mathesius" />
<meta name="twitter:card" content="summary_large_image" />
<link href="style.css" rel="stylesheet" type="text/css" />
${GOOGLE_FONT}
<style>
${BASE_PAGE_CSS}
  /* Dezenter Nebenlink People → private Nische — bewusst leiser als der Haupt-CTA. */
  .events-link{text-align:center;margin:10px 0 0;}
  .events-link a{display:inline-flex;align-items:center;gap:6px;font-size:11px;letter-spacing:.08em;
                 color:#999;text-decoration:none;}
  .events-link a:hover{color:#FF6600;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;margin-bottom:28px;}
  figure{margin:0;}
  figure img{width:100%;height:auto;display:block;background:#f3f3f3;border-radius:2px;}
  figcaption{font-size:11px;color:#666;margin-top:6px;line-height:1.4;}
${DARK_CSS}
  /* Seiteneigene Dark-Werte NACH DARK_CSS: exakt die neutralgrauen Tokens der SPA
     (--background/--foreground in src/index.css), statt DARK_CSS' warmem Braunton —
     sonst wirkt der Dark-Modus hier anders als im React-Overlay auf der Startseite. */
  html.dark body{background:#121212;color:#f5f5f5;}
  html.dark .brand .hl{color:#f5f5f5;}
  html.dark .brand .hl .c{color:#666;}
  html.dark nav.cat{border-color:#424242;}
  html.dark nav.cat a{color:#f5f5f5;}
  html.dark h1{color:#f5f5f5;}
  html.dark .intro{color:#9e9e9e;}
  html.dark figcaption{color:#9e9e9e;}
  html.dark .cta{border-color:#424242;}
  html.dark .cta p{color:#9e9e9e;}
  html.dark .events-link a{color:#8a8a8a;}
  html.dark footer{border-color:#424242;color:#9e9e9e;}
  html.dark footer a{color:#9e9e9e;}
</style>
<script type="application/ld+json">${jsonLd(galleryLd)}</script>
<script type="application/ld+json">${jsonLd(breadcrumbLd)}</script>
</head>
<body>
  <div class="wrap">
    <div class="brand">
      <a href="/" aria-label="Startseite"><img src="images/kreuz.jpg" alt="Dirk Mathesius – Fotograf Berlin" width="50" height="50" /></a>
      <div class="hl"><span class="c">&copy;</span> DIRK MATHESIUS FOTOS</div>
    </div>
    ${THEME_BTN}
    <nav class="cat">
        ${nav}
    </nav>

    <!-- Bewusst KEIN CTA hier oben: er stand zwischen Navigation und dem ersten Foto,
         also bevor der Besucher irgendetwas gesehen hat — und war wortgleich mit dem
         unter der Galerie. Eine Kategorie-Seite fragt einmal, nach den Bildern. -->

    <h1>${E(seo.h1)} — ${E(seo.title)}</h1>
    <p class="intro">${E(seo.intro)}</p>

    <section class="grid">
${figures}
    </section>

    <!-- Der einzige CTA der Seite, bewusst NACH den Bildern — und auf beiden Varianten.
         Auf der offiziellen Domain zeigt er auf den Buchungsanker /#info, ist also kein
         Self-Link; ihn dort wegzulassen liesse Dirks Kategorie-Seiten ohne Anfrageweg. -->
    <div class="cta">
      <p>Dieses Motiv oder ein eigenes Projekt anfragen?</p>
      <a class="book" href="${utm(c.id)}"${bookAttrs}>${bookLabel}</a>
    </div>
${c.id === "folks" && !IS_FANPAGE ? `
    <!-- Dezenter Nebenlink zur privaten Nische — bewusst NICHT in der Hauptnavigation,
         nur hier auf der People-Seite, wo Portraitkundschaft ohnehin schon ist. -->
    <p class="events-link">
      <a href="/hochzeitsfotograf-berlin.html">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        Auch für Hochzeiten &amp; private Feiern
      </a>
    </p>` : ""}
    <footer>
      <a href="/">Start</a> ·
      <a href="/info.html">Info</a> ·
      <a href="/impressum.html">Impressum</a> ·
      <a href="/datenschutzerklaerung.html">Datenschutz</a> ·
      <a href="https://www.dirkmathesius.de" target="_blank" rel="noopener">dirkmathesius.de</a>
    </footer>
  </div>
</body>
</html>
`;
};

for (const c of siteCategories) {
  writeFileSync(join(root, "public", `${c.id}.html`), categoryPage(c));
}
console.log(`✅ ${siteCategories.length} statische Kategorie-Seiten — public/{${siteCategories.map((c) => c.id).join(",")}}.html`);

// Auf der Fanpage fallen Dirks Solo-Kategorien weg. Die 301 in public/.htaccess
// faengt sie ab, bevor Apache ueberhaupt eine Datei sucht — aber die alten Dateien
// aus dem official-Lauf liegen weiter in public/ und wuerden mitdeployt. Fiele die
// .htaccess je aus, stuende dort genau das live, was hier entfernt werden soll.
// Deshalb werden sie durch einen harmlosen Zeiger auf Dirk ersetzt: noindex,
// canonical zu ihm, ein Satz, ein Link. Doppelt gesichert statt einmal gehofft.
if (IS_FANPAGE) {
  // Zwei verschiedene Ziele, und die Unterscheidung ist wichtig:
  //  - Rubriken MIT Kollaborationen (sport/folks/publication) sind auf der Fanpage in
  //    /photography.html aufgegangen → intern dorthin zeigen, nicht zu Dirk.
  //  - Rubriken OHNE (music/reportage/landscape/stills) gab es hier nie → zu Dirk.
  const dropped = navOrder.filter((id) => !siteCategories.some((c) => c.id === id));
  let merged = 0, toDirk = 0;
  for (const id of dropped) {
    const hadCollab = (categories.find((c) => c.id === id)?.images || []).some(isCollab);
    const target = hadCollab ? `${SITE}/${PHOTO_ID}.html` : `${OFFICIAL}/${id}.html`;
    const label = navLabel(id);
    hadCollab ? merged++ : toDirk++;
    const title = hadCollab ? "Jetzt in der Übersicht Photography" : `${seoByCat[id].h1} — jetzt auf dirkmathesius.de`;
    const text = hadCollab
      ? `Diese Arbeiten sind in der gemeinsamen Übersicht <b>Photography</b> zusammengefasst.`
      : `Dirks ${E(label)}-Arbeiten sind auf seiner eigenen Seite zu sehen.`;
    const linkText = hadCollab ? "Weiter zu Photography →" : `Weiter zu dirkmathesius.de/${id}.html →`;
    writeFileSync(join(root, "public", `${id}.html`), `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${E(title)}</title>
<meta name="robots" content="noindex, follow" />
<link rel="canonical" href="${target}" />
<meta http-equiv="refresh" content="0; url=${target}" />
</head>
<body style="font-family:Arial,Helvetica,sans-serif;text-align:center;padding:3rem 1rem;">
  <p>${text}</p>
  <p><a href="${target}" style="color:#FF6600;">${E(linkText)}</a></p>
</body>
</html>
`);
  }
  console.log(`✅ ${merged} Rubriken → /${PHOTO_ID}.html zusammengefasst, ${toDirk} Solo-Kategorien → dirkmathesius.de`);
} else {
  // photography.html ist ein reines Fanpage-Artefakt. Bleibt es aus einem frueheren
  // Fanpage-Lauf liegen, wandert es in Dirks Build — mit Fanpage-Inhalt und einem
  // Canonical, der auf die Subdomain zeigt. Also im official-Lauf entfernen.
  const stray = join(root, "public", `${PHOTO_ID}.html`);
  if (existsSync(stray)) {
    rmSync(stray);
    console.log(`✅ ${PHOTO_ID}.html entfernt (Fanpage-Artefakt, gehoert nicht in den official-Build)`);
  }
}

// --- Kollaborationen (John Förster × Dirk) — dezente statische Unterseite ---------
// Business bleibt auf der Startseite; die Fan-/Kollab-Inhalte leben hier (offizielle
// Seite) bzw. auf der Fanpage-Subdomain. Muss inhaltlich zu src/pages/Index.tsx passen.
const COLLAB_TIMELINE = [
  { file: "John-Foerster-freerunner-Sprung-adidas.webp", year: 2008 },
  { file: "John-Foerster-freerunner-Salto-Treppe-adidas.webp", year: 2009 },
  { file: "John-Foerster-Akrobat-Sprung-Pfuetze-Wand-Reichstag.webp", year: 2010 },
  { file: "John-Foerster-Akrobat-Berliner-Mauer-Stelen.webp", year: 2011 },
  { file: "John-Foerster-Akrobat-Zaun-Supermann.webp", year: 2012 },
  { file: "John-Foerster-Akrobat-Handstand-schwangere-Auster.webp", year: 2013 },
  { file: "John-und-Jim-Förster-Kreuz-Sprung.webp", year: 2014 },
  { file: "John-und-Jim-Förster-holy-Salto-Phaeno.webp", year: 2015 },
  { file: "John-und-Jim-Förster-Fuss-high-five-Phaeno.webp", year: 2016 },
];
const COLLAB_BTS = [
  { src: "/images/bts/bts-foerster-human-flag-behala-hafen-berlin.jpg", alt: "Freie Fotokunst, 100% real ohne Bildbearbeitung: Dirk Mathesius in schwebender Hocke und John Förster als Human-Flag am BEHALA-Schild, Berliner Westhafen", title: "Human-Flag am BEHALA-Hafen · Freie Arbeit" },
  { src: "/images/bts/bts-dirk-mathesius-foerster-action-flow-berlin.jpg", alt: "Behind the Scenes: Dirk Mathesius in Action mit den Förster-Brüdern – Freerunning- und Sportfotografie in Berlin", title: "Action-Flow mit den Förster-Brüdern" },
  { src: "/images/bts/bts-foerster-brueder-rauch-action-collab.jpg", alt: "Behind the Scenes: Action-Shooting mit den Förster-Brüdern und Dirk Mathesius – Rauch-/Pyro-Effekt und Sprung vor Berliner Wohnarchitektur", title: "Action-Shoot mit Rauch · Förster-Brüder" },
  { src: "/images/bts/bts-gerolsteiner-making-of-freerunner-john-foerster.jpg", alt: "Behind the Scenes: Making-of eines Gerolsteiner-Commercials in Berlin – Freerunner John Förster im Salto, Lichtset und Crew im Loft-Studio", title: "Making-of · Gerolsteiner-Commercial" },
];

const _collabAll = categories.flatMap((c) => c.images);
const collabTimeline = COLLAB_TIMELINE
  .map((t) => { const img = _collabAll.find((i) => i.src.endsWith(t.file)); return img ? { ...img, year: t.year } : null; })
  .filter(Boolean);

const kollabNav = siteNavOrder.map((id) => `<a href="/${id}.html">${E(navLabel(id))}</a>`).join("\n        ") + `\n        <a href="/info.html">info</a>`;
// Das Canonical zeigt auf BEIDEN Domains zu Dirk — die Kollaborationen sollen seiner
// Seite zugutekommen, nicht der Fanpage. Konsequenz daraus: die Fanpage darf ihre eigene
// Fassung dann auch NICHT in die Sitemap schreiben (siehe IS_FANPAGE-Zweig oben). Eine
// Sitemap-URL, die anderswohin canonicalisiert, hebt sich selbst auf — Google laesst sie
// fallen und man wartet auf eine Indexierung, die nie kommt. Entscheidung John, 2026-08-08.
const kollabCanonical = `${OFFICIAL}/kollaborationen.html`;
const kollabBook = isOfficialHost ? "/#info" : `${OFFICIAL}/?utm_source=kollaborationen&utm_medium=referral&utm_campaign=buchung`;
const kollabBookAttrs = isOfficialHost ? "" : ' target="_blank" rel="noopener"';
const kollabBookLabel = isOfficialHost ? "Shooting anfragen →" : "Zu dirkmathesius.de →";

const timelineFigs = collabTimeline.map((img) =>
  `      <figure>
        <img src="${enc(img.src)}" alt="${E(img.alt)}" loading="lazy" decoding="async" />
        <figcaption>${E(img.year + " · " + (img.title || img.alt))}</figcaption>
      </figure>`).join("\n");
const btsFigs = COLLAB_BTS.map((img) =>
  `      <figure>
        <img src="${enc(img.src)}" alt="${E(img.alt)}" loading="lazy" decoding="async" />
        <figcaption>${E(img.title)}</figcaption>
      </figure>`).join("\n");

const kollabLd = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "@id": `${kollabCanonical}#gallery`,
  name: "Kollaborationen – Dirk Mathesius × John Förster",
  url: kollabCanonical,
  description: "Sport- & Action-Fotografie: Dirk Mathesius mit Sportmodel John Förster (AcroBerlin) und den Förster-Brüdern – Serie 2008–2016 und Behind the Scenes.",
  author: CREATOR,
};

const kollabPage = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Kollaborationen – Dirk Mathesius × John Förster | Sport & Action Berlin</title>
<meta name="description" content="Sport- und Action-Fotografie von Dirk Mathesius mit Sportmodel John Förster (AcroBerlin) und den Förster-Brüdern – freie Fotokunst-Serie 2008–2016 und Behind the Scenes. 100 % real, ohne Bildbearbeitung." />
<link rel="canonical" href="${kollabCanonical}" />
<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
${THEME_BOOT}
<meta property="og:type" content="website" />
<meta property="og:title" content="Kollaborationen – Dirk Mathesius × John Förster" />
<meta property="og:description" content="Sport- & Action-Fotografie mit Sportmodel John Förster – freie Serie 2008–2016 & Behind the Scenes." />
<meta property="og:url" content="${kollabCanonical}" />
<meta name="twitter:card" content="summary_large_image" />
<link href="style.css" rel="stylesheet" type="text/css" />
${GOOGLE_FONT}
<style>
${BASE_PAGE_CSS}
  blockquote{font-size:15px;font-style:italic;color:#444;max-width:680px;margin:22px auto;line-height:1.6;text-align:center;}
  blockquote .who{display:block;font-style:normal;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#888;margin-top:10px;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin:10px 0 26px;}
  figure{margin:0;}
  figure img{width:100%;height:auto;display:block;background:#f3f3f3;border-radius:2px;}
  figcaption{font-size:11px;color:#666;margin-top:6px;line-height:1.4;}
  html.dark blockquote{color:#c2bbb3;}
  html.dark blockquote .who{color:#8d867f;}
${DARK_CSS}
</style>
<script type="application/ld+json">${jsonLd(kollabLd)}</script>
</head>
<body>
  <div class="wrap">
    <div class="brand">
      <a href="/" aria-label="Startseite"><img src="images/kreuz.jpg" alt="Dirk Mathesius – Fotograf Berlin" width="50" height="50" /></a>
      <div class="hl"><span class="c">&copy;</span> DIRK MATHESIUS FOTOS</div>
    </div>
    ${THEME_BTN}
    <nav class="cat">
        ${kollabNav}
    </nav>

    <h1>Kollaborationen — Dirk Mathesius &amp; John Förster</h1>
    <p class="intro">Freie Fotokunst-Serie mit Sportmodel John Förster (AcroBerlin) und den Förster-Brüdern: echte Bewegung, 100&nbsp;% real, ohne Bildbearbeitung. Eine langjährige Zusammenarbeit in Sport-, Action- und Konzeptfotografie.</p>

    <h2>Sportmodel-Serie · 2008–2016</h2>
    <section class="grid">
${timelineFigs}
    </section>

    <h2>Behind the Scenes</h2>
    <section class="grid">
${btsFigs}
    </section>

    <blockquote>„Ich arbeite seit Jahren mit Dirk Mathesius — pure, echte Action, ohne Bildbearbeitung. Mein klarer Tipp für Sport-, Action- &amp; Editorial-Shootings."
      <span class="who">John Förster · Sportmodel &amp; AcroBerlin</span>
    </blockquote>

    <div class="cta">
      <p>Sport-, Action- oder Editorial-Projekt mit Dirk Mathesius?</p>
      <a class="book" href="${kollabBook}"${kollabBookAttrs}>${kollabBookLabel}</a>
    </div>

    <footer>
      <a href="/">Start</a> ·
      <a href="/info.html">Info</a> ·
      <a href="/impressum.html">Impressum</a> ·
      <a href="/datenschutzerklaerung.html">Datenschutz</a> ·
      <a href="https://www.dirkmathesius.de" target="_blank" rel="noopener">dirkmathesius.de</a>
    </footer>
  </div>
</body>
</html>
`;
writeFileSync(join(root, "public", "kollaborationen.html"), kollabPage);
console.log(`✅ kollaborationen.html — Timeline ${collabTimeline.length} + BTS ${COLLAB_BTS.length}, canonical → ${kollabCanonical}`);

// ─── Statische Unterseiten: /ueber-dirk.html + /info.html ────────────────────────
// Die offizielle Startseite ist minimal (Hero + Nav + Footer). Über Dirk und die
// Business-Sektionen (Ergebnisse/Pakete/FAQ/Kontakt) leben hier — SEO/geo-optimal
// (eigene Titel/Description/Canonical + LocalBusiness/geo-JSON-LD auf /info).
const WEB3FORMS_KEY = readEnv("WEB3FORMS_KEY") || readEnv("VITE_WEB3FORMS_KEY") || "";
const SHOWREEL_ID = "D5VtZJvNYGY";
const CLIENTS = [
  "BMW Motorrad", "audible", "Red Bull", "adidas", "Stern", "Men's Health", "Amazon",
  "Heineken", "T-Mobile", "Converse", "Wella", "Jägermeister", "MTV Viacom", "Capital",
  "MADAME", "BVG", "ALBA", "HELIOS Kliniken", "Eurovia Vinci", "Bayer Schering Pharma",
];
const CASES = [
  { t: "Sport & Action", d: "Dynamische Sport- und Action-Fotografie — pure, echte Bewegung, ohne Bildbearbeitung. Basis für Vernissagen, Awards & Editorial." },
  { t: "Industrie & Produkt", d: "Mittelformat (Hasselblad), getethert on location — Baustelle, Hafen, Labor. Präzise, authentische Produkt- und Reportagebilder." },
  { t: "People & Editorial", d: "Portraits & Editorial für Magazine und Marken: Stern, Men's Health, audible, BMW Motorrad, Red Bull, adidas." },
];
const BUNDLES = [
  { t: "Action- & Editorial-Kombi", d: "Dynamische Action- und Editorial-Fotografie mit professionellen Sportmodels & Stunts. Echtes Material, ohne Bildbearbeitung.", p: "Preis auf Anfrage" },
  { t: "Industrie & Produkt — on location", d: "Mittelformat-Shooting mobil bei dir vor Ort und im Studio. Tethered, präzise, zuverlässig.", p: "Preis auf Anfrage" },
];
const FAQS = [
  { q: "Wie läuft ein Shooting mit Dirk Mathesius ab?", a: "Kurzes Briefing & Konzept, Terminabstimmung (mobil bei dir vor Ort oder im Studio), Shooting mit komplettem Profi-Equipment, kuratierte Bildauswahl und Lieferung der finalen Bilder." },
  { q: "In welcher Region arbeitest du?", a: "Basis ist Berlin & Umland; deutschlandweit und international auf Anfrage." },
  { q: "Wem gehören die Nutzungsrechte an den Bildern?", a: "Die Nutzungsrechte werden projektbezogen passend zum Einsatz vereinbart. Urheber bleibt © Dirk Mathesius." },
  { q: "Wie schnell bekomme ich die Bilder?", a: "Eine erste Auswahl zeitnah nach dem Shooting; die finale Bearbeitung richtet sich nach Umfang und Absprache." },
  { q: "Was kostet ein Shooting?", a: "Individuell nach Aufwand, Umfang und Nutzungsrechten — du bekommst ein transparentes Angebot auf Anfrage." },
  { q: "Bietet ihr auch Action-/Sportshootings mit Modellen an?", a: "Ja — dynamische Action- und Sportshootings mit professionellen Sportmodels: echte Action, 100 % real, ohne Bildbearbeitung." },
];

const subNav = siteNavOrder.map((id) => `<a href="/${id}.html">${E(navLabel(id))}</a>`).join("\n        ")
  + `\n        <a href="/ueber-dirk.html">über dirk</a>\n        <a href="/info.html">info</a>`;

const SUB_CSS = `
${BASE_PAGE_CSS}
  .clients{font-size:12px;color:#777;line-height:1.9;max-width:820px;}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;}
  .card{border:1px solid #eee;padding:18px;border-radius:2px;}
  .card h3{margin:0 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#222;}
  .card p{margin:0;font-size:12px;color:#666;line-height:1.6;}
  .card .price{margin-top:10px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#999;}
  .faq details{border-bottom:1px solid #eee;padding:12px 0;}
  .faq summary{cursor:pointer;font-size:13px;color:#333;list-style:none;}
  .faq summary::-webkit-details-marker{display:none;}
  .faq summary:before{content:"+ ";color:#FF6600;}
  .faq p{margin:10px 0 0;font-size:12px;color:#666;line-height:1.6;}
  .showreel{margin:8px 0 4px;}
  .showreel button{background:#111;color:#fff;border:0;padding:14px 22px;font-size:12px;letter-spacing:.1em;cursor:pointer;border-radius:2px;}
  .showreel button:hover{background:#FF6600;}
  form.dm{display:flex;flex-direction:column;gap:12px;max-width:420px;margin:16px 0;}
  form.dm input,form.dm textarea,form.dm select{border:0;border-bottom:1px solid #ccc;padding:10px 2px;font-size:13px;font-family:inherit;outline:none;background:transparent;color:inherit;}
  form.dm input:focus,form.dm textarea:focus,form.dm select:focus{border-color:#FF6600;}
  form.dm .hp{position:absolute;left:-9999px;}
  form.dm button{align-self:flex-start;background:#FF6600;color:#fff;border:0;padding:11px 24px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:background .15s;}
  form.dm button:hover{background:#e25c00;}
  #dm-status{font-size:12px;color:#555;}
  .legal{font-size:10px;color:#aaa;margin-top:8px;}
  html.dark .clients{color:#9a938b;}
  html.dark .showreel button{background:#2a2724;}
  html.dark form.dm select{color:#e8e4df;border-color:#3a3632;}
${DARK_CSS}`;

// `css` = seiten-eigene Regeln, die NUR diese eine Seite bekommt. SUB_CSS teilen
// sich alle Unterseiten (7 Kategorien + kollaborationen + info) auf zwei Domains —
// wer dort etwas aendert, gestaltet unbemerkt alle mit um.
function subPage({ canonical, title, desc, headLd = [], body, css = "" }) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${E(title)}</title>
<meta name="description" content="${E(desc)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${canonical}" />
<meta name="geo.region" content="DE-BE" />
<meta name="geo.placename" content="Berlin" />
<meta name="geo.position" content="52.4547;13.5667" />
<meta name="ICBM" content="52.4547, 13.5667" />
<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
${THEME_BOOT}
<meta property="og:type" content="website" />
<meta property="og:title" content="${E(title)}" />
<meta property="og:description" content="${E(desc)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${SITE}/images/John-Foerster-Human-Flag-Friedenstaube-Pappeln-Berlin.webp" />
<meta name="twitter:card" content="summary_large_image" />
<link href="style.css" rel="stylesheet" type="text/css" />
${GOOGLE_FONT}
<style>${SUB_CSS}${css}</style>
${headLd.map((o) => `<script type="application/ld+json">${jsonLd(o)}</script>`).join("\n")}
</head>
<body>
  <div class="wrap">
    <div class="brand">
      <a href="/" aria-label="Startseite"><img src="images/kreuz.jpg" alt="Dirk Mathesius – Fotograf Berlin" width="50" height="50" /></a>
      <div class="hl"><span class="c">&copy;</span> DIRK MATHESIUS FOTOS</div>
    </div>
    ${THEME_BTN}
    <nav class="cat">
        ${subNav}
    </nav>
${body}
    <footer>
      <a href="/">Start</a> ·
      <a href="/ueber-dirk.html">Über Dirk</a> ·
      <a href="/info.html">Info</a> ·
      <a href="/impressum.html">Impressum</a> ·
      <a href="/datenschutzerklaerung.html">Datenschutz</a>
    </footer>
  </div>
</body>
</html>
`;
}

// --- ueber-dirk.html -------------------------------------------------------
// B2B-Seite: sie muss die Fragen beantworten, die vor einer Buchung stehen —
// wer, womit, wie laeuft es ab, wem gehoeren die Bilder. Pakete und Preise
// bleiben bewusst auf /info.html (kein doppelter Inhalt, kein zweites FAQPage-
// JSON-LD auf derselben Domain) und werden von hier nur verlinkt.

/** Alle acht Behind-the-Scenes-Aufnahmen, mit echten Massen gegen Layout-Spruenge. */
const ABOUT_BTS = [
  { src: "/images/bts/bts-hasselblad-tethered-baustelle-berlin.jpg", w: 1200, h: 1600,
    t: "Hasselblad am Set · Industrie", a: "Behind the Scenes: Hasselblad-Mittelformatkamera mit dirk-mathesius.de am Set – getethertes Industrie- und Baustellen-Shooting in Berlin" },
  { src: "/images/bts/bts-dirk-mathesius-monitor-industrie-hafen.jpg", w: 1200, h: 1600,
    t: "Live-Monitor · Hafen", a: "Behind the Scenes: Live-Monitor mit dirk-mathesius.de bei einem Industrie- und Hafen-Shooting in Berlin" },
  { src: "/images/bts/bts-dirk-mathesius-produktfotografie-labor.jpg", w: 1600, h: 1575,
    t: "Produktfotografie im Labor", a: "Behind the Scenes: Dirk Mathesius bei der Produktfotografie an einem Matest Softmatic Prüfgerät im Labor" },
  { src: "/images/bts/bts-gerolsteiner-making-of-freerunner-john-foerster.jpg", w: 1417, h: 945,
    t: "Making-of · Gerolsteiner-Commercial", a: "Behind the Scenes: Making-of eines Gerolsteiner-Commercials in Berlin – Freerunner im Salto, Lichtset und Crew im Loft-Studio" },
  { src: "/images/bts/bts-foerster-human-flag-behala-hafen-berlin.jpg", w: 1600, h: 1067,
    t: "Human-Flag am BEHALA-Hafen", a: "Freie Fotokunst, 100% real ohne Bildbearbeitung: Dirk Mathesius in schwebender Hocke und John Förster als Human-Flag am BEHALA-Schild, Berliner Westhafen" },
  { src: "/images/bts/bts-dirk-mathesius-foerster-action-flow-berlin.jpg", w: 702, h: 1246,
    t: "Action-Flow am Set", a: "Behind the Scenes: Dirk Mathesius in Action mit den Förster-Brüdern – Freerunning- und Sportfotografie in Berlin" },
  { src: "/images/bts/bts-foerster-brueder-rauch-action-collab.jpg", w: 639, h: 1136,
    t: "Action-Shoot mit Rauch", a: "Behind the Scenes: Action-Shooting mit Rauch-/Pyro-Effekt und Sprung vor Berliner Wohnarchitektur" },
  { src: "/images/bts/bts-dirk-mathesius-balance-cube-berlin-spree.jpg", w: 1600, h: 1200,
    t: "Balance am Cube Berlin", a: "Behind the Scenes: Dirk Mathesius in Balance-Pose am Cube Berlin an der Spree, Berlin Hauptbahnhof" },
];

/** Ablauf einer Produktion — die Frage jedes Auftraggebers vor der Buchung. */
const ABOUT_STEPS = [
  { n: "01", t: "Briefing", d: "Kurzes Gespräch über Ziel, Motive und Nutzung. Daraus entsteht ein konkretes Konzept statt einer Preisliste." },
  { n: "02", t: "Planung", d: "Termin, Location und Team. Mobil bei Ihnen vor Ort — Baustelle, Hafen, Labor, Büro — oder im Studio." },
  { n: "03", t: "Produktion", d: "Shooting mit komplettem Profi-Equipment. Getethert, Ergebnisse direkt am Monitor mitverfolgen und freigeben." },
  { n: "04", t: "Lieferung", d: "Kuratierte Auswahl zeitnah nach dem Termin, finale Bilder nach Absprache — im benötigten Format." },
];

/** Technik-Belege, die im B2B-Vergleich tatsächlich zählen. */
const ABOUT_TECH = [
  { t: "Mittelformat", d: "Hasselblad 501c mit CFV-Digitalrückteil — Auflösung und Tonwerte für Print, Großformat und Kampagnen." },
  { t: "Tethered on location", d: "Aufnahme direkt auf den Monitor. Bildauswahl und Freigabe passieren am Set, nicht Tage später." },
  { t: "Mobil & Studio", d: "Komplettes Licht- und Kamera-Setup reist mit. Industrie, Sport und People auch unter rauen Bedingungen." },
  { t: "Ohne Bildbearbeitung", d: "Action und Sport entstehen real vor der Kamera — kein Composing, keine nachträgliche Erfindung." },
];

/* Seiten-eigenes CSS — alles unter .ueber, damit die Geschwister-Seiten
   (Kategorien, kollaborationen, info) unveraendert bleiben. */
const UEBER_CSS = `
  .ueber{max-width:1000px;}
  .ueber .lead{font-size:clamp(15px,2.4vw,19px);line-height:1.65;color:#333;max-width:44em;margin:0 0 26px;}
  .ueber .lead b{font-weight:600;color:#111;}
  .ueber h1{font-size:clamp(24px,5vw,40px);line-height:1.12;letter-spacing:-.01em;font-weight:600;color:#111;margin:30px 0 16px;max-width:20em;}
  .ueber h2{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#999;border-top:1px solid #ececec;padding-top:26px;margin:52px 0 20px;font-weight:600;}
  .ueber .facts{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 30px;padding:0;list-style:none;}
  .ueber .facts li{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#555;border:1px solid #e4e4e4;border-radius:2px;padding:7px 12px;}
  .ueber .facts li b{color:#FF6600;font-weight:600;}
  .ueber .film{margin:0 0 8px;}
  .ueber .film button{display:block;width:100%;position:relative;border:0;padding:0;cursor:pointer;background:#111;overflow:hidden;}
  .ueber .film button img{display:block;width:100%;height:auto;opacity:.62;transition:opacity .25s,transform .5s;}
  .ueber .film button:hover img{opacity:.8;transform:scale(1.02);}
  .ueber .film .play{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#fff;pointer-events:none;}
  .ueber .film .disc{width:64px;height:64px;border-radius:50%;background:#FF6600;display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1;padding-left:5px;}
  .ueber .film .lbl{font-size:11px;letter-spacing:.2em;text-transform:uppercase;text-shadow:0 1px 8px rgba(0,0,0,.6);}
  .ueber .cap{font-size:11px;color:#999;line-height:1.6;margin:0 0 8px;}
  .ueber .logos{display:flex;flex-wrap:wrap;gap:7px;padding:0;margin:0;list-style:none;}
  .ueber .logos li{font-size:12px;color:#444;background:#f6f6f6;padding:8px 13px;letter-spacing:.02em;}
  .ueber .steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:1px;background:#ececec;border:1px solid #ececec;}
  .ueber .steps > div{background:#fff;padding:20px 18px;}
  .ueber .steps .n{font-size:10px;letter-spacing:.2em;color:#FF6600;font-weight:600;}
  .ueber .steps h3{margin:8px 0 7px;font-size:14px;font-weight:600;color:#111;letter-spacing:0;text-transform:none;}
  .ueber .steps p{margin:0;font-size:12.5px;line-height:1.65;color:#666;}
  .ueber .tech{display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:22px 30px;}
  .ueber .tech h3{margin:0 0 6px;font-size:13px;font-weight:600;color:#111;letter-spacing:0;text-transform:none;}
  .ueber .tech h3:before{content:"—";color:#FF6600;margin-right:8px;}
  .ueber .tech p{margin:0;font-size:12.5px;line-height:1.65;color:#666;}
  .ueber .bts{columns:2;column-gap:10px;}
  @media(min-width:700px){.ueber .bts{columns:3;column-gap:12px;}}
  .ueber .bts figure{break-inside:avoid;margin:0 0 10px;position:relative;background:#f2f2f2;}
  .ueber .bts img{display:block;width:100%;height:auto;}
  .ueber .bts figcaption{position:absolute;left:0;right:0;bottom:0;padding:20px 10px 8px;font-size:10.5px;letter-spacing:.03em;color:#fff;background:linear-gradient(to top,rgba(0,0,0,.72),transparent);}
  .ueber .rights{border-left:2px solid #FF6600;padding:2px 0 2px 18px;max-width:44em;}
  .ueber .rights p{margin:0 0 10px;font-size:13px;line-height:1.7;color:#555;}
  .ueber .rights p:last-child{margin-bottom:0;}
  .ueber .close{margin:56px 0 8px;padding:34px 24px;background:#111;text-align:center;}
  .ueber .close p{margin:0 auto 20px;font-size:clamp(15px,2.2vw,19px);line-height:1.5;color:#fff;max-width:24em;}
  .ueber .close .row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;}
  .ueber .close .alt{color:#bbb;text-decoration:none;font-size:11px;letter-spacing:.14em;text-transform:uppercase;border-bottom:1px solid #444;padding-bottom:2px;}
  .ueber .close .alt:hover{color:#FF6600;border-color:#FF6600;}
  .ueber .more{font-size:12.5px;color:#666;line-height:1.8;}
  .ueber .more a{color:#FF6600;text-decoration:none;}
  .ueber .more a:hover{text-decoration:underline;}
`;

const ueberBody = `
  <div class="ueber">
    <h1>Fotografie, die vor der Kamera passiert — seit 1997 in Berlin</h1>

    <p class="lead">Dirk Mathesius fotografiert <b>Sport, People, Industrie, Reportage und Editorial</b> —
      für Marken, Magazine und Unternehmen. Seine Bilder erscheinen in führenden Titeln und Kampagnen,
      von BMW Motorrad und Red Bull über adidas und audible bis Stern und Men&#39;s Health.
      Action entsteht dabei real vor der Linse, nicht nachträglich am Rechner.</p>

    <ul class="facts">
      <li>seit <b>1997</b></li>
      <li><b>30+</b> Jahre Erfahrung</li>
      <li>Berlin &amp; international</li>
      <li>Hasselblad <b>Mittelformat</b></li>
      <li>mobil vor Ort &amp; Studio</li>
    </ul>

    <h2>Bewegtbild</h2>
    <div class="film">
      <button id="sr-btn" type="button" aria-label="Film abspielen (lädt erst nach Klick von YouTube)">
        <img src="/images/John-Foerster-Human-Flag-Friedenstaube-Pappeln-Berlin.webp"
             alt="Standbild: Human-Flag zwischen Pappeln mit Friedenstaube – fotografiert von Dirk Mathesius"
             width="1617" height="1212" loading="lazy" decoding="async" />
        <span class="play"><span class="disc">▶</span><span class="lbl">Film abspielen</span></span>
      </button>
    </div>
    <p class="cap">„Die FriedensFlagge“ · Human Flag, fotografiert von Dirk Mathesius ·
      Video auf dem Kanal von John Förster (@berlinjohn.de). Lädt erst nach Klick — vorher werden keine Daten an YouTube gesendet.</p>

    <h2>Vertraut von</h2>
    <ul class="logos">${CLIENTS.map((c) => `<li>${E(c)}</li>`).join("")}</ul>

    <h2>Wie eine Produktion abläuft</h2>
    <div class="steps">${ABOUT_STEPS.map((s) => `<div><div class="n">${s.n}</div><h3>${E(s.t)}</h3><p>${E(s.d)}</p></div>`).join("")}</div>

    <h2>Technik &amp; Arbeitsweise</h2>
    <div class="tech">${ABOUT_TECH.map((t) => `<div><h3>${E(t.t)}</h3><p>${E(t.d)}</p></div>`).join("")}</div>

    <h2>Behind the Scenes</h2>
    <p class="lead">Wie die Bilder entstehen — Baustelle, Hafen, Labor, Studio und Straße.</p>
    <div class="bts">${ABOUT_BTS.map((b) => `<figure><img src="${b.src}" alt="${E(b.a)}" width="${b.w}" height="${b.h}" loading="lazy" decoding="async" /><figcaption>${E(b.t)}</figcaption></figure>`).join("")}</div>

    <h2 id="nutzungsrechte">Nutzungsrechte</h2>
    <div class="rights">
      <p>Die Nutzungsrechte werden <b>projektbezogen und passend zum tatsächlichen Einsatz</b> vereinbart —
        von der einmaligen Magazinstrecke bis zur zeitlich und räumlich weiten Kampagnennutzung.
        Was Sie brauchen, steht vor dem Shooting im Angebot, nicht als Überraschung danach.</p>
      <p>Urheber bleibt in jedem Fall © Dirk Mathesius. Umfang, Dauer und Gebiet halten wir schriftlich fest,
        damit Ihre Marketing- und Rechtsabteilung eine belastbare Grundlage hat.</p>
    </div>

    <h2>Mehr sehen</h2>
    <p class="more">
      Pakete, Preisrahmen und häufige Fragen: <a href="/info.html">Info &amp; Anfrage →</a><br />
      Ausgewählte Kollaborationen: <a href="/kollaborationen.html">Kollaborationen →</a><br />
      Laufende Arbeiten und Showreels: <a href="https://www.instagram.com/dirk_mathesius/" target="_blank" rel="noopener">Instagram →</a>
    </p>

    <div class="close">
      <p>Sport-, People-, Industrie- oder Editorial-Projekt? Erzählen Sie kurz, worum es geht.</p>
      <div class="row">
        <a class="book" href="${IS_FANPAGE ? `${OFFICIAL}/info.html#kontakt` : "/info.html#kontakt"}">Projekt anfragen →</a>
        <a class="alt" id="ue-call" href="${IS_FANPAGE ? `${OFFICIAL}/info.html#kontakt` : "/info.html#kontakt"}">oder direkt anrufen</a>
      </div>
    </div>
    <script>
      /* Film erst auf Klick nachladen (kein YouTube-Kontakt vorher).
         Telefonnummer erst im Browser zusammensetzen — sie steht nirgends
         im Klartext im HTML, siehe gleiche Loesung auf /info.html. */
      (function () {
        var b = document.getElementById('sr-btn');
        if (b) b.addEventListener('click', function () {
          var f = document.createElement('iframe');
          f.width = '100%'; f.height = '520'; f.title = 'Film — fotografiert von Dirk Mathesius';
          f.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
          f.allowFullscreen = true; f.style.border = '0'; f.style.display = 'block';
          f.src = 'https://www.youtube-nocookie.com/embed/${SHOWREEL_ID}?autoplay=1&rel=0&playsinline=1';
          this.parentNode.replaceChild(f, this);
        });
        var c = document.getElementById('ue-call');
        if (c) c.href = 'tel:' + atob('KzQ5MTc1NTkxNTY3MA==');
      })();
    </script>
  </div>`;
// Person/Photographer — KEIN telephone-Feld: die Nummer wird auf der Seite bewusst
// erst im Browser zusammengesetzt, im JSON-LD stuende sie wieder im Klartext.
const ueberPersonLd = {
  "@context": "https://schema.org",
  "@type": ["Person", "Photographer"],
  "@id": `${SITE}/ueber-dirk.html#person`,
  name: "Dirk Mathesius",
  jobTitle: "Fotograf",
  url: `${SITE}/ueber-dirk.html`,
  email: "mail@dirkmathesius.de",
  image: `${SITE}/images/bts/bts-hasselblad-tethered-baustelle-berlin.jpg`,
  description:
    "Berliner Fotograf seit 1997 für Sport, People, Industrie, Reportage und Editorial. Mittelformat (Hasselblad), getethert on location, mobil und im Studio. Über 30 Jahre Erfahrung.",
  address: { "@type": "PostalAddress", streetAddress: "Bahrendorfer Straße 22", addressLocality: "Berlin", postalCode: "12555", addressCountry: "DE" },
  areaServed: ["Berlin", "Brandenburg", "Deutschland"],
  knowsAbout: ["Sportfotografie", "Industriefotografie", "Produktfotografie", "Portraitfotografie", "Reportagefotografie", "Editorial Photography", "Mittelformatfotografie"],
  sameAs: [OFFICIAL, "https://www.instagram.com/dirk_mathesius/"],
};

writeFileSync(join(root, "public", "ueber-dirk.html"), subPage({
  canonical: `${SITE}/ueber-dirk.html`,
  title: "Über Dirk Mathesius — Fotograf Berlin seit 1997 | Sport, Industrie, Editorial",
  desc: "Dirk Mathesius: Berliner Fotograf seit 1997, über 30 Jahre Erfahrung. Sport, People, Industrie, Reportage & Editorial. Hasselblad-Mittelformat, getethert on location. Kunden: BMW Motorrad, Red Bull, adidas, audible, Stern, Men's Health.",
  headLd: [ueberPersonLd],
  css: UEBER_CSS,
  body: ueberBody,
}));

// --- info.html (Ergebnisse · Pakete · FAQ · Kontakt + Formular) ---
const formHtml = WEB3FORMS_KEY ? `
    <form class="dm" id="dm-form">
      <input type="hidden" name="access_key" value="${WEB3FORMS_KEY}" />
      <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="E-Mail" required />
      <input name="telefon" type="tel" placeholder="Telefon (optional)" />
      <textarea name="message" rows="3" placeholder="Projekt / Nachricht" required></textarea>
      <button type="submit">Anfrage senden</button>
      <p id="dm-status"></p>
      <p class="legal">Mit dem Absenden werden deine Angaben zur Bearbeitung der Anfrage verarbeitet (Versand via Web3Forms). Details: <a href="/datenschutzerklaerung.html">Datenschutz</a>.</p>
    </form>
    <script>
      (function () {
        var f = document.getElementById('dm-form'), s = document.getElementById('dm-status');
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          s.textContent = 'senden…';
          var r = Object.fromEntries(new FormData(f).entries());
          /* Web3Forms rendert die JSON-Schluessel 1:1 als Beschriftungen in der
             Mail. Deshalb hier saubere deutsche Labels statt der technischen
             Feldnamen — ein gestaltetes HTML-Template gibt es nur im PRO-Tarif,
             die Lesbarkeit entsteht also ueber Schluessel, Betreff und Reihenfolge.
             replyto sorgt dafuer, dass "Antworten" direkt beim Kunden landet. */
          var data = {
            access_key: r.access_key,
            botcheck: r.botcheck,
            subject: 'Shooting-Anfrage: ' + (r.name || 'ohne Namen') + ' — dirkmathesius.de',
            from_name: r.name || 'Anfrage über dirkmathesius.de',
            replyto: r.email || '',
            'Name': r.name || '—',
            'E-Mail': r.email || '—',
            'Telefon': r.telefon || '— (nicht angegeben)',
            'Projekt / Nachricht': r.message || '—',
            'Gesendet über': location.host + location.pathname
          };
          fetch('https://api.web3forms.com/submit', {
            method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
          }).then(function (r) { return r.json(); }).then(function (d) {
            if (d.success) { f.reset(); f.querySelector('button').style.display = 'none';
              s.innerHTML = 'Danke für deine Anfrage! Dirk meldet sich zeitnah bei dir.'; }
            else { s.textContent = 'Senden fehlgeschlagen – bitte per Telefon oder E-Mail.'; }
          }).catch(function () { s.textContent = 'Senden fehlgeschlagen – bitte per Telefon oder E-Mail.'; });
        });
      })();
    </script>` : `
    <p class="intro"><a class="book" href="mailto:mail@dirkmathesius.de?subject=Projektanfrage">Anfrage per E-Mail →</a></p>`;

const infoLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE}/info.html#business`,
  name: "Dirk Mathesius Photography",
  description: "Professionelle Fotografie in Berlin: Sport, People, Music, Reportage & Editorial. Buchung & Anfrage.",
  url: `${SITE}/info.html`,
  // telephone bewusst NICHT im JSON-LD: es stuende sonst im Klartext im HTML und
  // machte die Verschleierung der Nummer auf der Seite wirkungslos. Das Feld ist
  // bei LocalBusiness optional; massgeblich fuer lokale Treffer ist das Google-
  // Unternehmensprofil, nicht dieses Markup. Wieder aufnehmen = eine Zeile.
  email: "mail@dirkmathesius.de",
  image: `${SITE}/images/John-Foerster-Human-Flag-Friedenstaube-Pappeln-Berlin.webp`,
  priceRange: "€€€",
  address: { "@type": "PostalAddress", streetAddress: "Bahrendorfer Straße 22", addressLocality: "Berlin", postalCode: "12555", addressCountry: "DE" },
  geo: { "@type": "GeoCoordinates", latitude: 52.4547, longitude: 13.5667 },
  areaServed: ["Berlin", "Brandenburg", "Deutschland"],
};
const infoFaqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

const infoBody = `
    <h1>Info &amp; Anfrage — Dirk Mathesius Fotografie Berlin</h1>
    <p class="intro">Fotograf in Berlin, aktiv seit 1997, über 30 Jahre Erfahrung. Sport · People · Music · Publication · Landscape · Reportage · Stills. Mobil bei dir vor Ort und im Studio, deutschlandweit auf Anfrage.</p>

    <h2>Ergebnisse</h2>
    <div class="cards">${CASES.map((c) => `<div class="card"><h3>${E(c.t)}</h3><p>${E(c.d)}</p></div>`).join("")}</div>

    <h2>Pakete</h2>
    <div class="cards">${BUNDLES.map((b) => `<div class="card"><h3>${E(b.t)}</h3><p>${E(b.d)}</p><p class="price">${E(b.p)}</p></div>`).join("")}</div>

    <h2>FAQ</h2>
    <div class="faq">${FAQS.map((f) => `<details><summary>${E(f.q)}</summary><p>${E(f.a)}</p></details>`).join("")}</div>

    <h2 id="kontakt">Kontakt &amp; Buchung</h2>
    <p class="intro">Dirk Mathesius · Bahrendorfer Straße 22 · 12555 Berlin · Mobil <span id="dm-tel">…</span> · <a href="mailto:mail@dirkmathesius.de">mail@dirkmathesius.de</a></p>
    <p><a class="book" id="dm-call" href="#kontakt">Direkt anrufen</a></p>
    <script>
      /* Nummer nicht im Klartext im HTML — sie wird erst im Browser zusammengesetzt.
         Haelt die einfachen Harvester ab, die tel:-Links und Ziffernfolgen einsammeln.
         Ohne JS bleibt der Kontaktweg ueber Formular und E-Mail vollstaendig nutzbar. */
      (function () {
        var n = atob("KzQ5MTc1NTkxNTY3MA==");
        var pretty = "+" + n.slice(1, 3) + " " + n.slice(3, 6) + " " + n.slice(6);
        var s = document.getElementById("dm-tel");
        if (s) { var a = document.createElement("a"); a.href = "tel:" + n; a.textContent = pretty; s.replaceWith(a); }
        var b = document.getElementById("dm-call");
        if (b) { b.href = "tel:" + n; }
      })();
    </script>
${formHtml}`;
writeFileSync(join(root, "public", "info.html"), subPage({
  canonical: `${SITE}/info.html`,
  title: "Info & Anfrage — Fotograf Berlin buchen | Dirk Mathesius",
  desc: "Shooting mit Dirk Mathesius in Berlin anfragen: Sport, People, Editorial, Industrie. Pakete, FAQ & direkter Kontakt (Telefon, Formular). Bahrendorfer Straße 22, 12555 Berlin.",
  headLd: [infoLd, infoFaqLd],
  body: infoBody,
}));
console.log(`✅ ueber-dirk.html + info.html — statische Unterseiten (info: LocalBusiness+FAQ JSON-LD, Formular ${WEB3FORMS_KEY ? "Web3Forms" : "mailto-Fallback"})`);

// --- hochzeitsfotograf-berlin.html (private Nebenpositionierung, NUR offizielle Domain) ---
// Dirks eigene B2C-Nische neben dem B2B-Kerngeschaeft: Hochzeit, Verlobung, Geburtstag,
// private Feiern. Bewusst NICHT in der Hauptnavigation (navOrder bleibt B2B) — erreichbar
// über Suche + den dezenten Link auf /folks.html. Auf der Fanpage gibt es das nicht: sie
// zeigt ausschliesslich die Kollaborationen mit John Förster, keine Solo-Angebote Dirks.
if (!IS_FANPAGE) {
  // Drei Gruppen statt einer flachen Liste — sowohl fuer die Lesbarkeit bei zehn
  // Anlaessen als auch als SEO-Signal: jede Gruppe ist ein eigenes Themen-Cluster
  // (eigene <h2>, eigene <optgroup>), statt zehn beliebig sortierte Karten.
  const NICHE_ICONS = {
    g1: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    g2: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    g3: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  };
  const NICHE_GROUPS = [
    {
      label: "Private Anlässe",
      cls: "g1",
      items: [
        { id: "Hochzeit", t: "Hochzeit", d: "Trauung, Feier und die Momente dazwischen — dokumentarisch begleitet, ohne gestellte Regie." },
        { id: "Verlobung & Paarshooting", t: "Verlobung &amp; Paarshooting", d: "Ein ruhiges Shooting zu zweit, bevor der große Tag kommt." },
        { id: "Geburtstag & Jubiläum", t: "Geburtstag &amp; Jubiläum", d: "Runde Geburtstage, goldene Hochzeit, Familienfeste — festgehalten, nicht inszeniert." },
        { id: "Private Feier", t: "Private Feiern &amp; Empfänge", d: "Gartenfeste, private Empfänge, besondere Anlässe im kleinen Kreis." },
        { id: "Familie & Neugeborene", t: "Familie &amp; Neugeborene", d: "Die ersten gemeinsamen Fotos, Familienshootings zuhause oder draußen — echt statt gestellt." },
      ],
    },
    {
      label: "Business & Bewerbung",
      cls: "g2",
      items: [
        { id: "Business-Portrait", t: "Business-Portrait", d: "Aussagekräftige Portraits für LinkedIn, Website und Pressemappe." },
        { id: "Bewerbungsfoto", t: "Bewerbungsfoto", d: "Professionelles Bewerbungsfoto — meist kurzfristig möglich." },
      ],
    },
    {
      label: "Fashion & Kreativ",
      cls: "g3",
      items: [
        { id: "Sport-Portrait privat", t: "Sport-Portrait", d: "Läufer, Kampfsport, Fitness — dein Sport im stärksten Moment festgehalten." },
        { id: "Fashion-Editorial", t: "Fashion-Editorial", d: "Editorial-Shooting für Portfolio, Modelbook oder eine eigene Bildstrecke." },
        { id: "Creative Content", t: "Creative Content", d: "Content-Shooting für Social Media, Portfolio oder ein eigenes kreatives Projekt." },
      ],
    },
  ];
  const NICHE = NICHE_GROUPS.flatMap((g) => g.items);

  const EVENT_FAQS = [
    { q: "Wie weit im Voraus sollten wir buchen?", a: "Für Hochzeiten am besten 6–12 Monate im Voraus, besonders in der Saison von Mai bis September. Für kleinere Anlässe reichen oft wenige Wochen." },
    { q: "Wie viele Bilder bekommen wir?", a: "Eine kuratierte Auswahl der stärksten Momente, passend zu Dauer und Anlass — der Umfang steht vor dem Termin fest, keine Überraschung danach." },
    { q: "Bearbeitet ihr die Bilder nachträglich?", a: "Farbe und Licht werden fein abgestimmt, das Motiv selbst bleibt echt — wie im gesamten Portfolio von Dirk Mathesius." },
    { q: "Kommt ihr auch außerhalb Berlins?", a: "Ja, deutschlandweit auf Anfrage." },
    { q: "Wie schnell bekommen wir ein Angebot?", a: "Meist innerhalb von 24 Stunden — bei sehr vielen Anfragen kann es vereinzelt etwas länger dauern." },
    { q: "Bietet ihr auch Business-Portraits oder Bewerbungsfotos an?", a: "Ja — kurze, professionelle Sessions für LinkedIn, Website oder Bewerbung, oft innerhalb weniger Tage umsetzbar." },
    { q: "Was ist ein Fashion-Editorial oder Content-Shooting?", a: "Ein freies, konzeptionelles Shooting für Portfolio, Modelbook oder eigene Social-Media-Inhalte — mit klarer Bildsprache statt Schnappschuss." },
  ];

  const EVENTS_CSS = `
  .events{max-width:900px;}
  .events .lead{font-size:clamp(15px,2.4vw,19px);line-height:1.65;color:#333;max-width:42em;margin:0 0 22px;}
  .events .lead b{font-weight:600;color:#111;}
  .events h1{font-size:clamp(24px,5vw,38px);line-height:1.14;letter-spacing:-.01em;font-weight:600;color:#111;margin:30px 0 14px;max-width:19em;}
  .events .promise{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;letter-spacing:.06em;
                    color:#a5600a;background:#fff4e8;border:1px solid #ffd9ad;border-radius:3px;padding:8px 14px;margin:0 0 28px;}
  .events .promise svg{flex:none;}
  /* Hero-Band: bewusst abstrakt (Verlauf + Marken-Kreuz), KEIN echtes Foto —
     ein Bestandskunden-Portrait aus einem anderen Kontext (WELLA/audible/Red Bull)
     als "Hochzeitsbeispiel" umzudeuten waere fuer echte Besucher irrefuehrend.
     Sobald Dirk eigene Beispielfotos je Anlass hat: hier + in .thumb ersetzen. */
  .events .hero{position:relative;height:150px;border-radius:4px;overflow:hidden;margin:0 0 32px;
                 background:linear-gradient(115deg,#ffb066 0%,#FF6600 38%,#c23f0a 100%);}
  .events .hero .x{position:absolute;top:50%;right:-30px;width:230px;height:230px;transform:translateY(-50%) rotate(-12deg);opacity:.16;}
  .events .hero .x b{position:absolute;top:50%;left:50%;width:230px;height:34px;background:#fff;border-radius:2px;}
  .events .hero .x b:first-child{transform:translate(-50%,-50%) rotate(45deg);}
  .events .hero .x b:last-child{transform:translate(-50%,-50%) rotate(-45deg);}
  .events .hero .cap{position:absolute;left:22px;bottom:18px;color:#fff;font-style:italic;font-size:clamp(14px,2.2vw,18px);
                      text-shadow:0 1px 10px rgba(0,0,0,.25);max-width:20em;}
  .events h2{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#999;border-top:1px solid #ececec;padding-top:24px;margin:46px 0 18px;font-weight:600;}
  .events .niche-list{display:flex;flex-direction:column;gap:1px;background:#ececec;border:1px solid #ececec;margin:0 0 4px;}
  .events .niche-list a{display:flex;align-items:center;gap:14px;
                         background:#fff;padding:14px 18px;text-decoration:none;color:inherit;transition:background .15s;}
  .events .niche-list a:hover{background:#fafafa;}
  .events .niche-list .thumb{flex:none;width:52px;height:52px;border-radius:3px;display:flex;align-items:center;justify-content:center;}
  .events .niche-list .thumb svg{width:22px;height:22px;color:#fff;opacity:.92;}
  .events .niche-list .thumb.g1{background:linear-gradient(135deg,#f0a05c,#c9531a);}
  .events .niche-list .thumb.g2{background:linear-gradient(135deg,#6b7684,#333d47);}
  .events .niche-list .thumb.g3{background:linear-gradient(135deg,#e8b23d,#a8681c);}
  .events .niche-list .txt{flex:1;min-width:0;}
  .events .niche-list .txt h3{margin:0 0 4px;font-size:14px;font-weight:600;color:#111;letter-spacing:0;}
  .events .niche-list .txt p{margin:0;font-size:12.5px;line-height:1.55;color:#666;max-width:36em;}
  .events .niche-list .arrow{flex:none;color:#FF6600;font-size:15px;}
  .events select{border:0;border-bottom:1px solid #ccc;padding:10px 2px;font-size:13px;font-family:inherit;
                  outline:none;background:transparent;color:inherit;}
  .events select:focus{border-color:#FF6600;}
  .events .close{margin:56px 0 8px;padding:34px 24px;background:#111;text-align:center;}
  .events .close p{margin:0 auto 20px;font-size:clamp(15px,2.2vw,19px);line-height:1.5;color:#fff;max-width:24em;}
  .events .close .row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;}
  .events .close .alt{color:#bbb;text-decoration:none;font-size:11px;letter-spacing:.14em;text-transform:uppercase;border-bottom:1px solid #444;padding-bottom:2px;}
  .events .close .alt:hover{color:#FF6600;border-color:#FF6600;}
  html.dark .events .lead{color:#cfcfcf;}
  html.dark .events .lead b{color:#f5f5f5;}
  html.dark .events h1{color:#f5f5f5;}
  html.dark .events .promise{color:#ffb35c;background:#3a2408;border-color:#5a3a12;}
  html.dark .events h2{color:#9e9e9e;border-color:#424242;}
  html.dark .events .niche-list{background:#333;border-color:#424242;}
  html.dark .events .niche-list a{background:#1c1c1c;}
  html.dark .events .niche-list a:hover{background:#242424;}
  html.dark .events .niche-list .txt h3{color:#f5f5f5;}
  html.dark .events .niche-list .txt p{color:#9e9e9e;}
  html.dark .events select{color:#f5f5f5;border-color:#555;}
`;

  const eventsFormHtml = WEB3FORMS_KEY ? `
    <form class="dm" id="dm-events-form">
      <input type="hidden" name="access_key" value="${WEB3FORMS_KEY}" />
      <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <select name="anlass" id="dm-events-anlass" required>
        <option value="" disabled selected>Anlass wählen…</option>
${NICHE_GROUPS.map((g) => `        <optgroup label="${E(g.label)}">
${g.items.map((n) => `          <option value="${E(n.id)}">${n.t}</option>`).join("\n")}
        </optgroup>`).join("\n")}
        <option value="Sonstiger Anlass">Sonstiger Anlass</option>
      </select>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="E-Mail" required />
      <input name="telefon" type="tel" placeholder="Telefon (optional)" />
      <input name="datum" placeholder="Wunschtermin (optional)" />
      <textarea name="message" rows="3" placeholder="Kurz zum Anlass — Ort, ungefähre Gästezahl, was euch wichtig ist"></textarea>
      <button type="submit">Angebot anfragen</button>
      <p id="dm-events-status"></p>
      <p class="legal">Mit dem Absenden werden deine Angaben zur Bearbeitung der Anfrage verarbeitet (Versand via Web3Forms). Details: <a href="/datenschutzerklaerung.html">Datenschutz</a>.</p>
    </form>
    <script>
      (function () {
        var f = document.getElementById('dm-events-form'), s = document.getElementById('dm-events-status');
        document.querySelectorAll('.niche-list a[data-anlass]').forEach(function (a) {
          a.addEventListener('click', function () {
            var sel = document.getElementById('dm-events-anlass');
            if (sel) { sel.value = a.getAttribute('data-anlass'); }
          });
        });
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          s.textContent = 'senden…';
          var r = Object.fromEntries(new FormData(f).entries());
          var data = {
            access_key: r.access_key,
            botcheck: r.botcheck,
            subject: 'Private-Event-Anfrage (' + (r.anlass || 'Anlass offen') + '): ' + (r.name || 'ohne Namen') + ' — dirkmathesius.de',
            from_name: r.name || 'Anfrage über dirkmathesius.de',
            replyto: r.email || '',
            'Anlass': r.anlass || '—',
            'Name': r.name || '—',
            'E-Mail': r.email || '—',
            'Telefon': r.telefon || '— (nicht angegeben)',
            'Wunschtermin': r.datum || '— (nicht angegeben)',
            'Nachricht': r.message || '—',
            'Gesendet über': location.host + location.pathname
          };
          fetch('https://api.web3forms.com/submit', {
            method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
          }).then(function (r) { return r.json(); }).then(function (d) {
            if (d.success) { f.reset(); f.querySelector('button').style.display = 'none';
              s.innerHTML = 'Danke für deine Anfrage! Meist meldet sich Dirk innerhalb von 24 Stunden.'; }
            else { s.textContent = 'Senden fehlgeschlagen – bitte per Telefon oder E-Mail.'; }
          }).catch(function () { s.textContent = 'Senden fehlgeschlagen – bitte per Telefon oder E-Mail.'; });
        });
      })();
    </script>` : `
    <p class="intro"><a class="book" href="mailto:mail@dirkmathesius.de?subject=Private-Event-Anfrage">Angebot per E-Mail anfragen →</a></p>`;

  const eventsServiceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Hochzeits-, Business- und Fashionfotografie",
    name: "Fotograf Berlin für Hochzeit, Business & Fashion — Dirk Mathesius",
    provider: { "@type": "Person", name: "Dirk Mathesius", url: `${SITE}/` },
    areaServed: ["Berlin", "Brandenburg", "Deutschland"],
    url: `${SITE}/hochzeitsfotograf-berlin.html`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Private & individuelle Shootings",
      itemListElement: NICHE.map((n, i) => ({
        "@type": "Offer", position: i + 1,
        itemOffered: { "@type": "Service", name: n.id, description: n.d.replace(/&amp;/g, "&") },
      })),
    },
  };
  const eventsFaqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: EVENT_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const eventsBreadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Hochzeit & private Feiern", item: `${SITE}/hochzeitsfotograf-berlin.html` },
    ],
  };

  const eventsBody = `
  <div class="events">
    <h1>Hochzeitsfotograf Berlin — und alles andere, was persönlich zählt</h1>
    <p class="lead">Neben Kampagnen für <b>BMW Motorrad, Red Bull und adidas</b> fotografiert Dirk Mathesius auch das,
      was privat zählt: Hochzeiten, Familie und Feiern im kleinen Kreis, dazu Business-Portraits, Bewerbungsfotos
      und freie Fashion- &amp; Content-Shootings. Gleicher Blick, gleiche 30&nbsp;Jahre Erfahrung — nur ohne
      Art-Direction, dafür mit euren echten Momenten.</p>

    <p class="promise">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      Individuelles Angebot meist innerhalb von 24 Stunden
    </p>

    <!-- PLATZHALTER: abstrakter Verlauf + Marken-Kreuz statt echtem Foto — sobald
         Dirk eigene Beispielfotos zu diesen Anlässen hat, hier ein Bild einsetzen
         (z. B. <img class="hero" src="..."> statt des <div class="hero">). -->
    <div class="hero">
      <span class="x"><b></b><b></b></span>
      <span class="cap">„Echte Momente, kein gestelltes Studio.“</span>
    </div>

${NICHE_GROUPS.map((g) => `    <h2>${E(g.label)}</h2>
    <div class="niche-list">
${g.items.map((n) => `      <a href="#angebot" data-anlass="${E(n.id)}">
        <!-- PLATZHALTER-Thumbnail (Icon auf Verlauf) — durch echtes Beispielfoto
             zu "${n.id}" ersetzen, sobald verfügbar. -->
        <span class="thumb ${g.cls}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NICHE_ICONS[g.cls]}</svg></span>
        <span class="txt"><h3>${n.t}</h3><p>${n.d}</p></span>
        <span class="arrow">→</span>
      </a>`).join("\n")}
    </div>
`).join("\n")}
    <h2>FAQ</h2>
    <div class="faq">${EVENT_FAQS.map((f) => `<details><summary>${E(f.q)}</summary><p>${E(f.a)}</p></details>`).join("")}</div>

    <h2 id="angebot">Individuelles Angebot anfragen</h2>
    <p class="intro">Kurz Anlass, Datum und Ort nennen — den Rest besprechen wir am Telefon oder per Mail.</p>
${eventsFormHtml}

    <div class="close">
      <p>Lieber gleich sprechen? Ruf direkt an.</p>
      <div class="row">
        <a class="alt" id="ev-call" href="/info.html#kontakt">Direkt anrufen</a>
      </div>
    </div>

    <p class="intro" style="margin-top:28px">Für Kampagnen, Editorial und Firmenkunden: <a href="/info.html">Info &amp; B2B-Anfrage →</a></p>
  </div>`;

  writeFileSync(join(root, "public", "hochzeitsfotograf-berlin.html"), subPage({
    canonical: `${SITE}/hochzeitsfotograf-berlin.html`,
    title: "Hochzeit, Business & Fashion Fotograf Berlin | Dirk Mathesius",
    desc: "Fotograf in Berlin für Hochzeit, Familie & private Feiern, Business-Portraits, Bewerbungsfotos sowie Fashion- & Content-Shootings. Individuelles Angebot meist innerhalb von 24 Stunden.",
    headLd: [eventsServiceLd, eventsFaqLd, eventsBreadcrumbLd],
    css: EVENTS_CSS,
    body: eventsBody,
  }));
  console.log("✅ hochzeitsfotograf-berlin.html — private B2C-Nebenpositionierung (nur offizielle Domain)");
}
