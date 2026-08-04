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

  const allImages = [...(manualExtras[id] || []), ...images];

  return {
    id,
    label: meta.label,
    altBase: meta.altSuffix,
    cover: allImages[0]?.src ?? "",
    coverAlt: allImages[0]?.alt ?? meta.altSuffix,
    images: allImages,
  };
});

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

const associatedMedia = categories.flatMap((c) =>
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
const HOME_HERO = "https://www.dirkmathesius.de/images/windowpic.jpg"; // Live hero (Bäume / Flagge)
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
      <image:title>Dirk Mathesius Fotograf Berlin – Hasselblad 501c CFVii50v</image:title>
      <image:caption>© Dirk Mathesius, John Förster, AcroBerlin – Hasselblad 501c CFVii50v</image:caption>
    </image:image>
  </url>
${categories.map(categoryUrl).join("\n")}
  <url>
    <loc>${SITE}/kollaborationen.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE}/info.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
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
const totalImg = categories.reduce((n, c) => n + c.images.length, 0);
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

  const nav = navOrder
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

for (const c of categories) {
  writeFileSync(join(root, "public", `${c.id}.html`), categoryPage(c));
}
console.log(`✅ ${categories.length} statische Kategorie-Seiten — public/{${categories.map((c) => c.id).join(",")}}.html`);

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

const kollabNav = navOrder.map((id) => `<a href="/${id}.html">${E(navLabel(id))}</a>`).join("\n        ") + `\n        <a href="/info.html">info</a>`;
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
