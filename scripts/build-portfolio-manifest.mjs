import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const portfolioDir = join(root, "public", "portfolio");
const outFile = join(root, "src", "lib", "portfolio.ts");
const jsonLdFile = join(root, "src", "lib", "imageJsonLd.ts");

const SITE = "https://dirkmathesius.berlinjohn.de";

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

  return {
    id,
    label: meta.label,
    altBase: meta.altSuffix,
    cover: images[0]?.src ?? "",
    coverAlt: images[0]?.alt ?? meta.altSuffix,
    images,
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
