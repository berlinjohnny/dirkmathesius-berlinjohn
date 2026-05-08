import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const portfolioDir = join(root, "public", "portfolio");
const outFile = join(root, "src", "lib", "portfolio.ts");

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

const fileToAlt = (file) =>
  file.replace(/\.webp$/i, "")
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

const categories = order.map((id) => {
  const dir = join(portfolioDir, id);
  const files = readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".webp"))
    .sort();  // ASCII / byte order — matches macOS `ls` default (uppercase before lowercase) = Dirk's chosen order
  const meta = categoryMeta[id];
  const images = files.map((file) => ({
    src: `/portfolio/${id}/${file}`,
    alt: `${fileToAlt(file)} – ${meta.altSuffix}`,
  }));
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
// Updated: ${new Date().toISOString().slice(0, 10)}
`;

const body = `export type PortfolioImage = { src: string; alt: string };
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
for (const c of categories) console.log(`   ${c.id}: ${c.images.length}`);

// --- sitemap.xml (Google Image Sitemap, SEO-optimized for the live multi-page site)
const SITE = "https://dirkmathesius.berlinjohn.de";
const HOME_HERO = "https://www.dirkmathesius.de/images/windowpic.jpg"; // Live hero (Bäume / Flagge)
const today = new Date().toISOString().slice(0, 10);
const xmlEscape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const enc = (s) => s.split("/").map(encodeURIComponent).join("/");

const captionByCat = {
  sport:       "© Dirk Mathesius – Sportfotografie Berlin",
  folks:       "© Dirk Mathesius – Portrait & People Photography Berlin",
  music:       "© Dirk Mathesius – Musikfotografie & Konzertfotografie Berlin",
  reportage:   "© Dirk Mathesius – Reportagefotografie Berlin",
  landscape:   "© Dirk Mathesius – Landschaftsfotografie",
  stills:      "© Dirk Mathesius – Stills & Produktfotografie Berlin",
  publication: "© Dirk Mathesius – Editorial Photography Berlin (Stern, Men's Health)",
};

const imageBlock = (img, catId) =>
  `    <image:image>
      <image:loc>${SITE}${enc(img.src)}</image:loc>
      <image:title>${xmlEscape(img.alt)}</image:title>
      <image:caption>${xmlEscape(captionByCat[catId] ?? "© Dirk Mathesius")}</image:caption>
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
