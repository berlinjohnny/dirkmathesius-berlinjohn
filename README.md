# dirkmathesius — Portfolio Site

SEO-optimierte Portfolio-Website des Berliner Fotografen **Dirk Mathesius**
(Sport · People · Music · Reportage · Editorial). Single-Page-App, deren Bild-SEO
und Accessibility direkt aus den in die Fotos eingebetteten Adobe-XMP/IPTC-Metadaten
gespeist werden.

Live: **dirkmathesius.berlinjohn.de**

## Tech-Stack

- **React 18** + **TypeScript** + **Vite 5** (SWC)
- **Tailwind CSS** + **shadcn/ui** (Radix) + **framer-motion**
- **react-router-dom** — Routes: `/` (Portfolio), `/impressum`, `*` (404)
- **react-helmet-async** — rendert JSON-LD in den `<head>`

## Bild-SEO-Pipeline (Herzstück)

Alle Portfolio-Fotos liegen als `.webp` unter `public/portfolio/<kategorie>/` und
tragen vollständige, in Photoshop befüllte XMP/IPTC-Metadaten (Alt-Text, Beschreibung,
Titel, Credit, Nutzungsrechte).

`scripts/build-portfolio-manifest.mjs` liest diese Metadaten direkt aus dem
WebP-RIFF-Container und generiert daraus drei Artefakte:

| Generiert | Zweck |
|-----------|-------|
| `src/lib/portfolio.ts` | Galerie-Manifest mit echten **Alt-Texten** (Fallback: Dateiname) |
| `public/sitemap.xml` | Google **Image-Sitemap** — `<image:title>`/`<image:caption>` aus den Metadaten |
| `src/lib/imageJsonLd.ts` | **schema.org `ImageGallery`** JSON-LD (`associatedMedia: ImageObject[]`) |

Das JSON-LD wird auf der Startseite (`src/pages/Index.tsx`) via `<Helmet>` als
`<script type="application/ld+json">` in den `<head>` injiziert (Provider in
`src/main.tsx`).

> **Die drei generierten Dateien sind Build-Artefakte — nicht von Hand editieren.**
> Bei neuen/geänderten Fotos das Manifest neu erzeugen:
> ```sh
> node scripts/build-portfolio-manifest.mjs
> ```
> Bilder fallen sauber auf den Dateinamen-Alt zurück, wenn ein Metadatenfeld fehlt.

## Portfolio-Kategorien

`sport · folks · music · reportage · landscape · stills · publication` (~181 Bilder)

## Entwicklung

```sh
npm install
npm run dev        # Vite Dev-Server → http://localhost:8080
npm run build      # Production-Build → dist/
npm run preview    # gebautes dist/ lokal servieren
npm run lint       # ESLint
npm run test       # Vitest
```

## Projektstruktur

```
public/portfolio/<kategorie>/*.webp   Fotos mit eingebetteten XMP/IPTC-Metadaten
scripts/build-portfolio-manifest.mjs  Metadaten → portfolio.ts + sitemap.xml + imageJsonLd.ts
src/lib/portfolio.ts                  (generiert) Galerie-Manifest + Alt-Texte
src/lib/imageJsonLd.ts                (generiert) ImageGallery-JSON-LD
src/pages/Index.tsx                   Startseite: Galerie, Lightbox, Helmet/JSON-LD
src/pages/Impressum.tsx               Impressum
public/sitemap.xml                    (generiert) Image-Sitemap
```

## Deployment

`npm run build` erzeugt ein statisches `dist/` (SPA), das auf den Live-Host
ausgeliefert wird. Deep-Links/Reloads werden serverseitig auf `index.html`
zurückgeroutet (SPA-Fallback).
