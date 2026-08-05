import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
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
};

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
const siteCategories = IS_FANPAGE
  ? categories
      .map((c) => {
        const imgs = c.images.filter(isCollab);
        return { ...c, images: imgs, cover: imgs[0]?.src ?? "", coverAlt: imgs[0]?.alt ?? c.altBase };
      })
      .filter((c) => c.images.length > 0)
  : categories;

const siteNavOrder = navOrder.filter((id) => siteCategories.some((c) => c.id === id));

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

const associatedMedia = siteCategories.flatMap((c) =>
  c.images.map((img) => {
    const node = {
      "@type": "ImageObject",
      contentUrl: `${SITE}${img.src}`,
      name: img.title || img.alt,
      description: img.alt,
      creator: CREATOR,
      copyrightHolder: CREATOR,
    };
    if (img.rights) node.copyrightNotice = img.rights;
    return node;
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
  <url>
    <loc>${SITE}/kollaborationen.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
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
      const active = id === c.id ? ' style="color:#FF6600"' : "";
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
    associatedMedia: c.images.map((img) => {
      const node = {
        "@type": "ImageObject",
        contentUrl: `${SITE}${img.src}`,
        name: img.title || img.alt,
        description: img.alt,
        creator: CREATOR,
        copyrightHolder: CREATOR,
      };
      if (img.rights) node.copyrightNotice = img.rights;
      return node;
    }),
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
<meta property="og:type" content="website" />
<meta property="og:title" content="${E(seo.title)}" />
<meta property="og:description" content="${E(seo.description)}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:image" content="${cover}" />
<meta property="og:site_name" content="Dirk Mathesius" />
<meta name="twitter:card" content="summary_large_image" />
<link href="style.css" rel="stylesheet" type="text/css" />
<style>
  body{background:#fff;margin:0;color:#222;font-family:Arial,Helvetica,sans-serif;}
  .wrap{max-width:1100px;margin:0 auto;padding:0 16px;}
  .brand{text-align:center;padding:24px 0 6px;}
  .brand img{width:50px;height:50px;border:0;}
  .brand .hl{font-size:14px;letter-spacing:.05em;margin-top:6px;}
  .brand .hl .c{color:#ccc;}
  nav.cat{background:url(images/navbg.jpg);text-align:center;margin:14px 0 0;}
  nav.cat a{display:inline-block;line-height:33px;font-size:11px;color:#000;text-decoration:none;padding:0 16px;}
  nav.cat a:hover{color:#FF6600;}
  .cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;
       background:#111;color:#fff;padding:14px 18px;margin:18px 0;text-align:center;}
  .cta p{margin:0;font-size:12px;line-height:1.5;color:#ddd;}
  .cta a.book{background:#FF6600;color:#fff;text-decoration:none;font-size:11px;
              letter-spacing:.18em;text-transform:uppercase;padding:11px 20px;white-space:nowrap;}
  .cta a.book:hover{background:#e25c00;}
  h1{font-size:22px;font-weight:400;letter-spacing:.04em;margin:22px 0 6px;}
  .intro{font-size:13px;color:#555;max-width:760px;line-height:1.6;margin:0 0 22px;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;margin-bottom:28px;}
  figure{margin:0;}
  figure img{width:100%;height:auto;display:block;background:#f3f3f3;}
  figcaption{font-size:11px;color:#666;margin-top:6px;line-height:1.4;}
  footer{border-top:1px solid #eee;margin-top:24px;padding:18px 0 40px;text-align:center;font-size:11px;color:#888;}
  footer a{color:#888;text-decoration:none;margin:0 8px;}
  footer a:hover{color:#FF6600;}
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
    <nav class="cat">
        ${nav}
    </nav>

    <div class="cta">
      <p>Original-Website &amp; Buchung direkt bei Dirk Mathesius</p>
      <a class="book" href="${utm(c.id)}"${bookAttrs}>${bookLabel}</a>
    </div>

    <h1>${E(seo.h1)} — ${E(seo.title)}</h1>
    <p class="intro">${E(seo.intro)}</p>

    <section class="grid">
${figures}
    </section>

    <div class="cta">
      <p>Dieses Motiv oder ein eigenes Projekt anfragen?</p>
      <a class="book" href="${utm(c.id)}"${bookAttrs}>${bookLabel}</a>
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
  const dropped = navOrder.filter((id) => !siteCategories.some((c) => c.id === id));
  for (const id of dropped) {
    const target = `${OFFICIAL}/${id}.html`;
    const label = navLabel(id);
    writeFileSync(join(root, "public", `${id}.html`), `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${E(seoByCat[id].h1)} — jetzt auf dirkmathesius.de</title>
<meta name="robots" content="noindex, follow" />
<link rel="canonical" href="${target}" />
<meta http-equiv="refresh" content="0; url=${target}" />
</head>
<body style="font-family:Arial,Helvetica,sans-serif;text-align:center;padding:3rem 1rem;">
  <p>Dirks ${E(label)}-Arbeiten sind auf seiner eigenen Seite zu sehen.</p>
  <p><a href="${target}" style="color:#FF6600;">Weiter zu dirkmathesius.de/${id}.html →</a></p>
</body>
</html>
`);
  }
  console.log(`✅ ${dropped.length} Solo-Kategorien → Zeiger auf dirkmathesius.de (${dropped.join(", ")})`);
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
<meta property="og:type" content="website" />
<meta property="og:title" content="Kollaborationen – Dirk Mathesius × John Förster" />
<meta property="og:description" content="Sport- & Action-Fotografie mit Sportmodel John Förster – freie Serie 2008–2016 & Behind the Scenes." />
<meta property="og:url" content="${kollabCanonical}" />
<meta name="twitter:card" content="summary_large_image" />
<link href="style.css" rel="stylesheet" type="text/css" />
<style>
  body{background:#fff;margin:0;color:#222;font-family:Arial,Helvetica,sans-serif;}
  .wrap{max-width:1100px;margin:0 auto;padding:0 16px;}
  .brand{text-align:center;padding:24px 0 6px;}
  .brand img{width:50px;height:50px;border:0;}
  .brand .hl{font-size:14px;letter-spacing:.05em;margin-top:6px;}
  .brand .hl .c{color:#ccc;}
  nav.cat{background:url(images/navbg.jpg);text-align:center;margin:14px 0 0;}
  nav.cat a{display:inline-block;line-height:33px;font-size:11px;color:#000;text-decoration:none;padding:0 16px;}
  nav.cat a:hover{color:#FF6600;}
  .cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;
       background:#111;color:#fff;padding:14px 18px;margin:18px 0;text-align:center;}
  .cta p{margin:0;font-size:12px;line-height:1.5;color:#ddd;}
  .cta a.book{background:#FF6600;color:#fff;text-decoration:none;font-size:11px;
              letter-spacing:.18em;text-transform:uppercase;padding:11px 20px;white-space:nowrap;}
  .cta a.book:hover{background:#e25c00;}
  h1{font-size:22px;font-weight:400;letter-spacing:.04em;margin:22px 0 6px;}
  h2{font-size:15px;font-weight:400;letter-spacing:.06em;text-transform:uppercase;color:#333;margin:34px 0 4px;}
  .intro{font-size:13px;color:#555;max-width:760px;line-height:1.6;margin:0 0 8px;}
  blockquote{font-size:15px;font-style:italic;color:#444;max-width:680px;margin:22px auto;line-height:1.6;text-align:center;}
  blockquote .who{display:block;font-style:normal;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#888;margin-top:10px;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin:10px 0 26px;}
  figure{margin:0;}
  figure img{width:100%;height:auto;display:block;background:#f3f3f3;}
  figcaption{font-size:11px;color:#666;margin-top:6px;line-height:1.4;}
  footer{border-top:1px solid #eee;margin-top:24px;padding:18px 0 40px;text-align:center;font-size:11px;color:#888;}
  footer a{color:#888;text-decoration:none;margin:0 8px;}
  footer a:hover{color:#FF6600;}
</style>
<script type="application/ld+json">${jsonLd(kollabLd)}</script>
</head>
<body>
  <div class="wrap">
    <div class="brand">
      <a href="/" aria-label="Startseite"><img src="images/kreuz.jpg" alt="Dirk Mathesius – Fotograf Berlin" width="50" height="50" /></a>
      <div class="hl"><span class="c">&copy;</span> DIRK MATHESIUS FOTOS</div>
    </div>
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
  body{background:#fff;margin:0;color:#222;font-family:Arial,Helvetica,sans-serif;}
  .wrap{max-width:1100px;margin:0 auto;padding:0 16px;}
  .brand{text-align:center;padding:24px 0 6px;}
  .brand img{width:50px;height:50px;border:0;}
  .brand .hl{font-size:14px;letter-spacing:.05em;margin-top:6px;}
  .brand .hl .c{color:#ccc;}
  nav.cat{background:url(images/navbg.jpg);text-align:center;margin:14px 0 0;}
  nav.cat a{display:inline-block;line-height:33px;font-size:11px;color:#000;text-decoration:none;padding:0 14px;}
  nav.cat a:hover{color:#FF6600;}
  h1{font-size:22px;font-weight:400;letter-spacing:.04em;margin:22px 0 6px;}
  h2{font-size:14px;font-weight:400;letter-spacing:.08em;text-transform:uppercase;color:#333;margin:34px 0 10px;border-top:1px solid #eee;padding-top:22px;}
  .intro{font-size:13px;color:#555;max-width:760px;line-height:1.7;margin:0 0 12px;}
  .clients{font-size:12px;color:#777;line-height:1.9;max-width:820px;}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;}
  .card{border:1px solid #eee;padding:18px;}
  .card h3{margin:0 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#222;}
  .card p{margin:0;font-size:12px;color:#666;line-height:1.6;}
  .card .price{margin-top:10px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#999;}
  .faq details{border-bottom:1px solid #eee;padding:12px 0;}
  .faq summary{cursor:pointer;font-size:13px;color:#333;list-style:none;}
  .faq summary::-webkit-details-marker{display:none;}
  .faq summary:before{content:"+ ";color:#FF6600;}
  .faq p{margin:10px 0 0;font-size:12px;color:#666;line-height:1.6;}
  .showreel{margin:8px 0 4px;}
  .showreel button{background:#111;color:#fff;border:0;padding:14px 22px;font-size:12px;letter-spacing:.1em;cursor:pointer;}
  .showreel button:hover{background:#FF6600;}
  .cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;background:#111;color:#fff;padding:14px 18px;margin:26px 0;text-align:center;}
  .cta p{margin:0;font-size:12px;color:#ddd;}
  a.book{background:#FF6600;color:#fff;text-decoration:none;font-size:11px;letter-spacing:.18em;text-transform:uppercase;padding:11px 20px;white-space:nowrap;display:inline-block;}
  a.book:hover{background:#e25c00;}
  a.wa{background:#25D366;}
  a.wa:hover{background:#1eb955;}
  form.dm{display:flex;flex-direction:column;gap:12px;max-width:420px;margin:16px 0;}
  form.dm input,form.dm textarea{border:0;border-bottom:1px solid #ccc;padding:10px 2px;font-size:13px;font-family:inherit;outline:none;background:transparent;}
  form.dm input:focus,form.dm textarea:focus{border-color:#FF6600;}
  form.dm .hp{position:absolute;left:-9999px;}
  form.dm button{align-self:flex-start;background:#FF6600;color:#fff;border:0;padding:11px 24px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;}
  form.dm button:hover{background:#e25c00;}
  #dm-status{font-size:12px;color:#555;}
  .legal{font-size:10px;color:#aaa;margin-top:8px;}
  footer{border-top:1px solid #eee;margin-top:34px;padding:18px 0 44px;text-align:center;font-size:11px;color:#888;}
  footer a{color:#888;text-decoration:none;margin:0 8px;}
  footer a:hover{color:#FF6600;}
`;

function subPage({ canonical, title, desc, headLd = [], body }) {
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
<meta property="og:type" content="website" />
<meta property="og:title" content="${E(title)}" />
<meta property="og:description" content="${E(desc)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${SITE}/images/John-Foerster-Human-Flag-Friedenstaube-Pappeln-Berlin.webp" />
<meta name="twitter:card" content="summary_large_image" />
<link href="style.css" rel="stylesheet" type="text/css" />
<style>${SUB_CSS}</style>
${headLd.map((o) => `<script type="application/ld+json">${jsonLd(o)}</script>`).join("\n")}
</head>
<body>
  <div class="wrap">
    <div class="brand">
      <a href="/" aria-label="Startseite"><img src="images/kreuz.jpg" alt="Dirk Mathesius – Fotograf Berlin" width="50" height="50" /></a>
      <div class="hl"><span class="c">&copy;</span> DIRK MATHESIUS FOTOS</div>
    </div>
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

// --- ueber-dirk.html ---
const ueberBody = `
    <h1>Über Dirk Mathesius — Fotograf in Berlin seit 1997</h1>
    <p class="intro">Dirk Mathesius fotografiert seit 1997 in Berlin — Sport, People, Music, Reportage &amp; Editorial. Seine Arbeiten erscheinen in führenden Magazinen und Kampagnen (BMW Motorrad, Red Bull, adidas, audible, Stern, Men&#39;s Health) — über 30 Jahre Erfahrung.</p>
    <div class="showreel"><button id="sr-btn" type="button">▶ Showreel abspielen · lädt erst nach Klick (YouTube)</button></div>
    <script>
      document.getElementById('sr-btn').addEventListener('click', function () {
        this.parentNode.innerHTML = '<iframe width="100%" height="460" src="https://www.youtube-nocookie.com/embed/${SHOWREEL_ID}?autoplay=1&rel=0&playsinline=1" title="Showreel Dirk Mathesius" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen style="border:0;max-width:820px"></iframe>';
      });
    </script>
    <h2>Vertraut von</h2>
    <p class="clients">${E(CLIENTS.join("  ·  "))}</p>
    <p class="intro">Ausgewählte Kollaborationen &amp; Behind-the-Scenes-Arbeiten: <a href="/kollaborationen.html">Kollaborationen →</a> · Mehr Showreels auf <a href="https://www.instagram.com/dirk_mathesius/" target="_blank" rel="noopener">Instagram →</a></p>
    <div class="cta"><p>Sport-, People- oder Editorial-Projekt mit Dirk Mathesius?</p><a class="book" href="/info.html#kontakt">Zur Anfrage →</a></div>`;
writeFileSync(join(root, "public", "ueber-dirk.html"), subPage({
  canonical: `${SITE}/ueber-dirk.html`,
  title: "Über Dirk Mathesius — Fotograf Berlin seit 1997 | Sport, People, Editorial",
  desc: "Dirk Mathesius: Berliner Fotograf seit 1997, über 30 Jahre Erfahrung. Sport, People, Music, Reportage & Editorial. Kunden: BMW Motorrad, Red Bull, adidas, audible, Stern, Men's Health.",
  body: ueberBody,
}));

// --- info.html (Ergebnisse · Pakete · FAQ · Kontakt + Formular) ---
const waText = encodeURIComponent("Hallo Dirk, ich interessiere mich für ein Shooting und hätte eine Anfrage:");
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
          var data = Object.fromEntries(new FormData(f).entries());
          data.subject = 'Neue Shooting-Anfrage von ' + (data.name || '') + ' · dirkmathesius.de';
          data.from_name = data.name;
          fetch('https://api.web3forms.com/submit', {
            method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
          }).then(function (r) { return r.json(); }).then(function (d) {
            if (d.success) { f.reset(); f.querySelector('button').style.display = 'none';
              s.innerHTML = 'Danke für deine Anfrage! Dirk meldet sich zeitnah bei dir.'; }
            else { s.textContent = 'Senden fehlgeschlagen – bitte per WhatsApp oder E-Mail.'; }
          }).catch(function () { s.textContent = 'Senden fehlgeschlagen – bitte per WhatsApp oder E-Mail.'; });
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
  telephone: "+491755915670",
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
    <p class="intro">Dirk Mathesius · Bahrendorfer Straße 22 · 12555 Berlin · Mobil <a href="tel:+491755915670">+49 175 5915670</a> · <a href="mailto:mail@dirkmathesius.de">mail@dirkmathesius.de</a></p>
    <p><a class="book wa" href="https://wa.me/491755915670?text=${waText}" target="_blank" rel="noopener">Direkt per WhatsApp anfragen</a></p>
${formHtml}`;
writeFileSync(join(root, "public", "info.html"), subPage({
  canonical: `${SITE}/info.html`,
  title: "Info & Anfrage — Fotograf Berlin buchen | Dirk Mathesius",
  desc: "Shooting mit Dirk Mathesius in Berlin anfragen: Sport, People, Editorial, Industrie. Pakete, FAQ & direkter Kontakt (WhatsApp, Formular). Bahrendorfer Straße 22, 12555 Berlin.",
  headLd: [infoLd, infoFaqLd],
  body: infoBody,
}));
console.log(`✅ ueber-dirk.html + info.html — statische Unterseiten (info: LocalBusiness+FAQ JSON-LD, Formular ${WEB3FORMS_KEY ? "Web3Forms" : "mailto-Fallback"})`);
